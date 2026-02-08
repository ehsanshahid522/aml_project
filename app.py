from flask import Flask, render_template, request
from werkzeug.utils import secure_filename
import os
import numpy as np
from PIL import Image
from transformers import pipeline
from gtts import gTTS
import speech_recognition as sr
import librosa

# Try importing tensorflow, handle if missing
try:
    from tensorflow.keras.models import load_model
except ImportError:
    load_model = None

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Dataset paths (Colab format - update these for local use)
TRAIN_DIR = "/content/drive/MyDrive/AML-F24/Code/image_datset/image_datset/train"
TEST_DIR = "/content/drive/MyDrive/AML-F24/Code/image_datset/image_datset/test"

# ---------------- MODELS ---------------- #
from models_loader import loader

sentiment_model = loader.sentiment_pipeline
qa_model = loader.qa_pipeline
textgen_model = loader.text_gen_pipeline
translator = loader.translator_pipeline
stt_model = loader.stt_pipeline
zsl_model = loader.zsl_pipeline
gender_classifier = loader.gender_classifier
gender_model = loader.cnn_model # Custom CNN

# Clustering Dependencies
import pandas as pd
from sklearn.cluster import KMeans, DBSCAN
import matplotlib
matplotlib.use('Agg') # Non-interactive backend
import matplotlib.pyplot as plt
import io
import base64
from sklearn.preprocessing import StandardScaler

# Association Rules Dependencies
from mlxtend.frequent_patterns import apriori, association_rules
from mlxtend.preprocessing import TransactionEncoder

# ---------------- ROUTES ---------------- #

@app.route('/')
def index():
    return render_template('index.html')

# -------- GENDER CLASSIFICATION -------- #
@app.route('/gender', methods=['GET', 'POST'])
def gender():
    result = ""
    if request.method == 'POST':
        if 'image' not in request.files:
            return render_template('gender.html', result="No image uploaded")
        
        file = request.files['image']
        if file.filename == '':
            return render_template('gender.html', result="No image selected")

        if file:
            # Save file temporarily (use secure filename)
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)

            if gender_classifier:
                try:
                    img = Image.open(filepath)
                    results = gender_classifier(img)
                    # Extract the top result
                    result = results[0]['label'].capitalize()
                    print(f"Gender Classification Result: {result}")
                except Exception as e:
                    result = f"Error processing image with transformers: {e}"
            elif gender_model:
                try:
                    img = Image.open(filepath).convert('RGB')
                    img = img.resize((128, 128))
                    img_array = np.array(img).astype(np.float32) / 255.0
                    # Correct shape for PyTorch CNN: (batch, channels, height, width)
                    img_tensor = torch.from_numpy(img_array).permute(2, 0, 1).unsqueeze(0)
                    
                    with torch.no_grad():
                        prediction = gender_model(img_tensor)
                    result = "Male" if prediction.item() > 0.5 else "Female"
                except Exception as e:
                    import traceback
                    print(traceback.format_exc())
                    result = f"Error processing image: {e}"
            else:
                result = "Gender model is not loaded (check console for details)."
            
    return render_template('gender.html', result=result)

# -------- TEXT GENERATION -------- #
@app.route('/textgen', methods=['GET', 'POST'])
def textgen():
    result = ""
    if request.method == 'POST':
        text = request.form['prompt']
        if textgen_model:
            result = textgen_model(text, max_length=50)[0]['generated_text']
        else:
            result = "Text generation model not available"
    return render_template('textgen.html', generated_text=result)

# -------- TRANSLATION -------- #
@app.route('/translate', methods=['GET', 'POST'])
def translate():
    result = ""
    if request.method == 'POST':
        text = request.form.get('text', '')
        if translator:
            result = translator(text)[0]['translation_text']
        else:
            result = "Translation model not available"
    return render_template('translate.html', translated_text=result)

