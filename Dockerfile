FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install system dependencies
RUN apt-get update && apt-get install -y build-essential libpq-dev ca-certificates && rm -rf /var/lib/apt/lists/*

# Set work directory
WORKDIR /app

# Copy requirements first
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Change to server directory where the code lives
WORKDIR /app/server

# Expose port (Internal for HF and local)
EXPOSE 7860

# Command to run the application
CMD ["sh", "-c", "python ingest.py && uvicorn main:app --host 0.0.0.0 --port 7860"]
