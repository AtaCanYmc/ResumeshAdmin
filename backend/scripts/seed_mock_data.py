import os
import random
import sys

from dotenv import load_dotenv
from faker import Faker

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv()

from app.config.database import Base, SessionLocal, engine  # noqa: E402
from app.models.article import Article  # noqa: E402
from app.models.experience import Experience  # noqa: E402
from app.models.project import Project  # noqa: E402
from scripts.seed_admin import seed_admin  # noqa: E402

fake = Faker()


def seed_mock_data():
    db = SessionLocal()
    try:
        # First ensure admin exists
        seed_admin()

        print("Seeding mock data...")

        # 1. Seed Experiences
        experiences_count = db.query(Experience).count()
        if experiences_count == 0:
            for _ in range(3):
                exp = Experience(
                    company_name=fake.company(),
                    title=fake.job(),
                    location=fake.city(),
                    start_date=fake.date_between(start_date="-5y", end_date="-1y"),
                    end_date=(
                        fake.date_between(start_date="-1y", end_date="today")
                        if random.choice([True, False])
                        else None
                    ),
                    is_current=random.choice([True, False]),
                    description=fake.text(max_nb_chars=200),
                )
                db.add(exp)
            print("Added 3 mock experiences.")

        # 2. Seed Projects
        projects_count = db.query(Project).count()
        if projects_count == 0:
            languages_pool = ["Python", "TypeScript", "Go", "Rust", "Java", "C++"]
            for _ in range(8):
                proj = Project(
                    title=fake.catch_phrase(),
                    description=fake.text(max_nb_chars=300),
                    url=fake.url(),
                    stars=random.randint(0, 1500),
                    watchers=random.randint(0, 200),
                    forks=random.randint(0, 500),
                    languages=random.sample(languages_pool, k=random.randint(1, 3)),
                    tags=[fake.word() for _ in range(random.randint(2, 5))],
                )
                db.add(proj)
            print("Added 8 mock projects.")

        # 3. Seed Articles
        articles_count = db.query(Article).count()
        if articles_count == 0:
            for _ in range(5):
                art = Article(
                    title=fake.sentence(),
                    summary=fake.text(max_nb_chars=250),
                    url=fake.unique.url(),
                    platform=random.choice(["MEDIUM", "DEV_TO"]),
                    reading_time_minutes=random.randint(3, 15),
                    published_at=fake.date_time_between(
                        start_date="-2y", end_date="now"
                    ),
                )
                db.add(art)
            print("Added 5 mock articles.")

        # 4. Seed Skills
        from app.models.skill import Skill

        skills_count = db.query(Skill).count()
        if skills_count == 0:
            skills = [
                {"name": "React", "category": "Frontend", "icon_name": "react"},
                {
                    "name": "TypeScript",
                    "category": "Frontend",
                    "icon_name": "typescript",
                },
                {"name": "Node.js", "category": "Backend", "icon_name": "nodejs"},
                {"name": "Python", "category": "Backend", "icon_name": "python"},
                {"name": "Docker", "category": "DevOps", "icon_name": "docker"},
                {
                    "name": "PostgreSQL",
                    "category": "Database",
                    "icon_name": "postgresql",
                },
            ]
            for s in skills:
                db.add(Skill(**s))
            print("Added 6 mock skills.")

        db.commit()
        print("Mock data seeded successfully!")

    except Exception as e:
        print(f"Error seeding mock data: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    seed_mock_data()
