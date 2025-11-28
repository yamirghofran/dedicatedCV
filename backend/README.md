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
- **JWT Authentication** with secure user registration and login
- **Password hashing** using Argon2 (industry-standard, more secure than bcrypt)
- **Protected API endpoints** - all CV operations require authentication
- **Authorization** - users can only access their own CVs and data
- 35 API endpoints (31 CV endpoints + 4 auth endpoints)
- Pydantic schemas with validation (email, GPA 0-4.0, dates)
- Nested CV retrieval with all relations
- Cascade delete functionality
- Health check endpoint with database status
- Enhanced education model (GPA, honors, relevant subjects, thesis)

**TODO:**
- Automated pytest test suite
- API rate limiting
- Password reset functionality
- Email verification
- Frontend integration
- Deployment configuration

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

### Overview (35 endpoints total)

#### Authentication (4 endpoints) Public
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login and get JWT access token
- `GET /api/v1/auth/me` - Get current authenticated user 🔒
- `POST /api/v1/auth/test-token` - Test JWT token validity 🔒

#### CVs (5 endpoints) Protected
- `POST /api/v1/cvs/` - Create a new CV (user_id automatically set from token)
- `GET /api/v1/cvs/` - List all CVs for authenticated user (paginated)
- `GET /api/v1/cvs/{cv_id}` - Get single CV with all relations (only if owned by user)
- `PUT /api/v1/cvs/{cv_id}` - Update a CV (only if owned by user)
- `DELETE /api/v1/cvs/{cv_id}` - Delete a CV (only if owned by user, cascade deletes all related data)

