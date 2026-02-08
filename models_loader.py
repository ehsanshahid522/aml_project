from transformers import pipeline
import torch
import torch.nn as nn
import os
import numpy as np
from PIL import Image

class GenderCNN(nn.Module):
    def __init__(self):
        super(GenderCNN, self).__init__()
        self.conv_layers = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.BatchNorm2d(32),
            nn.MaxPool2d(2, 2),
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.BatchNorm2d(64),
            nn.MaxPool2d(2, 2),
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.BatchNorm2d(128),
            nn.MaxPool2d(2, 2)
        )
        self.fc_layers = nn.Sequential(
            nn.Flatten(),
            nn.Linear(128 * 16 * 16, 256),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(256, 1),
            nn.Sigmoid()
        )

    def forward(self, x):
        x = self.conv_layers(x)
        x = self.fc_layers(x)
        return x

class ModelLoader:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelLoader, cls).__new__(cls)
            cls._instance._load_models()
        return cls._instance

    def _load_models(self):
        print("Initializing models...")
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Using device: {self.device}")

        # CNN - Load immediately as it's lightweight
        print("Loading CNN model...")
        self.cnn_model = GenderCNN()
        model_path = "models/gender_model.pth"
        if os.path.exists(model_path):
            try:
                self.cnn_model.load_state_dict(
                    torch.load(model_path, map_location=torch.device("cpu"))
                )
                print("CNN model weights loaded.")
            except Exception as e:
                print(f"Error loading CNN weights: {e}. Model will use random initialization or fallback.")
        self.cnn_model.eval()

        # Initialize pipelines as None - they will be loaded on first use (lazy loading)
        print("Models initialized with lazy loading strategy.")
        self._sentiment_pipeline = None
        self._qa_pipeline = None
        self._text_gen_pipeline = None
        self._translator_pipeline = None
        self._stt_pipeline = None
        self._zsl_pipeline = None
        self._gender_classifier = None

    # Lazy loading properties
    @property
    def sentiment_pipeline(self):
        if self._sentiment_pipeline is None:
            print("Loading Sentiment Analysis model...")
            self._sentiment_pipeline = self._safe_pipeline(
                "sentiment-analysis", 
                model="cardiffnlp/twitter-roberta-base-sentiment-latest"
            )
        return self._sentiment_pipeline
    
    @property
    def qa_pipeline(self):
        if self._qa_pipeline is None:
            print("Loading QA model...")
            self._qa_pipeline = self._safe_pipeline(
                "question-answering", 
                model="distilbert-base-cased-distilled-squad"
            )
        return self._qa_pipeline
    
    @property
    def text_gen_pipeline(self):
        if self._text_gen_pipeline is None:
            print("Loading Text Generation model...")
            self._text_gen_pipeline = self._safe_pipeline(
                "text-generation", 
                model="gpt2"
            )
        return self._text_gen_pipeline
    
    @property
    def translator_pipeline(self):
        if self._translator_pipeline is None:
            print("Loading Translation model...")
            self._translator_pipeline = self._safe_pipeline(
                "translation", 
                model="Helsinki-NLP/opus-mt-en-ur"
            )
        return self._translator_pipeline
    
    @property
    def stt_pipeline(self):
        if self._stt_pipeline is None:
            print("Loading STT model...")
            self._stt_pipeline = self._safe_pipeline(
                "automatic-speech-recognition", 
                model="openai/whisper-base"
            )
        return self._stt_pipeline
    
    @property
    def zsl_pipeline(self):
        if self._zsl_pipeline is None:
            print("Loading Zero-Shot Classification model...")
            self._zsl_pipeline = self._safe_pipeline(
                "zero-shot-classification", 
                model="facebook/bart-large-mnli"
            )
        return self._zsl_pipeline
    
    @property
    def gender_classifier(self):
        if self._gender_classifier is None:
            print("Loading Gender Classifier model...")
            self._gender_classifier = self._safe_pipeline(
                "image-classification", 
                model="prithivMLmods/Gender-Classifier-Mini"
            )
        return self._gender_classifier


    def _safe_pipeline(self, *args, **kwargs):
        try:
            # Explicitly set device (0 for CUDA if available, -1 for CPU)
            device_idx = 0 if self.device == "cuda" else -1
            return pipeline(*args, device=device_idx, **kwargs)
        except Exception as e:
            print(f"Failed to load pipeline {args} {kwargs}: {e}")
            return None

# Singleton instance
loader = ModelLoader()
