import joblib
loaded_model = joblib.load('heart_disease_model.pkl')

sample_case = [1.0,1.0,1.0,30.0,1.0,0.0,2.0,0.0,1.0	,1.0,0.0,5.0,1.0,0.0,9.0]

probability = loaded_model.predict_proba([sample_case])[:, 1]

print(f'Probability of heart disease: {probability[0]*100}%')
