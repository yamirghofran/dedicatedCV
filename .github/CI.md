# CI Pipeline Documentation

This project uses GitHub Actions for continuous integration. The pipeline runs automatically on pushes to `main` and on pull requests.

## Pipeline Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CI Pipeline                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐                                                   │
│  │ Detect   │──► Determines which jobs need to run              │
│  │ Changes  │                                                   │
│  └────┬─────┘                                                   │
│       │                                                         │
│       ▼                                                         │
│  ┌─────────────────────┐    ┌─────────────────────┐            │
│  │   Backend Jobs      │    │   Frontend Jobs     │            │
│  │   (if backend/)     │    │   (if frontend/)    │            │
│  │                     │    │                     │            │
│  │  • Lint & Types     │    │  • Lint & Types     │            │
│  │  • Tests            │    │  • Build & Test     │            │
│  │  • Security Scan    │    │                     │            │
│  └─────────────────────┘    └─────────────────────┘            │
│                                                                 │
│  ┌─────────────────────┐                                       │
│  │  Secret Scanning    │◄── Always runs on all changes         │
│  └─────────────────────┘                                       │
│                                                                 │
│  ┌─────────────────────┐                                       │
│  │  CI Success Gate    │◄── Summary job for branch protection  │
│  └─────────────────────┘                                       │
└─────────────────────────────────────────────────────────────────┘
```

## Jobs

### Backend Jobs (run only when `backend/**` changes)

| Job | Description | Tools |
|-----|-------------|-------|
| **backend-lint** | Linting and type checking | Ruff, mypy |
| **backend-test** | Unit tests with coverage | pytest, pytest-cov |
| **backend-security** | Dependency vulnerability scan | pip-audit |

### Frontend Jobs (run only when `frontend/**` changes)

| Job | Description | Tools |
|-----|-------------|-------|
| **frontend-lint** | Linting and type checking | Biome, TypeScript |
| **frontend-build** | Tests and production build | Vitest, Vite |

### Global Jobs (always run)

| Job | Description | Tools |
|-----|-------------|-------|
| **secret-scanning** | Scans for leaked secrets | Gitleaks |
| **ci-success** | Aggregates results for branch protection | - |

## Triggers

- **Push to `main`**: Full pipeline runs
- **Pull Request to `main`**: Full pipeline runs
- **Concurrent runs**: Automatically cancelled when new commits are pushed

## Path Filtering

The pipeline uses smart path detection to skip unnecessary jobs:

| Files Changed | Backend Jobs | Frontend Jobs | Secret Scan |
|--------------|--------------|---------------|-------------|
| `backend/**` | ✅ Run | ⏭️ Skip | ✅ Run |
| `frontend/**` | ⏭️ Skip | ✅ Run | ✅ Run |
| Both | ✅ Run | ✅ Run | ✅ Run |
| Neither | ⏭️ Skip | ⏭️ Skip | ✅ Run |

## Branch Protection

To require CI to pass before merging, add `ci-success` as a required status check in your repository settings:

1. Go to **Settings** → **Branches**
2. Add a branch protection rule for `main`
3. Enable **Require status checks to pass**
4. Select **ci-success** from the list

## Configuration Files

| File | Purpose |
|------|---------|
| `.github/workflows/ci.yml` | Main workflow definition |
| `.gitleaks.toml` | Secret scanning rules and allowlist |

## Running Locally

### Backend
```bash
cd backend
make lint      # Run Ruff linting
make test      # Run pytest
uv run mypy app --ignore-missing-imports  # Type check
uv run pip-audit  # Security scan
```

### Frontend
```bash
cd frontend
bun run check  # Biome lint + format
bunx tsc --noEmit  # Type check
bun run test   # Run Vitest
bun run build  # Production build
```

## Artifacts

The pipeline uploads artifacts that are retained for 7 days:

- **backend-coverage**: Test coverage report (XML)
- **frontend-dist**: Production build output

