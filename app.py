from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
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

app = Flask(__name__,
            static_folder='frontend/dist',
            static_url_path='')
CORS(app)  # Enable CORS for React frontend
app.config['UPLOAD_FOLDER'] = 'static/uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Dataset paths
TRAIN_DIR = "/content/drive/MyDrive/AML-F24/Code/image_datset/image_datset/train"
TEST_DIR = "/content/drive/MyDrive/AML-F24/Code/image_datset/image_datset/test"

# ---------------- MODELS ---------------- #
from models_loader import loader

# Clustering Dependencies
import pandas as pd
from sklearn.cluster import KMeans, DBSCAN
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import io
import base64
from sklearn.preprocessing import StandardScaler

# Association Rules Dependencies
from mlxtend.frequent_patterns import apriori, association_rules
from mlxtend.preprocessing import TransactionEncoder

# ============================================================
#                       API ROUTES
# ============================================================

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})

@app.errorhandler(Exception)
def handle_exception(e):
    import traceback
    error_details = traceback.format_exc()
    print(error_details)
    return jsonify({
        "error": f"Internal Server Error: {str(e)}",
        "traceback": error_details
    }), 500

# -------- GENDER CLASSIFICATION -------- #
@app.route('/api/gender', methods=['POST'])
def gender():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No image selected"}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    classifier = loader.gender_classifier
    cnn = loader.cnn_model

    if classifier:
        try:
            img = Image.open(filepath)
            results = classifier(img)
            result = results[0]['label'].capitalize()
            return jsonify({"result": result})
        except Exception as e:
            return jsonify({"error": f"Error processing image: {e}"}), 500
    elif cnn:
        try:
            import torch
            img = Image.open(filepath).convert('RGB')
            img = img.resize((128, 128))
            img_array = np.array(img).astype(np.float32) / 255.0
            img_tensor = torch.from_numpy(img_array).permute(2, 0, 1).unsqueeze(0)
            with torch.no_grad():
                prediction = cnn(img_tensor)
            result = "Male" if prediction.item() > 0.5 else "Female"
            return jsonify({"result": result})
        except Exception as e:
            return jsonify({"error": f"Error processing image: {e}"}), 500
    else:
        return jsonify({"error": "Gender model is not loaded"}), 500

# -------- TEXT GENERATION -------- #
@app.route('/api/textgen', methods=['POST'])
def textgen():
    data = request.get_json()
    prompt = data.get('prompt', '')
    if not prompt:
        return jsonify({"error": "No prompt provided"}), 400
    
    textgen_model = loader.text_gen_pipeline
    if textgen_model:
        result = textgen_model(prompt, max_length=50)[0]['generated_text']
        return jsonify({"generated_text": result})
    return jsonify({"error": "Text generation model not available"}), 500

# -------- TRANSLATION -------- #
@app.route('/api/translate', methods=['POST'])
def translate():
    data = request.get_json()
    text = data.get('text', '')
    if not text:
        return jsonify({"error": "No text provided"}), 400
    
    # Properly access the property to instantiate the model lazily
    translator_model = loader.translator_pipeline
    
    if translator_model:
        try:
            result = translator_model(text)[0]['translation_text']
            return jsonify({"translated_text": result})
        except Exception as e:
            import traceback
            print(f"Translation generation error: {traceback.format_exc()}")
            return jsonify({"error": f"Error during translation: {str(e)}"}), 500
            
    return jsonify({"error": "Translation model not available. Check server logs."}), 500

# -------- SENTIMENT ANALYSIS -------- #
@app.route('/api/sentiment', methods=['POST'])
def sentiment():
    typed_text = ''
    audio_file = request.files.get('voice')

    if request.content_type and 'multipart/form-data' in request.content_type:
        typed_text = request.form.get('text', '').strip()
    else:
        data = request.get_json(silent=True) or {}
        typed_text = data.get('text', '').strip()

    text = ""
    transcript = ""
    if typed_text:
        text = typed_text
    elif audio_file and audio_file.filename != '':
        audio_filename = secure_filename(audio_file.filename)
        audio_path = os.path.join(app.config['UPLOAD_FOLDER'], audio_filename)
        audio_file.save(audio_path)

        stt_model = loader.stt_pipeline
        if stt_model is None:
            return jsonify({"error": "STT model not available"}), 500
        try:
            audio_array, sampling_rate = librosa.load(audio_path, sr=16000)
            audio_array = audio_array.astype(np.float32)
            stt_result = stt_model(audio_array)
            text = stt_result.get('text', '').strip()
            transcript = text
            if not text:
                return jsonify({"error": "Could not understand audio"}), 400
        except Exception as e:
            return jsonify({"error": f"STT processing error: {str(e)}"}), 500
    else:
        return jsonify({"error": "No input provided"}), 400

    sentiment_model = loader.sentiment_pipeline
    if sentiment_model is None:
        return jsonify({"error": "Sentiment model not available"}), 500

    try:
        sentiment_data = sentiment_model(text)[0]
        label = sentiment_data.get('label', 'Unknown').capitalize()
        score = round(sentiment_data.get('score', 0) * 100, 1)
        return jsonify({
            "result": label,
            "score": score,
            "text": text,
            "transcript": transcript
        })
    except Exception as e:
        return jsonify({"error": f"Sentiment analysis failed: {str(e)}"}), 500

