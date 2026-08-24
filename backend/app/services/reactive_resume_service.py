from reactive_resume import AsyncRxResumeClient
from reactive_resume.models import ResumeImportData

from app.config.settings import settings
from app.db.repositories import ISystemLogRepository
from app.services.log_service import LogService


class ReactiveResumeService:
    """Service class to interact with the Reactive Resume API via the SDK."""

    def __init__(self, log_provider: ISystemLogRepository = None):
        self.client = AsyncRxResumeClient(
            base_url=settings.REACTIVE_RESUME_URL,
            api_key=settings.REACTIVE_RESUME_API_KEY,
        )
        self.log_provider = log_provider

    async def list_resumes(self):
        """List all resumes in Reactive Resume."""
        try:
            return await self.client.resumes.list()
        except Exception as e:
            await LogService.error(
                self.log_provider,
                "REACTIVE_RESUME",
                f"Error listing resumes: {str(e)}",
            )
            raise

    async def get_resume(self, resume_id: str):
        """Fetches a specific resume from Reactive Resume."""
        try:
            return await self.client.resumes.get(resume_id)
        except Exception as e:
            await LogService.error(
                self.log_provider,
                "REACTIVE_RESUME",
                f"Error retrieving resume {resume_id}: {str(e)}",
            )
            raise

    async def create_resume(self, import_data: ResumeImportData):
        """Creates/Imports a new resume using the SDK."""
        try:
            return await self.client.resumes.create(import_data)
        except Exception as e:
            await LogService.error(
                self.log_provider,
                "REACTIVE_RESUME",
                f"Error creating/importing resume: {str(e)}",
            )
            raise

    async def export_to_pdf(self, resume_id: str) -> str:
        """Retrieves the PDF download URL using the SDK."""
        try:
            return await self.client.resumes.get_pdf_url(resume_id)
        except Exception as e:
            await LogService.error(
                self.log_provider,
                "REACTIVE_RESUME",
                f"PDF export url retrieval error for resume {resume_id}: {str(e)}",
            )
            raise

    async def sync_mesh_data_to_resume(
        self, resume_id: str, import_data: ResumeImportData
    ):
        """Synchronizes ResuMesh data to a specific resume using the SDK."""
        try:
            # We dump the schema using by_alias=True to match camelCase/API formats
            payload = import_data.model_dump(by_alias=True, exclude_none=True)

            # Extract basics and sections to build the inner "data" update object
            update_payload = {}
            if "title" in payload:
                update_payload["name"] = payload["title"]
            if "slug" in payload:
                update_payload["slug"] = payload["slug"]

            # Build the inner data dictionary for basics and sections
            inner_data = {}
            if "basics" in payload:
                inner_data["basics"] = payload["basics"]
            if "sections" in payload:
                inner_data["sections"] = payload["sections"]

            if inner_data:
                update_payload["data"] = inner_data

            return await self.client.resumes.update(resume_id, update_payload)
        except Exception as e:
            await LogService.error(
                self.log_provider,
                "REACTIVE_RESUME",
                f"Error synchronizing data to resume {resume_id}: {str(e)}",
            )
            raise