#### Work Experiences (5 endpoints) Protected
- `POST /api/v1/work-experiences/` - Create work experience (only for user's CVs)
- `GET /api/v1/work-experiences/{id}` - Get single work experience (only if user owns CV)
- `PUT /api/v1/work-experiences/{id}` - Update work experience (only if user owns CV)
- `DELETE /api/v1/work-experiences/{id}` - Delete work experience (only if user owns CV)

#### Educations (5 endpoints) Protected
- `POST /api/v1/educations/` - Create education entry (only for user's CVs)
- `GET /api/v1/educations/{id}` - Get single education (only if user owns CV)
- `PUT /api/v1/educations/{id}` - Update education (only if user owns CV)
- `DELETE /api/v1/educations/{id}` - Delete education (only if user owns CV)

#### Skills (5 endpoints) Protected
- `POST /api/v1/skills/` - Create skill (only for user's CVs)
- `GET /api/v1/skills/{id}` - Get single skill (only if user owns CV)
- `PUT /api/v1/skills/{id}` - Update skill (only if user owns CV)
- `DELETE /api/v1/skills/{id}` - Delete skill (only if user owns CV)

#### Projects (5 endpoints) Protected
- `POST /api/v1/projects/` - Create project (only for user's CVs)
- `GET /api/v1/projects/{id}` - Get single project (only if user owns CV)
- `PUT /api/v1/projects/{id}` - Update project (only if user owns CV)
- `DELETE /api/v1/projects/{id}` - Delete project (only if user owns CV)
#### Health Check (1 endpoint) Public
- `GET /api/v1/health` - Health check with database status

**Legend:**
- Public - No authentication required
- Protected - Requires JWT Bearer token in Authorization header

### API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Example API Usage

#### 1. Register a New User
```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123",
    "full_name": "John Doe"
  }'
```

#### 2. Login to Get JWT Token
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=john@example.com&password=securepassword123"
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### 3. Create a CV (with authentication)
```bash
TOKEN="your_jwt_token_here"

curl -X POST "http://localhost:8000/api/v1/cvs/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Software Engineer CV",
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "location": "San Francisco, CA",
    "summary": "Experienced software engineer..."
  }'
```

#### 4. Add Work Experience (with authentication)
```bash
curl -X POST "http://localhost:8000/api/v1/work-experiences/" \
  -H "Authorization: Bearer $TOKEN" \
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

### Manual Testing
All 35 endpoints have been manually tested:
- ✅ Authentication (register, login, token validation)
- ✅ CREATE operations (POST with JWT)
- ✅ READ operations (GET with JWT, ownership verification)
- ✅ UPDATE operations (PUT with JWT, ownership verification)
- ✅ DELETE operations (DELETE with JWT, ownership verification, cascade delete)
- ✅ Authorization (users can only access their own data)
- ✅ Validation (email, GPA, foreign keys, dates)
- ✅ Data persistence

### Automated Testing (TODO)
Run tests:
```bash
make test
# or
uv run pytest
```

**TODO: Write pytest tests for:**
- All CRUD endpoints with authentication
- Authorization checks (users cannot access other users' data)
- Validation errors
- Foreign key constraints
- Cascade delete behavior
- Edge cases

## Security Features

### Authentication & Authorization
- **JWT Tokens**: Industry-standard JSON Web Tokens with 30-minute expiration
- **Password Hashing**: Argon2 algorithm (more secure than bcrypt, no compatibility issues)
- **Protected Endpoints**: All CV operations require valid JWT token
- **Ownership Verification**: Users can only access/modify their own CVs and related data
- **Secure Token Storage**: Tokens include user ID in payload for fast lookups

### Security Best Practices
✅ Password hashing with Argon2  
✅ JWT tokens with expiration  
✅ Email uniqueness validation  
✅ Inactive user check  
✅ Ownership verification on all operations  
✅ OAuth2 password flow (industry standard)  
✅ Proper HTTP status codes (401 Unauthorized, 403 Forbidden, 404 Not Found)  
✅ CORS configuration  
✅ SQL injection protection (SQLAlchemy ORM)  

### Important Security Notes

⚠️ **Authentication is now REQUIRED** for all CV endpoints. The old `user_id` parameter approach has been removed.

**How it works:**
1. User registers: `POST /api/v1/auth/register`
2. User logs in: `POST /api/v1/auth/login` → receives JWT token
3. User includes token in all requests: `Authorization: Bearer <token>`
4. Backend verifies token and extracts user ID
5. All operations automatically filtered by authenticated user

**Authorization Rules:**
- Users can only create CVs for themselves (user_id set from token)
- Users can only view/edit/delete their own CVs
- Users can only add work experiences/educations/skills/projects to their own CVs
- Attempting to access another user's data returns `403 Forbidden`

## API Design Decisions

1. **JWT Authentication**: All CV endpoints now require authentication. No more manual `user_id` parameter.

2. **Trailing Slashes**: All endpoints use trailing slashes (`/api/v1/cvs/`). FastAPI will redirect without trailing slash (307).

3. **Request Body**: Foreign keys (cv_id) are passed in request body. user_id is automatically set from JWT token.

4. **Cascade Delete**: Deleting a CV automatically deletes all related work experiences, educations, skills, and projects. This is intentional for data cleanup.

5. **Display Order**: All sections (work experiences, educations, skills, projects) support a `display_order` field for custom sorting in the frontend.

6. **Timestamps**: All entities have `created_at` and `updated_at` timestamps that are automatically managed.

7. **Password Hashing**: Using Argon2 instead of bcrypt for better security and Python 3.13 compatibility.

## Next Steps

### High Priority
1. [ ] Write comprehensive pytest test suite with authentication
2. [ ] Add API rate limiting (prevent brute force attacks)
3. [ ] Add password reset functionality (email-based)
4. [ ] Add email verification on registration
5. [ ] Connect React frontend with authentication

### Medium Priority
6. [ ] Add refresh tokens for long-lived sessions
7. [ ] Implement caching (Redis)
8. [ ] Add logging and monitoring
9. [ ] Add account lockout after failed login attempts
10. [ ] Add password strength validation

### Low Priority
11. [ ] Add file upload for profile pictures
12. [ ] PDF export functionality
13. [ ] Email notifications
14. [ ] API analytics
15. [ ] Deployment configuration (Docker, K8s)

## License

MIT
