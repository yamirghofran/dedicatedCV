# FastAPI Backend with PostgreSQL

A production-ready FastAPI backend application with PostgreSQL database, Alembic migrations, and Pydantic models.

## Features

- **FastAPI** - Modern, fast web framework for building APIs
- **PostgreSQL** - Robust relational database
- **SQLAlchemy 2.0** - SQL toolkit and ORM
- **Alembic** - Database migration tool
- **Pydantic v2** - Data validation using Python type annotations
- **JWT Authentication** - Secure token-based authentication
- **CORS** - Cross-Origin Resource Sharing support
- **Docker Compose** - Easy PostgreSQL setup
- **UV** - Fast Python package manager

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

## Usage

### API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

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

## Development

### Adding a New Endpoint

1. Create endpoint in `app/api/v1/endpoints/`
2. Add router to `app/api/v1/api.py`
3. Create Pydantic schemas in `app/schemas/`
4. Create SQLAlchemy models in `app/models/`
5. Add business logic in `app/services/`

### Adding a New Model

1. Create model in `app/models/`
2. Import in `alembic/env.py`
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
