"""
Twilio SMS notification service for medication reminders.
"""

import asyncio
from config import get_settings

settings = get_settings()


async def send_sms_reminder(phone: str, med_name: str, dosage: str, scheduled_time: str):
    """Send an SMS medication reminder via Twilio."""
    try:
        from twilio.rest import Client

        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        body = (
            f"Medication Reminder - CardioSphere\n"
            f"Time to take {med_name} ({dosage}).\n"
            f"Scheduled: {scheduled_time}\n"
            f"Stay on track with your heart health!"
        )

        loop = asyncio.get_running_loop()
        msg = await loop.run_in_executor(
            None,
            lambda: client.messages.create(
                body=body,
                from_=settings.TWILIO_FROM_NUMBER,
                to=phone,
            ),
        )
        print(f"SMS sent to {phone} for {med_name} at {scheduled_time} | SID: {msg.sid} | Status: {msg.status}")
    except Exception as e:
        print(f"SMS reminder FAILED for {phone} ({med_name}): {type(e).__name__}: {e}")