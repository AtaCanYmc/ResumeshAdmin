from datetime import date, datetime
from typing import List, Optional

from reactive_resume.models.resume import (
    Basics,
    CertificationItem,
    EducationItem,
    ProjectItem,
    PublicationItem,
    ResumeImportData,
    Section,
    SkillItem,
    WorkItem,
)

from app.models.article import Article
from app.models.certificate import Certificate
from app.models.education import Education
from app.models.experience import Experience
from app.models.project import Project
from app.models.skill import Skill


class ReactiveResumeMapper:
    """Maps ResuMesh database models to Reactive Resume SDK models."""

    @staticmethod
    def format_date_range(
        start: Optional[date], end: Optional[date], is_current: bool = False
    ) -> str:
        """Formats a start and end date into a standard range string."""
        if not start:
            return ""
        start_str = start.strftime("%Y-%m")
        if is_current:
            return f"{start_str} - Present"
        if end:
            return f"{start_str} - {end.strftime('%Y-%m')}"
        return start_str

    @classmethod
    def map_project(cls, project: Project) -> ProjectItem:
        """Maps Project model to ProjectItem."""
        # Combines languages and tags for keywords
        keywords = []
        if project.languages:
            keywords.extend(project.languages)
        if project.tags:
            keywords.extend(project.tags)

        # Let's create a summary mentioning stars, watchers, forks if any
        summary_parts = []
        if project.stars:
            summary_parts.append(f"★ {project.stars}")
        if project.forks:
            summary_parts.append(f"⑂ {project.forks}")

        summary = " | ".join(summary_parts)

        return ProjectItem(
            id=project.id,
            visible=True,
            name=getattr(project, "name", None) or getattr(project, "title", ""),
            description=project.description or "",
            date=project.created_at.strftime("%Y-%m") if project.created_at else "",
            summary=summary,
            keywords=keywords,
            url=project.url or "",
        )

    @classmethod
    def map_experience(cls, exp: Experience) -> WorkItem:
        """Maps Experience model to WorkItem."""
        return WorkItem(
            id=exp.id,
            visible=True,
            company=exp.company_name,
            position=exp.title,
            location=exp.location or "",
            date=cls.format_date_range(exp.start_date, exp.end_date, exp.is_current),
            summary=exp.description or "",
            url="",
        )

    @classmethod
    def map_education(cls, edu: Education) -> EducationItem:
        """Maps Education model to EducationItem."""
        return EducationItem(
            id=edu.id,
            visible=True,
            institution=edu.school,
            studyType=edu.degree,
            area=edu.field_of_study,
            score=edu.grade or "",
            date=cls.format_date_range(edu.start_date, edu.end_date, edu.is_current),
            summary=edu.description or "",
            url="",
        )

    @classmethod
    def map_certificate(cls, cert: Certificate) -> CertificationItem:
        """Maps Certificate model to CertificationItem."""
        return CertificationItem(
            id=cert.id,
            visible=True,
            name=cert.name,
            issuer=cert.issuing_organization,
            date=cert.issue_date.strftime("%Y-%m") if cert.issue_date else "",
            summary=f"ID: {cert.credential_id}" if cert.credential_id else "",
            url=cert.credential_url or "",
        )

    @classmethod
    def map_article(cls, article: Article) -> PublicationItem:
        """Maps Article model to PublicationItem."""
        date_str = ""
        if article.published_at:
            if isinstance(article.published_at, (date, datetime)):
                date_str = article.published_at.strftime("%Y-%m-%d")
            else:
                date_str = str(article.published_at)

        return PublicationItem(
            id=article.id,
            visible=True,
            name=article.title,
            publisher=article.platform,
            date=date_str,
            summary=article.summary or "",
            url=article.url or "",
        )

    @classmethod
    def map_skill(cls, skill: Skill) -> SkillItem:
        """Maps Skill model to SkillItem."""
        return SkillItem(
            id=skill.id,
            visible=True,
            name=skill.name,
            description=skill.category,
            level="",
            keywords=[],
        )

    @classmethod
    def build_resume_import_data(
        cls,
        title: str,
        basics: Basics,
        projects: List[Project] = None,
        experiences: List[Experience] = None,
        educations: List[Education] = None,
        certificates: List[Certificate] = None,
        articles: List[Article] = None,
        skills: List[Skill] = None,
    ) -> ResumeImportData:
        """Builds a complete ResumeImportData payload to sync with Reactive Resume."""
        sections = {}

        if experiences:
            sections["work"] = Section(
                id="work",
                name="Work Experience",
                items=[cls.map_experience(x) for x in experiences],
            )

        if educations:
            sections["education"] = Section(
                id="education",
                name="Education",
                items=[cls.map_education(x) for x in educations],
            )

        if projects:
            sections["projects"] = Section(
                id="projects",
                name="Projects",
                items=[cls.map_project(x) for x in projects],
            )

        if skills:
            sections["skills"] = Section(
                id="skills",
                name="Skills",
                items=[cls.map_skill(x) for x in skills],
            )

        if certificates:
            sections["certifications"] = Section(
                id="certifications",
                name="Certifications",
                items=[cls.map_certificate(x) for x in certificates],
            )

        if articles:
            sections["publications"] = Section(
                id="publications",
                name="Publications",
                items=[cls.map_article(x) for x in articles],
            )

        return ResumeImportData(
            title=title,
            basics=basics,
            sections=sections,
        )
