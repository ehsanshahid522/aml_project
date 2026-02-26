import traceback
from transformers import pipeline

try:
    pipe = pipeline('translation', model='Helsinki-NLP/opus-mt-en-ur')
except Exception as e:
    with open('trans_error.txt', 'w') as f:
        f.write(traceback.format_exc())
