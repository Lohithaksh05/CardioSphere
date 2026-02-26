"""
Medication routes — CRUD for medication reminders.
Phone number is read from the user profile (not per-medication).
"""

from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, date
from bson import ObjectId
from database import get_db
from middleware.clerk_auth import get_current_user_id
from models.medication import MedicationCreate, MedicationUpdate, ToggleSMSRequest
from services.scheduler_service import schedule_medication_reminders, cancel_medication_reminders

router = APIRouter(prefix="/medications", tags=["Medications"])


def serialize_med(doc: dict) -> dict:
    """Convert MongoDB document to JSON-safe dict."""
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc


def compute_streak(taken_dates: list, start_date_str: str | None = None) -> int:
    """Compute consecutive-day streak ending at today."""
    if not taken_dates:
        return 0
    today = date.today()
    dates_set = set()
    for d in taken_dates:
        try:
            dates_set.add(datetime.strptime(d, "%Y-%m-%d").date())
        except ValueError:
            pass
    streak = 0
    check = today
    while check in dates_set:
        streak += 1
        check = date.fromordinal(check.toordinal() - 1)
    return streak


async def _get_user_phone(db, user_id: str) -> str | None:
    """Fetch phone number from the user profile."""
    user = await db.users.find_one({"clerk_id": user_id})
    return user.get("phone_number") if user else None


