from typing import List, Optional

from app.db.providers.supabase.client import SupabaseClientManager
from app.db.repositories import ICertificateRepository
from app.schemas.certificate import (
    CertificateCreate,
    CertificateResponse,
    CertificateUpdate,
)


class SupabaseCertificateRepository(ICertificateRepository):
    def __init__(self):
        self.client = SupabaseClientManager.get_client()

    async def create_certificate(
        self, certificate: CertificateCreate
    ) -> CertificateResponse:
        cert_data = certificate.model_dump(mode="json")
        response = await self.client.table("certificates").insert(cert_data).execute()
        if not response.data:
            raise Exception("Failed to create certificate in Supabase.")
        return CertificateResponse(**response.data[0])

    async def get_all_certificates(
        self, skip: int = 0, limit: int = 100
    ) -> List[CertificateResponse]:
        start = skip
        end = skip + limit - 1
        response = (
            await self.client.table("certificates")
            .select("*")
            .range(start, end)
            .execute()
        )
        return [CertificateResponse(**item) for item in response.data]

    async def update_certificate(
        self, certificate_id: str, certificate: CertificateUpdate
    ) -> Optional[CertificateResponse]:
        update_data = certificate.model_dump(mode="json", exclude_unset=True)
        if (
            "credential_url" in update_data
            and update_data["credential_url"] is not None
        ):
            update_data["credential_url"] = str(update_data["credential_url"])
        response = (
            await self.client.table("certificates")
            .update(update_data)
            .eq("id", certificate_id)
            .execute()
        )
        if not response.data:
            return None
        return CertificateResponse(**response.data[0])

    async def delete_certificate(self, certificate_id: str) -> bool:
        response = (
            await self.client.table("certificates")
            .delete()
            .eq("id", certificate_id)
            .execute()
        )
        return len(response.data) > 0
