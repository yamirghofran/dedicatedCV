# Azure Application Insights Setup Guide

This guide will help you set up Azure Application Insights monitoring for your FastAPI backend application.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Azure Portal Setup](#azure-portal-setup)
- [Backend Configuration](#backend-configuration)
- [Installation](#installation)
- [Testing](#testing)
- [Dashboard Setup](#dashboard-setup)
- [Alerts Configuration](#alerts-configuration)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

Azure Application Insights integration provides:

- ✅ **Real-time request tracking** - Monitor all HTTP requests with duration, status codes, and endpoints
- ✅ **Exception tracking** - Automatic capture of exceptions with stack traces
- ✅ **Custom metrics** - Track business-specific events and metrics
- ✅ **Database performance** - Monitor SQLAlchemy query performance
- ✅ **Custom dashboards** - Create visualizations in Azure Portal
- ✅ **Proactive alerts** - Get notified of issues before users complain
- ✅ **Distributed tracing** - Track requests across services

---

## 📦 Prerequisites

- Azure account with an active subscription
- Access to create Azure resources
- Python 3.13+ with uv package manager
- Running PostgreSQL database

---

## 🔧 Azure Portal Setup

### Step 1: Create Application Insights Resource

1. **Navigate to Azure Portal** ([portal.azure.com](https://portal.azure.com))

2. **Create Resource:**
   - Click "Create a resource"
   - Search for "Application Insights"
   - Click "Create"

3. **Configure Resource:**
   ```
   Subscription: [Your subscription]
   Resource Group: [Create new or use existing]
   Name: dedicatedcv-backend-insights
   Region: [Choose your preferred region]
   Resource Mode: Workspace-based (recommended)
   ```

4. **Review and Create:**
   - Click "Review + Create"
   - Click "Create"
   - Wait for deployment to complete

### Step 2: Get Connection String

1. **Navigate to your Application Insights resource**

2. **Copy Connection String:**
   - Go to "Overview" section
   - Find "Connection String" (NOT Instrumentation Key)
   - Click "Copy to clipboard"

   Format should be:
   ```
   InstrumentationKey=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx;IngestionEndpoint=https://...;LiveEndpoint=https://...
   ```

3. **Keep this connection string safe** - you'll need it for backend configuration

---

## ⚙️ Backend Configuration

### Step 1: Install Dependencies

Install the Azure Application Insights packages:

```bash
uv pip install -e .
```

This will install all dependencies including:
- `opencensus-ext-azure` - Azure exporter
- `opencensus-ext-fastapi` - FastAPI integration
- `opencensus-ext-sqlalchemy` - Database tracking
- `opencensus-ext-requests` - HTTP request tracking
- `opencensus-ext-logging` - Logging integration

### Step 2: Configure Environment Variables

1. **Copy the example environment file** (if you haven't already):
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file** and add your Azure connection string:
   ```env
   # Azure Application Insights
   APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=xxx;IngestionEndpoint=https://...;LiveEndpoint=https://...
   ENABLE_AZURE_INSIGHTS=True
   ```

3. **Important:** Make sure `.env` is in your `.gitignore` to keep secrets safe!

### Step 3: Verify Configuration

Check that monitoring is properly configured by examining the health endpoint response:

```bash
curl http://localhost:8000/api/v1/health | jq .monitoring
```

Expected output:
```json
{
  "azure_insights_enabled": true,
  "azure_insights_configured": true,
  "azure_insights_active": true,
  "telemetry_sent": false,
  "packages_available": true,
  "initialization_error": null
}
```

---

## 🚀 Installation

### Local Development

1. **Start PostgreSQL:**
   ```bash
   docker-compose up -d db
   ```

2. **Run database migrations:**
   ```bash
   alembic upgrade head
   ```

3. **Start the application:**
   ```bash
   uvicorn app.main:app --reload
   ```

4. **Verify monitoring is active:**
   - Check the startup logs for: `"Azure Application Insights monitoring initialized successfully"`
   - Visit: http://localhost:8000/api/v1/health
   - Look for `"azure_insights_active": true` in the monitoring section

### Production Deployment

1. **Set environment variables** in your production environment:
   ```bash
   export APPLICATIONINSIGHTS_CONNECTION_STRING="your-connection-string"
   export ENABLE_AZURE_INSIGHTS=True
   export DEBUG=False
   ```

2. **Deploy your application** using your preferred method (Docker, systemd, etc.)

3. **Verify telemetry** is flowing to Azure (may take 2-5 minutes)

---

## 🧪 Testing

### Generate Test Traffic

1. **Make some API requests:**
   ```bash
   # Health check
   curl http://localhost:8000/api/v1/health

   # Create a user (if you have auth endpoints)
   curl -X POST http://localhost:8000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"testpass123"}'

   # Generate some load
   for i in {1..50}; do
     curl http://localhost:8000/api/v1/health
     sleep 0.1
   done
   ```

2. **Trigger an error** (to test exception tracking):
   ```bash
   # This should return a 404 error
   curl http://localhost:8000/api/v1/nonexistent-endpoint
   ```

### Verify Telemetry in Azure

1. **Navigate to Azure Portal** > Your Application Insights resource

2. **Check Live Metrics:**
   - Click "Live Metrics" in the left menu
   - You should see real-time requests appearing

3. **Check Logs:**
   - Click "Logs" in the left menu
   - Run this query:
   ```kusto
   requests
   | where timestamp > ago(1h)
   | project timestamp, name, resultCode, duration
   | order by timestamp desc
   | take 20
   ```

4. **Check Exceptions:**
   ```kusto
   exceptions
   | where timestamp > ago(1h)
   | project timestamp, type, outerMessage, problemId
   | order by timestamp desc
   ```

**Note:** There may be a 2-5 minute delay before telemetry appears in Azure Portal.

---

## 📊 Dashboard Setup

### Create Custom Dashboard

1. **Navigate to Azure Portal** > Your Application Insights resource > "Dashboards"

2. **Click "New dashboard"** or edit existing dashboard

3. **Add tiles** for the following metrics:

#### 1. Uptime Monitor

**Create Availability Test:**
- Navigate to "Availability" in left menu
- Click "+ Add Standard test"
- Configure:
  ```
  Test name: Health Check
  URL: https://your-domain.com/api/v1/health
  Test frequency: 5 minutes
  Test locations: Select 3-5 locations
  Success criteria: HTTP 200
  ```

**Add to Dashboard:**
- Click "Pin to dashboard"
- Select your dashboard

#### 2. Error Rate Chart

**Query:**
```kusto
requests
| where timestamp > ago(24h)
| summarize
    Total = count(),
    Errors = countif(success == false),
    ErrorRate = (countif(success == false) * 100.0) / count()
    by bin(timestamp, 5m)
| project timestamp, ErrorRate
| render timechart
```

**Settings:**
- Chart type: Line chart
- Time range: Last 24 hours
- Pin to dashboard

#### 3. Response Time Chart

**Query:**
```kusto
requests
| where timestamp > ago(24h)
| summarize
    Average = avg(duration),
    P50 = percentile(duration, 50),
    P95 = percentile(duration, 95),
    P99 = percentile(duration, 99)
    by bin(timestamp, 5m)
| render timechart
```

**Settings:**
- Chart type: Line chart with multiple series
- Time range: Last 24 hours
- Pin to dashboard

#### 4. Request Volume

**Query:**
```kusto
requests
| where timestamp > ago(24h)
| summarize RequestCount = count() by bin(timestamp, 5m)
| render areachart
```

#### 5. Top 10 Slowest Endpoints

**Query:**
```kusto
requests
| where timestamp > ago(1h)
| summarize
    AvgDuration = avg(duration),
    P95 = percentile(duration, 95),
    Count = count()
    by name
| order by P95 desc
| take 10
```

#### 6. Failed Requests by Endpoint

**Query:**
```kusto
requests
| where timestamp > ago(24h) and success == false
| summarize ErrorCount = count() by name, resultCode
| order by ErrorCount desc
| take 10
| render barchart
```

#### 7. Database Performance

**Query:**
```kusto
dependencies
| where timestamp > ago(1h) and type == "SQL"
| summarize
    AvgDuration = avg(duration),
    P95 = percentile(duration, 95),
    Count = count()
    by bin(timestamp, 5m)
| render timechart
```

### Useful Queries

#### Overall Uptime (Last 24h)

```kusto
requests
| where timestamp > ago(24h)
| where name == "GET /api/v1/health"
| summarize
    Total = count(),
    Successful = countif(success == true)
| extend UptimePercentage = (Successful * 100.0) / Total
| project UptimePercentage
```

#### Error Breakdown by Status Code

```kusto
requests
| where timestamp > ago(24h) and success == false
| summarize Count = count() by resultCode
| order by Count desc
| render piechart
```

#### Request Duration Distribution

```kusto
requests
| where timestamp > ago(1h)
| summarize count() by bin(duration, 100)
| order by duration asc
| render columnchart
```

---

## 🚨 Alerts Configuration

### Create Alerts

1. **Navigate to** Application Insights > "Alerts" > "Create alert rule"

#### Alert 1: High Error Rate

**Condition:**
```
Signal: Custom log search
Query:
requests
| where timestamp > ago(5m)
| summarize
    Total = count(),
    Errors = countif(success == false)
| extend ErrorRate = (Errors * 100.0) / Total
| where ErrorRate > 5

Threshold: Greater than 0 results
Evaluation frequency: 5 minutes
```

**Actions:**
- Create action group
- Add email notification
- Severity: Critical (Sev 1)

#### Alert 2: Slow Response Time

**Condition:**
```
Signal: Custom log search
Query:
requests
| where timestamp > ago(5m)
| summarize P95 = percentile(duration, 95)
| where P95 > 2000

Threshold: Greater than 0 results
Evaluation frequency: 5 minutes
```

**Actions:**
- Use existing action group
- Severity: Warning (Sev 2)

#### Alert 3: Service Downtime

**Condition:**
- Use the Availability Test you created earlier
- Alert when: Locations failed >= 2
- Time period: 5 minutes

**Actions:**
- Use existing action group
- Severity: Critical (Sev 0)

#### Alert 4: High Exception Rate

**Condition:**
```
Signal: Custom log search
Query:
exceptions
| where timestamp > ago(5m)
| summarize ExceptionCount = count()
| where ExceptionCount > 10

Threshold: Greater than 0 results
Evaluation frequency: 5 minutes
```

**Actions:**
- Use existing action group
- Severity: Warning (Sev 2)

---

## 🔍 Troubleshooting

### Telemetry Not Appearing in Azure

**Check 1: Verify configuration**
```bash
curl http://localhost:8000/api/v1/health | jq .monitoring
```

Expected values:
- `azure_insights_enabled`: true
- `azure_insights_configured`: true
- `azure_insights_active`: true
- `packages_available`: true

**Check 2: Review application logs**
```bash
# Look for initialization messages
grep "Azure Application Insights" logs/app.log
```

**Check 3: Verify connection string format**
- Should contain: `InstrumentationKey`, `IngestionEndpoint`, `LiveEndpoint`
- No extra spaces or newlines
- Properly set in environment variables

**Check 4: Wait for ingestion**
- Telemetry can take 2-5 minutes to appear
- Check "Live Metrics" for real-time data

### Common Errors

#### Error: "Azure Insights packages not available"

**Solution:**
```bash
uv pip install opencensus-ext-azure opencensus-ext-fastapi opencensus-ext-sqlalchemy
```

#### Error: "Connection string not configured"

**Solution:**
1. Check `.env` file has `APPLICATIONINSIGHTS_CONNECTION_STRING` set
2. Verify `ENABLE_AZURE_INSIGHTS=True`
3. Restart the application

#### Error: "Failed to initialize Azure Application Insights"

**Solution:**
1. Check connection string is valid
2. Verify network connectivity to Azure
3. Check application logs for specific error details
4. Verify Azure resource is properly created

### Monitoring Not Working in Production

**Checklist:**
- [ ] Environment variables are set correctly
- [ ] Connection string is from production Azure resource
- [ ] Firewall/network allows outbound HTTPS to Azure endpoints
- [ ] Application has been restarted after configuration changes
- [ ] Check application logs for errors

### Performance Impact

Azure Application Insights is designed to have minimal performance impact:
- Request tracking: ~1-2ms overhead per request
- Sampling can be adjusted in `app/core/monitoring.py`
- Telemetry is sent asynchronously

**To reduce overhead:**
1. Enable sampling (currently at 100%):
   ```python
   # In app/core/monitoring.py
   sampler=ProbabilitySampler(0.5)  # Sample 50% of requests
   ```

2. Disable in development:
   ```env
   ENABLE_AZURE_INSIGHTS=False
   ```

---

## 📚 Additional Resources

### Documentation
- [Azure Application Insights Overview](https://docs.microsoft.com/azure/azure-monitor/app/app-insights-overview)
- [OpenCensus Python](https://github.com/census-instrumentation/opencensus-python)
- [Kusto Query Language](https://docs.microsoft.com/azure/data-explorer/kusto/query/)

### Monitoring Best Practices
- Set up alerts for critical metrics
- Review dashboards regularly
- Monitor trends over time
- Set up automated reports
- Use Application Map for distributed tracing

### Custom Tracking

You can add custom tracking in your code:

```python
from app.core.monitoring import monitoring

# Track custom event
monitoring.track_event("user_registered", {
    "user_id": user.id,
    "email": user.email
})

# Track custom exception
try:
    risky_operation()
except Exception as e:
    monitoring.track_exception(e, {
        "operation": "risky_operation",
        "user_id": current_user.id
    })
```

---

## 🎉 Next Steps

1. ✅ Complete Azure Portal setup
2. ✅ Configure environment variables
3. ✅ Install dependencies and test locally
4. ✅ Create custom dashboard
5. ✅ Set up alerts
6. ✅ Deploy to production
7. ✅ Monitor and optimize

---

## 💡 Tips

- **Start with basic monitoring** and add more metrics as needed
- **Set up alerts early** to catch issues proactively
- **Review metrics weekly** to identify trends
- **Use custom events** to track business metrics
- **Leverage Application Map** to visualize dependencies
- **Export data** to Power BI for advanced analytics

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Azure Application Insights documentation
3. Check application logs for detailed error messages
4. Verify all prerequisites are met

---

**Happy Monitoring! 🚀**
