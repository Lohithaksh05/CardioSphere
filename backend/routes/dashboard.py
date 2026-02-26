"""
Dashboard routes — risk history and progress trends.
"""

from fastapi import APIRouter, Depends, Query
from database import get_db
from middleware.clerk_auth import get_current_user_id

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/risk-history")
async def get_risk_history(
    limit: int = Query(default=20, ge=1, le=100),
    user_id: str = Depends(get_current_user_id),
):
    """
    GET /dashboard/risk-history
    Returns the user's recent prediction results for the dashboard.
    """
    db = get_db()
    cursor = (
        db.predictions.find({"user_id": user_id})
        .sort("created_at", -1)
        .limit(limit)
    )

    history = []
    async for doc in cursor:
        history.append({
            "id": str(doc["_id"]),
            "probability": doc["probability"],
            "risk_percentage": doc["risk_percentage"],
            "risk_category": doc["risk_category"],
            "confidence_score": doc["confidence_score"],
            "input_data": doc.get("input_data", {}),
            "has_recommendations": bool(doc.get("recommendations")),
            "created_at": doc["created_at"].isoformat(),
        })

    return history


@router.get("/progress-trend")
async def get_progress_trend(
    user_id: str = Depends(get_current_user_id),
):
    """
    GET /dashboard/progress-trend
    Returns aggregated trend data for the progress chart.
    Groups predictions by date and returns average risk per day.
    """
    db = get_db()
    pipeline = [
        {"$match": {"user_id": user_id}},
        {"$sort": {"created_at": 1}},
        {
            "$group": {
                "_id": {
                    "$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}
                },
                "avg_risk": {"$avg": "$risk_percentage"},
                "count": {"$sum": 1},
                "min_risk": {"$min": "$risk_percentage"},
                "max_risk": {"$max": "$risk_percentage"},
            }
        },
        {"$sort": {"_id": 1}},
        {"$limit": 30},
    ]

    results = []
    async for doc in db.predictions.aggregate(pipeline):
        results.append({
            "date": doc["_id"],
            "avg_risk": round(doc["avg_risk"], 2),
            "min_risk": round(doc["min_risk"], 2),
            "max_risk": round(doc["max_risk"], 2),
            "assessment_count": doc["count"],
        })

    return results


@router.get("/stats")
async def get_dashboard_stats(user_id: str = Depends(get_current_user_id)):
    """
    GET /dashboard/stats
    Returns summary statistics for the dashboard overview cards.
    """
    db = get_db()

    # Latest prediction
    latest = await db.predictions.find_one(
        {"user_id": user_id}, sort=[("created_at", -1)]
    )

    # Total predictions
    total_predictions = await db.predictions.count_documents({"user_id": user_id})

    # Medication adherence
    total_meds = await db.medications.count_documents({"user_id": user_id})
    taken_meds = await db.medications.count_documents(
        {"user_id": user_id, "adherence_status": True}
    )

    stats = {
        "latest_risk": {
            "percentage": latest["risk_percentage"] if latest else None,
            "category": latest["risk_category"] if latest else None,
            "date": latest["created_at"].isoformat() if latest else None,
        },
        "total_assessments": total_predictions,
        "medication_adherence": {
            "total": total_meds,
            "taken": taken_meds,
            "rate": round(taken_meds / total_meds * 100, 1) if total_meds > 0 else 0,
        },
    }

    # BMI from latest prediction
    if latest and "input_data" in latest:
        stats["latest_bmi"] = latest["input_data"].get("bmi")

    return stats
