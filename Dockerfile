# KFSQUARE Multi-Architecture Production Dockerfile
# Supports AMD64, ARM64, and multi-stage builds for optimization

FROM --platform=$BUILDPLATFORM node:18-alpine as base

# Install system dependencies
RUN apk add --no-cache libc6-compat tini curl bash

# Install dependencies stage
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install production dependencies
RUN npm ci --only=production && npm cache clean --force

# Builder stage (for any build processes)
FROM base AS builder
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY . .

# Run build process if available
RUN npm run build 2>/dev/null || echo "No build process, using static files"

# Production runtime stage
FROM base AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Create system user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 kfsquare

# Copy production dependencies
COPY --from=deps --chown=kfsquare:nodejs /app/node_modules ./node_modules

# Copy application files
COPY --from=builder --chown=kfsquare:nodejs /app .

# Remove development files for smaller image
RUN rm -rf \
    .git* \
    *.md \
    tests \
    __tests__ \
    coverage \
    .env.example

# Switch to non-root user
USER kfsquare

# Create logs directory
RUN mkdir -p logs

# Expose application port
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check (single instance)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || node -e "require('http').get('http://localhost:3000/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))" || exit 1

# Use tini for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start the application (single CMD)
CMD ["npm", "start"]

# Metadata labels
LABEL maintainer="KFSQUARE Team"
LABEL version="1.0.0"
LABEL description="KFSQUARE Customer Support Platform - Cross Platform"
LABEL architecture="multi"
