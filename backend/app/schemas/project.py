from datetime import datetime
from typing import Optional

from pydantic import ConfigDict
from resumesh_scrapers.models import GitHubRepositoryModel


class ProjectBase(GitHubRepositoryModel):
    name: Optional[str] = None
    title: Optional[str] = None

    stars: Optional[int] = None
    watchers: Optional[int] = None
    forks: Optional[int] = None
    url: Optional[str] = None

    def model_post_init(self, __context):
        if not self.name and self.title:
            self.name = self.title
        elif not self.title and self.name:
            self.title = self.name

        if self.stars is None:
            self.stars = self.stargazers_count or 0
        if self.watchers is None:
            self.watchers = self.watchers_count or 0
        if self.forks is None:
            self.forks = self.forks_count or 0
        if not self.url and self.html_url:
            self.url = str(self.html_url)


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(ProjectBase):
    pass


class ProjectResponse(ProjectBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
