# Dockerfile for Makerspace Hub - Flask API + React frontend
# Uses a multi-stage build to keep the final image small

# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy all frontend source files (including tsconfig.json)
COPY frontend/src ./src
COPY frontend/tsconfig.json ./
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

# Copy all requirements files
COPY requirements.txt ./
COPY src/requirements.txt ./src_requirements.txt

# Install Python dependencies - merge both requirements files
RUN pip install --no-cache-dir -r requirements.txt -r src_requirements.txt && \
    pip install --no-cache-dir gunicorn

# Copy backend source
COPY src/makerspace ./makerspace

# Add src directory to PYTHONPATH so that 'makerspace' can be imported
ENV PYTHONPATH=/app/src:$PYTHONPATH

# Copy built frontend from stage 1 to Flask's static folder
# Flask app is at src/makerspace, so static folder is src/makerspace/static
COPY --from=frontend-builder /app/frontend/dist ./src/makerspace/static

# Create the database directory if it doesn't exist
RUN mkdir -p /app/src/instance

# Set environment variables
ENV FLASK_APP=makerspace
ENV FLASK_ENV=production
ENV PORT=5000

# Expose the port Flask will run on
EXPOSE 5000

# Use Gunicorn as production server to serve both API and frontend
# Gunicorn will serve the Flask app which handles both /api/* and /* routes
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--threads", "2", "makerspace:app"]
