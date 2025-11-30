"""Azure Application Insights monitoring integration for FastAPI."""

import logging
import time
from typing import Callable, Optional, Any
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

# Azure Application Insights imports using OpenTelemetry
try:
    from azure.monitor.opentelemetry import configure_azure_monitor
    from opentelemetry import trace, metrics
    from opentelemetry.trace import Status, StatusCode
    from opentelemetry.metrics import get_meter_provider
    from opentelemetry.trace import get_tracer_provider
    
    AZURE_INSIGHTS_AVAILABLE = True
except ImportError:
    AZURE_INSIGHTS_AVAILABLE = False

from app.core.config import settings

logger = logging.getLogger(__name__)


class AzureInsightsMonitoring:
    """Azure Application Insights monitoring manager."""

    def __init__(self):
        """Initialize Azure Insights monitoring."""
        self.enabled = False
        self.connection_string: Optional[str] = None
        self.tracer: Any = None
        self.meter: Any = None
        
        # Custom metrics
        self.request_duration_histogram: Any = None
        self.request_counter: Any = None
        self.error_counter: Any = None
        
        # Status tracking
        self.initialization_error: Optional[str] = None
        self.telemetry_sent = False

    def initialize(self, connection_string: str) -> bool:
        """
        Initialize Azure Application Insights.
        
        Args:
            connection_string: Azure Application Insights connection string
            
        Returns:
            bool: True if initialization was successful, False otherwise
        """
        if not AZURE_INSIGHTS_AVAILABLE:
            self.initialization_error = "Azure Insights packages not installed"
            logger.warning(
                "Azure Application Insights packages not available. "
                "Install with: uv pip install azure-monitor-opentelemetry"
            )
            return False

        if not connection_string:
            self.initialization_error = "Connection string not provided"
            logger.warning("Azure Application Insights connection string not configured")
            return False

        try:
            self.connection_string = connection_string
            
            # Configure Azure Monitor with OpenTelemetry
            configure_azure_monitor(  # type: ignore
                connection_string=connection_string,
                logger_name="app",
            )
            
            # Get tracer and meter
            self.tracer = trace.get_tracer(__name__)  # type: ignore
            self.meter = metrics.get_meter(__name__)  # type: ignore
            
            # Set up custom metrics
            self._setup_custom_metrics()
            
            self.enabled = True
            logger.info("Azure Application Insights initialized successfully")
            return True
            
        except Exception as e:
            self.initialization_error = str(e)
            logger.error(f"Failed to initialize Azure Application Insights: {e}")
            return False

    def _setup_custom_metrics(self):
        """Set up custom metrics for monitoring."""
        if not AZURE_INSIGHTS_AVAILABLE or not self.meter:
            return
            
        try:
            # Create histogram for request duration
            self.request_duration_histogram = self.meter.create_histogram(
                name="http.server.request.duration",
                description="Duration of HTTP requests",
                unit="ms"
            )
            
            # Create counter for total requests
            self.request_counter = self.meter.create_counter(
                name="http.server.request.count",
                description="Total number of HTTP requests",
                unit="requests"
            )
            
            # Create counter for errors
            self.error_counter = self.meter.create_counter(
                name="http.server.request.errors",
                description="Number of failed HTTP requests",
                unit="errors"
            )
            
        except Exception as e:
            logger.error(f"Failed to set up custom metrics: {e}")

    def track_request(
        self,
        endpoint: str,
        method: str,
        status_code: int,
        duration_ms: float,
        success: bool
    ):
        """
        Track HTTP request metrics.
        
        Args:
            endpoint: API endpoint path
            method: HTTP method
            status_code: HTTP status code
            duration_ms: Request duration in milliseconds
            success: Whether the request was successful
        """
        if not self.enabled:
            return
            
        try:
            # Common attributes for all metrics
            attributes = {
                "http.route": endpoint,
                "http.method": method,
                "http.status_code": status_code,
            }
            
            # Record request duration
            if self.request_duration_histogram:
                self.request_duration_histogram.record(duration_ms, attributes)
            
            # Record request count
            if self.request_counter:
                self.request_counter.add(1, attributes)
            
            # Record error if request failed
            if not success and self.error_counter:
                self.error_counter.add(1, attributes)
            
            self.telemetry_sent = True
            
        except Exception as e:
            logger.error(f"Failed to track request: {e}")

    def track_exception(self, exception: Exception, properties: Optional[dict] = None):
        """
        Track an exception.
        
        Args:
            exception: The exception to track
            properties: Additional properties to include
        """
        if not self.enabled:
            return
            
        try:
            # Log exception which will be sent to Azure Monitor
            logger.error(
                f"Exception occurred: {type(exception).__name__}",
                exc_info=exception,
                extra=properties or {}
            )
            
            # Also record in current span if available
            if AZURE_INSIGHTS_AVAILABLE:
                span = trace.get_current_span()  # type: ignore
                if span and span.is_recording():
                    span.record_exception(exception)
                    span.set_status(Status(StatusCode.ERROR, str(exception)))  # type: ignore
            
            self.telemetry_sent = True
            
        except Exception as e:
            logger.error(f"Failed to track exception: {e}")

    def track_event(self, name: str, properties: Optional[dict] = None):
        """
        Track a custom event.
        
        Args:
            name: Event name
            properties: Event properties
        """
        if not self.enabled:
            return
            
        try:
            logger.info(
                f"Event: {name}",
                extra=properties or {}
            )
            
            # Add event to current span if available
            if AZURE_INSIGHTS_AVAILABLE:
                span = trace.get_current_span()  # type: ignore
                if span and span.is_recording():
                    span.add_event(name, attributes=properties or {})
            
            self.telemetry_sent = True
            
        except Exception as e:
            logger.error(f"Failed to track event: {e}")

    def flush(self):
        """Flush all pending telemetry."""
        if not self.enabled:
            return
            
        try:
            # OpenTelemetry auto-flushes, but we can force flush if needed
            if AZURE_INSIGHTS_AVAILABLE:
                tracer_provider = get_tracer_provider()  # type: ignore
                if hasattr(tracer_provider, 'force_flush'):
                    tracer_provider.force_flush()  # type: ignore
                
                meter_provider = get_meter_provider()  # type: ignore
                if hasattr(meter_provider, 'force_flush'):
                    meter_provider.force_flush()  # type: ignore
            
            logger.info("Flushed Azure Application Insights telemetry")
            
        except Exception as e:
            logger.error(f"Failed to flush telemetry: {e}")

    def get_status(self) -> dict:
        """
        Get monitoring status.
        
        Returns:
            dict: Status information
        """
        return {
            "enabled": self.enabled,
            "available": AZURE_INSIGHTS_AVAILABLE,
            "configured": bool(self.connection_string),
            "telemetry_sent": self.telemetry_sent,
            "initialization_error": self.initialization_error,
        }


