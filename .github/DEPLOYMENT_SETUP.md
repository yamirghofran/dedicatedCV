# Azure Deployment Setup Guide

## Overview

This project uses a **staged deployment pipeline** with security scanning:
1. **Build** → Docker images built with SHA-based tags
2. **Staging Deployment** → Automatic deployment to staging environment
3. **DAST Security Scan** → OWASP ZAP scans staging environment
4. **Production Promotion** → Manual approval required, promotes to production
5. **Production Verification** → Health checks confirm successful deployment

## GitHub Secrets Configuration

### Required Secrets

All secrets should be added via: **GitHub Repository → Settings → Secrets and variables → Actions**

#### Azure Container Registry
- **`ACR_USERNAME`** - Azure Container Registry username
- **`ACR_PASSWORD`** - Azure Container Registry password

#### Azure Credentials
- **`AZURE_CREDENTIALS`** - Service principal JSON for Azure login
  ```json
  {
    "clientId": "xxx",
    "clientSecret": "xxx",
    "subscriptionId": "xxx",
    "tenantId": "xxx"
  }
  ```

#### Staging Environment
- **`VITE_API_BASE_URL_STAGING`** - Staging backend URL (e.g., `https://dedicatedcv-staging-backend.azurewebsites.net`)
- **`STAGING_FRONTEND_APP_NAME`** - Azure App Service name for staging frontend
- **`STAGING_BACKEND_APP_NAME`** - Azure App Service name for staging backend

#### Production Environment
- **`VITE_API_BASE_URL`** - Production backend URL (e.g., `https://dedicatedcv-backend.azurewebsites.net`)
- **`PROD_FRONTEND_APP_NAME`** - Azure App Service name for production frontend
- **`PROD_BACKEND_APP_NAME`** - Azure App Service name for production backend
- **`PROD_TRANSLATION_APP_NAME`** - Azure App Service name for production translation service

**Important**: Do NOT include trailing slashes in any URLs

## Pipeline Architecture

### Services Overview

| Service | Staging | Production | Notes |
|---------|---------|------------|-------|
| **Frontend** | ✅ | ✅ | Environment-specific builds (different API URLs) |
| **Backend** | ✅ | ✅ | Same image, different runtime config |
| **Translation** | ❌ | ✅ | **Production only** - no staging deployment |

### Deployment Stages

#### Stage 1: Build Staging Images
- Frontend built with `VITE_API_BASE_URL_STAGING`
- Backend built once (environment-agnostic)
- Images tagged with: `{sha}-staging` and `staging`
- Azure App Services track `:staging` tag for auto-deployment

#### Stage 2: Deploy to Staging
- Azure automatically pulls new `:staging` tagged images
- Health checks verify services are running
- **No manual approval needed**

#### Stage 3: DAST Security Scan
- OWASP ZAP baseline scans run against staging
- Scans both frontend and backend
- Reports uploaded as artifacts
- Currently set to `continue-on-error: true` (advisory mode)

#### Stage 4: Promote to Production
- **Requires manual approval** via GitHub Environment protection
- Frontend rebuilt with `VITE_API_BASE_URL` (production)
- Backend re-tagged from staging (same image)
- **Translation service built here** (production only)
- Images tagged with: `{sha}` and `latest`
- Azure App Services track `:latest` tag for auto-deployment

#### Stage 5: Verify Production
- Health checks for all three services
- Confirms production deployment successful

## How It Works

### Frontend Build Strategy
The frontend requires **two separate builds** because Vite bakes the API URL at build time:

1. **Staging Build**:
   - Uses `VITE_API_BASE_URL_STAGING` build argument
   - Tagged as `{sha}-staging` and `staging`
   - Points to staging backend

2. **Production Build**:
   - Uses `VITE_API_BASE_URL` build argument
   - Tagged as `{sha}` and `latest`
   - Points to production backend

During `bun run build`, Vite replaces all `import.meta.env.VITE_API_BASE_URL` references with the actual URL, creating a static bundle with the hardcoded API endpoint.

### Backend Deployment Strategy
Backend is **environment-agnostic** - the same image works for both environments:
- Built once during staging phase
- Configuration injected via environment variables at runtime
- Re-tagged for production (same image, different tag)

### Translation Service Strategy
Translation service is **production-only**:
- No staging environment needed
- Built during production promotion phase
- Tagged with `{sha}` and `latest`

## Deployment Flow

