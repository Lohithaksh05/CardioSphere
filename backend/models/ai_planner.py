"""
AI planner models — workout and diet generation request/response.
"""

from pydantic import BaseModel, Field
from typing import Optional, List


class WorkoutRequest(BaseModel):
    age: int = Field(..., ge=10, le=100)
    heart_risk: str = Field(..., description="Low / Medium / High")
    equipment: List[str] = Field(default=[], description="e.g. ['dumbbells','resistance bands']")
    injuries: Optional[str] = ""
    fitness_goal: str = Field(..., description="e.g. weight loss, endurance, strength")
    fitness_level: Optional[str] = "beginner"


class WorkoutDay(BaseModel):
    day: str
    focus: str
    exercises: List[dict]
    duration_minutes: int
    notes: str = ""


class WorkoutResponse(BaseModel):
    plan_name: str
    description: str
    weekly_plan: List[WorkoutDay]
    safety_notes: List[str]


class DietRequest(BaseModel):
    age: int = Field(..., ge=10, le=100)
    weight_kg: float = Field(..., ge=20, le=300)
    height_cm: float = Field(..., ge=100, le=250)
    heart_risk: str
    dietary_restrictions: List[str] = Field(default=[], description="e.g. ['vegetarian','gluten-free']")
    goal: str = Field(..., description="e.g. weight loss, maintenance, heart health")


class MealItem(BaseModel):
    name: str
    calories: int
    protein_g: float
    carbs_g: float
    fat_g: float
    description: str = ""


class DietResponse(BaseModel):
    plan_name: str
    daily_calories: int
    meals: List[dict]
    heart_healthy_tips: List[str]
    foods_to_avoid: List[str]
