import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os

# Create synthetic dataset based on real crop requirements
def create_crop_dataset():
    np.random.seed(42)
    
    crops_data = []
    
    # Rice - High water, moderate NPK
    for _ in range(200):
        crops_data.append([
            np.random.normal(80, 15),   # N
            np.random.normal(40, 10),   # P  
            np.random.normal(40, 10),   # K
            np.random.normal(25, 3),    # temperature
            np.random.normal(80, 5),    # humidity
            np.random.normal(6.5, 0.5), # ph
            np.random.normal(200, 50),  # rainfall
            'rice'
        ])
    
    # Wheat - Cool weather, moderate NPK
    for _ in range(200):
        crops_data.append([
            np.random.normal(50, 10),   # N
            np.random.normal(20, 5),    # P
            np.random.normal(30, 8),    # K
            np.random.normal(18, 2),    # temperature
            np.random.normal(60, 10),   # humidity
            np.random.normal(6.8, 0.3), # ph
            np.random.normal(100, 30),  # rainfall
            'wheat'
        ])
    
    # Maize - High N, warm weather
    for _ in range(200):
        crops_data.append([
            np.random.normal(120, 20),  # N
            np.random.normal(60, 15),   # P
            np.random.normal(50, 12),   # K
            np.random.normal(27, 3),    # temperature
            np.random.normal(70, 8),    # humidity
            np.random.normal(6.2, 0.4), # ph
            np.random.normal(150, 40),  # rainfall
            'maize'
        ])
    
    # Cotton - Hot, dry conditions
    for _ in range(200):
        crops_data.append([
            np.random.normal(90, 15),   # N
            np.random.normal(30, 8),    # P
            np.random.normal(40, 10),   # K
            np.random.normal(32, 2),    # temperature
            np.random.normal(50, 8),    # humidity
            np.random.normal(7.0, 0.3), # ph
            np.random.normal(80, 20),   # rainfall
            'cotton'
        ])
    
    # Sugarcane - High NPK, hot humid
    for _ in range(200):
        crops_data.append([
            np.random.normal(150, 25),  # N
            np.random.normal(80, 20),   # P
            np.random.normal(100, 25),  # K
            np.random.normal(30, 2),    # temperature
            np.random.normal(85, 5),    # humidity
            np.random.normal(6.5, 0.4), # ph
            np.random.normal(250, 60),  # rainfall
            'sugarcane'
        ])
    
    # Soybean - Moderate conditions
    for _ in range(200):
        crops_data.append([
            np.random.normal(70, 12),   # N
            np.random.normal(45, 10),   # P
            np.random.normal(60, 15),   # K
            np.random.normal(28, 3),    # temperature
            np.random.normal(75, 8),    # humidity
            np.random.normal(6.8, 0.3), # ph
            np.random.normal(180, 45),  # rainfall
            'soybean'
        ])
    
    # Tomato - High NPK, controlled conditions
    for _ in range(200):
        crops_data.append([
            np.random.normal(200, 30),  # N
            np.random.normal(100, 20),  # P
            np.random.normal(150, 30),  # K
            np.random.normal(24, 2),    # temperature
            np.random.normal(65, 10),   # humidity
            np.random.normal(6.3, 0.4), # ph
            np.random.normal(120, 25),  # rainfall
            'tomato'
        ])
    
    df = pd.DataFrame(crops_data, columns=[
        'N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall', 'crop'
    ])
    
    return df

def train_model():
    print("Creating synthetic crop dataset...")
    df = create_crop_dataset()
    
    print(f"Dataset created with {len(df)} samples")
    print(f"Crops: {df['crop'].unique()}")
    print(f"Class distribution:\n{df['crop'].value_counts()}")
    
    # Prepare features and target
    X = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
    y = df['crop']
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Scale the features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train Random Forest model
    print("Training Random Forest model...")
    model = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=10)
    model.fit(X_train_scaled, y_train)
    
    # Evaluate the model
    y_pred = model.predict(X_test_scaled)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"Model Accuracy: {accuracy:.3f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Save the model and scaler
    model_dir = os.path.dirname(__file__)
    model_path = os.path.join(model_dir, "crop_model.pkl")
    scaler_path = os.path.join(model_dir, "scaler.pkl")
    
    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)
    
    print(f"Model saved to: {model_path}")
    print(f"Scaler saved to: {scaler_path}")
    
    # Feature importance
    feature_names = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
    importance = model.feature_importances_
    
    print("\nFeature Importance:")
    for name, imp in zip(feature_names, importance):
        print(f"{name}: {imp:.3f}")

if __name__ == "__main__":
    train_model()