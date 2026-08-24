"""settings_store.py — Storage layer for settings, sections, and social_links tables.

Key-value configurations (footer, marquee, en, tr) are stored in 'app_settings'.
Section visibilities are stored exclusively in 'sections' table.
Social links are stored exclusively in 'social_links' table.
"""

import uuid
from typing import Any, Dict

from sqlalchemy.orm import Session

from app.models.app_settings import AppSetting
from app.models.section import Section
from app.models.social_link import SocialLink

# ---------------------------------------------------------------------------
# Default values
# ---------------------------------------------------------------------------
DEFAULT_SECTIONS: Dict[str, bool] = {
    "educations": True,
    "articles": True,
    "projects": True,
    "certificates": True,
    "videos": True,
    "experiences": True,
    "skills": True,
    "posts": True,
}

DEFAULT_SOCIALS: list[Dict[str, Any]] = [
    {
        "id": "github",
        "platform": "github",
        "url": "https://github.com/AtaCanYmc",
        "label": "GitHub",
    },
    {
        "id": "linkedin",
        "platform": "linkedin",
        "url": "https://www.linkedin.com/in/ata-can-yaymacı/",
        "label": "LinkedIn",
    },
    {
        "id": "devto",
        "platform": "devto",
        "url": "https://dev.to/atacanymc",
        "label": "Dev.to",
    },
    {
        "id": "medium",
        "platform": "medium",
        "url": "https://medium.com/@atacanymc",
        "label": "Medium",
    },
]

DEFAULT_MARQUEE: list[str] = [
    "React.js",
    "Vite.js",
    "Java",
    "SpringBoot",
    "TypeScript",
    "JavaScript",
    "Tailwind CSS",
    "Python",
    "FastAPI",
    "PostgreSQL",
    "PL/SQL",
    "C#",
    ".NET",
    "Supabase",
    "Firebase",
    "MongoDB",
    "Docker",
    "Node.js",
    "Next.js",
    "GraphQL",
]

DEFAULT_EN: Dict[str, Any] = {
    "hero": {
        "name": "Ata Can",
        "fullName": "Ata Can Yaymacı",
        "avatarSubtitle": "Crafting digital experiences",
        "avatarImage": "/api/v1/avatar/profile_pic.jpeg",
        "title": "I bridge the gap between AI Workflows and Financial Technologies.",
        "description": (
            "With a Computer Engineering background from Dokuz Eylul University, "
            "I specialize in scalable backend architectures and automation processes. "
            "I transform complex data into meaningful insights "
            "using modern web technologies."
        ),
        "resumeLink": "/resumes/resume.pdf",
    },
    "metrics": [
        {
            "id": 1,
            "icon": "code",
            "value": "25+",
            "label": "Active Projects",
            "color": "blue",
        },
        {
            "id": 2,
            "icon": "book",
            "value": "40+",
            "label": "Technical Articles",
            "color": "indigo",
        },
        {
            "id": 3,
            "icon": "star",
            "value": "4+",
            "label": "Years Experience",
            "color": "purple",
        },
    ],
}

DEFAULT_TR: Dict[str, Any] = {
    "hero": {
        "name": "Ata Can",
        "fullName": "Ata Can Yaymacı",
        "avatarSubtitle": "Dijital deneyimler tasarlıyorum",
        "avatarImage": "/api/v1/avatar/profile_pic.jpeg",
        "title": "Yapay Zeka İş Akışları ve Finansal Teknolojiler arasında köprü kuruyorum.",
        "description": (
            "Dokuz Eylül Üniversitesi Bilgisayar Mühendisliği geçmişimle, "
            "ölçeklenebilir backend mimarileri ve otomasyon süreçleri "
            "üzerine çalışıyorum. Modern web teknolojileriyle karmaşık verileri "
            "anlamlı içgörülere dönüştürüyorum."
        ),
        "resumeLink": "/resumes/resume.pdf",
    },
    "metrics": [
        {
            "id": 1,
            "icon": "code",
            "value": "25+",
            "label": "Aktif Proje",
            "color": "blue",
        },
        {
            "id": 2,
            "icon": "book",
            "value": "40+",
            "label": "Teknik Makale",
            "color": "indigo",
        },
        {
            "id": 3,
            "icon": "star",
            "value": "4+",
            "label": "Yıl Deneyim",
            "color": "purple",
        },
    ],
}

