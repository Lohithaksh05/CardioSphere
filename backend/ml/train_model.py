"""
Train the heart disease RandomForest model and save it as a .pkl file.
Uses the BRFSS dataset from model/data.csv.
Run this script once to generate ml/heart_disease_model.pkl.
"""

import os
import sys
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import roc_auc_score, accuracy_score, log_loss
import joblib

# Path to data (relative to project root)
DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "model", "data.csv")
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "heart_disease_model.pkl")


def train():
    print("📊 Loading data...")
    data = pd.read_csv(DATA_PATH)

    # Drop columns not used by the model
    drop_cols = ["Education", "Income", "NoDocbcCost", "AnyHealthcare", "MentHlth", "PhysHlth"]
    X = data.drop(columns=["HeartDiseaseorAttack"] + drop_cols)
    y = data["HeartDiseaseorAttack"]

    print(f"Features ({len(X.columns)}): {list(X.columns)}")
    print(f"Dataset size: {len(X)} samples")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    print("🏋️ Training RandomForest...")
    model = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    # Evaluate
    proba = model.predict_proba(X_test)[:, 1]
    roc_auc = roc_auc_score(y_test, proba)
    accuracy = accuracy_score(y_test, (proba >= 0.5).astype(int))
    ll = log_loss(y_test, proba)

    print(f"✅ ROC AUC:  {roc_auc:.4f}")
    print(f"✅ Accuracy: {accuracy:.4f}")
    print(f"✅ Log Loss: {ll:.4f}")

    # Save model
    joblib.dump(model, OUTPUT_PATH)
    print(f"💾 Model saved to {OUTPUT_PATH}")


if __name__ == "__main__":
    train()
