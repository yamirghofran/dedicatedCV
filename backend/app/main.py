import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.api.v1.api import api_router
from app.core.monitoring import (
    MonitoringMiddleware,
    initialize_monitoring,
    shutdown_monitoring,
    monitoring,
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler for startup and shutdown events.

    Args:
        app: FastAPI application instance
    """
    # Startup
    logger.info("Starting up application...")

    # Initialize Azure Application Insights
    if settings.ENABLE_AZURE_INSIGHTS:
        logger.info("Initializing Azure Application Insights monitoring...")
        success = initialize_monitoring()
        if success:
            logger.info(
                "Azure Application Insights monitoring initialized successfully"
            )
            monitoring.track_event(
                "application_started",
                {
                    "app_name": settings.APP_NAME,
                    "version": settings.APP_VERSION,
                    "environment": (
                        "production" if not settings.DEBUG else "development"
                    ),
                },
            )
        else:
            logger.warning("Failed to initialize Azure Application Insights monitoring")
    else:
        logger.info("Azure Application Insights monitoring is disabled")

    yield

    # Shutdown
    logger.info("Shutting down application...")

    # Shutdown monitoring and flush telemetry
    if settings.ENABLE_AZURE_INSIGHTS:
        logger.info("Flushing Azure Application Insights telemetry...")
        monitoring.track_event(
            "application_stopped",
            {"app_name": settings.APP_NAME, "version": settings.APP_VERSION},
        )
        shutdown_monitoring()

    logger.info("Application shutdown complete")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    lifespan=lifespan,
)


# Exception handler for unhandled exceptions
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Global exception handler to track unhandled exceptions.

    Args:
        request: FastAPI request
        exc: Exception that was raised

    Returns:
        JSONResponse: Error response
    """
    # Track exception in Azure Insights
    if settings.ENABLE_AZURE_INSIGHTS:
        monitoring.track_exception(
            exc,
            properties={
                "endpoint": request.url.path,
                "method": request.method,
                "url": str(request.url),
            },
        )

    # Log exception
    logger.error(
        f"Unhandled exception: {type(exc).__name__}: {str(exc)}",
        exc_info=exc,
        extra={
            "endpoint": request.url.path,
            "method": request.method,
        },
    )

    # Return error response
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Internal server error",
            "error": str(exc) if settings.DEBUG else "An unexpected error occurred",
        },
    )


# Set up CORS
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Add Azure Application Insights monitoring middleware
if settings.ENABLE_AZURE_INSIGHTS:
    app.add_middleware(MonitoringMiddleware)
    logger.info("Azure Application Insights monitoring middleware added")

# Include API router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/")
def root():
    """Root endpoint."""
    return {
        "message": "Welcome to the API",
        "docs": "/docs",
        "health": f"{settings.API_V1_PREFIX}/health",
    }