# -------- SENTIMENT (VOICE) -------- #
@app.route('/sentiment', methods=['GET', 'POST'])
def sentiment():
    result = ""
    if request.method == 'POST':
        typed_text = request.form.get('text', '').strip()
        audio_file = request.files.get('voice')
        
        text = ""
        if typed_text:
            text = typed_text
        elif audio_file:
            if audio_file.filename == '':
                return render_template('sentiment.html', result="No audio selected")
            audio_filename = secure_filename(audio_file.filename)
            audio_path = os.path.join(app.config['UPLOAD_FOLDER'], audio_filename)
            audio_file.save(audio_path)
            
            if stt_model is None:
                return render_template('sentiment.html', result="STT model not available")
            
            try:
                audio_array, sampling_rate = librosa.load(audio_path, sr=16000)
                # Ensure the audio array is 1D and float32
                audio_array = audio_array.astype(np.float32)
                stt_result = stt_model(audio_array)
                text = stt_result.get('text', '').strip()
                if not text:
                     return render_template('sentiment.html', result="Could not understand audio")
            except Exception as e:
                return render_template('sentiment.html', result=f"STT processing error: {str(e)}")
        else:
            return render_template('sentiment.html', result="No input provided")

        # Sentiment Analysis Logic
        if sentiment_model is None:
            result = f"Analyzed: {text} | Status: Sentiment model not available"
        else:
            try:
                sentiment_data = sentiment_model(text)[0]
                label = sentiment_data.get('label', 'Unknown').capitalize()
                score = round(sentiment_data.get('score', 0) * 100, 1)
                
                # Question Detection
                questions_words = ["who", "what", "where", "when", "why", "how", "is", "are", "do", "does", "can", "could", "would", "should"]
                is_question = text.strip().endswith("?") or any(text.lower().startswith(q + " ") for q in questions_words)
                
                type_str = "Question" if is_question else "Statement"
                result = f"Text: \"{text}\" | Type: {type_str} | Sentiment: {label} (Confidence: {score}%)"
            except Exception as e:
                result = f"Sentiment analysis failed: {str(e)}"
                
    return render_template('sentiment.html', result=result)

# -------- QUESTION ANSWERING (VOICE → VOICE) -------- #
@app.route('/qa', methods=['GET', 'POST'])
def qa():
    answer = ""
    context = ""
    question_text = ""
    if request.method == 'POST':
        context = request.form.get('context', '')
        audio_file = request.files.get('voice')
        typed_question = request.form.get('question', '').strip()

        if typed_question:
            question_text = typed_question
        elif audio_file:
            if audio_file.filename != '':
                audio_filename = secure_filename(audio_file.filename)
                audio_path = os.path.join(app.config['UPLOAD_FOLDER'], audio_filename)
                audio_file.save(audio_path)
                
                try:
                    audio_array, sampling_rate = librosa.load(audio_path, sr=16000)
                    audio_array = audio_array.astype(np.float32)
                    stt_result = stt_model(audio_array)
                    question_text = stt_result.get('text', '').strip()
                except Exception as e:
                    print(f"STT Error in QA: {e}")
                    answer = "Error processing your voice question."

        if not answer and question_text and context:
            if qa_model is None:
                answer = "Question-answering model not available"
            else:
                try:
                    result = qa_model(question=question_text, context=context)
                    answer = result.get('answer', str(result))
                    
                    try:
                        tts = gTTS(answer)
                        tts.save(os.path.join('static', 'answer.mp3'))
                    except Exception as e:
                        print(f"TTS failed: {e}")
                except Exception as e:
                    answer = f"QA model error: {e}"
        elif not answer:
            answer = "Please provide both context and a question (typed or voice)."

    return render_template('qa.html', answer=answer, context=context, question=question_text)

