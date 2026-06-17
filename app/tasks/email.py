import asyncio
import logging
from datetime import datetime

logger = logging.getLogger("infrastack.tasks")


async def send_email(ctx, user_id: int, email: str, subject: str) -> dict:
    """
    Tâche asynchrone simulée : envoi d'un email.
    """

    logger.info(
        "Sending email to user=%d email=%s subject='%s'",
        user_id, email, subject
    )

    # Simule un envoi d'email (3 secondes)
    await asyncio.sleep(3)

    result = {
        "user_id": user_id,
        "email": email,
        "subject": subject,
        "sent_at": datetime.utcnow().isoformat(),
        "status": "sent",
    }

    logger.info("Email sent successfully: %s", result)
    return result