import logging

from fastapi import BackgroundTasks, Request

logger = logging.getLogger("ResuMesh")


class TelemetryService:
    def __init__(self):
        logger.info("[TELEMETRY] Local logging telemetry service initialized.")

    def capture_event(self, distinct_id: str, event_name: str, properties: dict = None):
        logger.info(
            f"[TELEMETRY EVENT] distinct_id={distinct_id},"
            f" event={event_name}, properties={properties or {}}"
        )


# Singleton instance
telemetry = TelemetryService()


async def get_telemetry_data(request: Request, background_tasks: BackgroundTasks):
    """Dependency to extract telemetry metadata and background task scheduler

    from the current request.
    """
    return {
        "ip": request.client.host if request.client else "unknown",
        "ua": request.headers.get("user-agent", "unknown"),
        "background_tasks": background_tasks,
        "url": str(request.url),
        "language": request.headers.get("language", "unknown"),
    }
