import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import roc_auc_score, accuracy_score, log_loss

data = pd.read_csv('data.csv')

X = data.drop(columns=['HeartDiseaseorAttack','Education','Income','NoDocbcCost','AnyHealthcare','MentHlth','PhysHlth'])
y = data['HeartDiseaseorAttack']
print(X)
print(y)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

rf_model = RandomForestClassifier(n_estimators=100, random_state=42)

rf_model.fit(X_train, y_train)

predicted_probabilities = rf_model.predict_proba(X_test)[:, 1]

roc_auc = roc_auc_score(y_test, predicted_probabilities)
accuracy = accuracy_score(y_test, (predicted_probabilities >= 0.5).astype(int))
log_loss_score = log_loss(y_test, predicted_probabilities)

print(f'ROC AUC: {roc_auc}')
print(f'Accuracy: {accuracy}')
print(f'Log Loss: {log_loss_score}')

import joblib

# Save the trained model to a file
joblib.dump(rf_model, 'heart_disease_model.pkl')
print("Model dumped!")
