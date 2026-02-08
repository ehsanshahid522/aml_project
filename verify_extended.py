
import sys
import os
import torch
import numpy as np
import pandas as pd
import librosa
from models_loader import loader

def test_extended():
    print("--- Starting Extended Model Verification ---")

    # 1. STT (Speech to Text)
    print("\nTesting STT (Whisper)...")
    if loader.stt_pipeline:
        try:
            # Create a 1-second silent audio array
            audio_array = np.zeros(16000, dtype=np.float32)
            res = loader.stt_pipeline(audio_array)
            print(f"STT Result: {res}")
        except Exception as e:
            print(f"FAILED: STT pipeline error: {e}")
    else:
        print("FAILED: STT pipeline not loaded")

    # 2. DBSCAN
    print("\nTesting DBSCAN...")
    try:
        from sklearn.cluster import DBSCAN
        data = np.random.rand(10, 2)
        db = DBSCAN(eps=0.3, min_samples=2).fit(data)
        print(f"DBSCAN labels: {db.labels_}")
    except Exception as e:
        print(f"FAILED: DBSCAN error: {e}")

    # 3. Apriori
    print("\nTesting Apriori...")
    try:
        from mlxtend.frequent_patterns import apriori, association_rules
        from mlxtend.preprocessing import TransactionEncoder
        dataset = [['Milk', 'Onion', 'Nut', 'Kidney Beans', 'Eggs', 'Yogurt'],
                   ['Dill', 'Onion', 'Nut', 'Kidney Beans', 'Eggs', 'Yogurt'],
                   ['Milk', 'Apple', 'Kidney Beans', 'Eggs'],
                   ['Milk', 'Unicorn', 'Corn', 'Kidney Beans', 'Yogurt'],
                   ['Corn', 'Onion', 'Onion', 'Kidney Beans', 'Ice cream', 'Eggs']]
        te = TransactionEncoder()
        te_ary = te.fit(dataset).transform(dataset)
        df = pd.DataFrame(te_ary, columns=te.columns_)
        freq = apriori(df, min_support=0.6, use_colnames=True)
        rules = association_rules(freq, metric="lift", min_threshold=0.7)
        print(f"Apriori rules found: {len(rules)}")
    except Exception as e:
        print(f"FAILED: Apriori error: {e}")

    print("\n--- Extended Verification Complete ---")

if __name__ == "__main__":
    test_extended()
