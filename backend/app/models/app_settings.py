from sqlalchemy import JSON, Column, Integer, String

from app.config.database import Base


class AppSetting(Base):
    """Key-value settings store.

    Each row holds a single setting identified by *key*.
    The *value* column is stored as JSON, supporting any Python type:
    bool, str, int, list, dict, None.

    Adding a new setting requires no schema migration — just insert a new row.
    """

    __tablename__ = "app_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(255), unique=True, nullable=False, index=True)
    value = Column(JSON, nullable=True)
