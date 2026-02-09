#!/usr/bin/env python3
"""
Test the labour controller Python script directly
"""
import sys
import os
import json

# Add the ML directory to Python path
ml_dir = "src/ml"
sys.path.append(ml_dir)

import joblib
import pandas as pd
import numpy as np
from labour_recommender import LabourRecommender

def test_controller_python():
    """Test the Python script that the controller uses"""
    try:
        # Load the trained model
        model_path = "src/ml/labour_model.joblib"
        
        if not os.path.exists(model_path):
            print(json.dumps({"error": "Model file not found"}))
            return False
        
        # Load model
        model = joblib.load(model_path)
        print("✅ Model loaded successfully")
        
        # Test input data
        input_data = [
            {
                "Crop": "Rice",
                "Season": "Kharif",
                "Region": "Uttar_Pradesh",
                "Soil_Type": "Black",
                "Irrigation_Type": "Canal",
                "Mechanization_Level": "Medium",
                "Labour_Availability": "Medium",
                "Gender_Split": "Mixed",
                "Farm_Size_Acre": 2.5,
                "Task": "Harvesting",
                "Prev_Yield_q_per_acre": 25.0,
                "Weather_Index": 0.9
            }
        ]
        
        # Make prediction
        predictions = model.predict(input_data)
        print("✅ Predictions made successfully")
        
        # Output as JSON (like the controller does)
        result = json.dumps(predictions)
        print(f"Result: {result}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_controller_python()
    if success:
        print("\n🎉 Controller Python script test successful!")
    else:
        print("\n💥 Controller Python script test failed!")