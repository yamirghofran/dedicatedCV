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
│  │  • Build            │    │  • SCA (npm audit)  │            │
│  │  • SAST & SCA       │    │  • SAST (Semgrep)   │            │
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
| **backend-build** | Verify package builds correctly | uv build |
| **backend-security** | Dependency SCA (vulnerability scan) | pip-audit |
| **backend-sast** | Static application security testing | Semgrep (Python, OWASP, secrets) |

### Frontend Jobs (run only when `frontend/**` changes)

| Job | Description | Tools |
|-----|-------------|-------|
| **frontend-lint** | Linting and type checking | Biome, TypeScript |
| **frontend-build** | Tests and production build | Vitest, Vite |
| **frontend-security** | Dependency SCA (vulnerability scan) | npm audit |
| **frontend-sast** | Static application security testing | Semgrep (JS/TS/React, OWASP, secrets) |

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

## Dependency Caching

The pipeline caches dependencies to speed up subsequent runs:

### Backend (Python/uv)
- **Cache key**: Based on `backend/uv.lock`
- **Cache location**: uv's internal cache
- **Benefit**: ~30-60s faster when dependencies unchanged

### Frontend (Bun)
- **Cache key**: Based on `frontend/bun.lock`
- **Cache location**: `~/.bun/install/cache`
- **Benefit**: ~20-40s faster when dependencies unchanged

When lock files change, the cache is invalidated and dependencies are reinstalled.

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
uv sync --all-extras      # Install dependencies
uv run ruff check .       # Linting
uv run ruff format --check .  # Format check
uv run mypy app --ignore-missing-imports  # Type check
uv run pytest             # Run tests
uv build                  # Build package
uv run pip-audit          # Security scan
```

### Frontend
```bash
cd frontend
bun install --frozen-lockfile  # Install dependencies
bunx biome format --error-on-warnings ./src  # Format check
bunx tsc --noEmit              # Type check
bunx vitest run --passWithNoTests  # Run tests
bun run build                  # Production build
```

## Artifacts

The pipeline uploads artifacts that are retained for 7 days:

| Artifact | Description |
|----------|-------------|
| **backend-coverage** | Test coverage report (XML) |
| **frontend-dist** | Production build output |

## Troubleshooting

### Cache not working?
- Verify your lock files (`uv.lock`, `bun.lock`) are committed
- Check the Actions tab for cache hit/miss logs

### Tests failing in CI but passing locally?
- Check environment variables are set correctly
- Verify all dependencies are in lock files

### Build failing?
- Run the build locally first: `uv build` or `bun run build`
- Check for missing dependencies or type errors