DEFAULT_FOOTER: Dict[str, Any] = {"email": "atacanymc@gmail.com"}

DEFAULT_INTEGRATIONS: Dict[str, Any] = {
    "github_username": "AtaCanYmc",
    "medium_username": "atacanymc",
    "devto_username": "atacanymc",
}

DEFAULT_LLM: Dict[str, Any] = {
    "provider": "mock",
    "openai_model": "gpt-4o",
    "groq_model": "llama-3.3-70b-versatile",
    "ollama_base_url": "http://localhost:11434",
    "ollama_model": "llama3",
}

KV_DEFAULTS: Dict[str, Any] = {
    "footer": DEFAULT_FOOTER,
    "marquee": DEFAULT_MARQUEE,
    "en": DEFAULT_EN,
    "tr": DEFAULT_TR,
    "integrations": DEFAULT_INTEGRATIONS,
    "llm": DEFAULT_LLM,
}

DEFAULTS: Dict[str, Any] = {
    "sections": DEFAULT_SECTIONS,
    "socials": DEFAULT_SOCIALS,
    **KV_DEFAULTS,
}


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def get_setting(db: Session, key: str, default: Any = None) -> Any:
    """Return the value for *key*, or *default* if the row doesn't exist."""
    if key == "sections":
        db_sections = db.query(Section).order_by(Section.order_index.asc()).all()
        if db_sections:
            return {s.key: s.is_active for s in db_sections}
        return DEFAULT_SECTIONS

    if key == "socials":
        db_socials = db.query(SocialLink).order_by(SocialLink.order_index.asc()).all()
        if db_socials:
            return [
                {
                    "id": s.id,
                    "platform": s.platform,
                    "label": s.label,
                    "url": s.url,
                    "icon": s.icon,
                    "order_index": s.order_index,
                    "is_active": s.is_active,
                }
                for s in db_socials
            ]
        return DEFAULT_SOCIALS

    row = db.query(AppSetting).filter(AppSetting.key == key).first()
    if row is None:
        return KV_DEFAULTS.get(key, default)
    return row.value


def set_setting(db: Session, key: str, value: Any, *, commit: bool = True) -> Any:
    """Upsert setting.

    'sections' and 'socials' persist exclusively to their dedicated database tables
    ('sections' and 'social_links'). Other keys update 'app_settings'.
    """
    if key == "sections" and isinstance(value, dict):
        for s_key, is_act in value.items():
            sec = db.query(Section).filter(Section.key == s_key).first()
            if sec:
                sec.is_active = bool(is_act)
            else:
                title = f"{s_key.capitalize()} Section"
                desc = f"Show or hide your {s_key} page on the public site."
                sec = Section(
                    id=str(uuid.uuid4()),
                    key=s_key,
                    title=title,
                    description=desc,
                    is_active=bool(is_act),
                )
                db.add(sec)
        if commit:
            db.commit()
        return value

    if key == "socials" and isinstance(value, list):
        for item in value:
            s_id = item.get("id")
            platform = item.get("platform") or "custom"
            social = None
            if s_id:
                social = db.query(SocialLink).filter(SocialLink.id == s_id).first()
            if not social and platform:
                social = (
                    db.query(SocialLink).filter(SocialLink.platform == platform).first()
                )
            if social:
                social.url = item.get("url", social.url)
                if item.get("label"):
                    social.label = item.get("label")
                if item.get("platform"):
                    social.platform = item.get("platform")
                if item.get("icon"):
                    social.icon = item.get("icon")
            else:
                social = SocialLink(
                    id=s_id or str(uuid.uuid4()),
                    platform=platform,
                    label=item.get("label", platform.capitalize()),
                    url=item.get("url", ""),
                    icon=item.get("icon", platform),
                    is_active=item.get("is_active", True),
                )
                db.add(social)
        if commit:
            db.commit()
        return value

    row = db.query(AppSetting).filter(AppSetting.key == key).first()
    if row is None:
        row = AppSetting(key=key, value=value)
        db.add(row)
    else:
        row.value = value
    if commit:
        db.commit()
        db.refresh(row)
    return row.value


