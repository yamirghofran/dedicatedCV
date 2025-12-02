# Azure Deployment Setup Guide

## GitHub Secrets Configuration

You need to set the following secret in your GitHub repository:

### Required Secret

**`VITE_API_BASE_URL`**
- **Purpose**: Backend API endpoint URL for the frontend application
- **Value**: Your Azure backend URL (e.g., `https://dedicatedcv-backend.azurewebsites.net`)
- **Important**: Do NOT include a trailing slash

### How to Add the Secret

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `VITE_API_BASE_URL`
5. Value: Your backend Azure URL (e.g., `https://dedicatedcv-backend.azurewebsites.net`)
6. Click **Add secret**

## What Was Changed

### 1. Frontend Dockerfile (`frontend/Dockerfile`)
- Added build arguments (`ARG`) to accept `VITE_API_BASE_URL` and `VITE_API_VERSION`
- Set these as environment variables during the build stage
- This ensures the API URL is baked into the static bundle at build time

### 2. GitHub Actions CD Workflow (`.github/workflows/cd.yml`)
- Updated the frontend build step to pass build arguments
- The `VITE_API_BASE_URL` secret is now passed to the Docker build
- `VITE_API_VERSION` defaults to `v1`

### 3. Environment Example (`.env.example`)
- Added documentation about production configuration
- Clarified the difference between local and production setup

## How It Works

1. **Build Time**: When GitHub Actions builds the Docker image, it passes `VITE_API_BASE_URL` as a build argument
2. **Vite Build**: During `bun run build`, Vite replaces all `import.meta.env.VITE_API_BASE_URL` references with the actual URL
3. **Static Bundle**: The final JavaScript bundle contains the hardcoded API URL
4. **Runtime**: Nginx serves the static files, and the frontend makes API calls to the configured backend URL

## Testing Locally

To test the Docker build locally with custom API URL:

```bash
cd frontend
docker build --build-arg VITE_API_BASE_URL=https://your-backend.azurewebsites.net -t frontend-test .
docker run -p 8080:8080 frontend-test
```

Then visit http://localhost:8080

## Deployment Flow

1. Push to `main` branch or trigger workflow manually
2. GitHub Actions checks out code
3. Builds Docker image with `VITE_API_BASE_URL` from secrets
4. Pushes image to Azure Container Registry
5. Azure App Service pulls and runs the new image
6. Frontend is now live with the correct backend URL!

## Troubleshooting

### Site startup probe failed / Container keeps restarting
- **Fixed**: Nginx now listens on both port 80 and 8080 for Azure compatibility
- Azure automatically detects port 80 from the nginx:alpine base image
- The container will start successfully on either port

### Frontend can't connect to backend
- Verify `VITE_API_BASE_URL` secret is set correctly in GitHub
- Check that the backend URL is accessible (not localhost!)
- Ensure backend CORS settings include the frontend URL

### Build fails in GitHub Actions
- Check that `VITE_API_BASE_URL` secret exists
- Verify the secret value is a valid URL
- Review GitHub Actions logs for specific errors

### Changes not reflected after deployment
- Clear browser cache
- Verify the new image was built and pushed (check GitHub Actions logs)
- Ensure Azure App Service pulled the latest image (may need to restart)

## Backend CORS Configuration

Don't forget to set the backend's `BACKEND_CORS_ORIGINS` environment variable to include your frontend URL:

```
BACKEND_CORS_ORIGINS=https://your-frontend.azurewebsites.net
```

This should be set in Azure App Service Configuration for the backend.
