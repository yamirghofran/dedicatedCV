# DedicatedCV

A modern, full-stack CV/Resume builder application with AI-powered optimization, multi-language support, and professional templates.

## Features

- **Professional Templates** - Choose from Classic, Modern, and Minimal CV templates
- **AI Optimization** - Enhance your CV content with AI-powered suggestions using Groq
- **Multi-language Support** - Translate your CV into multiple languages
- **Export & Share** - Generate shareable links and export to PDF
- **Secure Authentication** - JWT-based authentication with Argon2 password hashing
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Cloud Storage** - Profile picture uploads via Azure Blob Storage
- **Dashboard Analytics** - Track your CVs and recent activity
- **Complete CV Management** - Manage work experience, education, skills, and projects

## Architecture

This project uses an N-tier architecture with three main layers:

```
dedicatedCV/
├── frontend/             # Presentation Layer - React frontend (TypeScript)
├── backend/              # Business Logic & Data Access Layer - FastAPI backend (Python)
└── translation-service/  # Translation service for translating the CV
```

**Presentation Layer (Frontend):**

- User interface and user experience
- Client-side routing and state management
- API consumption via service layer

**Business Logic & Data Access Layer (Backend):**

- RESTful API endpoints
- Business logic and validation
- Database operations via ORM
- Authentication and authorization
- Integration with external services (AI, Blob Storage)

**Service Layer (Translation Service):**

- Dedicated translation functionality
- Decoupled from main backend for scalability

### Tech Stack

**Backend:**

- FastAPI - Modern Python web framework
- PostgreSQL - Relational database
- SQLAlchemy 2.0 - ORM with relationship management
- Alembic - Database migrations
- Pydantic v2 - Data validation
- JWT - Authentication
- Groq AI - AI-powered content optimization
- Azure Blob Storage - File storage
- Azure Monitor - Application insights and monitoring

**Frontend:**

- React 19 - UI library
- TypeScript - Type safety
- TanStack Router - File-based routing
- TanStack Query - Data fetching and caching
- TanStack Table - Advanced table functionality
- Tailwind CSS 4 - Styling
- Shadcn UI - Component library
- Biome - Linting and formatting
- Vite - Build tool

**Translation Service:**

- FastAPI - API framework
- Python 3.13 - Runtime

## Prerequisites

