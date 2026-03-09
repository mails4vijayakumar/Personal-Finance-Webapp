# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files
COPY Frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY Frontend/ ./

# Build the app
RUN npm run build

# Production stage - using Nginx
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create health check script
RUN echo '#!/bin/sh' > /healthcheck.sh && \
    echo 'wget --quiet --tries=1 --spider http://localhost/health || exit 1' >> /healthcheck.sh && \
    chmod +x /healthcheck.sh

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD /healthcheck.sh

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
