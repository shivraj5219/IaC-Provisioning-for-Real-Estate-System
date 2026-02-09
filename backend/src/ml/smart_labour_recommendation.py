"""
Smart Labour Recommendation System using ML
Combines database matching with ML-based labour requirement prediction
"""
import sys
import json
import pandas as pd
import numpy as np
from pathlib import Path

# Try to load the ML model if it exists
try:
    import joblib
    model_path = Path(__file__).parent / "labour_model.joblib"
    if model_path.exists():
        labour_model = joblib.load(model_path)
        HAS_ML_MODEL = True
    else:
        HAS_ML_MODEL = False
except:
    HAS_ML_MODEL = False

def calculate_labour_requirement(crop_type, area, season=None):
    """
    Calculate labour requirement using ML model or fallback heuristics
    
    Args:
        crop_type: Type of crop (Rice, Wheat, etc.)
        area: Area in hectares
        season: Growing season (Kharif, Rabi, Zaid)
    
    Returns:
        dict with labour_required and confidence
    """
    
    # Fallback heuristics if model not available
    labour_per_hectare = {
        'Rice': 3.5,
        'Wheat': 2.5,
        'Cotton': 4.0,
        'Sugarcane': 5.0,
        'Maize': 2.0,
        'Soybean': 1.5,
        'Vegetables': 6.0,
        'Fruits': 4.5,
        'default': 3.0
    }
    
    # Season multipliers
    season_factor = {
        'Kharif': 1.2,  # More labour intensive (monsoon season)
        'Rabi': 1.0,    # Normal
        'Zaid': 0.8,    # Summer crops, less labour
        'default': 1.0
    }
    
    if HAS_ML_MODEL:
        try:
            # Prepare input for ML model
            input_data = pd.DataFrame({
                'Crop': [crop_type],
                'Area_Hectares': [area],
                'Season': [season or 'Kharif']
            })
            
            # Get prediction
            prediction = labour_model.predict(input_data)[0]
            labour_required = int(prediction['Labour_Required'])
            demand_level = prediction['Labour_Demand_Level']
            
            return {
                'labour_required': labour_required,
                'demand_level': demand_level,
                'confidence': 0.85,
                'method': 'ml_model'
            }
        except Exception as e:
            print(f"ML prediction failed: {e}", file=sys.stderr)
            # Fall through to heuristic method
    
    # Heuristic calculation
    base_rate = labour_per_hectare.get(crop_type, labour_per_hectare['default'])
    season_mult = season_factor.get(season, season_factor['default'])
    
    labour_required = int(np.ceil(area * base_rate * season_mult))
    
    # Determine demand level
    labour_per_hectare_calc = labour_required / area if area > 0 else 0
    if labour_per_hectare_calc < 1.5:
        demand_level = "Low"
    elif labour_per_hectare_calc < 3.0:
        demand_level = "Medium"
    elif labour_per_hectare_calc < 4.5:
        demand_level = "High"
    else:
        demand_level = "Very_High"
    
    return {
        'labour_required': labour_required,
        'demand_level': demand_level,
        'confidence': 0.70,
        'method': 'heuristic'
    }

def main():
    """
    Main function to handle command line input
    Expected input format:
    {
        "crop_type": "Rice",
        "area": 100,
        "season": "Kharif"
    }
    """
    try:
        # Read input from stdin
        input_data = json.loads(sys.stdin.read())
        
        crop_type = input_data.get('crop_type', 'Rice')
        area = float(input_data.get('area', 10))
        season = input_data.get('season', 'Kharif')
        
        # Calculate labour requirement
        result = calculate_labour_requirement(crop_type, area, season)
        
        # Output result
        output = {
            'success': True,
            'crop_type': crop_type,
            'area_hectares': area,
            'season': season,
            'labour_required': result['labour_required'],
            'demand_level': result['demand_level'],
            'labour_per_hectare': round(result['labour_required'] / area, 2) if area > 0 else 0,
            'confidence': result['confidence'],
            'method': result['method'],
            'recommendations': [
                f"Total labour required: {result['labour_required']} workers",
                f"Labour intensity: {result['demand_level']}",
                f"Estimated per hectare: {round(result['labour_required'] / area, 2) if area > 0 else 0} workers/ha",
                "Consider hiring experienced workers for better efficiency" if result['demand_level'] in ['High', 'Very_High'] else "Standard workforce should suffice"
            ]
        }
        
        print(json.dumps(output))
        sys.exit(0)
        
    except Exception as e:
        error_output = {
            'success': False,
            'error': str(e),
            'message': 'Failed to calculate labour requirement'
        }
        print(json.dumps(error_output))
        sys.exit(1)

if __name__ == '__main__':
    main()