@router.post("", status_code=201)
async def add_medication(
    data: MedicationCreate,
    user_id: str = Depends(get_current_user_id),
):
    """POST /medications — add a new medication."""
    db = get_db()
    doc = {
        "user_id": user_id,
        "medication_name": data.medication_name,
        "dosage": data.dosage,
        "dosage_unit": data.dosage_unit,
        "time_schedule": data.time_schedule,
        "frequency": data.frequency,
        "specific_days": data.specific_days,
        "start_date": data.start_date,
        "end_date": data.end_date,
        "category": data.category,
        "notes": data.notes or "",
        "adherence_status": False,
        "last_taken": None,
        "sms_reminders_enabled": False,
        "reminder_job_ids": [],
        "taken_dates": [],
        "streak": 0,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    result = await db.medications.insert_one(doc)
    med_id = str(result.inserted_id)

    # Schedule SMS reminders if requested (phone comes from user profile)
    job_ids = []
    if data.sms_reminders_enabled:
        phone = await _get_user_phone(db, user_id)
        if phone:
            job_ids = schedule_medication_reminders(
                med_id, data.medication_name, data.dosage,
                data.time_schedule, phone,
                data.frequency, data.specific_days,
                data.start_date, data.end_date,
            )
            await db.medications.update_one(
                {"_id": result.inserted_id},
                {"$set": {"sms_reminders_enabled": True, "reminder_job_ids": job_ids}},
            )

    doc["id"] = med_id
    doc["sms_reminders_enabled"] = bool(job_ids)
    doc["reminder_job_ids"] = job_ids
    del doc["_id"]
    return doc


@router.get("")
async def get_medications(user_id: str = Depends(get_current_user_id)):
    """GET /medications — list all medications for the current user."""
    db = get_db()
    cursor = db.medications.find({"user_id": user_id}).sort("created_at", -1)
    meds = []
    async for doc in cursor:
        # Recompute streak on read
        doc["streak"] = compute_streak(
            doc.get("taken_dates", []),
            doc.get("start_date"),
        )
        meds.append(serialize_med(doc))
    return meds


@router.put("/{med_id}/take")
async def mark_taken(med_id: str, user_id: str = Depends(get_current_user_id)):
    """PUT /medications/{id}/take — mark a medication as taken today."""
    db = get_db()
    try:
        oid = ObjectId(med_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid medication ID")

    today_str = date.today().isoformat()

    result = await db.medications.update_one(
        {"_id": oid, "user_id": user_id},
        {
            "$set": {
                "adherence_status": True,
                "last_taken": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            },
            "$addToSet": {"taken_dates": today_str},
        },
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Medication not found")

    return {"message": "Medication marked as taken"}


@router.put("/{med_id}/skip")
async def skip_medication(med_id: str, user_id: str = Depends(get_current_user_id)):
    """PUT /medications/{id}/skip — skip medication for today (not taken, no streak break)."""
    db = get_db()
    try:
        oid = ObjectId(med_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid medication ID")

    result = await db.medications.update_one(
        {"_id": oid, "user_id": user_id},
        {"$set": {"adherence_status": False, "updated_at": datetime.utcnow()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Medication not found")

    return {"message": "Medication skipped for today"}


@router.put("/{med_id}/reset")
async def reset_taken(med_id: str, user_id: str = Depends(get_current_user_id)):
    """PUT /medications/{id}/reset — reset adherence for a new day."""
    db = get_db()
    try:
        oid = ObjectId(med_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid medication ID")

    result = await db.medications.update_one(
        {"_id": oid, "user_id": user_id},
        {"$set": {"adherence_status": False, "updated_at": datetime.utcnow()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Medication not found")

    return {"message": "Medication adherence reset"}


@router.put("/{med_id}")
async def update_medication(
    med_id: str,
    data: MedicationUpdate,
    user_id: str = Depends(get_current_user_id),
):
    """PUT /medications/{id} — edit name, dosage, times, dates, etc.
    Automatically reschedules SMS reminders when time/frequency/dates change."""
    db = get_db()
    try:
        oid = ObjectId(med_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid medication ID")

    med = await db.medications.find_one({"_id": oid, "user_id": user_id})
    if not med:
        raise HTTPException(status_code=404, detail="Medication not found")

    # Build update dict from non-None fields
    updates: dict = {"updated_at": datetime.utcnow()}
    for field in [
        "medication_name", "dosage", "dosage_unit", "time_schedule",
        "frequency", "specific_days", "start_date", "end_date",
        "category", "notes",
    ]:
        val = getattr(data, field, None)
        if val is not None:
            updates[field] = val

    await db.medications.update_one({"_id": oid}, {"$set": updates})

    # If SMS reminders are on, cancel old jobs and reschedule with new data
    if med.get("sms_reminders_enabled"):
        if med.get("reminder_job_ids"):
            cancel_medication_reminders(med["reminder_job_ids"])

        phone = await _get_user_phone(db, user_id)
        # Merge saved doc with updates to get effective values
        effective = {**med, **updates}
        new_job_ids: list = []
        if phone:
            new_job_ids = schedule_medication_reminders(
                med_id,
                effective.get("medication_name", med["medication_name"]),
                effective.get("dosage", med["dosage"]),
                effective.get("time_schedule", med["time_schedule"]),
                phone,
                effective.get("frequency", "daily"),
                effective.get("specific_days", []),
                effective.get("start_date"),
                effective.get("end_date"),
            )
        await db.medications.update_one(
            {"_id": oid},
            {"$set": {"reminder_job_ids": new_job_ids}},
        )

    doc = await db.medications.find_one({"_id": oid})
    doc["streak"] = compute_streak(doc.get("taken_dates", []), doc.get("start_date"))
    return serialize_med(doc)


@router.delete("/{med_id}")
async def delete_medication(med_id: str, user_id: str = Depends(get_current_user_id)):
    """DELETE /medications/{id} — remove a medication and cancel any reminder jobs."""
    db = get_db()
    try:
        oid = ObjectId(med_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid medication ID")

    med = await db.medications.find_one({"_id": oid, "user_id": user_id})
    if not med:
        raise HTTPException(status_code=404, detail="Medication not found")

    if med.get("reminder_job_ids"):
        cancel_medication_reminders(med["reminder_job_ids"])

    await db.medications.delete_one({"_id": oid})
    return {"message": "Medication deleted"}


@router.put("/{med_id}/toggle-sms")
async def toggle_sms_reminder(
    med_id: str,
    data: ToggleSMSRequest,
    user_id: str = Depends(get_current_user_id),
):
    """PUT /medications/{id}/toggle-sms — enable or disable SMS reminders.
    Phone number is pulled from user profile automatically."""
    db = get_db()
    try:
        oid = ObjectId(med_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid medication ID")

    med = await db.medications.find_one({"_id": oid, "user_id": user_id})
    if not med:
        raise HTTPException(status_code=404, detail="Medication not found")

    # Cancel existing jobs regardless
    if med.get("reminder_job_ids"):
        cancel_medication_reminders(med["reminder_job_ids"])

    job_ids: list = []
    if data.enabled:
        phone = await _get_user_phone(db, user_id)
        if not phone:
            raise HTTPException(
                status_code=400,
                detail="No phone number on your profile. Please add one first.",
            )
        job_ids = schedule_medication_reminders(
            med_id,
            med["medication_name"],
            med["dosage"],
            med["time_schedule"],
            phone,
            med.get("frequency", "daily"),
            med.get("specific_days", []),
            med.get("start_date"),
            med.get("end_date"),
        )

    await db.medications.update_one(
        {"_id": oid},
        {
            "$set": {
                "sms_reminders_enabled": data.enabled and bool(job_ids),
                "reminder_job_ids": job_ids,
                "updated_at": datetime.utcnow(),
            }
        },
    )
    return {
        "message": "Reminders updated",
        "enabled": data.enabled and bool(job_ids),
        "job_count": len(job_ids),
    }