# Global monitoring instance
monitoring = AzureInsightsMonitoring()


class MonitoringMiddleware(BaseHTTPMiddleware):
    """Middleware for tracking HTTP requests with Azure Application Insights."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        Process request and track metrics.
        
        Args:
            request: FastAPI request
            call_next: Next middleware/endpoint handler
            
        Returns:
            Response: HTTP response
        """
        # Record start time
        start_time = time.time()
        
        # Get request details
        method = request.method
        endpoint = request.url.path
        
        # Process request
        response = None
        
        try:
            response = await call_next(request)
            return response
            
        except Exception as e:
            # Track exception
            monitoring.track_exception(
                e,
                properties={
                    "endpoint": endpoint,
                    "method": method,
                    "url": str(request.url),
                }
            )
            raise
            
        finally:
            # Calculate duration
            duration_ms = (time.time() - start_time) * 1000
            
            # Get status code
            status_code = response.status_code if response else 500
            success = 200 <= status_code < 400 if response else False
            
            # Track request
            monitoring.track_request(
                endpoint=endpoint,
                method=method,
                status_code=status_code,
                duration_ms=duration_ms,
                success=success
            )


def initialize_monitoring() -> bool:
    """
    Initialize Azure Application Insights monitoring.
    
    Returns:
        bool: True if initialization was successful
    """
    if not settings.ENABLE_AZURE_INSIGHTS:
        logger.info("Azure Application Insights monitoring is disabled")
        return False
        
    return monitoring.initialize(settings.APPLICATIONINSIGHTS_CONNECTION_STRING)


def shutdown_monitoring():
    """Shutdown monitoring and flush pending telemetry."""
    if monitoring.enabled:
        logger.info("Shutting down Azure Application Insights monitoring")
        monitoring.flush()


def get_monitoring_status() -> dict:
    """
    Get current monitoring status.
    
    Returns:
        dict: Monitoring status information
    """
    return monitoring.get_status()


# Export monitoring instance and utilities
__all__ = [
    "monitoring",
    "MonitoringMiddleware",
    "initialize_monitoring",
    "shutdown_monitoring",
    "get_monitoring_status",
]
