# backend/models/labour_model.py
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline, FeatureUnion
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.base import BaseEstimator, TransformerMixin
import joblib

# Custom transformer to allow dual output
class LabourFeatures(BaseEstimator, TransformerMixin):
    def fit(self, X, y=None):
        return self
    def transform(self, X):
        return X.values

# Load dataset
df = pd.read_csv("../../data/indian_agri_labour_full_dataset.csv")

# ====== Targets ======
TARGET_REG = "Labour_Required"
TARGET_CLS = "Labour_Demand_Level"

if TARGET_CLS not in df.columns:
    df[TARGET_CLS] = pd.cut(df["Labour_Per_Acre_est"], bins=[-1,1.5,2.5,4.0,10],
                             labels=["Very_Low","Low","Medium","High"])

X = df.drop(columns=[TARGET_REG, TARGET_CLS])
y_reg = df[TARGET_REG]
y_cls = df[TARGET_CLS].astype(str)

cat_cols = X.select_dtypes(include=['object']).columns.tolist()
num_cols = X.select_dtypes(include=[np.number]).columns.tolist()

preprocessor = ColumnTransformer(transformers=[
    ("cat", OneHotEncoder(handle_unknown='ignore'), cat_cols)
], remainder='passthrough')

# Regression pipeline
reg_pipe = Pipeline([
    ("pre", preprocessor),
    ("reg", RandomForestRegressor(n_estimators=200, random_state=42, n_jobs=-1))
])

# Classification pipeline
cls_pipe = Pipeline([
    ("pre", preprocessor),
    ("clf", RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1))
])

# Split data
X_train, X_test, y_train_r, y_test_r, y_train_c, y_test_c = train_test_split(
    X, y_reg, y_cls, test_size=0.2, random_state=42, stratify=y_cls
)

# Train models
reg_pipe.fit(X_train, y_train_r)
cls_pipe.fit(X_train, y_train_c)

# Unified prediction function
class LabourRecommender:
    def __init__(self, reg_model, cls_model):
        self.reg_model = reg_model
        self.cls_model = cls_model
    
    def predict(self, X):
        labour_required = self.reg_model.predict(X)
        demand_level = self.cls_model.predict(X)
        return [{"Labour_Required": lr, "Labour_Demand_Level": dl} 
                for lr, dl in zip(labour_required, demand_level)]

# Save unified model
labour_model = LabourRecommender(reg_pipe, cls_pipe)
joblib.dump(labour_model, "../saved_models/labour_model.joblib")
print("Saved unified labour recommendation model as labour_model.joblib")
