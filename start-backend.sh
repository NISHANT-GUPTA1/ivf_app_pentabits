#!/bin/bash
# Quick Test Script - Run backend locally

echo "🚀 Starting EMBRYA Backend..."
echo ""

cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate || . venv/Scripts/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Run the server
echo "✅ Starting server on http://localhost:8000"
echo ""
echo "📝 Test credentials:"
echo "   Admin: admin / admin123"
echo "   Embryologist: embryologist / embryo123"
echo "   Auditor: auditor / audit123"
echo ""
echo "Press Ctrl+C to stop"
echo ""

uvicorn main:app --reload --host 0.0.0.0 --port 8000
