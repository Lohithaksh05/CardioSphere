"""
Prediction models — input/output for heart disease risk prediction.
Feature order matches the trained RandomForest model:
  HighBP, HighChol, CholCheck, BMI, Smoker, Stroke, Diabetes,
  PhysActivity, Fruits, Veggies, HvyAlcoholConsump, GenHlth,
  DiffWalk, Sex, Age
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class PredictionInput(BaseModel):
    """Risk assessment form data from the frontend."""
    high_bp: float = Field(..., ge=0, le=1, description="High blood pressure (0/1)")
    high_cholesterol: float = Field(..., ge=0, le=1, description="High cholesterol (0/1)")
    cholesterol_check: float = Field(..., ge=0, le=1, description="Cholesterol check in last 5 years (0/1)")
    bmi: float = Field(..., ge=10, le=80, description="Body Mass Index")
    smoker: float = Field(..., ge=0, le=1, description="Smoked >=100 cigarettes in life (0/1)")
    stroke: float = Field(..., ge=0, le=1, description="Ever had a stroke (0/1)")
    diabetes: float = Field(..., ge=0, le=2, description="0=no, 1=pre-diabetes, 2=diabetes")
    physical_activity: float = Field(..., ge=0, le=1, description="Physical activity in past 30 days (0/1)")
    fruits: float = Field(..., ge=0, le=1, description="Consume fruit 1+ times/day (0/1)")
    veggies: float = Field(..., ge=0, le=1, description="Consume vegetables 1+ times/day (0/1)")
    heavy_alcohol: float = Field(..., ge=0, le=1, description="Heavy drinker (0/1)")
    general_health: float = Field(..., ge=1, le=5, description="General health 1=excellent to 5=poor")
    difficulty_walking: float = Field(..., ge=0, le=1, description="Serious difficulty walking (0/1)")
    sex: float = Field(..., ge=0, le=1, description="0=female, 1=male")
    age: float = Field(..., ge=1, le=13, description="Age category 1-13 (18-24 to 80+)")


class RiskFactor(BaseModel):
    factor: str
    explanation: str

class LifestyleChange(BaseModel):
    action: str
    impact: str
    priority: str  # high | medium | low

class Recommendations(BaseModel):
    summary: str
    risk_factors: list[RiskFactor] = []
    positive_factors: list[str] = []
    lifestyle_changes: list[LifestyleChange] = []
    medical_recommendations: list[str] = []

class PredictionOutput(BaseModel):
    """Result returned by the prediction endpoint."""
    probability: float = Field(..., description="Heart disease probability 0-1")
    risk_percentage: float = Field(..., description="Risk as percentage 0-100")
    risk_category: str = Field(..., description="Low / Medium / High")
    confidence_score: float = Field(..., description="Model confidence 0-1")
    input_summary: dict = Field(..., description="Echo of input parameters")
    recommendations: Optional[Recommendations] = Field(None, description="Personalized AI recommendations")


class PredictionRecord(BaseModel):
    """Stored in MongoDB for history tracking."""
    user_id: str
    input_data: dict
    probability: float
    risk_percentage: float
    risk_category: str
    confidence_score: float
    recommendations: Optional[dict] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
