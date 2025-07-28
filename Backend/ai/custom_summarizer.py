import sys
from transformers import pipeline, BartTokenizer

def summarize(title, headings, main_text):
    # Combine title, headings, and main text for context
    input_text = f"Title: {title}\nHeadings: {headings}\nContent: {main_text}"
    tokenizer = BartTokenizer.from_pretrained("facebook/bart-large-cnn")
    # Truncate input to max model length (1024 tokens)
    inputs = tokenizer.encode(input_text, max_length=1024, truncation=True, return_tensors="pt")
    truncated_text = tokenizer.decode(inputs[0], skip_special_tokens=True)
    summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
    summary = summarizer(truncated_text, max_length=150, min_length=40, do_sample=False)[0]['summary_text']
    return summary

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: custom_summarizer.py <title> <headings> <main_text_path>")
        sys.exit(1)
    title = sys.argv[1]
    headings = sys.argv[2]
    main_text_path = sys.argv[3]
    with open(main_text_path, "r", encoding="utf-8") as f:
        main_text = f.read()
    summary = summarize(title, headings, main_text)
    sys.stdout.buffer.write(summary.encode("utf-8"))

# Required installations:
# pip install transformers torch

# Training section for fine-tuning BART on CNN/DailyMail
def train_bart_on_cnn_dailymail():
    from datasets import load_dataset
    from transformers import BartTokenizer, BartForConditionalGeneration, Trainer, TrainingArguments

    # Load dataset
    dataset = load_dataset("cnn_dailymail", "3.0.0")
    tokenizer = BartTokenizer.from_pretrained("facebook/bart-large-cnn")
    model = BartForConditionalGeneration.from_pretrained("facebook/bart-large-cnn")

    # Tokenize function
    def preprocess(examples):
        inputs = examples["article"]
        targets = examples["highlights"]
        model_inputs = tokenizer(inputs, max_length=1024, truncation=True)
        with tokenizer.as_target_tokenizer():
            labels = tokenizer(targets, max_length=128, truncation=True)
        model_inputs["labels"] = labels["input_ids"]
        return model_inputs

    # Prepare tokenized datasets
    tokenized_datasets = dataset.map(preprocess, batched=True, remove_columns=dataset["train"].column_names)

    # Training arguments
    training_args = TrainingArguments(
        output_dir="./bart_cnn_model",
        per_device_train_batch_size=2,
        num_train_epochs=1,  # Increase for better results
        save_steps=500,
        save_total_limit=2,
        logging_steps=100,
        evaluation_strategy="no",
        fp16=True,
    )

    # Trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_datasets["train"].select(range(2000)),  # Use more for better results
    )

    # Train
    trainer.train()
    model.save_pretrained("./bart_cnn_model")
    tokenizer.save_pretrained("./bart_cnn_model")
    print("Model trained and saved to ./bart_cnn_model")

# To run training, uncomment the following line:
# train_bart_on_cnn_dailymail()
