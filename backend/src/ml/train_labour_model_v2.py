#!/usr/bin/env python3
"""
Train Labour Prediction Model for Indian Agriculture
"""
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler, LabelEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.metrics import mean_squared_error, accuracy_score, classification_report
import joblib
import warnings
from labour_recommender import LabourRecommender
warnings.filterwarnings('ignore')

def train_labour_model(dataset_path="indian_agri_labour_full_dataset.csv"):
    """Train the labour prediction model"""
    
    print("Loading dataset...")
    df = pd.read_csv(dataset_path)
    print(f"Dataset loaded: {df.shape}")
    
    # Define targets
    TARGET_REG = "Labour_Required"
    TARGET_CLS = "Labour_Demand_Level"
    
    # Prepare features (exclude target columns and derived/cost columns)
    feature_columns = [
        'Crop', 'Season', 'Region', 'Soil_Type', 'Irrigation_Type',
        'Mechanization_Level', 'Labour_Availability', 'Gender_Split',
        'Farm_Size_Acre', 'Task', 'Prev_Yield_q_per_acre', 'Weather_Index'
    ]
    
    # Handle missing values in Mechanization_Level
    df['Mechanization_Level'] = df['Mechanization_Level'].fillna('Unknown')
    
    # Prepare feature matrix
    X = df[feature_columns].copy()
    y_reg = df[TARGET_REG]
    y_cls = df[TARGET_CLS]
    
    print(f"Features: {X.columns.tolist()}")
    print(f"Feature matrix shape: {X.shape}")
    print(f"Target classes: {y_cls.unique()}")
    
    # Identify categorical and numerical columns
    cat_cols = X.select_dtypes(include=['object']).columns.tolist()
    num_cols = X.select_dtypes(include=[np.number]).columns.tolist()
    
    print(f"Categorical columns: {cat_cols}")
    print(f"Numerical columns: {num_cols}")
    
    # Create preprocessor
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), cat_cols),
            ('num', StandardScaler(), num_cols)
        ],
        remainder='drop'
    )
    
    # Create regression pipeline
    reg_pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(
            n_estimators=100,
            random_state=42,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            n_jobs=-1
        ))
    ])
    
    # Create classification pipeline
    cls_pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(
            n_estimators=100,
            random_state=42,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            n_jobs=-1
        ))
    ])
    
    # Split data
    X_train, X_test, y_train_reg, y_test_reg, y_train_cls, y_test_cls = train_test_split(
        X, y_reg, y_cls, test_size=0.2, random_state=42, stratify=y_cls
    )
    
    print(f"Training set size: {X_train.shape[0]}")
    print(f"Test set size: {X_test.shape[0]}")
    
    # Train models
    print("Training regression model...")
    reg_pipeline.fit(X_train, y_train_reg)
    
    print("Training classification model...")
    cls_pipeline.fit(X_train, y_train_cls)
    
    # Evaluate models
    print("\nModel Evaluation:")
    print("=" * 40)
    
    # Regression evaluation
    reg_pred = reg_pipeline.predict(X_test)
    rmse = np.sqrt(mean_squared_error(y_test_reg, reg_pred))
    print(f"Regression RMSE: {rmse:.3f}")
    
    # Classification evaluation
    cls_pred = cls_pipeline.predict(X_test)
    accuracy = accuracy_score(y_test_cls, cls_pred)
    print(f"Classification Accuracy: {accuracy:.3f}")
    print("\nClassification Report:")
    print(classification_report(y_test_cls, cls_pred))
    
    # Create unified model
    labour_model = LabourRecommender(reg_pipeline, cls_pipeline, feature_columns)
    
    # Test the unified model
    print("\nTesting unified model...")
    test_sample = X_test.iloc[:3]
    predictions = labour_model.predict(test_sample)
    print("Sample predictions:")
    for i, pred in enumerate(predictions):
        print(f"  Sample {i+1}: {pred}")
    
    # Save the model
    model_path = "labour_model.joblib"
    joblib.dump(labour_model, model_path)
    print(f"\nModel saved as: {model_path}")
    
    return labour_model

if __name__ == "__main__":
    try:
        model = train_labour_model()
        print("✅ Model training completed successfully!")
    except Exception as e:
        print(f"❌ Error during training: {e}")
        import traceback
        traceback.print_exc()