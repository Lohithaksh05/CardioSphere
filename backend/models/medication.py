"""
Medication models — schema for the medication reminder system.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class MedicationCreate(BaseModel):
    medication_name: str = Field(..., min_length=1, max_length=200)
    dosage: str = Field(..., min_length=1, max_length=100, description="e.g. 500mg")
    dosage_unit: str = Field("mg", description="mg, ml, tablet, capsule, etc.")
    time_schedule: List[str] = Field(..., description="List of times, e.g. ['08:00','20:00']")
    frequency: str = Field("daily", description="daily | specific_days | as_needed")
    specific_days: List[str] = Field(default=[], description="e.g. ['Mon','Wed','Fri'] when frequency=specific_days")
    start_date: str = Field(..., description="YYYY-MM-DD")
    end_date: Optional[str] = Field(None, description="YYYY-MM-DD or null for ongoing")
    category: str = Field("general", description="heart, blood_pressure, cholesterol, diabetes, pain, supplement, general")
    notes: Optional[str] = ""
    sms_reminders_enabled: bool = False


class ToggleSMSRequest(BaseModel):
    enabled: bool


class MedicationUpdate(BaseModel):
    medication_name: Optional[str] = None
    dosage: Optional[str] = None
    dosage_unit: Optional[str] = None
    time_schedule: Optional[List[str]] = None
    frequency: Optional[str] = None
    specific_days: Optional[List[str]] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    category: Optional[str] = None
    notes: Optional[str] = None


class MedicationResponse(BaseModel):
    id: str
    user_id: str
    medication_name: str
    dosage: str
    dosage_unit: str
    time_schedule: List[str]
    frequency: str
    specific_days: List[str]
    start_date: str
    end_date: Optional[str]
    category: str
    notes: Optional[str] = ""
    adherence_status: bool = False
    last_taken: Optional[datetime] = None
    sms_reminders_enabled: bool = False
    taken_dates: List[str] = []
    streak: int = 0
    created_at: datetime


class MedicationRecord(BaseModel):
    """Stored in MongoDB."""
    user_id: str
    medication_name: str
    dosage: str
    dosage_unit: str = "mg"
    time_schedule: List[str]
    frequency: str = "daily"
    specific_days: List[str] = []
    start_date: str = ""
    end_date: Optional[str] = None
    category: str = "general"
    notes: str = ""
    adherence_status: bool = False
    last_taken: Optional[datetime] = None
    sms_reminders_enabled: bool = False
    reminder_job_ids: List[str] = []
    taken_dates: List[str] = []  # list of "YYYY-MM-DD" when taken
    streak: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
