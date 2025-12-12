.PHONY: help install dev run migrate migration upgrade downgrade test lint format clean docker-up docker-down

help:
	@echo "Available commands:"
	@echo "  make install       - Install dependencies"
	@echo "  make dev           - Install dev dependencies"
	@echo "  make run           - Run the development server"
	@echo "  make migrate       - Create a new migration"
	@echo "  make upgrade       - Apply migrations"
	@echo "  make downgrade     - Rollback last migration"
	@echo "  make test          - Run tests"
	@echo "  make lint          - Run linter"
	@echo "  make format        - Format code"
	@echo "  make clean         - Clean cache files"
	@echo "  make docker-up     - Start PostgreSQL with Docker"
	@echo "  make docker-down   - Stop PostgreSQL"

install:
	uv sync

dev:
	uv sync --all-extras

run:
	uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000

lint:
	uv run ruff check .

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