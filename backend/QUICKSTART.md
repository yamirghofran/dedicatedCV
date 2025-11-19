# Quick Start Guide

Get your FastAPI backend up and running in minutes!

## Prerequisites

- Python 3.13+
- Docker Desktop (for PostgreSQL)
- UV package manager (should already be installed)

## 🚀 Quick Setup (5 minutes)

### 1. Configure Environment Variables

The `.env` file has already been created. Update it with your preferences:

```bash
# Edit the .env file
nano .env  # or use your preferred editor
```

**Important:** Change the `SECRET_KEY` in production!

### 2. Start PostgreSQL

```bash
make docker-up
```

This will start a PostgreSQL container in the background.

### 3. Run Database Migrations

```bash
make upgrade
```

This creates the initial database tables.

### 4. Start the Development Server

```bash
make run
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🧪 Verify Installation

### Test the API

```bash
# Root endpoint
curl http://localhost:8000/

# Health check
curl http://localhost:8000/api/v1/health
```

### Run Tests

```bash
make test
```

## 📚 Common Tasks

### Create a New Database Migration

```bash
make migrate msg="add new table"
```

### Apply Migrations

```bash
make upgrade
```

### Rollback Last Migration

```bash
make downgrade
```

### Format Code

```bash
make format
```

### Stop PostgreSQL

```bash
make docker-down
```

## 🏗️ Project Structure

```
backend/
├── app/
│   ├── api/v1/endpoints/    # API endpoints
│   ├── core/                # Configuration & security
│   ├── db/                  # Database setup
│   ├── models/              # SQLAlchemy models
│   ├── schemas/             # Pydantic schemas
│   ├── services/            # Business logic
│   └── main.py             # FastAPI app
├── alembic/                # Database migrations
├── tests/                  # Test files
└── .env                    # Environment variables
```

## 🔧 Development Workflow

1. **Create a new feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Add your models** in `app/models/`

3. **Create Pydantic schemas** in `app/schemas/`

4. **Add endpoints** in `app/api/v1/endpoints/`

5. **Create migration**
   ```bash
   make migrate msg="add my feature"
   ```

6. **Apply migration**
   ```bash
   make upgrade
   ```

7. **Test your changes**
   ```bash
   make test
   ```

8. **Format code**
   ```bash
   make format
   ```

## 🐛 Troubleshooting

### PostgreSQL won't start

```bash
# Check if port 5432 is already in use
lsof -i :5432

# Stop existing PostgreSQL
make docker-down

# Start again
make docker-up
```

### Import errors in IDE

The imports work fine when running with `uv run`. If your IDE shows errors:
- Make sure your IDE is using the virtual environment at `.venv`
- Restart your IDE/language server

### Database connection errors

Make sure:
1. PostgreSQL is running: `docker ps`
2. Environment variables in `.env` match `docker-compose.yml`
3. Database exists: `make docker-up` creates it automatically

## 📖 Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check out the [FastAPI documentation](https://fastapi.tiangolo.com/)
- Explore the [SQLAlchemy 2.0 documentation](https://docs.sqlalchemy.org/)
- Learn about [Alembic migrations](https://alembic.sqlalchemy.org/)

## 🎉 You're Ready!

Your FastAPI backend is now set up and ready for development. Happy coding!
