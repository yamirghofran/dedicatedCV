.PHONY: help install dev ci-tools run migrate migration upgrade downgrade test lint typecheck check format clean docker-up docker-down

help:
	@echo "Available commands:"
	@echo "  make install       - Install dependencies"
	@echo "  make dev           - Install dev dependencies"
	@echo "  make ci-tools      - Install CI tooling (ruff, mypy, pytest, pip-audit)"
	@echo "  make run           - Run the development server"
	@echo "  make migrate       - Create a new migration"
	@echo "  make upgrade       - Apply migrations"
	@echo "  make downgrade     - Rollback last migration"
	@echo "  make test          - Run tests"
	@echo "  make lint          - Run linter"
	@echo "  make typecheck     - Run mypy type checks"
	@echo "  make check         - Run lint, typecheck, and tests"
	@echo "  make format        - Format code"
	@echo "  make clean         - Clean cache files"
	@echo "  make docker-up     - Start PostgreSQL with Docker"
	@echo "  make docker-down   - Stop PostgreSQL"

install:
	uv sync

dev:
	uv sync --all-extras

ci-tools:
	uv pip install --python .venv/bin/python "ruff==0.7.3" "mypy==1.13.0" "pip-audit==2.7.0" "pytest==8.3.3" "pytest-cov==6.0.0"

run:
	uv run uvicorn main:app --reload --host 0.0.0.0 --port 8001

lint:
	uv run ruff check .
	uv run ruff format --check .

typecheck:
	uv run mypy main.py --ignore-missing-imports --disable-error-code=arg-type --disable-error-code=call-arg --disable-error-code=var-annotated --disable-error-code=attr-defined

test:
	@set +e; \
	uv run pytest --cov=main --cov-report=term-missing --cov-report=xml; \
	status=$$?; \
	if [ $$status -eq 5 ]; then \
		echo "No tests found, continuing..."; \
		exit 0; \
	fi; \
	exit $$status

check: lint typecheck test

format:
	uv run black .
	uv run ruff check --fix .

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down