- **Python 3.13+** with [uv](https://github.com/astral-sh/uv) package manager
- **Node.js 18+** or **Bun** (recommended)
- **Docker & Docker Compose** - For PostgreSQL
- **Git** - Version control

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd dedicatedCV
```

### 2. Backend Setup

```bash
cd backend

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration

# Install dependencies
uv sync

# Start PostgreSQL
make docker-up

# Run database migrations
make upgrade

# Start the development server
make run
```

The backend API will be available at:

- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 3. Frontend Setup

```bash
cd frontend

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration

# Install dependencies
bun install
# or: npm install

# Start the development server
bun run dev
# or: npm run dev
```

The frontend will be available at http://localhost:3000

### 4. Translation Service Setup (Optional)

```bash
cd translation-service

# Install dependencies
uv sync

# Start the service
make run
```

The translation service will be available at http://localhost:8001

## Project Structure

```
dedicatedCV/
├── backend/
│   ├── alembic/              # Database migrations
│   ├── app/
│   │   ├── api/v1/           # API endpoints
│   │   ├── core/             # Configuration & security
│   │   ├── db/               # Database setup
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic (AI, Blob, Translation)
│   │   └── main.py           # Application entry point
│   ├── tests/                # Test suite
│   └── pyproject.toml        # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── auth/         # Authentication components
│   │   │   ├── cv/           # CV form components
│   │   │   ├── dashboard/    # Dashboard components
│   │   │   └── ui/           # Shadcn UI components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/api/          # API client and services
│   │   ├── routes/           # TanStack Router routes
│   │   ├── templates/        # CV templates
│   │   └── main.tsx          # Application entry point
│   └── package.json          # Node dependencies
│
└── translation-service/
    ├── main.py               # Translation API
    └── tests/                # Test suite
```

## Development

### Backend Commands

```bash
# Run development server
make run

# Run tests
make test

# Format code
make format

# Lint code
make lint

# Create database migration
make migrate msg="your migration message"

# Apply migrations
make upgrade

# Rollback migration
make downgrade

# Start PostgreSQL
make docker-up

# Stop PostgreSQL
make docker-down
```

### Frontend Commands

```bash
# Start development server
bun run dev

# Build for production
bun run build

# Run tests
bun run test

# Format code
bun run format

# Lint code
bun run lint

# Check code quality
bun run check
```

## Testing

### Backend Tests

```bash
cd backend
make test
# or: uv run pytest
```

Current test coverage includes:

- Authentication (register, login, token validation)
- CV CRUD operations
- Work experience management
- Education management
- Skills management
- Projects management
- Health checks

### Frontend Tests

```bash
cd frontend
bun run test
# or: npm test
```

## Pre-commit Hooks

This project uses [pre-commit](https://pre-commit.com/) to ensure code quality before commits.

### Setup (One-time)

From the **repository root**:

```bash
# Install pre-commit
pipx install pre-commit
# or: uv tool install pre-commit

# Install git hooks
pre-commit install

# Run on all files (recommended after setup)
pre-commit run --all-files
```

### What Runs

**Backend (`backend/**/\*.py`):\*\*

- Ruff formatter
- Ruff linter

**Frontend (`frontend/src/**/\*.{ts,tsx,js,jsx}`):\*\*

- Biome check (formatting + linting)

**Global (all commits):**

- Trailing whitespace check
- End-of-file fixer
- Merge conflict detection
- YAML/TOML/JSON validation
- **Gitleaks** secret scanning

## Deployment

### Docker Deployment

Each service includes a `Dockerfile` for containerized deployment:

```bash
# Build backend
cd backend
docker build -t dedicatedcv-backend .

# Build frontend
cd frontend
docker build -t dedicatedcv-frontend .

# Build translation service
cd translation-service
docker build -t dedicatedcv-translation .
```

### Azure Deployment

The project includes GitHub Actions workflows for automated deployment to Azure:

- **CI Workflow** (`.github/workflows/ci.yml`) - Runs tests on pull requests
- **CD Workflow** (`.github/workflows/cd.yml`) - Deploys to Azure on push to main

See [DEPLOYMENT_SETUP.md](./DEPLOYMENT_SETUP.md) for detailed Azure deployment instructions.

### Environment Variables

#### Backend

Create a `.env` file in the `backend/` directory:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dedicatedcv

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
BACKEND_CORS_ORIGINS=http://localhost:3000

# Azure (Optional)
APPLICATIONINSIGHTS_CONNECTION_STRING=your-connection-string
AZURE_STORAGE_CONNECTION_STRING=your-storage-connection-string
AZURE_STORAGE_CONTAINER_NAME=profile-pictures

# Groq AI (Optional)
GROQ_API_KEY=your-groq-api-key
```

#### Frontend

Create a `.env` file in the `frontend/` directory:

```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_API_VERSION=v1
```

## Documentation

- **Backend README**: [backend/README.md](./backend/README.md)
- **Frontend README**: [frontend/README.md](./frontend/README.md)
- **Quick Start Guide**: [backend/QUICKSTART.md](./backend/QUICKSTART.md)
- **API Integration**: [frontend/API_INTEGRATION.md](./frontend/API_INTEGRATION.md)
- **Deployment Setup**: [DEPLOYMENT_SETUP.md](./DEPLOYMENT_SETUP.md)
- **CI/CD Guide**: [.github/CI.md](./.github/CI.md)
- **Azure Insights**: [backend/AZURE_INSIGHTS_SETUP.md](./backend/AZURE_INSIGHTS_SETUP.md)

## Security Features

- **JWT Authentication** - Secure token-based authentication
- **Argon2 Password Hashing** - Industry-standard password security
- **CORS Protection** - Configurable cross-origin resource sharing
- **SQL Injection Protection** - SQLAlchemy ORM prevents SQL injection
- **Secret Scanning** - Gitleaks prevents committing secrets
- **Authorization** - Users can only access their own data
- **Token Expiration** - Automatic token expiration (30 minutes default)

### Code Quality

- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR
- Pre-commit hooks will run automatically

## API Documentation

Once the backend is running, visit:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

**Authentication:**

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get JWT token
- `GET /api/v1/auth/me` - Get current user (protected)

**CVs:**

- `GET /api/v1/cvs/` - List all user CVs (protected)
- `POST /api/v1/cvs/` - Create new CV (protected)
- `GET /api/v1/cvs/{id}` - Get CV with all relations (protected)
- `PUT /api/v1/cvs/{id}` - Update CV (protected)
- `DELETE /api/v1/cvs/{id}` - Delete CV (protected, cascade deletes)

**Work Experience, Education, Skills, Projects:**

- Similar CRUD endpoints for each resource
- All protected and scoped to user's CVs

**AI & Translation:**

- `POST /api/v1/ai/optimize` - Optimize CV content with AI
- `POST /api/v1/translation/translate` - Translate CV content

**Share Links:**

- `POST /api/v1/share-links/` - Create shareable CV link
- `GET /api/v1/share-links/{token}` - Access shared CV (public)

## Troubleshooting

### Backend Issues

**PostgreSQL won't start:**

```bash
# Check if port 5432 is in use
lsof -i :5432

# Stop and restart
make docker-down
make docker-up
```

**Database connection errors:**

- Verify PostgreSQL is running: `docker ps`
- Check `.env` matches `docker-compose.yml`
- Ensure migrations are applied: `make upgrade`

**Import errors:**

- Ensure using correct Python version: `python --version`
- Reinstall dependencies: `uv sync`

### Frontend Issues

**API connection errors:**

- Verify backend is running on port 8000
- Check `VITE_API_BASE_URL` in `.env`
- Verify CORS settings in backend `.env`

**Build errors:**

- Clear node_modules: `rm -rf node_modules && bun install`
- Clear build cache: `rm -rf dist .vite`

## Monitoring

The application includes Azure Application Insights integration for:

- Request tracking
- Error logging
- Performance monitoring
- Custom metrics

See [backend/AZURE_INSIGHTS_SETUP.md](./backend/AZURE_INSIGHTS_SETUP.md) for setup instructions.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) - Backend framework
- [React](https://react.dev/) - Frontend library
- [TanStack](https://tanstack.com/) - Router, Query, and Table
- [Shadcn UI](https://ui.shadcn.com/) - Component library
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [Groq](https://groq.com/) - AI optimization
- [Azure](https://azure.microsoft.com/) - Cloud infrastructure

---
