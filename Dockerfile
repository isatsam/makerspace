# Dockerfile for Makerspace Hub - Flask API + React frontend
# Uses a multi-stage build to keep the final image small

# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source
COPY frontend/src ./src
COPY frontend/public ./public
COPY frontend/vite.config.ts ./
COPY frontend/index.html ./

# Build the React app
RUN npm run build

# Stage 2: Python backend with Flask
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for SQLite
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements
COPY src/requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY src/makerspace ./src/makerspace

# Copy built frontend from stage 1 to Flask's static folder
# Flask app is at src/makerspace, so static folder is src/makerspace/static
COPY --from=frontend-builder /app/frontend/dist ./src/makerspace/static

# Create the database directory if it doesn't exist
RUN mkdir -p /app/src/instance

# Set environment variables
ENV FLASK_APP=src.makerspace
ENV FLASK_ENV=production
ENV PORT=5000

# The Flask server will serve both the API and the static frontend files
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]
