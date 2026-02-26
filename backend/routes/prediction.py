"""
Prediction routes — heart disease risk prediction using the ML model.
Every prediction is stored in MongoDB for history tracking.
"""

from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime
from database import get_db
from middleware.clerk_auth import get_current_user_id
from models.prediction import PredictionInput, PredictionOutput, PredictionRecord, Recommendations
from services.ml_service import predict
from services.openai_service import generate_risk_recommendations

router = APIRouter(prefix="/predict", tags=["Prediction"])


@router.post("/risk", response_model=PredictionOutput)
async def predict_risk(
    data: PredictionInput,
    user_id: str = Depends(get_current_user_id),
):
    """
    POST /predict/risk
    Runs the RandomForest model and returns heart disease probability,
    risk category, and confidence score. Stores result in MongoDB.
    """
    try:
        result = predict(data)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

    # Generate personalized AI recommendations (non-blocking — failure is graceful)
    recommendations = None
    try:
        rec_data = await generate_risk_recommendations(
            inputs=data.model_dump(),
            risk_category=result.risk_category,
            risk_percentage=result.risk_percentage,
        )
        recommendations = Recommendations(**rec_data)
    except Exception as rec_err:
        print(f"⚠️  Recommendations generation failed: {rec_err}")

    # Store in MongoDB for dashboard history
    db = get_db()
    record = PredictionRecord(
        user_id=user_id,
        input_data=data.model_dump(),
        probability=result.probability,
        risk_percentage=result.risk_percentage,
        risk_category=result.risk_category,
        confidence_score=result.confidence_score,
        recommendations=recommendations.model_dump() if recommendations else None,
        created_at=datetime.utcnow(),
    )
    inserted = await db.predictions.insert_one(record.model_dump())

    result.recommendations = recommendations
    return result


@router.get("/risk/{prediction_id}")
async def get_prediction(
    prediction_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """
    GET /predict/risk/{id}
    Fetch a single saved prediction (including recommendations) by its MongoDB ID.
    """
    db = get_db()
    try:
        oid = ObjectId(prediction_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid prediction ID")

    doc = await db.predictions.find_one({"_id": oid, "user_id": user_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Prediction not found")

    return {
        "id": str(doc["_id"]),
        "probability": doc["probability"],
        "risk_percentage": doc["risk_percentage"],
        "risk_category": doc["risk_category"],
        "confidence_score": doc["confidence_score"],
        "input_data": doc.get("input_data", {}),
        "recommendations": doc.get("recommendations"),
        "created_at": doc["created_at"].isoformat(),
    }
