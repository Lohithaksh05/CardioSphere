from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import joblib
import uvicorn

app = FastAPI(title="CardioSphere Prediction API", version="1.0.0")

# Enable CORS for all origins (same behaviour as Flask-Cors default)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the trained model once at startup
loaded_model = joblib.load('heart_disease_model.pkl')


class PredictRequest(BaseModel):
    data: List[float]


@app.get("/")
def health_check():
    return {"status": "CardioSphere API is running"}


@app.post("/predict")
def predict(payload: PredictRequest):
    try:
        print(payload.data)
        probability = loaded_model.predict_proba([payload.data])[:, 1]
        return {"probability": float(probability[0])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == '__main__':
    uvicorn.run("app:app", host="0.0.0.0", port=5000, reload=True)