### Automatic Deployment (on CI success)
```
┌─────────────────────────────────────────────────────────────┐
│ 1. CI Pipeline Passes (on main branch)                     │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Build Stage                                              │
│    • Frontend (staging) → {sha}-staging, :staging           │
│    • Backend → {sha}-staging, :staging                      │
│    • Push to Azure Container Registry                      │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Staging Deployment (Automatic)                          │
│    • Azure pulls :staging tags                             │
│    • Services restart with new images                      │
│    • Health checks verify deployment                       │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. DAST Security Scan                                       │
│    • OWASP ZAP scans staging environment                   │
│    • Tests frontend and backend                            │
│    • Reports uploaded as artifacts                         │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Production Promotion (REQUIRES MANUAL APPROVAL)         │
│    • Build frontend (production) → {sha}, :latest          │
│    • Re-tag backend → {sha}, :latest                       │
│    • Build translation service → {sha}, :latest            │
│    • Push to Azure Container Registry                      │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Production Deployment (Automatic)                       │
│    • Azure pulls :latest tags                              │
│    • All services restart with new images                  │
│    • Health checks verify deployment                       │
└─────────────────────────────────────────────────────────────┘
```

### Manual Deployment
Trigger via GitHub Actions UI:
1. Go to **Actions** → **CD - Staged Deployment with DAST**
2. Click **Run workflow**
3. Select branch (typically `main`)
4. Pipeline executes as described above

## Testing Locally

### Test frontend build with custom API URL:
```bash
cd frontend
docker build --build-arg VITE_API_BASE_URL=https://your-backend.azurewebsites.net -t frontend-test .
docker run -p 8080:8080 frontend-test
```
Visit http://localhost:8080

### Test backend:
```bash
cd backend
docker build -t backend-test .
docker run -p 8000:8000 -e DATABASE_URL=your-db-url backend-test
```

### Test translation service:
```bash
cd translation-service
docker build -t translation-test .
docker run -p 8001:8001 translation-test
```

## Azure App Service Configuration

### Tag-Based Continuous Deployment

Each Azure App Service should be configured to track specific tags:

#### Staging Environment
| Service | Tag to Track | Environment Variable |
|---------|-------------|---------------------|
| Frontend | `:staging` | `VITE_API_BASE_URL` (already baked in) |
| Backend | `:staging` | Set runtime env vars |

#### Production Environment
| Service | Tag to Track | Environment Variable |
|---------|-------------|---------------------|
| Frontend | `:latest` | `VITE_API_BASE_URL` (already baked in) |
| Backend | `:latest` | Set runtime env vars |
| Translation | `:latest` | Set runtime env vars |

### Required Environment Variables per Service

#### Backend (Staging & Production)
```
DATABASE_URL=postgresql://...
BACKEND_CORS_ORIGINS=https://your-frontend.azurewebsites.net
REDIS_URL=redis://...
# Add other backend-specific variables
```

#### Translation Service (Production only)
```
# Add translation service specific variables
OPENAI_API_KEY=...
# or other translation API configurations
```

## GitHub Environment Protection

To enable manual approval for production:

1. Go to **Settings** → **Environments** → **production**
2. Enable **Required reviewers**
3. Add team members who can approve production deployments
4. Optionally set **Wait timer** to add a delay before deployment

## Troubleshooting

### Pipeline stuck waiting for approval
- Check **GitHub → Actions** → Click the workflow run
- Look for the **Review deployments** button
- Approve the production deployment

### Staging deployment fails
- Check Azure App Service logs for the specific service
- Verify `:staging` tag is being tracked in Azure
- Ensure health endpoints (`/health` for frontend, `/api/v1/health` for backend) are working
- Review GitHub Actions logs for build errors

### Production deployment fails
- Same as staging, but check `:latest` tag tracking
- Verify all secrets are set correctly
- Check CORS configuration if frontend can't reach backend

### DAST scan reports issues
- Review the ZAP scan artifacts in GitHub Actions
- Decide whether to:
  - Fix the issues before promoting to production
  - Set `continue-on-error: false` to block pipeline on security issues
  - Adjust `.zap/rules.tsv` to ignore false positives

### Frontend can't connect to backend
- **Staging**: Verify `VITE_API_BASE_URL_STAGING` secret points to staging backend
- **Production**: Verify `VITE_API_BASE_URL` secret points to production backend
- Check that the backend URL is accessible (not localhost!)
- Ensure backend CORS settings include the frontend URL
- Remember: API URL is baked at build time, not runtime

### Build fails in GitHub Actions
- Check all required secrets are set (see secrets list above)
- Verify secret values are valid URLs (no trailing slashes)
- Review Docker build logs for context/file not found errors
- Ensure ACR credentials are valid and have push permissions

