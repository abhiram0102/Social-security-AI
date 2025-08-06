from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import psutil
from services.task_engine import process_query

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/assistant', methods=['POST'])
def process_assistant_query():
    """
    Process a query from the AI assistant
    """
    data = request.json
    
    if not data or 'query' not in data:
        return jsonify({'error': 'No query provided'}), 400
    
    query = data['query']
    voice_mode = data.get('voice_mode', False)
    language = data.get('language', 'en')
    
    try:
        # Process the query through our task engine
        result = process_query(query, language, voice_mode)
        return jsonify(result)
    except Exception as e:
        print(f"Error processing query: {str(e)}")
        return jsonify({'error': f'Error processing query: {str(e)}'}), 500

@app.route('/api/system/resources', methods=['GET'])
def get_system_resources():
    """
    Get system resource information (CPU, RAM, etc.)
    """
    try:
        # Get CPU usage
        cpu_percent = psutil.cpu_percent(interval=0.5)
        
        # Get memory usage
        memory = psutil.virtual_memory()
        ram_percent = memory.percent
        ram_used = round(memory.used / (1024 * 1024 * 1024), 2)  # GB
        ram_total = round(memory.total / (1024 * 1024 * 1024), 2)  # GB
        
        # Get disk usage
        disk = psutil.disk_usage('/')
        disk_percent = disk.percent
        disk_used = round(disk.used / (1024 * 1024 * 1024), 2)  # GB
        disk_total = round(disk.total / (1024 * 1024 * 1024), 2)  # GB
        
        # Try to get battery info, might not be available on all systems
        battery_percent = None
        battery_plugged = None
        try:
            battery = psutil.sensors_battery()
            if battery:
                battery_percent = battery.percent
                battery_plugged = battery.power_plugged
        except:
            pass
        
        return jsonify({
            'cpu': {
                'percent': cpu_percent
            },
            'memory': {
                'percent': ram_percent,
                'used_gb': ram_used,
                'total_gb': ram_total
            },
            'disk': {
                'percent': disk_percent,
                'used_gb': disk_used,
                'total_gb': disk_total
            },
            'battery': {
                'percent': battery_percent,
                'plugged': battery_plugged
            }
        })
    except Exception as e:
        return jsonify({'error': f'Error getting system resources: {str(e)}'}), 500

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """
    Handle file uploads and process them based on the command
    """
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    # Get the command to run on the file
    command = request.form.get('command', 'summarize')
    
    try:
        # Create uploads directory if it doesn't exist
        upload_folder = os.path.join(os.path.dirname(__file__), 'uploads')
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)
        
        # Save the file
        file_path = os.path.join(upload_folder, file.filename)
        file.save(file_path)
        
        # Process the file based on the command
        # This would be handled by your task_engine.py in a real implementation
        
        # For now, return a simple acknowledgment
        return jsonify({
            'success': True,
            'message': f'File {file.filename} uploaded successfully and {command} operation queued',
            'filename': file.filename,
            'command': command
        })
    except Exception as e:
        return jsonify({'error': f'Error processing file: {str(e)}'}), 500

@app.route('/api/suggestions', methods=['GET'])
def get_suggestions():
    """
    Get auto-suggestions for the AI assistant
    """
    suggestions = [
        "What's the weather in New York?",
        "Open Notepad",
        "Create a Python script to scrape a website",
        "Monitor system resources",
        "Tell me a joke",
        "What's the time in Tokyo?",
        "Calculate 15% of 67.8",
        "Summarize this text file",
        "Generate a Bash script to backup files",
        "Write a React component for a login form"
    ]
    return jsonify({'suggestions': suggestions})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)