# -------- ZERO-SHOT LEARNING -------- #
@app.route('/zsl', methods=['GET', 'POST'])
def zsl():
    result = None
    if request.method == 'POST':
        text = request.form.get('text', '')
        labels = request.form.get('labels', '')
        
        if not text or not labels:
            return render_template('zsl.html', error="Both text and labels are required.")
            
        candidate_labels = [l.strip() for l in labels.split(',') if l.strip()]
        
        if zsl_model is None:
            return render_template('zsl.html', error="ZSL model not available.")
            
        try:
            output = zsl_model(text, candidate_labels=candidate_labels)
            # Find the index of the label with the highest score
            best_idx = np.argmax(output['scores'])
            result = {
                'label': output['labels'][0], # BART-MNLI returns sorted
                'score': round(output['scores'][0] * 100, 2),
                'all_results': zip(output['labels'], [round(s * 100, 2) for s in output['scores']])
            }
        except Exception as e:
            return render_template('zsl.html', error=f"ZSL error: {str(e)}")
            
    return render_template('zsl.html', result=result)


# -------- K-MEANS CLUSTERING -------- #
@app.route('/clustering', methods=['GET', 'POST'])
def clustering():
    plot_url = None
    cluster_info = None
    if request.method == 'POST':
        if 'file' not in request.files:
            return render_template('clustering.html', error="No file uploaded")
            
        file = request.files['file']
        n_clusters = int(request.form.get('clusters', 3))
        
        if file.filename == '':
            return render_template('clustering.html', error="No file selected")
            
        try:
            if file.filename.endswith('.csv'):
                df = pd.read_csv(file)
            else:
                df = pd.read_excel(file)
                
            # Keep only numeric columns
            numeric_df = df.select_dtypes(include=[np.number])
            
            if numeric_df.shape[1] < 2:
                return render_template('clustering.html', error="Dataset must have at least 2 numeric columns for clustering.")
                
            # Basic cleaning
            numeric_df = numeric_df.dropna()
            
            # K-Means
            kmeans = KMeans(n_clusters=n_clusters, random_state=42)
            df['Cluster'] = kmeans.fit_predict(numeric_df)
            
            # Create Plot (using first two numeric columns)
            plt.figure(figsize=(10, 6))
            scatter = plt.scatter(numeric_df.iloc[:, 0], numeric_df.iloc[:, 1], c=df['Cluster'], cmap='viridis', alpha=0.6)
            plt.colorbar(scatter, label='Cluster')
            plt.title(f'K-Means Clustering (K={n_clusters})')
            plt.xlabel(numeric_df.columns[0])
            plt.ylabel(numeric_df.columns[1])
            plt.grid(True, alpha=0.3)
            
            # Save plot to base64
            img = io.BytesIO()
            plt.savefig(img, format='png', bbox_inches='tight', transparent=True)
            img.seek(0)
            plot_url = base64.b64encode(img.getvalue()).decode()
            plt.close()
            
            # Cluster stats
            cluster_info = df.groupby('Cluster').size().to_dict()
            
        except Exception as e:
            return render_template('clustering.html', error=f"Clustering error: {str(e)}")
            
    return render_template('clustering.html', plot_url=plot_url, cluster_info=cluster_info)

