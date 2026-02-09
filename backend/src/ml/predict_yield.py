import sys
import json
import joblib
import numpy as np
import os
import warnings

# Suppress sklearn warnings
warnings.filterwarnings("ignore")

MODEL_PATH = os.path.join(os.path.dirname(__file__), "yield_model.pkl")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "yield_scaler.pkl")
ENCODERS_PATH = os.path.join(os.path.dirname(__file__), "yield_encoders.pkl")

# Read input JSON from Node.js
input_str = sys.stdin.read()
data = json.loads(input_str)

# Load encoders if available
if os.path.exists(ENCODERS_PATH):
    encoders = joblib.load(ENCODERS_PATH)
    state_encoded = encoders["State"].transform([data["State"]])[0]
    season_encoded = encoders["Season"].transform([data["Season"]])[0]
    crop_encoded = encoders["Crop"].transform([data["Crop"]])[0]
else:
    # Fallback encoding
    state_map = {"Punjab": 0, "Haryana": 1, "UP": 2, "MP": 3, "Maharashtra": 4, 
                 "Karnataka": 5, "Tamil Nadu": 6, "AP": 7, "Gujarat": 8, "Rajasthan": 9}
    season_map = {"Kharif": 0, "Rabi": 1, "Zaid": 2}
    crop_map = {"Rice": 0, "Wheat": 1, "Maize": 2, "Cotton": 3, "Sugarcane": 4, "Soybean": 5}
    
    state_encoded = state_map.get(data["State"], 0)
    season_encoded = season_map.get(data["Season"], 0)
    crop_encoded = crop_map.get(data["Crop"], 0)

# Prepare features with all 9 parameters
features = np.array([[
    state_encoded,
    data["Year"],
    season_encoded,
    crop_encoded,
    data["Area"],
    data["Rainfall"],
    data.get("Temperature", 25),  # Default if not provided
    data.get("Fertilizer", 150),  # Default if not provided
    data.get("Pesticide", 3)      # Default if not provided
]])

try:
    # Load model and scaler if available
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
        
        # Use scaler if available
        if os.path.exists(SCALER_PATH):
            scaler = joblib.load(SCALER_PATH)
            features_scaled = scaler.transform(features)
            prediction = model.predict(features_scaled)[0]
        else:
            prediction = model.predict(features)[0]
        
        print(json.dumps({
            "predicted_production": round(float(prediction), 2),
            "yield_per_hectare": round(float(prediction) / data["Area"], 2),
            "model_used": "Random_Forest_Regressor",
            "unit": "tons",
            "confidence": "High"
        }))
    else:
        # Fallback rule-based calculation
        crop_factors = {"Rice": 3.5, "Wheat": 3.2, "Soybean": 1.5, "Maize": 4.0, "Cotton": 2.0, "Sugarcane": 70.0}
        crop_name = data.get("Crop", "Rice")
        crop_factor = crop_factors.get(crop_name, 2.0)
        
        # Calculate production
        production = data["Area"] * crop_factor
        
        print(json.dumps({
            "predicted_production": round(production, 2),
            "yield_per_hectare": round(crop_factor, 2),
            "model_used": "Rule_Based_Fallback",
            "unit": "tons",
            "note": "ML model not available, using rule-based prediction"
        }))
        
except Exception as e:
    print(json.dumps({
        "error": f"Prediction failed: {str(e)}",
        "predicted_production": 0,
        "yield_per_hectare": 0,
        "model_used": "Error_Fallback"
    }))