def get_all_settings(db: Session) -> Dict[str, Any]:
    """Return all settings as a flat {key: value} dict.

    Sources sections and socials exclusively from 'sections' and 'social_links'
    database tables, reducing app_settings storage footprint.
    """
    rows = db.query(AppSetting).all()
    stored = {row.key: row.value for row in rows}
    result = {**KV_DEFAULTS, **stored}

    # Fetch sections from sections table
    db_sections = db.query(Section).order_by(Section.order_index.asc()).all()
    if db_sections:
        result["sections"] = {s.key: s.is_active for s in db_sections}
    else:
        result["sections"] = DEFAULT_SECTIONS

    # Fetch socials from social_links table
    db_socials = db.query(SocialLink).order_by(SocialLink.order_index.asc()).all()
    if db_socials:
        result["socials"] = [
            {
                "id": s.id,
                "platform": s.platform,
                "label": s.label,
                "url": s.url,
                "icon": s.icon,
                "order_index": s.order_index,
                "is_active": s.is_active,
            }
            for s in db_socials
        ]
    else:
        result["socials"] = DEFAULT_SOCIALS

    return result


def ensure_defaults(db: Session) -> None:
    """Insert missing default settings into database tables."""
    existing_keys = {row.key for row in db.query(AppSetting.key).all()}
    new_rows = [
        AppSetting(key=key, value=value)
        for key, value in KV_DEFAULTS.items()
        if key not in existing_keys
    ]
    if new_rows:
        db.bulk_save_objects(new_rows)
        db.commit()

    # Ensure default sections in sections table
    existing_section_keys = {s.key for s in db.query(Section.key).all()}
    default_sections_data = [
        (
            "educations",
            "Educations Section",
            "Show or hide your educations page on the public site.",
            1,
        ),
        (
            "experiences",
            "Experiences Section",
            "Show or hide your experiences page on the public site.",
            2,
        ),
        (
            "projects",
            "Projects Section",
            "Show or hide your projects page on the public site.",
            3,
        ),
        (
            "certificates",
            "Certificates Section",
            "Show or hide your certificates page on the public site.",
            4,
        ),
        (
            "articles",
            "Articles Section",
            "Show or hide your articles page on the public site.",
            5,
        ),
        (
            "videos",
            "Videos Section",
            "Show or hide your videos page on the public site.",
            6,
        ),
        (
            "skills",
            "Skills Section",
            "Show or hide your skills page on the public site.",
            7,
        ),
        (
            "posts",
            "Posts Section",
            "Show or hide your posts page on the public site.",
            8,
        ),
    ]
    sections_to_add = [
        Section(
            id=str(uuid.uuid4()),
            key=key,
            title=title,
            description=desc,
            is_active=True,
            order_index=idx,
        )
        for key, title, desc, idx in default_sections_data
        if key not in existing_section_keys
    ]
    if sections_to_add:
        db.bulk_save_objects(sections_to_add)
        db.commit()

    # Ensure default social links in social_links table
    existing_social_ids = {s.id for s in db.query(SocialLink.id).all()}
    existing_social_platforms = {
        s.platform for s in db.query(SocialLink.platform).all()
    }
    default_socials_data = [
        ("github", "github", "GitHub", "https://github.com/AtaCanYmc", "github", 1),
        (
            "linkedin",
            "linkedin",
            "LinkedIn",
            "https://www.linkedin.com/in/ata-can-yaymacı/",
            "linkedin",
            2,
        ),
        ("devto", "devto", "Dev.to", "https://dev.to/atacanymc", "devto", 3),
        ("medium", "medium", "Medium", "https://medium.com/@atacanymc", "medium", 4),
    ]
    socials_to_add = [
        SocialLink(
            id=s_id,
            platform=platform,
            label=label,
            url=url,
            icon=icon,
            order_index=idx,
            is_active=True,
        )
        for s_id, platform, label, url, icon, idx in default_socials_data
        if s_id not in existing_social_ids and platform not in existing_social_platforms
    ]
    if socials_to_add:
        db.bulk_save_objects(socials_to_add)
        db.commit()
