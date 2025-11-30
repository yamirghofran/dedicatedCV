from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.core.config import settings
from app.core.monitoring import get_monitoring_status

router = APIRouter()


@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """
    Health check endpoint.
    
    Returns application health status including:
    - Application info (name, version)
    - Database connection status
    - Azure Application Insights monitoring status
    """
    # Test database connection
    try:
        db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    # Get monitoring status
    monitoring_status = get_monitoring_status()
    
    # Determine overall status
    overall_status = "healthy" if db_status == "healthy" else "unhealthy"

    return {
        "status": overall_status,
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "database": db_status,
        "monitoring": {
            "azure_insights_enabled": settings.ENABLE_AZURE_INSIGHTS,
            "azure_insights_configured": monitoring_status.get("configured", False),
            "azure_insights_active": monitoring_status.get("enabled", False),
            "telemetry_sent": monitoring_status.get("telemetry_sent", False),
            "packages_available": monitoring_status.get("available", False),
            "initialization_error": monitoring_status.get("initialization_error"),
        }
    }
