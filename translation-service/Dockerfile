# Slim Python image keeps footprint small while remaining compatible with CPU-only PyTorch wheels.
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .

# Install dependencies first to leverage Docker layer caching.
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt \
    && rm -rf /root/.cache/pip

COPY main.py .

EXPOSE 8001

# Use uvicorn directly; no extra process manager needed for single service container.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
