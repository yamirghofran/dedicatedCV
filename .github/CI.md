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
│  │  • Setup (shared venv)│  │  • Lint & Types     │            │
│  │  • Lint & Types     │    │  • Build & Test     │            │
│  │  • Tests            │    │  • SCA (npm audit)  │            │
│  │  • Build (after tests)│  │  • SAST (Semgrep)   │            │
│  │  • SAST & SCA       │    │                     │            │
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
| **backend-setup** | One-time backend environment setup; installs dependencies into a shared virtualenv and uploads it as an artifact | uv, Python |
| **backend-lint** | Linting and type checking (reuses shared virtualenv from `backend-setup`) | Ruff, mypy |
| **backend-test** | Unit tests with coverage (reuses shared virtualenv from `backend-setup`) | pytest, pytest-cov |
| **backend-build** | Verify package builds correctly; runs **after tests** and reuses the shared virtualenv | uv build |
| **backend-security** | Dependency SCA (vulnerability scan, reuses shared virtualenv) | pip-audit |
| **backend-sast** | Static application security testing | Semgrep (Python, OWASP, secrets) |

### Frontend Jobs (run only when `frontend/**` changes)

| Job | Description | Tools |
|-----|-------------|-------|
| **frontend-lint** | Linting and type checking | Biome, TypeScript |
| **frontend-build** | Tests and production build; runs **after** `frontend-lint` completes successfully | Vitest, Vite |
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

## Job Sequencing & Dependencies

The pipeline uses a combination of parallel and sequential execution for optimal speed and correctness:

### Backend Job Graph

```
changes ──► backend-setup ──┬──► backend-lint
                            ├──► backend-test ──► backend-build
                            └──► backend-security

changes ──► backend-sast (runs independently)
```

- **backend-setup**: Runs first, installs all dependencies once, uploads shared virtualenv
- **backend-lint, backend-test, backend-security**: Run in parallel after setup, reuse shared venv
- **backend-build**: Runs only after tests pass (sequential dependency)
- **backend-sast**: Runs independently (no venv needed, uses Semgrep container)

### Frontend Job Graph

```
changes ──► frontend-lint ──► frontend-build

changes ──┬──► frontend-security
          └──► frontend-sast
```

- **frontend-lint**: Runs first (format check, lint, type check)
- **frontend-build**: Runs only after lint passes (sequential dependency)
- **frontend-security, frontend-sast**: Run independently in parallel

## Shared Backend Virtualenv

The backend uses an artifact-based approach to share the virtualenv across jobs, avoiding repeated dependency installation:

### How it works

1. **backend-setup** job:
   - Runs `uv sync --all-extras` to install all dependencies (including dev tools)
   - Uploads `backend/.venv` as artifact named `backend-venv`

2. **Downstream jobs** (lint, test, build, security):
   - Download the `backend-venv` artifact to `backend/.venv`
   - Restore executable permissions with `chmod -R +x .venv/bin/`
   - Run tools directly via `uv run` without reinstalling

### Technical notes

- **Artifact paths**: Upload/download paths are relative to `$GITHUB_WORKSPACE` (repo root), not to `working-directory`
- **Permissions**: GitHub artifacts don't preserve Unix permissions, so we restore them after download
- **Artifact retention**: `backend-venv` is retained for 1 day (only needed within workflow run)

### Benefits

- **Faster CI**: Dependencies installed once instead of 4× (lint, test, build, security)
- **Consistent environment**: All jobs use identical dependency versions
- **Reduced network load**: PyPI packages downloaded once per workflow run

## Dependency Caching

In addition to the shared venv artifact, the pipeline uses tool-level caching:

### Backend (uv cache)
- **Cache key**: Based on `backend/uv.lock`
- **Cache location**: uv's internal cache (`~/.cache/uv`)
- **Benefit**: If lockfile unchanged, `backend-setup` installs from cache (~2-5s vs ~30s)

### Frontend (Bun cache)
- **Cache key**: Based on `frontend/bun.lock`
- **Cache location**: `~/.bun/install/cache`
- **Benefit**: ~20-40s faster when dependencies unchanged

When lock files change, caches are invalidated and dependencies are reinstalled.

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

The pipeline uploads the following artifacts:

| Artifact | Description | Retention |
|----------|-------------|-----------|
| **backend-venv** | Shared Python virtualenv for backend jobs | 1 day |
| **backend-coverage** | Test coverage report (XML) | 7 days |
| **frontend-dist** | Production build output | 7 days |

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

### Backend venv artifact issues?

**"Artifact not found" error:**
- Check `backend-setup` job completed successfully
- Verify the upload path is `backend/.venv` (relative to repo root)

**"Permission denied" error:**
- The `chmod -R +x .venv/bin/` step restores executable permissions
- If missing, add it after the download-artifact step

**"Failed to spawn" error (e.g., ruff, pytest):**
- Tools may not be installed - check `backend-setup` runs `uv sync --all-extras`
- Verify dev dependencies are in `pyproject.toml` under `[project.optional-dependencies]`

**uv creates new venv instead of using downloaded one:**
- Download path should be `backend/.venv`, not `backend`
- The artifact contains the *contents* of `.venv`, not the directory itself
