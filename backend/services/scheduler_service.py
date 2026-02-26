"""
APScheduler service - manages medication reminder cron jobs.
Supports date ranges and day-of-week filtering.
"""

from datetime import datetime, date
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from tzlocal import get_localzone

# Use the system local IANA timezone (e.g. Asia/Kolkata on IST machines)
_local_tz = get_localzone()
scheduler = AsyncIOScheduler(timezone=_local_tz)
print(f"Scheduler timezone: {_local_tz}")

DAY_MAP = {"mon": "mon", "tue": "tue", "wed": "wed", "thu": "thu",
           "fri": "fri", "sat": "sat", "sun": "sun"}


def schedule_medication_reminders(
    med_id: str,
    med_name: str,
    dosage: str,
    time_schedule: list,
    phone: str,
    frequency: str = "daily",
    specific_days: list | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
) -> list:
    """
    Create cron jobs for every time in time_schedule.
    Respects frequency (daily / specific_days) and date range.
    Returns the list of job IDs created.
    """
    from services.notification_service import send_sms_reminder

    # Parse dates for the trigger using local timezone
    start_dt = None
    end_dt = None
    if start_date:
        try:
            start_dt = datetime.strptime(start_date, "%Y-%m-%d").replace(
                tzinfo=_local_tz
            )
        except (ValueError, AttributeError):
            pass
    if end_date:
        try:
            end_dt = datetime.strptime(end_date, "%Y-%m-%d").replace(
                hour=23, minute=59, tzinfo=_local_tz
            )
        except (ValueError, AttributeError):
            pass

    # Build day_of_week filter
    day_of_week = None
    if frequency == "specific_days" and specific_days:
        days = [DAY_MAP.get(d.lower()[:3], d.lower()[:3]) for d in specific_days]
        day_of_week = ",".join(days)

    job_ids = []
    for time_str in time_schedule:
        try:
            parts = time_str.strip().split(":")
            hour, minute = int(parts[0]), int(parts[1])
            job_id = f"med_{med_id}_{hour:02d}{minute:02d}"

            # Always pass timezone explicitly to CronTrigger
            trigger_kwargs = {
                "hour": hour,
                "minute": minute,
                "timezone": _local_tz,
            }
            if day_of_week:
                trigger_kwargs["day_of_week"] = day_of_week
            if start_dt:
                trigger_kwargs["start_date"] = start_dt
            if end_dt:
                trigger_kwargs["end_date"] = end_dt

            scheduler.add_job(
                send_sms_reminder,
                trigger=CronTrigger(**trigger_kwargs),
                id=job_id,
                replace_existing=True,
                args=[phone, med_name, dosage, time_str],
            )
            job_ids.append(job_id)
            print(f"Scheduled reminder for {med_name} at {time_str} IST (job: {job_id})")
        except Exception as e:
            print(f"Failed to schedule job for time '{time_str}': {e}")
    return job_ids


def cancel_medication_reminders(job_ids: list):
    """Remove scheduled jobs by their IDs."""
    for job_id in job_ids:
        try:
            scheduler.remove_job(job_id)
            print(f"Cancelled job {job_id}")
        except Exception:
            pass  # job may not exist


async def reschedule_all_on_startup(db):
    """
    Re-register all active SMS reminders from MongoDB after server restart.
    Called during the FastAPI lifespan startup.
    """
    try:
        cursor = db.medications.find({"sms_reminders_enabled": True})
        count = 0
        async for med in cursor:
            # Look up the user phone number
            user = await db.users.find_one({"clerk_id": med["user_id"]})
            phone = user.get("phone_number") if user else None
            if not phone:
                continue

            # Skip if end_date has passed
            end_date = med.get("end_date")
            if end_date:
                try:
                    if datetime.strptime(end_date, "%Y-%m-%d").date() < date.today():
                        continue
                except ValueError:
                    pass

            med_id = str(med["_id"])
            schedule_medication_reminders(
                med_id,
                med["medication_name"],
                med["dosage"],
                med["time_schedule"],
                phone,
                med.get("frequency", "daily"),
                med.get("specific_days", []),
                med.get("start_date"),
                end_date,
            )
            count += 1
        print(f"Rescheduled {count} active medication reminder(s)")
    except Exception as e:
        print(f"Startup reschedule failed: {e}")