from flask import Flask, request, jsonify
from flask_cors import CORS  # Import the CORS extension
import joblib

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the trained model
loaded_model = joblib.load('heart_disease_model.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    # Get the feature values from the JSON payload
    feature_values = request.get_json()['data']
    print(feature_values)
    
    # Make predictions using the loaded model
    probability = loaded_model.predict_proba([feature_values])[:, 1]

    # Return the predicted probability as JSON
    return jsonify({'probability': probability[0]})

if __name__ == '__main__':
    app.run(debug=True)
