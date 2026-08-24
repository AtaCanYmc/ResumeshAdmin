from abc import ABC, abstractmethod
from typing import List, Optional

from app.schemas.certificate import (
    CertificateCreate,
    CertificateResponse,
    CertificateUpdate,
)


class ICertificateRepository(ABC):
    @abstractmethod
    async def create_certificate(
        self, certificate: CertificateCreate
    ) -> CertificateResponse:
        pass

    @abstractmethod
    async def get_all_certificates(
        self, skip: int = 0, limit: int = 100
    ) -> List[CertificateResponse]:
        pass

    @abstractmethod
    async def update_certificate(
        self, certificate_id: str, certificate: CertificateUpdate
    ) -> Optional[CertificateResponse]:
        pass

    @abstractmethod
    async def delete_certificate(self, certificate_id: str) -> bool:
        pass