# -------- QUESTION ANSWERING -------- #
@app.route('/api/qa', methods=['POST'])
def qa():
    context = ''
    question_text = ''

    if request.content_type and 'multipart/form-data' in request.content_type:
        context = request.form.get('context', '')
        question_text = request.form.get('question', '').strip()
        audio_file = request.files.get('voice')
    else:
        data = request.get_json(silent=True) or {}
        context = data.get('context', '')
        question_text = data.get('question', '').strip()
        audio_file = None

    if not question_text and audio_file and audio_file.filename != '':
        audio_filename = secure_filename(audio_file.filename)
        audio_path = os.path.join(app.config['UPLOAD_FOLDER'], audio_filename)
        audio_file.save(audio_path)
        try:
            stt_model = loader.stt_pipeline
            if stt_model is None:
                return jsonify({"error": "STT model not available. Check logs."}), 500
                
            audio_array, sampling_rate = librosa.load(audio_path, sr=16000)
            audio_array = audio_array.astype(np.float32)
            stt_result = stt_model(audio_array)
            question_text = stt_result.get('text', '').strip()
        except Exception as e:
            return jsonify({"error": f"STT Error: {e}"}), 500

    if not question_text or not context:
        return jsonify({"error": "Both context and question are required"}), 400

    qa_model = loader.qa_pipeline
    if qa_model is None:
        return jsonify({"error": "QA model not available"}), 500

    try:
        result = qa_model(question=question_text, context=context)
        answer = result.get('answer', str(result))
        score = round(result.get('score', 0) * 100, 1)

        audio_url = None
        try:
            tts = gTTS(answer)
            tts.save(os.path.join('static', 'answer.mp3'))
            audio_url = '/static/answer.mp3'
        except Exception:
            pass

        return jsonify({
            "answer": answer,
            "score": score,
            "question": question_text,
            "audio_url": audio_url
        })
    except Exception as e:
        return jsonify({"error": f"QA model error: {e}"}), 500

# -------- ZERO-SHOT LEARNING -------- #
@app.route('/api/zsl', methods=['POST'])
def zsl():
    data = request.get_json()
    text = data.get('text', '')
    labels = data.get('labels', '')

    if not text or not labels:
        return jsonify({"error": "Both text and labels are required"}), 400

    candidate_labels = [l.strip() for l in labels.split(',') if l.strip()]

    zsl_model = loader.zsl_pipeline
    if zsl_model is None:
        return jsonify({"error": "ZSL model not available"}), 500

    try:
        output = zsl_model(text, candidate_labels=candidate_labels)
        results = []
        for label, score in zip(output['labels'], output['scores']):
            results.append({"label": label, "score": round(score * 100, 2)})
        return jsonify({"results": results, "best_label": output['labels'][0], "best_score": round(output['scores'][0] * 100, 2)})
    except Exception as e:
        return jsonify({"error": f"ZSL error: {str(e)}"}), 500

# -------- K-MEANS CLUSTERING -------- #
@app.route('/api/clustering', methods=['POST'])
def clustering():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    n_clusters = int(request.form.get('clusters', 3))

    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file)
        else:
            df = pd.read_excel(file)

        numeric_df = df.select_dtypes(include=[np.number])
        if numeric_df.shape[1] < 2:
            return jsonify({"error": "Dataset must have at least 2 numeric columns"}), 400

        numeric_df = numeric_df.dropna()
        kmeans = KMeans(n_clusters=n_clusters, random_state=42)
        df['Cluster'] = kmeans.fit_predict(numeric_df)

        plt.figure(figsize=(10, 6))
        scatter = plt.scatter(numeric_df.iloc[:, 0], numeric_df.iloc[:, 1], c=df['Cluster'], cmap='viridis', alpha=0.6)
        plt.colorbar(scatter, label='Cluster')
        plt.title(f'K-Means Clustering (K={n_clusters})')
        plt.xlabel(numeric_df.columns[0])
        plt.ylabel(numeric_df.columns[1])
        plt.grid(True, alpha=0.3)

        img = io.BytesIO()
        plt.savefig(img, format='png', bbox_inches='tight', transparent=True)
        img.seek(0)
        plot_url = base64.b64encode(img.getvalue()).decode()
        plt.close()

        cluster_info = df.groupby('Cluster').size().to_dict()
        return jsonify({"plot": plot_url, "cluster_info": cluster_info})
    except Exception as e:
        return jsonify({"error": f"Clustering error: {str(e)}"}), 500

