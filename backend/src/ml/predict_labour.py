#!/usr/bin/env python3
"""
Predict Labour Requirements using trained ML model
"""
import sys
import json
import pandas as pd
import joblib
from pathlib import Path

def predict_labour(input_data):
    """
    Predict labour requirements using trained model
    """
    try:
        # Load the trained model
        model_path = Path(__file__).parent / "labour_model.joblib"
        
        if not model_path.exists():
            # Fallback to heuristic calculation
            farm_size = input_data[0].get('Farm_Size_Acre', 30)
            labour_per_acre = 3  # Default estimate
            
            labour_required = int(farm_size * labour_per_acre)
            
            return [{
                'Labour_Required': labour_required,
                'Labour_Demand_Level': 'Medium',
                'method': 'heuristic',
                'message': 'ML model not found, using heuristic calculation'
            }]
        
        # Load model
        model = joblib.load(model_path)
        
        # Convert input to DataFrame
        df = pd.DataFrame(input_data)
        
        # Make predictions
        predictions = model.predict(df)
        
        return predictions
        
    except Exception as e:
        print(f"Error in prediction: {e}", file=sys.stderr)
        # Fallback calculation
        farm_size = input_data[0].get('Farm_Size_Acre', 30)
        return [{
            'Labour_Required': int(farm_size * 3),
            'Labour_Demand_Level': 'Medium',
            'method': 'fallback',
            'error': str(e)
        }]

def main():
    """
    Main function to handle stdin input
    """
    try:
        # Read input from stdin
        input_json = sys.stdin.read()
        input_data = json.loads(input_json)
        
        # Make prediction
        predictions = predict_labour(input_data)
        
        # Output result
        print(json.dumps(predictions))
        sys.exit(0)
        
    except Exception as e:
        error_output = {
            'error': str(e),
            'message': 'Failed to predict labour requirement'
        }
        print(json.dumps([error_output]), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
