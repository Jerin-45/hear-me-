# ==============================================================================
# HearMe AI - Multi-Stage Production Dockerfile
# Implements TRACEN Topic 7 (Docker & Containerization)
# ==============================================================================

# Stage 1: Build Frontend Assets
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm ci

# Copy source code and build production assets
COPY . .
RUN npm run build

# Stage 2: Minimal Production Runtime
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5001

# Copy package descriptors and install production-only dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled backend and frontend distribution
COPY server/ ./server/
COPY --from=builder /app/dist ./dist

# Create unprivileged user for security
USER node

EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:5001/api/health || exit 1

CMD ["node", "--experimental-strip-types", "server/index.ts"]
