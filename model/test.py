from transformers import GPT2LMHeadModel, GPT2Tokenizer

# Load pre-trained GPT-2 model and tokenizer
model = GPT2LMHeadModel.from_pretrained("gpt2")
tokenizer = GPT2Tokenizer.from_pretrained("gpt2")

# Example user input
user_input = "what color is the sky?"

# Tokenize and encode user input
input_ids = tokenizer.encode(user_input, return_tensors="pt")

# Generate response from the model
output = model.generate(input_ids, max_length=200, num_return_sequences=1, no_repeat_ngram_size=2, top_k=50, top_p=0.80, temperature=0.7,do_sample=True)

# Decode and print the generated response
generated_response = tokenizer.decode(output[0], skip_special_tokens=True)
print(generated_response)
