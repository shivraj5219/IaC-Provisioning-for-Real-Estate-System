import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import os

def create_yield_dataset():
    """Create comprehensive synthetic yield dataset"""
    np.random.seed(42)
    
    states = ["Punjab", "Haryana", "UP", "MP", "Maharashtra", "Karnataka", "Tamil Nadu", "AP"]
    seasons = ["Kharif", "Rabi", "Zaid"]
    crops = ["Rice", "Wheat", "Maize", "Cotton", "Sugarcane", "Soybean"]
    years = list(range(2015, 2024))
    
    data = []
    
    # Generate realistic yield data
    for _ in range(2000):
        state = np.random.choice(states)
        season = np.random.choice(seasons)
        crop = np.random.choice(crops)
        year = np.random.choice(years)
        
        # Base area (in hectares)
        area = np.random.uniform(100, 5000)
        
        # Rainfall (mm) - varies by season
        if season == "Kharif":
            rainfall = np.random.normal(800, 200)
        elif season == "Rabi":
            rainfall = np.random.normal(200, 80)
        else:  # Zaid
            rainfall = np.random.normal(300, 100)
        
        # Temperature (°C) - varies by season
        if season == "Kharif":
            temperature = np.random.normal(28, 3)
        elif season == "Rabi":
            temperature = np.random.normal(20, 3)
        else:
            temperature = np.random.normal(32, 3)
        
        # Fertilizer usage (kg/ha)
        fertilizer = np.random.normal(150, 40)
        
        # Pesticide usage (kg/ha)
        pesticide = np.random.normal(3, 1)
        
        # Calculate yield based on crop type and conditions
        base_yields = {
            "Rice": 3.5,
            "Wheat": 3.2,
            "Maize": 4.0,
            "Cotton": 2.0,
            "Sugarcane": 70.0,
            "Soybean": 1.5
        }
        
        base_yield = base_yields[crop]
        
        # Yield factors
        rainfall_factor = 1 + (rainfall - 500) / 1000
        temp_factor = 1 - abs(temperature - 25) / 50
        fertilizer_factor = 1 + (fertilizer - 100) / 500
        year_factor = 1 + (year - 2015) * 0.02  # Yield improvement over years
        
        # Calculate production per hectare
        yield_per_ha = base_yield * rainfall_factor * temp_factor * fertilizer_factor * year_factor
        yield_per_ha = max(yield_per_ha, 0.5)  # Minimum yield
        
        # Total production
        production = area * yield_per_ha
        
        data.append([
            state, year, season, crop, area, rainfall, 
            temperature, fertilizer, pesticide, production
        ])
    
    df = pd.DataFrame(data, columns=[
        "State", "Year", "Season", "Crop", "Area", "Rainfall",
        "Temperature", "Fertilizer", "Pesticide", "Production"
    ])
    
    return df

def train_model():
    print("Creating synthetic yield dataset...")
    df = create_yield_dataset()
    
    print(f"Dataset created with {len(df)} samples")
    print(f"\nDataset statistics:")
    print(df.describe())
    
    # Save label encoders for later use
    label_encoders = {}
    
    # Encode categorical features
    for col in ["State", "Season", "Crop"]:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
        label_encoders[col] = le
    
    # Prepare features and target
    X = df[["State", "Year", "Season", "Crop", "Area", "Rainfall", "Temperature", "Fertilizer", "Pesticide"]]
    y = df["Production"]
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train Random Forest model
    print("\nTraining Random Forest Regressor...")
    model = RandomForestRegressor(
        n_estimators=100, 
        max_depth=15,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train_scaled, y_train)
    
    # Evaluate the model
    y_pred = model.predict(X_test_scaled)
    
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    
    print(f"\nModel Performance:")
    print(f"MAE: {mae:.2f}")
    print(f"RMSE: {rmse:.2f}")
    print(f"R² Score: {r2:.3f}")
    
    # Save the model, scaler, and encoders
    model_dir = os.path.dirname(__file__)
    
    joblib.dump(model, os.path.join(model_dir, "yield_model.pkl"))
    joblib.dump(scaler, os.path.join(model_dir, "yield_scaler.pkl"))
    joblib.dump(label_encoders, os.path.join(model_dir, "yield_encoders.pkl"))
    
    print(f"\nModel saved to: {os.path.join(model_dir, 'yield_model.pkl')}")
    print(f"Scaler saved to: {os.path.join(model_dir, 'yield_scaler.pkl')}")
    print(f"Encoders saved to: {os.path.join(model_dir, 'yield_encoders.pkl')}")
    
    # Feature importance
    feature_names = ["State", "Year", "Season", "Crop", "Area", "Rainfall", "Temperature", "Fertilizer", "Pesticide"]
    importance = model.feature_importances_
    
    print("\nFeature Importance:")
    for name, imp in sorted(zip(feature_names, importance), key=lambda x: x[1], reverse=True):
        print(f"{name}: {imp:.3f}")

if __name__ == "__main__":
    train_model()
