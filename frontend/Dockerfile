# Frontend Dockerfile for Tanstack React + Bun
# Multi-stage build for optimized production image

# Stage 1: Build the application
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Accept build arguments for Vite environment variables
ARG VITE_API_BASE_URL
ARG VITE_API_VERSION=v1

# Set as environment variables for the build process
# These will be baked into the static bundle during build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_API_VERSION=$VITE_API_VERSION

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application with environment variables baked in
RUN bun run build

# Stage 2: Production server with Nginx
FROM nginx:alpine AS production

# Copy custom nginx configuration
# Azure expects port 80, so we listen on both 80 and 8080 for compatibility
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    listen 8080;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # SPA routing - serve index.html for all routes
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health check endpoint for Azure
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Azure App Service compatibility
# Set permissions for potential non-root execution
RUN chmod -R 755 /usr/share/nginx/html && \
    chmod -R 777 /var/cache/nginx && \
    chmod -R 777 /var/log/nginx && \
    chmod -R 755 /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chmod 666 /var/run/nginx.pid

# Expose both ports for Azure compatibility
EXPOSE 80 8080

# Start nginx (Azure will handle user context)
CMD ["nginx", "-g", "daemon off;"]
