import sys
import json
import joblib
import numpy as np
import os
import warnings

# Suppress sklearn warnings
warnings.filterwarnings("ignore")

MODEL_PATH = os.path.join(os.path.dirname(__file__), "crop_model.pkl")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "scaler.pkl")

# Read input JSON from Node.js
input_str = sys.stdin.read()
data = json.loads(input_str)

features = np.array([[
    data["N"],
    data["P"],
    data["K"],
    data["temperature"],
    data["humidity"],
    data["ph"],
    data["rainfall"]
]])

try:
    # Load model and scaler
    if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
        model = joblib.load(MODEL_PATH)
        scaler = joblib.load(SCALER_PATH)
        
        # Scale the features (important for ML model)
        features_scaled = scaler.transform(features)
        
        # Get prediction
        prediction = model.predict(features_scaled)[0]
        
        # Get prediction probabilities for confidence
        probabilities = model.predict_proba(features_scaled)[0]
        classes = model.classes_
        
        # Find confidence score
        max_prob_index = np.argmax(probabilities)
        confidence = probabilities[max_prob_index]
        
        print(json.dumps({
            "recommended_crop": prediction,
            "confidence": float(confidence),
            "model_used": "Random_Forest_ML_Model",
            "all_predictions": {
                crop: float(prob) for crop, prob in zip(classes, probabilities)
            }
        }))
    else:
        # Model not found error
        print(json.dumps({
            "error": "ML model not found. Please train the model first.",
            "message": "Run: python src/ml/train_crop_model.py"
        }))
        
except Exception as e:
    print(json.dumps({
        "error": f"Model prediction failed: {str(e)}",
        "message": "Check if model is properly trained"
    }))
