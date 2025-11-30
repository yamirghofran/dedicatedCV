"""
Pytest configuration and fixtures for testing.
"""

import pytest
from datetime import date
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.security import get_password_hash
from app.db.base import Base, get_db
from app.main import app
from app.models.cv import CV
from app.models.education import Education
from app.models.project import Project
from app.models.skill import Skill
from app.models.user import User
from app.models.work_experience import WorkExperience

# Create test database engine using SQLite in memory
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    """
    Create a fresh database for each test.
    """
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    """
    Create a test client with the test database.
    """

    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db):
    """
    Create a test user.
    """
    user = User(
        email="testuser@example.com",
        hashed_password=get_password_hash("testpassword123"),
        full_name="Test User",
        is_active=True,
        is_superuser=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_user2(db):
    """
    Create a second test user for authorization tests.
    """
    user = User(
        email="testuser2@example.com",
        hashed_password=get_password_hash("testpassword456"),
        full_name="Test User 2",
        is_active=True,
        is_superuser=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def inactive_user(db):
    """
    Create an inactive test user.
    """
    user = User(
        email="inactive@example.com",
        hashed_password=get_password_hash("testpassword789"),
        full_name="Inactive User",
        is_active=False,
        is_superuser=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def auth_headers(client, test_user):
    """
    Get authentication headers for test user.
    """
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "testuser@example.com", "password": "testpassword123"},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def auth_headers_user2(client, test_user2):
    """
    Get authentication headers for test user 2.
    """
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "testuser2@example.com", "password": "testpassword456"},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def test_cv(db, test_user):
    """
    Create a test CV.
    """
    cv = CV(
        user_id=test_user.id,
        title="Software Engineer Resume",
        full_name="Test User",
        email="testuser@example.com",
        phone="+1234567890",
        location="San Francisco, CA",
        summary="Experienced software engineer with 5 years of experience.",
    )
    db.add(cv)
    db.commit()
    db.refresh(cv)
    return cv


@pytest.fixture
def test_cv_user2(db, test_user2):
    """
    Create a test CV for user 2.
    """
    cv = CV(
        user_id=test_user2.id,
        title="Data Scientist Resume",
        full_name="Test User 2",
        email="testuser2@example.com",
        phone="+9876543210",
        location="New York, NY",
        summary="Data scientist with ML expertise.",
    )
    db.add(cv)
    db.commit()
    db.refresh(cv)
    return cv


@pytest.fixture
def test_work_experience(db, test_cv):
    """
    Create a test work experience.
    """
    work_exp = WorkExperience(
        cv_id=test_cv.id,
        company="Tech Corp",
        position="Senior Developer",
        location="San Francisco, CA",
        start_date=date(2020, 1, 1),
        end_date=date(2023, 12, 31),
        description="Led development of microservices architecture.",
        display_order=1,
    )
    db.add(work_exp)
    db.commit()
    db.refresh(work_exp)
    return work_exp


@pytest.fixture
def test_education(db, test_cv):
    """
    Create a test education entry.
    """
    education = Education(
        cv_id=test_cv.id,
        institution="Stanford University",
        degree="Bachelor of Science",
        field_of_study="Computer Science",
        start_date=date(2015, 9, 1),
        end_date=date(2019, 6, 1),
        description="Focus on AI and Machine Learning",
        display_order=1,
        gpa=3.85,
        honors="Summa Cum Laude",
        relevant_subjects="Data Structures, Algorithms, Machine Learning",
        thesis_title="Deep Learning Applications in Computer Vision",
    )
    db.add(education)
    db.commit()
    db.refresh(education)
    return education


@pytest.fixture
def test_skill(db, test_cv):
    """
    Create a test skill.
    """
    skill = Skill(
        cv_id=test_cv.id,
        name="Python",
        category="Programming Languages",
        display_order=1,
    )
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill


@pytest.fixture
def test_project(db, test_cv):
    """
    Create a test project.
    """
    project = Project(
        cv_id=test_cv.id,
        name="E-commerce Platform",
        description="Built a scalable e-commerce platform using microservices",
        technologies="Python, FastAPI, PostgreSQL, Docker",
        url="https://github.com/example/ecommerce",
        start_date=date(2022, 1, 1),
        end_date=date(2023, 6, 1),
        display_order=1,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project
