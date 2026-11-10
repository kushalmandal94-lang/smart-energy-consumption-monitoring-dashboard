# Stage 1: Runtime
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (layer caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy application source code
COPY src/ ./src

# Expose backend API port
EXPOSE 5000

# Set non-root user for security
USER node

# Environment defaults
ENV NODE_ENV=production
ENV PORT=5000

# Start Express server
CMD ["node", "src/server.js"]

