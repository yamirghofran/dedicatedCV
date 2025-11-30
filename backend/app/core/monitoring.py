"""Azure Application Insights monitoring integration for FastAPI."""

import logging
import time
from typing import Callable, Optional
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

# Azure Application Insights imports
try:
    from opencensus.ext.azure import metrics_exporter
    from opencensus.ext.azure.log_exporter import AzureLogHandler
    from opencensus.ext.azure.trace_exporter import AzureExporter
    from opencensus.stats import aggregation as aggregation_module
    from opencensus.stats import measure as measure_module
    from opencensus.stats import stats as stats_module
    from opencensus.stats import view as view_module
    from opencensus.tags import tag_map as tag_map_module
    from opencensus.trace import config_integration
    from opencensus.trace.samplers import ProbabilitySampler
    from opencensus.trace.tracer import Tracer
    from opencensus.trace import execution_context

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
        self.connection_string = None
        self.exporter = None
        self.metrics_exporter = None
        self.tracer = None
        self.stats_recorder = None
        
        # Custom metrics
        self.request_measure = None
        self.error_measure = None
        
        # Status tracking
        self.initialization_error = None
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
                "Install with: uv pip install opencensus-ext-azure opencensus-ext-fastapi"
            )
            return False

        if not connection_string:
            self.initialization_error = "Connection string not provided"
            logger.warning("Azure Application Insights connection string not configured")
            return False

        try:
            self.connection_string = connection_string
            
            # Initialize trace exporter
            self.exporter = AzureExporter(connection_string=connection_string)
            
            # Initialize metrics exporter
            self.metrics_exporter = metrics_exporter.new_metrics_exporter(
                connection_string=connection_string
            )
            
            # Configure integrations for automatic tracking
            config_integration.trace_integrations(['requests', 'sqlalchemy', 'logging'])
            
            # Initialize tracer with sampling (100% for now, adjust in production)
            self.tracer = Tracer(
                exporter=self.exporter,
                sampler=ProbabilitySampler(1.0)
            )
            
            # Set up custom metrics
            self._setup_custom_metrics()
            
            # Configure logging handler
            self._setup_logging()
            
            self.enabled = True
            logger.info("Azure Application Insights initialized successfully")
            return True
            
        except Exception as e:
            self.initialization_error = str(e)
            logger.error(f"Failed to initialize Azure Application Insights: {e}")
            return False

    def _setup_custom_metrics(self):
        """Set up custom metrics for monitoring."""
        if not self.enabled and not AZURE_INSIGHTS_AVAILABLE:
            return
            
        try:
            # Get stats recorder
            self.stats_recorder = stats_module.stats.stats_recorder
            
            # Create custom measures
            self.request_measure = measure_module.MeasureFloat(
                "request_duration",
                "Duration of HTTP requests",
                "ms"
            )
            
            self.error_measure = measure_module.MeasureInt(
                "request_errors",
                "Number of failed requests",
                "errors"
            )
            
            # Create views for aggregation
            request_view = view_module.View(
                "request_duration_view",
                "Distribution of HTTP request durations",
                ["endpoint", "method", "status"],
                self.request_measure,
                aggregation_module.DistributionAggregation([50, 100, 200, 400, 1000, 2000, 5000])
            )
            
            error_view = view_module.View(
                "request_errors_view",
                "Count of HTTP request errors",
                ["endpoint", "method", "status"],
                self.error_measure,
                aggregation_module.CountAggregation()
            )
            
            # Register views
            view_manager = self.stats_recorder.view_manager
            view_manager.register_view(request_view)
            view_manager.register_view(error_view)
            view_manager.register_exporter(self.metrics_exporter)
            
        except Exception as e:
            logger.error(f"Failed to set up custom metrics: {e}")

    def _setup_logging(self):
        """Set up Azure logging handler."""
        if not self.enabled:
            return
            
        try:
            # Add Azure handler to root logger
            azure_handler = AzureLogHandler(connection_string=self.connection_string)
            azure_handler.setLevel(logging.WARNING)  # Only log warnings and errors
            
            # Add handler to root logger
            logging.getLogger().addHandler(azure_handler)
            
            # Add handler to app logger
            app_logger = logging.getLogger("app")
            app_logger.addHandler(azure_handler)
            
        except Exception as e:
            logger.error(f"Failed to set up Azure logging: {e}")

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
        if not self.enabled or not self.stats_recorder:
            return
            
        try:
            # Create tag map with custom dimensions
            tag_map = tag_map_module.TagMap()
            tag_map.insert("endpoint", endpoint)
            tag_map.insert("method", method)
            tag_map.insert("status", str(status_code))
            
            # Record request duration
            measurement_map = self.stats_recorder.new_measurement_map()
            measurement_map.measure_float_put(self.request_measure, duration_ms)
            
            # Record error if request failed
            if not success:
                measurement_map.measure_int_put(self.error_measure, 1)
            
            measurement_map.record(tag_map)
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
            # Log exception with Azure handler
            logger.error(
                f"Exception occurred: {type(exception).__name__}",
                exc_info=exception,
                extra={"custom_dimensions": properties or {}}
            )
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
                extra={"custom_dimensions": properties or {}}
            )
            self.telemetry_sent = True
            
        except Exception as e:
            logger.error(f"Failed to track event: {e}")

    def flush(self):
        """Flush all pending telemetry."""
        if not self.enabled:
            return
            
        try:
            if self.exporter:
                self.exporter.export([])  # Flush trace exporter
            if self.metrics_exporter:
                # Metrics are auto-flushed, but we can trigger a collection
                pass
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
        exception = None
        
        try:
            response = await call_next(request)
            return response
            
        except Exception as e:
            exception = e
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
