# filepath: c:\Users\Hp\OneDrive\Desktop\Adobe project\Backend\ai\download_cnn_dailymail.py
from datasets import load_dataset

# Download the dataset
dataset = load_dataset("cnn_dailymail", "3.0.0")

# Save a small sample to a local file for inspection
dataset["train"].select(range(10)).to_csv("cnn_dailymail_sample.csv")
print("Sample saved as cnn_dailymail_sample.csv")