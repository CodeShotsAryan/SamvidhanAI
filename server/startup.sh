#!/bin/bash
set -e

echo "🔄 Running database migrations..."

# Run the migration scripts
python add_citations_migration.py
python add_related_cases_migration.py

echo "✅ Migrations complete!"
echo "🚀 Starting FastAPI server..."

# Start the FastAPI server
exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload
