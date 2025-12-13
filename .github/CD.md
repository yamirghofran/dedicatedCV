# Continuous Deployment (CD) Pipeline

## Overview

The CD pipeline automates the deployment of the DedicatedCV application to staging and production environments on Azure. It follows a **staged deployment strategy** with manual approval gates, ensuring that only validated and security-scanned code reaches production.

**Pipeline Location**: `.github/workflows/cd.yml`

## Trigger Mechanisms

### Automatic Trigger
The CD pipeline automatically triggers when the CI pipeline completes successfully on the `main` branch:
```yaml
on:
  workflow_run:
    workflows: ["CI Pipeline"]
    branches: [main]
    types:
      - completed
```

**Flow**: `PR merged to main` → `CI runs and passes` → `CD starts automatically`

### Manual Trigger
Emergency deployments and rollbacks can be triggered manually via GitHub Actions UI:
- Go to Actions → CD Pipeline → Run workflow
- Useful for deploying hotfixes or rolling back to previous versions

## Pipeline Architecture

The CD pipeline consists of 5 stages that execute sequentially:

```
┌─────────────────────────────────────────────────────────────────┐
│ Stage 1: Build Staging Images                                   │
│  • Build frontend with staging API URL                          │
│  • Build backend                                                │
│  • Push with :staging tags                                      │
└──────────────────────┬──────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│ Stage 2: Staging Deployment (GitOps)                            │
│  • Azure App Service detects :staging tags                      │
│  • Automatic deployment                                         │
│  • Health check verification                                    │
└──────────────────────┬──────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│ Stage 3: DAST Security Scanning                                 │
│  • OWASP ZAP baseline scan (backend API)                        │
│  • OWASP ZAP baseline scan (frontend)                           │
│  • Upload security reports                                      │
└──────────────────────┬──────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│ Stage 4: Production Promotion (REQUIRES APPROVAL) 🔒            │
│  • ⏸️  Pipeline pauses for manual approval                      │
│  • Build frontend with production API URL                       │
│  • Re-tag backend from staging                                  │
│  • Push with :latest tags                                       │
└──────────────────────┬──────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│ Stage 5: Production Verification                                │
│  • Azure App Service detects :latest tags                       │
│  • Automatic deployment                                         │
│  • Health check verification                                    │
│  • Deployment summary published                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Stage Breakdown

### Stage 1: Build Staging Images
**Job**: `build-staging`

Builds Docker images for staging deployment only:
- **Frontend**: Built with `VITE_API_BASE_URL_STAGING` environment variable
- **Backend**: Environment-agnostic build (configured via runtime env vars)
- **Tags**: Images tagged with `:staging` and `{SHA}-staging`
- **Registry**: Azure Container Registry (ACR)

**Key Points**:
- Uses Docker BuildKit with layer caching for faster builds
- Only staging tags are pushed (production tags pushed later after approval)
- Generates SHA-based image tags for version tracking

### Stage 2: Staging Deployment
**Job**: `deploy-staging`

Verifies staging deployment through GitOps model:
- Azure App Service (staging) monitors ACR for `:staging` tag changes
- Automatic deployment when new images detected
- Pipeline performs health checks:
  - Backend: `GET /api/v1/health` (checks DB connectivity)
  - Frontend: `GET /health` (checks app availability)
- Retry logic: 10 attempts × 15 seconds = 2.5 minutes maximum

**Azure Configuration Required**:
- Staging App Service must be configured to track `:staging` tag
- Continuous deployment enabled in Azure portal

### Stage 3: DAST Security Scanning
**Job**: `dast-scan`

Runs dynamic security testing against live staging environment:
- **Tool**: OWASP ZAP baseline scanner v0.14.0
- **Backend Scan**: Tests API security (auth, headers, injection vulnerabilities)
- **Frontend Scan**: Tests web app security (XSS, CSP, cookie security)
- **Rules**: Custom configuration in `.zap/rules.tsv`
- **Reports**: Separate artifacts (`zap-scan-backend`, `zap-scan-frontend`)

**Security Checks**:
- Missing security headers (X-Content-Type-Options, HSTS, CSP)
- Cross-site scripting (XSS) vulnerabilities
- CSRF token validation
- Information disclosure issues
- Cookie security (SameSite, Secure flags)

### Stage 4: Production Promotion (Manual Approval Required)
**Job**: `promote-production`

**⚠️ REQUIRES MANUAL APPROVAL** via GitHub Environments protection:

1. **Pipeline Pauses**: Waits for designated reviewer to approve
2. **Review Process**: Reviewer sees:
   - Staging deployment status
   - DAST scan results and artifacts
   - Commit SHA and changes
3. **Upon Approval**:
   - Frontend built with `VITE_API_BASE_URL` (production)
   - Backend staging image re-tagged (same binary, new tag)
   - Both images pushed with `:latest` tags
4. **GitOps Trigger**: Azure App Service (production) detects `:latest` and deploys

**Why Manual Approval?**
- Human oversight before production changes
- Review security scan findings
- Verify staging validation results
- Control deployment timing
- Compliance and audit requirements

### Stage 5: Production Verification
**Job**: `verify-production`

Confirms successful production deployment:
- Waits 60 seconds for Azure to deploy new images
- Performs health checks (same logic as staging)
- Publishes comprehensive deployment summary:
  - Service URLs and health status
  - Deployed commit SHA
  - Complete pipeline flow verification
  - Timestamp and duration

## Container Tagging Strategy

### Staging Images
```
dedicatedcvacr.azurecr.io/dedicatedcv-frontend:staging       # Rolling tag
dedicatedcvacr.azurecr.io/dedicatedcv-frontend:a3c4f71-staging  # Immutable

dedicatedcvacr.azurecr.io/dedicatedcv-backend:staging        # Rolling tag
dedicatedcvacr.azurecr.io/dedicatedcv-backend:a3c4f71-staging   # Immutable
```

### Production Images
```
dedicatedcvacr.azurecr.io/dedicatedcv-frontend:latest        # Rolling tag
dedicatedcvacr.azurecr.io/dedicatedcv-frontend:a3c4f71      # Immutable

dedicatedcvacr.azurecr.io/dedicatedcv-backend:latest         # Rolling tag
dedicatedcvacr.azurecr.io/dedicatedcv-backend:a3c4f71       # Immutable
```

**Tag Types**:
- **Rolling tags** (`:staging`, `:latest`): Watched by Azure App Services
- **Immutable tags** (`{SHA}`): Enable precise rollbacks and version tracking

## GitOps Deployment Model

The pipeline uses a **pull-based GitOps approach**:

1. **Pipeline**: Builds images and pushes to ACR with appropriate tags
2. **Azure App Service**: Monitors ACR for tag changes
3. **Automatic Deployment**: Azure pulls new images and deploys
4. **Pipeline Verification**: Confirms deployment via health checks

**Benefits**:
- Simplified pipeline logic (no deployment scripts)
- Resilient (deployments continue if CI/CD runner fails)
- Azure maintains deployment history
- Declarative desired state through container tags

## Environment Configuration

### Required GitHub Secrets

| Secret | Purpose | Example |
|--------|---------|---------|
| `ACR_USERNAME` | Azure Container Registry username | `dedicatedcvacr` |
| `ACR_PASSWORD` | Azure Container Registry password | `***` |
| `VITE_API_BASE_URL_STAGING` | Staging backend URL | `https://staging-backend.azurewebsites.net` |
| `VITE_API_BASE_URL` | Production backend URL | `https://backend.azurewebsites.net` |
| `STAGING_BACKEND_APP_NAME` | Staging backend app service name | `dedicatedcv-backend-staging` |
| `STAGING_FRONTEND_APP_NAME` | Staging frontend app service name | `dedicatedcv-frontend-staging` |
| `PROD_BACKEND_APP_NAME` | Production backend app service name | `dedicatedcv-backend` |
| `PROD_FRONTEND_APP_NAME` | Production frontend app service name | `dedicatedcv-frontend` |

### GitHub Environment Protection

**Production Environment** requires configuration:
1. Go to Repository Settings → Environments → production
2. Add required reviewers (team members who can approve deployments)
3. Optionally add deployment branches (restrict to `main`)
4. Save configuration

**Without this configuration**, the pipeline will not pause for approval!

## Typical Deployment Timeline

| Time | Stage | Action |
|------|-------|--------|
| T+0 | CI Complete | CI pipeline finishes successfully on main |
| T+2 | Stage 1 | Staging images built and pushed |
| T+3 | Stage 2 | Staging deploys via GitOps |
| T+5 | Stage 2 | Staging health verified |
| T+8 | Stage 3 | DAST scans complete |
| T+8 | Stage 4 | ⏸️ **Pipeline pauses for approval** |
| — | — | 👤 Reviewer reviews and approves |
| T+10 | Stage 4 | Production images pushed |
| T+11 | Stage 5 | Production deploys via GitOps |
| T+13 | Stage 5 | Production health verified |
| T+13 | Complete | ✅ Deployment summary published |

**Total automated time**: ~13 minutes + approval wait time

## How to Approve Production Deployments

1. **Receive Notification**: GitHub notifies designated reviewers
2. **Review Deployment**:
   - Click notification link to view workflow
   - Review staging deployment status
   - Check DAST scan artifacts for security findings
   - Verify commit changes
3. **Approve or Reject**:
   - Click "Review deployments" button
   - Select "production" environment
   - Click "Approve and deploy" or "Reject"
4. **Monitor Progress**: Watch Stage 5 complete after approval

## Rollback Procedures

### Option 1: Redeploy Previous Version (Recommended)
1. Go to Actions → CD Pipeline → Run workflow
2. Select the commit SHA of the previous working version
3. Approve when it reaches Stage 4
4. Previous version deploys to production

### Option 2: Azure Portal Rollback
1. Go to Azure Portal → App Service (production)
2. Navigate to Deployment Center → Deployment History
3. Select previous successful deployment
4. Click "Redeploy"

### Option 3: Manual Tag Update (Emergency)
```bash
# Pull previous image
docker pull dedicatedcvacr.azurecr.io/dedicatedcv-frontend:abc1234

# Re-tag as latest
docker tag dedicatedcvacr.azurecr.io/dedicatedcv-frontend:abc1234 \
           dedicatedcvacr.azurecr.io/dedicatedcv-frontend:latest

# Push (requires ACR credentials)
docker push dedicatedcvacr.azurecr.io/dedicatedcv-frontend:latest
```

Azure will detect the tag change and deploy automatically.

## Troubleshooting

### Pipeline Fails at Staging Health Checks
**Symptoms**: Staging deployment times out or health checks fail

**Possible Causes**:
- Database not accessible (check Azure PostgreSQL status)
- Configuration error in Azure App Service
- Container startup failure

**Resolution**:
1. Check Azure App Service logs: Portal → App Service → Log stream
2. Verify environment variables in App Service Configuration
3. Check database connection string and firewall rules
4. Review container logs for startup errors

### DAST Scans Report Security Issues
**Symptoms**: Security findings in ZAP artifacts

**Resolution**:
1. Download DAST artifacts from workflow
2. Review findings (FAIL vs WARN severity)
3. Fix critical issues in code
4. Update `.zap/rules.tsv` if false positive
5. Rerun deployment after fixes

### Production Approval Not Working
**Symptoms**: Pipeline doesn't pause at Stage 4

**Possible Causes**:
- GitHub Environment not configured
- No required reviewers set

**Resolution**:
1. Go to Settings → Environments → production
2. Add required reviewers
3. Save and rerun workflow

### Production Health Checks Fail After Deployment
**Symptoms**: Stage 5 fails to verify production health

**Possible Causes**:
- Azure deployment still in progress
- Configuration mismatch between staging and production
- Database migration failed

**Resolution**:
1. Check Azure deployment status in portal
2. Verify production environment variables match requirements
3. Check database migration logs
4. If needed, initiate rollback procedure

## Best Practices

### For Developers
- ✅ Ensure CI passes before merging to main
- ✅ Monitor staging deployment after merge
- ✅ Review DAST scan results before approving production
- ✅ Keep deployment windows short (avoid batching changes)
- ✅ Test database migrations in staging first

### For Approvers
- ✅ Verify staging is healthy before approving
- ✅ Review security scan findings
- ✅ Check commit changes for risk assessment
- ✅ Coordinate with team on deployment timing
- ✅ Monitor production health after approval

### For Operations
- ✅ Keep Azure App Services configured with correct tags
- ✅ Monitor ACR storage usage
- ✅ Regular review of DAST scan results
- ✅ Maintain rollback readiness
- ✅ Document incident response procedures

## Security Considerations

### Multi-Layer Security Validation
1. **CI Pipeline**: SAST (Semgrep), SCA (pip-audit, npm audit), secret scanning
2. **CD Pipeline**: DAST (OWASP ZAP) against live staging environment
3. **Manual Review**: Human oversight before production

### Security Reports
- DAST reports uploaded as artifacts for every deployment
- Findings categorized by severity (FAIL, WARN, IGNORE)
- Currently non-blocking (monitored) to allow initial hardening
- Goal: Enable strict blocking mode once issues resolved

### Secrets Management
- All credentials stored as GitHub Secrets (encrypted)
- Azure credentials (ACR) separate from app credentials
- No secrets in code or configuration files
- Regular secret rotation recommended

## Monitoring and Observability

### Available Metrics
- **GitHub Actions**: Workflow duration, success rate, approval time
- **Azure App Service**: Deployment history, container health, resource usage
- **Application Insights**: Runtime telemetry (if enabled)

### Deployment Audit Trail
Every deployment is recorded with:
- Commit SHA and author
- CI validation results
- DAST scan findings
- Approver identity and timestamp
- Deployment success/failure
- Health check results

## Future Enhancements

Planned improvements to the CD pipeline:

- [ ] Automated rollback on health check failures
- [ ] Canary deployments with gradual traffic shifting
- [ ] Integration with Application Insights for deployment validation
- [ ] Post-deployment smoke tests
- [ ] Deployment frequency and MTTR metrics dashboard
- [ ] Blue-green deployment support
- [ ] Strict blocking mode for all security scans

## Related Documentation

- [CI Pipeline Documentation](CI.md) - Continuous Integration details
- [Azure Infrastructure Setup](DEPLOYMENT_SETUP.md) - Infrastructure configuration
- [Security Configuration](.zap/rules.tsv) - DAST scan rules

## Support and Feedback

For questions or issues with the CD pipeline:
1. Check this documentation first
2. Review recent workflow runs for similar issues
3. Contact the DevOps team
4. Submit issues to the repository issue tracker

---

**Last Updated**: December 2024
**Pipeline Version**: v2.0 (Approval-Gated Production Promotion)