# -------- DBSCAN CLUSTERING -------- #
@app.route('/dbscan', methods=['GET', 'POST'])
def dbscan():
    plot_url = None
    cluster_info = None
    if request.method == 'POST':
        if 'file' not in request.files:
            return render_template('dbscan.html', error="No file uploaded")
            
        file = request.files['file']
        eps = float(request.form.get('eps', 0.5))
        min_samples = int(request.form.get('min_samples', 5))
        
        if file.filename == '':
            return render_template('dbscan.html', error="No file selected")
            
        try:
            if file.filename.endswith('.csv'):
                df = pd.read_csv(file)
            else:
                df = pd.read_excel(file)
                
            # Keep only numeric columns
            numeric_df = df.select_dtypes(include=[np.number])
            
            if numeric_df.shape[1] < 2:
                return render_template('dbscan.html', error="Dataset must have at least 2 numeric columns for clustering.")
                
            # Basic cleaning
            numeric_df = numeric_df.dropna()
            
            # DBSCAN with Scaling
            scaler = StandardScaler()
            scaled_data = scaler.fit_transform(numeric_df)
            
            dbscan_model = DBSCAN(eps=eps, min_samples=min_samples)
            df['Cluster'] = dbscan_model.fit_predict(scaled_data)
            
            # Create Plot
            plt.figure(figsize=(10, 6))
            scatter = plt.scatter(numeric_df.iloc[:, 0], numeric_df.iloc[:, 1], c=df['Cluster'], cmap='viridis', alpha=0.6)
            plt.colorbar(scatter, label='Cluster')
            plt.title(f'DBSCAN Clustering (eps={eps}, min_samples={min_samples}) - Scaled')
            plt.xlabel(numeric_df.columns[0])
            plt.ylabel(numeric_df.columns[1])
            plt.grid(True, alpha=0.3)
            
            # Save plot to base64
            img = io.BytesIO()
            plt.savefig(img, format='png', bbox_inches='tight', transparent=True)
            img.seek(0)
            plot_url = base64.b64encode(img.getvalue()).decode()
            plt.close()
            
            # Cluster stats
            cluster_info = df.groupby('Cluster').size().to_dict()
            
        except Exception as e:
            return render_template('dbscan.html', error=f"DBSCAN error: {str(e)}")
            
    return render_template('dbscan.html', plot_url=plot_url, cluster_info=cluster_info)

# -------- A-PRIORI ASSOCIATION RULES -------- #
@app.route('/apriori', methods=['GET', 'POST'])
def apriori_route():
    rules_html = None
    if request.method == 'POST':
        if 'file' not in request.files:
            return render_template('apriori.html', error="No file uploaded")
            
        file = request.files['file']
        min_support = float(request.form.get('min_support', 0.1))
        min_threshold = float(request.form.get('min_threshold', 0.7))
        metric = request.form.get('metric', 'lift')
        has_header = request.form.get('has_header') == 'on'
        
        if file.filename == '':
            return render_template('apriori.html', error="No file selected")
            
        try:
            if file.filename.endswith('.csv'):
                df = pd.read_csv(file, header=0 if has_header else None)
            else:
                df = pd.read_excel(file, header=0 if has_header else None)
            
            # Convert to list of lists (transactions) - Handle nulls and whitespace
            transactions = []
            values = df.values.tolist()
            for row in values:
                # Filter out nan, None, and empty strings, and convert everything to string
                transaction = sorted(list(set([str(item).strip() for item in row if pd.notna(item) and str(item).strip() != ''])))
                if transaction:
                    transactions.append(transaction)
            
            if not transactions:
                 return render_template('apriori.html', error="No valid transactions found in file.")

            # Transaction Encoding
            te = TransactionEncoder()
            te_ary = te.fit(transactions).transform(transactions)
            encoded_df = pd.DataFrame(te_ary, columns=te.columns_)
            
            # Generate Frequent Itemsets
            frequent_itemsets = apriori(encoded_df, min_support=min_support, use_colnames=True)
            
            if frequent_itemsets.empty:
                return render_template('apriori.html', error="No frequent itemsets found. Try lowering min support.")
                
            # Generate Rules
            rules = association_rules(frequent_itemsets, metric=metric, min_threshold=min_threshold)
            
            if rules.empty:
                return render_template('apriori.html', error=f"No rules found for {metric} >= {min_threshold}. Try lowering threshold.")
            
            # Format rules for display
            rules['antecedents'] = rules['antecedents'].apply(lambda x: list(x))
            rules['consequents'] = rules['consequents'].apply(lambda x: list(x))
            
            # Selection of columns for display
            display_rules = rules[['antecedents', 'consequents', 'support', 'confidence', 'lift']]
            rules_html = display_rules.to_dict(orient='records')
            
        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return render_template('apriori.html', error=f"A-priori error: {str(e)}")
            
    return render_template('apriori.html', rules=rules_html)

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)
