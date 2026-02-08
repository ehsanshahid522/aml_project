import sys
import os

# Add current directory to path
sys.path.append(os.getcwd())

from models_loader import loader
import torch
from PIL import Image
import numpy as np

def test_models():
    print("--- Starting Model Verification ---")
    
    # 1. Sentiment
    print("\nTesting Sentiment Analysis...")
    if loader.sentiment_pipeline:
        res = loader.sentiment_pipeline("I love this project!")
        print(f"Result: {res}")
    else:
        print("FAILED: Sentiment pipeline not loaded")

    # 2. QA
    print("\nTesting Question Answering...")
    if loader.qa_pipeline:
        res = loader.qa_pipeline(question="What is this?", context="This is a test.")
        print(f"Result: {res}")
    else:
        print("FAILED: QA pipeline not loaded")

    # 3. Translation
    print("\nTesting Translation (MT-EN-UR)...")
    if loader.translator_pipeline:
        res = loader.translator_pipeline("Hello, how are you?")
        print(f"Result: {res}")
    else:
        print("FAILED: Translation pipeline not loaded")

    # 4. Text Gen
    print("\nTesting Text Generation...")
    if loader.text_gen_pipeline:
        res = loader.text_gen_pipeline("Once upon a time", max_length=20)
        print(f"Result: {res}")
    else:
        print("FAILED: Text Gen pipeline not loaded")

    # 5. ZSL
    print("\nTesting Zero-Shot Learning...")
    if loader.zsl_pipeline:
        res = loader.zsl_pipeline("This is about sports.", candidate_labels=["politics", "sports", "cooking"])
        print(f"Result: {res['labels'][0]}")
    else:
        print("FAILED: ZSL pipeline not loaded")

    # 6. Gender Classifier (Mini)
    print("\nTesting Image Classification (Gender)...")
    if loader.gender_classifier:
        # Create a dummy image
        dummy_img = Image.fromarray(np.uint8(np.random.rand(224,224,3)*255))
        res = loader.gender_classifier(dummy_img)
        print(f"Result: {res}")
    else:
        print("FAILED: Gender classifier pipeline not loaded")

    print("\n--- Verification Complete ---")

if __name__ == "__main__":
    test_models()
