# CV Maker Backend API

A FastAPI backend application for creating and managing professional CVs with PostgreSQL database, complete CRUD operations, and RESTful API design.

## Features

- **FastAPI** - Modern, fast web framework for building APIs
- **PostgreSQL** - Robust relational database with 7 tables
- **SQLAlchemy 2.0** - SQL toolkit and ORM with relationship management
- **Alembic** - Database migration tool (4 migrations applied)
- **Pydantic v2** - Data validation using Python type annotations
- **Complete CRUD API** - 31 RESTful endpoints for CV management
- **Nested Relations** - Retrieve CVs with all related data in one call
- **Cascade Delete** - Automatic cleanup of related entities
- **CORS** - Cross-Origin Resource Sharing support
- **Docker Compose** - Easy PostgreSQL setup
- **UV** - Fast Python package manager

## Current Status

**Implemented:**
- Complete database schema with 7 tables (User, CV, WorkExperience, Education, Skill, Project)
- 31 CRUD API endpoints fully tested and working
- Pydantic schemas with validation (email, GPA 0-4.0, dates)
- Nested CV retrieval with all relations
- Cascade delete functionality
- Health check endpoint with database status
- Enhanced education model (GPA, honors, relevant subjects, thesis)

**TODO:**
- JWT Authentication (currently using simple user_id field)
- Automated pytest test suite
- User registration and login endpoints
- Password hashing and security

## Project Structure

```
backend/
├── alembic/                # Database migrations
│   ├── versions/          # Migration files
│   └── env.py            # Alembic configuration
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/ # API endpoints
│   │       └── api.py    # API router
│   ├── core/             # Core functionality
│   │   ├── config.py     # Settings and configuration
│   │   └── security.py   # Security utilities
│   ├── db/               # Database
│   │   ├── base.py       # Database session
│   │   └── base_class.py # Base model class
│   ├── models/           # SQLAlchemy models
│   ├── schemas/          # Pydantic schemas
│   ├── services/         # Business logic
│   └── main.py           # Application entry point
├── .env.example          # Example environment variables
├── alembic.ini           # Alembic configuration
├── docker-compose.yml    # Docker services
├── pyproject.toml        # Project dependencies
└── Makefile              # Common commands

```

## Setup

### Prerequisites

- Python 3.13+
- UV package manager
- Docker and Docker Compose (for PostgreSQL)

### Installation

1. **Clone the repository** (if not already done)

2. **Copy environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and update the values as needed.

3. **Install dependencies**
   ```bash
   make install
   # or
   uv sync
   ```

4. **Start PostgreSQL**
   ```bash
   make docker-up
   # or
   docker-compose up -d
   ```

5. **Run database migrations**
   ```bash
   make upgrade
   # or
   uv run alembic upgrade head
   ```

6. **Start the development server**
   ```bash
   make run
   # or
   uv run uvicorn app.main:app --reload
   ```

The API will be available at `http://localhost:8000`

## API Endpoints

### Overview (31 endpoints total)

#### CVs (6 endpoints)
- `POST /api/v1/cvs/` - Create a new CV
- `GET /api/v1/cvs/` - List all CVs (paginated)
- `GET /api/v1/cvs/user/{user_id}` - Get all CVs for a user
- `GET /api/v1/cvs/{cv_id}` - Get single CV with all relations (work experiences, educations, skills, projects)
- `PUT /api/v1/cvs/{cv_id}` - Update a CV
- `DELETE /api/v1/cvs/{cv_id}` - Delete a CV (cascade deletes all related data)

#### Work Experiences (5 endpoints)
- `POST /api/v1/work-experiences/` - Create work experience
- `GET /api/v1/work-experiences/` - List all work experiences
- `GET /api/v1/work-experiences/{id}` - Get single work experience
- `PUT /api/v1/work-experiences/{id}` - Update work experience
- `DELETE /api/v1/work-experiences/{id}` - Delete work experience

#### Educations (5 endpoints)
- `POST /api/v1/educations/` - Create education entry
- `GET /api/v1/educations/` - List all educations
- `GET /api/v1/educations/{id}` - Get single education
- `PUT /api/v1/educations/{id}` - Update education
- `DELETE /api/v1/educations/{id}` - Delete education

