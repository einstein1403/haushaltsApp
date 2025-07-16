# Multi-stage build for combined frontend+backend

# Stage 1: Build React frontend
FROM node:18-alpine as frontend-builder

WORKDIR /app/client

# Copy frontend package files
COPY client/package*.json ./

# Install frontend dependencies
RUN npm ci && npm cache clean --force

# Copy frontend source code
COPY client/ ./

# Build the React application
RUN npm run build

# Stage 2: Setup backend with frontend
FROM node:18-alpine

WORKDIR /app

# Copy backend package files
COPY server/package*.json ./

# Install backend dependencies
RUN npm ci && npm cache clean --force

# Copy backend source code
COPY server/ ./

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/client/build ./public

# Create a simple static file server middleware for serving React app
RUN echo "const express = require('express');" > serve-static.js && \
    echo "const path = require('path');" >> serve-static.js && \
    echo "module.exports = (app) => {" >> serve-static.js && \
    echo "  app.use(express.static(path.join(__dirname, 'public')));" >> serve-static.js && \
    echo "  app.get('*', (req, res) => {" >> serve-static.js && \
    echo "    if (!req.path.startsWith('/api')) {" >> serve-static.js && \
    echo "      res.sendFile(path.join(__dirname, 'public', 'index.html'));" >> serve-static.js && \
    echo "    }" >> serve-static.js && \
    echo "  });" >> serve-static.js && \
    echo "};" >> serve-static.js

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Expose the backend port
EXPOSE 3001

# Start the combined application
CMD ["npm", "start"]