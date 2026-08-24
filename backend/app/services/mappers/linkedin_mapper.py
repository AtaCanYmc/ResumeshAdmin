from datetime import datetime
from typing import Any, Dict, List

from app.schemas.certificate import CertificateCreate
from app.schemas.experience import ExperienceCreate


class LinkedInDataMapper:
    """
    Adapter/Mapper responsible for parsing raw LinkedIn data dictionaries
    and transforming them into Pydantic models (ExperienceCreate, CertificateCreate).
    """

    @staticmethod
    def parse_experiences(data: Dict[str, Any]) -> List[ExperienceCreate]:
        experiences = []
        if "experiences" in data:
            for exp in data["experiences"]:
                start_date = None
                end_date = None
                if exp.get("start_date"):
                    start_date = datetime.strptime(exp["start_date"], "%Y-%m").date()
                if exp.get("end_date"):
                    end_date = datetime.strptime(exp["end_date"], "%Y-%m").date()

                experience = ExperienceCreate(
                    company_name=exp["company"],
                    title=exp["title"],
                    location=exp.get("location"),
                    start_date=start_date,
                    end_date=end_date,
                    is_current=exp.get("is_current", False),
                    description=exp.get("description"),
                )
                experiences.append(experience)
        return experiences

    @staticmethod
    def parse_certificates(data: Dict[str, Any]) -> List[CertificateCreate]:
        certificates = []
        if "certificates" in data:
            for cert in data["certificates"]:
                issue_date = None
                if cert.get("issue_date"):
                    issue_date = datetime.strptime(cert["issue_date"], "%Y-%m").date()

                certificate = CertificateCreate(
                    name=cert["name"],
                    issuing_organization=cert["authority"],
                    issue_date=issue_date,
                    credential_id=cert.get("license_number"),
                    credential_url=cert.get("url"),
                )
                certificates.append(certificate)
        return certificates