#### Skills (5 endpoints)
- `POST /api/v1/skills/` - Create skill
- `GET /api/v1/skills/` - List all skills
- `GET /api/v1/skills/{id}` - Get single skill
- `PUT /api/v1/skills/{id}` - Update skill
- `DELETE /api/v1/skills/{id}` - Delete skill

#### Projects (5 endpoints)
- `POST /api/v1/projects/` - Create project
- `GET /api/v1/projects/` - List all projects
- `GET /api/v1/projects/{id}` - Get single project
- `PUT /api/v1/projects/{id}` - Update project
- `DELETE /api/v1/projects/{id}` - Delete project

#### Health Check (1 endpoint)
- `GET /api/v1/health` - Health check with database status

### API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Example API Usage

**Create a CV:**
```bash
curl -X POST "http://localhost:8000/api/v1/cvs/" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "title": "Software Engineer CV",
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "location": "San Francisco, CA",
    "summary": "Experienced software engineer..."
  }'
```

**Add Work Experience:**
```bash
curl -X POST "http://localhost:8000/api/v1/work-experiences/" \
  -H "Content-Type: application/json" \
  -d '{
    "cv_id": 1,
    "company": "Tech Corp",
    "position": "Senior Developer",
    "location": "San Francisco, CA",
    "start_date": "2020-01-01",
    "end_date": "2023-12-31",
    "description": "Led development of...",
    "display_order": 1
  }'
```

**Get CV with All Relations:**
```bash
curl -X GET "http://localhost:8000/api/v1/cvs/1"
```

This returns the CV with nested arrays of work_experiences, educations, skills, and projects.

### Common Commands

```bash
# Install dependencies
make install

# Install with dev dependencies
make dev

# Run development server
make run

# Create a new migration
make migrate msg="your migration message"

# Apply migrations
make upgrade

# Rollback last migration
make downgrade

# Run tests
make test

# Format code
make format

# Lint code
make lint

# Clean cache files
make clean

# Start PostgreSQL
make docker-up

# Stop PostgreSQL
make docker-down
```

### Database Migrations

Create a new migration:
```bash
make migrate msg="add users table"
# or
uv run alembic revision --autogenerate -m "add users table"
```

Apply migrations:
```bash
make upgrade
# or
uv run alembic upgrade head
```

Rollback:
```bash
make downgrade
# or
uv run alembic downgrade -1
```

## Environment Variables

Key environment variables (see `.env.example` for full list):

- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - Secret key for JWT tokens
- `DEBUG` - Enable debug mode
- `BACKEND_CORS_ORIGINS` - Allowed CORS origins

## Database Schema

### Tables (7 total)

1. **user** - User accounts
2. **cv** - CV/Resume documents
3. **workexperience** - Work history entries
4. **education** - Educational background (with GPA, honors, thesis support)
5. **skill** - Technical and soft skills
6. **project** - Portfolio projects
7. **alembic_version** - Migration tracking

### Key Relationships

- User → CV (one-to-many)
- CV → WorkExperience (one-to-many, cascade delete)
- CV → Education (one-to-many, cascade delete)
- CV → Skill (one-to-many, cascade delete)
- CV → Project (one-to-many, cascade delete)

### Data Validation

- **Email**: Validated using Pydantic EmailStr
- **GPA**: Decimal(3,2) with validation (0.00 - 4.00)
- **Dates**: ISO format (YYYY-MM-DD)
- **Foreign Keys**: Enforced at database level
- **Display Order**: Integer field for custom sorting

## Development

### Adding a New Endpoint

1. Create endpoint in `app/api/v1/endpoints/`
2. Add router to `app/api/v1/api.py`
3. Create Pydantic schemas in `app/schemas/`
4. Create SQLAlchemy models in `app/models/`
5. Add business logic in `app/services/` (if needed)

### Adding a New Model

1. Create model in `app/models/`
2. Import in `app/db/base.py` (for Alembic auto-detection)
3. Create migration: `make migrate msg="add new model"`
4. Apply migration: `make upgrade`

## Testing

Run tests:
```bash
make test
# or
uv run pytest
```

## License

MIT
