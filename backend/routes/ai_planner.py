"""
AI Planner routes — generates workout plans and diet plans via OpenAI.
"""

from datetime import datetime, timezone
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from middleware.clerk_auth import get_current_user_id
from models.ai_planner import WorkoutRequest, DietRequest
from services.openai_service import generate_workout_plan, generate_diet_plan
from database import get_db

router = APIRouter(prefix="/generate", tags=["AI Planner"])


@router.post("/workout")
async def create_workout_plan(
    data: WorkoutRequest,
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db),
):
    """
    POST /generate/workout
    Generates a personalized weekly workout plan using OpenAI and persists it.
    """
    try:
        plan = await generate_workout_plan(
            age=data.age,
            heart_risk=data.heart_risk,
            equipment=data.equipment,
            injuries=data.injuries or "",
            fitness_goal=data.fitness_goal,
            fitness_level=data.fitness_level or "beginner",
        )

        # Persist to MongoDB
        record = {
            "user_id": user_id,
            "plan": plan,
            "request": data.model_dump(),
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        result = await db.workout_plans.insert_one(record)
        plan["id"] = str(result.inserted_id)
        return plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Workout generation failed: {str(e)}")


@router.get("/workouts")
async def list_workout_plans(
    limit: int = 20,
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db),
):
    """
    GET /generate/workouts
    Returns all saved workout plans for the current user (summary, newest first).
    """
    cursor = db.workout_plans.find(
        {"user_id": user_id},
        {"plan.plan_name": 1, "plan.description": 1, "request": 1, "created_at": 1},
    ).sort("created_at", -1).limit(limit)

    plans = []
    async for doc in cursor:
        plans.append({
            "id": str(doc["_id"]),
            "plan_name": doc.get("plan", {}).get("plan_name", "Workout Plan"),
            "description": doc.get("plan", {}).get("description", ""),
            "request": doc.get("request", {}),
            "created_at": doc.get("created_at"),
        })
    return plans


@router.get("/workout/{plan_id}")
async def get_workout_plan(
    plan_id: str,
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db),
):
    """
    GET /generate/workout/{plan_id}
    Returns a single saved workout plan by ID.
    """
    try:
        oid = ObjectId(plan_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid plan ID")

    doc = await db.workout_plans.find_one({"_id": oid, "user_id": user_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Workout plan not found")

    plan = doc["plan"]
    plan["id"] = str(doc["_id"])
    plan["created_at"] = doc.get("created_at")
    plan["request"] = doc.get("request", {})
    return plan


@router.post("/diet")
async def create_diet_plan(
    data: DietRequest,
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db),
):
    """
    POST /generate/diet
    Generates a heart-healthy daily meal plan using OpenAI and persists it.
    """
    try:
        plan = await generate_diet_plan(
            age=data.age,
            weight_kg=data.weight_kg,
            height_cm=data.height_cm,
            heart_risk=data.heart_risk,
            dietary_restrictions=data.dietary_restrictions,
            goal=data.goal,
        )

        # Persist to MongoDB
        record = {
            "user_id": user_id,
            "plan": plan,
            "request": data.model_dump(),
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        result = await db.diet_plans.insert_one(record)
        plan["id"] = str(result.inserted_id)
        return plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Diet generation failed: {str(e)}")


@router.get("/diets")
async def list_diet_plans(
    limit: int = 20,
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db),
):
    """
    GET /generate/diets
    Returns all saved diet plans for the current user (summary, newest first).
    """
    cursor = db.diet_plans.find(
        {"user_id": user_id},
        {"plan.plan_name": 1, "plan.daily_calories": 1, "request": 1, "created_at": 1},
    ).sort("created_at", -1).limit(limit)

    plans = []
    async for doc in cursor:
        plans.append({
            "id": str(doc["_id"]),
            "plan_name": doc.get("plan", {}).get("plan_name", "Diet Plan"),
            "daily_calories": doc.get("plan", {}).get("daily_calories"),
            "request": doc.get("request", {}),
            "created_at": doc.get("created_at"),
        })
    return plans


@router.get("/diet/{plan_id}")
async def get_diet_plan(
    plan_id: str,
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db),
):
    """
    GET /generate/diet/{plan_id}
    Returns a single saved diet plan by ID.
    """
    try:
        oid = ObjectId(plan_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid plan ID")

    doc = await db.diet_plans.find_one({"_id": oid, "user_id": user_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Diet plan not found")

    plan = doc["plan"]
    plan["id"] = str(doc["_id"])
    plan["created_at"] = doc.get("created_at")
    plan["request"] = doc.get("request", {})
    return plan

