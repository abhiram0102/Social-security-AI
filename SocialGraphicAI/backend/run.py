#!/usr/bin/env python3
"""
Run script for the AI Assistant Flask backend
"""
from app import app

if __name__ == "__main__":
    # Run the Flask application
    app.run(host='0.0.0.0', port=5001, debug=True)