### Changes not reflected after deployment
- Clear browser cache (especially for frontend changes)
- Verify the new image was built and pushed (check GitHub Actions logs)
- Check Azure App Service detected the new tag (Azure Portal → Deployment Center)
- May need to restart the App Service manually
- Check image tag matches what was deployed

### Translation service not deploying
- Verify `PROD_TRANSLATION_APP_NAME` secret is set
- Check translation service has health endpoint at `/health`
- Review translation service logs in Azure Portal
- Ensure the App Service is configured to track `:latest` tag

## Security Considerations

### OWASP ZAP Scanning
- Currently set to advisory mode (`continue-on-error: true`)
- To enforce security gates, set `continue-on-error: false` in `.github/workflows/cd.yml`
- Customize scan rules in `.zap/rules.tsv`

### Secrets Management
- Never commit secrets to the repository
- Rotate ACR credentials periodically
- Use Azure Key Vault for sensitive data in App Services
- Limit access to GitHub secrets to administrators only

### Container Security
- Images are scanned during CI pipeline
- Keep base images updated
- Review Dependabot alerts
- Monitor Azure Security Center recommendations

## Rollback Strategies

### Quick Rollback (Tag-Based)
Each deployment creates versioned tags (`{sha}` and `{sha}-staging`). To rollback:

1. **Staging Rollback**:
   ```bash
   # Find the previous working SHA
   docker pull dedicatedcvacr.azurecr.io/dedicatedcv-frontend:abc1234-staging
   docker tag dedicatedcvacr.azurecr.io/dedicatedcv-frontend:abc1234-staging \
              dedicatedcvacr.azurecr.io/dedicatedcv-frontend:staging
   docker push dedicatedcvacr.azurecr.io/dedicatedcv-frontend:staging
   ```

2. **Production Rollback**:
   ```bash
   # Find the previous working SHA
   docker pull dedicatedcvacr.azurecr.io/dedicatedcv-frontend:abc1234
   docker tag dedicatedcvacr.azurecr.io/dedicatedcv-frontend:abc1234 \
              dedicatedcvacr.azurecr.io/dedicatedcv-frontend:latest
   docker push dedicatedcvacr.azurecr.io/dedicatedcv-frontend:latest
   ```

Azure App Services will automatically detect and deploy the updated tag.

### Re-run Previous Workflow
1. Go to **Actions** → Find the successful previous deployment
2. Click **Re-run jobs** → **Re-run all jobs**
3. This rebuilds from the previous commit state

## Monitoring & Observability

### Health Endpoints
- **Frontend**: `https://your-frontend.azurewebsites.net/health`
- **Backend**: `https://your-backend.azurewebsites.net/api/v1/health`
- **Translation**: `https://your-translation.azurewebsites.net/health`

### Azure Application Insights
- Configure Application Insights for each App Service
- Monitor request rates, response times, and failures
- Set up alerts for anomalies
- Track custom metrics and events

### GitHub Actions Monitoring
- Review workflow summaries for deployment status
- Check DAST scan artifacts for security trends
- Monitor build times and resource usage
- Set up notifications for failed deployments

## Best Practices

1. **Always test in staging first** - The pipeline enforces this by design
2. **Review DAST reports** - Check security scan artifacts before approving production
3. **Use semantic commits** - Helps track what changed between deployments
4. **Tag releases** - Create Git tags for major releases
5. **Monitor after deployment** - Check health endpoints and logs post-deployment
6. **Keep secrets updated** - Rotate credentials regularly
7. **Document environment variables** - Maintain a list of required configs per service
8. **Test rollback procedures** - Verify you can rollback quickly if needed

## Pipeline Customization

### Adjusting Health Check Timeouts
Edit `.github/workflows/cd.yml` and modify:
```yaml
for i in {1..10}; do  # Number of attempts
  # ...
  sleep 15  # Wait time between attempts
done
```

### Enabling Strict Security Gates
To block deployment on security issues:
```yaml
continue-on-error: false  # Change from true
```

### Adding More Services
1. Add service to `env:` section with image name
2. Add build step in `build-staging` or `promote-production` job
3. Add health check in verification jobs
4. Update deployment summaries
5. Add required secrets for the service

## Useful Commands

### View all image tags in ACR
```bash
az acr repository show-tags --name dedicatedcvacr --repository dedicatedcv-frontend
```

### Manually trigger Azure App Service sync
```bash
az webapp restart --name your-app-name --resource-group your-rg
```

### View deployment logs
```bash
az webapp log tail --name your-app-name --resource-group your-rg
```