# -------- DBSCAN CLUSTERING -------- #
@app.route('/api/dbscan', methods=['POST'])
def dbscan():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    eps = float(request.form.get('eps', 0.5))
    min_samples = int(request.form.get('min_samples', 5))

    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file)
        else:
            df = pd.read_excel(file)

        numeric_df = df.select_dtypes(include=[np.number])
        if numeric_df.shape[1] < 2:
            return jsonify({"error": "Dataset must have at least 2 numeric columns"}), 400

        numeric_df = numeric_df.dropna()
        scaler = StandardScaler()
        scaled_data = scaler.fit_transform(numeric_df)

        dbscan_model = DBSCAN(eps=eps, min_samples=min_samples)
        df['Cluster'] = dbscan_model.fit_predict(scaled_data)

        plt.figure(figsize=(10, 6))
        scatter = plt.scatter(numeric_df.iloc[:, 0], numeric_df.iloc[:, 1], c=df['Cluster'], cmap='viridis', alpha=0.6)
        plt.colorbar(scatter, label='Cluster')
        plt.title(f'DBSCAN (eps={eps}, min_samples={min_samples})')
        plt.xlabel(numeric_df.columns[0])
        plt.ylabel(numeric_df.columns[1])
        plt.grid(True, alpha=0.3)

        img = io.BytesIO()
        plt.savefig(img, format='png', bbox_inches='tight', transparent=True)
        img.seek(0)
        plot_url = base64.b64encode(img.getvalue()).decode()
        plt.close()

        cluster_info = df.groupby('Cluster').size().to_dict()
        return jsonify({"plot": plot_url, "cluster_info": cluster_info})
    except Exception as e:
        return jsonify({"error": f"DBSCAN error: {str(e)}"}), 500

# -------- A-PRIORI ASSOCIATION RULES -------- #
@app.route('/api/apriori', methods=['POST'])
def apriori_route():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    min_support = float(request.form.get('min_support', 0.1))
    min_threshold = float(request.form.get('min_threshold', 0.7))
    metric = request.form.get('metric', 'lift')
    has_header = request.form.get('has_header') == 'true'

    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file, header=0 if has_header else None)
        else:
            df = pd.read_excel(file, header=0 if has_header else None)

        transactions = []
        values = df.values.tolist()
        for row in values:
            transaction = sorted(list(set([str(item).strip() for item in row if pd.notna(item) and str(item).strip() != ''])))
            if transaction:
                transactions.append(transaction)

        if not transactions:
            return jsonify({"error": "No valid transactions found"}), 400

        te = TransactionEncoder()
        te_ary = te.fit(transactions).transform(transactions)
        encoded_df = pd.DataFrame(te_ary, columns=te.columns_)

        frequent_itemsets = apriori(encoded_df, min_support=min_support, use_colnames=True)
        if frequent_itemsets.empty:
            return jsonify({"error": "No frequent itemsets found. Try lowering min support."}), 400

        rules = association_rules(frequent_itemsets, metric=metric, min_threshold=min_threshold)
        if rules.empty:
            return jsonify({"error": f"No rules found for {metric} >= {min_threshold}. Try lowering threshold."}), 400

        rules['antecedents'] = rules['antecedents'].apply(lambda x: list(x))
        rules['consequents'] = rules['consequents'].apply(lambda x: list(x))

        display_rules = rules[['antecedents', 'consequents', 'support', 'confidence', 'lift']]
        rules_list = display_rules.to_dict(orient='records')

        return jsonify({"rules": rules_list, "count": len(rules_list)})
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return jsonify({"error": f"A-priori error: {str(e)}"}), 500


# ============ SERVE STATIC UPLOADS (for ML file handling) ============ #
@app.route('/static/uploads/<path:filename>')
def serve_upload(filename):
    return send_from_directory('static/uploads', filename)

@app.route('/static/<path:filename>')
def serve_static_files(filename):
    return send_from_directory('static', filename)

# ============ SERVE REACT APP (catch-all) ============ #
@app.route('/')
def serve_react():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_react_paths(path):
    # Try to serve the file from dist, otherwise serve index.html (for React Router)
    file_path = os.path.join(app.static_folder, path)
    if os.path.isfile(file_path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')


if __name__ == '__main__':
    print("Initializing models...")
    app.run(debug=True, use_reloader=False, port=5000)
