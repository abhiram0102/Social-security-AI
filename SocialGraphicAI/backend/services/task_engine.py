import os
import sys
import re
import json
import datetime
import subprocess
import platform
import random

# Dictionary of supported languages
SUPPORTED_LANGUAGES = {
    'en': 'English',
    'hi': 'Hindi',
    'bn': 'Bengali',
    'fr': 'French',
    'es': 'Spanish',
    'de': 'German',
    'ja': 'Japanese',
    'zh': 'Chinese',
    'ar': 'Arabic',
    'ru': 'Russian'
}

# Basic natural language processing to detect intent
def detect_intent(query, language='en'):
    """
    Detects the intent of the user query
    """
    query = query.lower()
    
    # Check for code generation requests
    if any(phrase in query for phrase in [
        'write code', 'generate code', 'write a function', 'create a class',
        'python script', 'javascript function', 'html', 'css', 'java class',
        'code for', 'generate a program', 'code to', 'write program'
    ]):
        return 'code_generation'
    
    # Check for system commands
    if any(phrase in query for phrase in [
        'open ', 'run ', 'execute ', 'start ', 'launch ',
        'close ', 'kill ', 'stop ', 'terminate '
    ]):
        return 'system_command'
    
    # Check for system monitoring
    if any(phrase in query for phrase in [
        'system resources', 'ram usage', 'cpu usage', 'memory usage',
        'disk space', 'battery', 'system stats', 'performance'
    ]):
        return 'system_monitor'
    
    # Check for weather requests
    if any(phrase in query for phrase in [
        'weather', 'temperature', 'forecast', 'rain', 'sunny',
        'weather in', 'weather for', 'how\'s the weather'
    ]):
        return 'weather'
    
    # Check for time requests
    if any(phrase in query for phrase in [
        'time', 'current time', 'what time', 'clock', 'what\'s the time'
    ]):
        return 'time'
    
    # Check for jokes
    if any(phrase in query for phrase in [
        'joke', 'tell me a joke', 'something funny', 'make me laugh'
    ]):
        return 'joke'
    
    # Check for math calculations
    if any(char in query for char in '+-*/^%') or any(word in query for word in [
        'calculate', 'compute', 'sum', 'add', 'subtract', 'multiply', 'divide',
        'square root', 'power', 'percent', 'calculator'
    ]):
        return 'calculation'
    
    # Default to general query
    return 'general_query'

def process_query(query, language='en', voice_mode=False):
    """
    Process the user query and return a response
    """
    # Detect the intent
    intent = detect_intent(query, language)
    
    # Process based on intent
    if intent == 'code_generation':
        response = generate_code(query)
    elif intent == 'system_command':
        response = handle_system_command(query)
    elif intent == 'system_monitor':
        response = "I'll show you the system resources monitor."
    elif intent == 'weather':
        response = get_weather(query)
    elif intent == 'time':
        response = get_time(query)
    elif intent == 'joke':
        response = get_joke()
    elif intent == 'calculation':
        response = calculate(query)
    else:
        response = handle_general_query(query)
    
    # Build the result object
    result = {
        'query': query,
        'response': response,
        'intent': intent,
        'timestamp': datetime.datetime.now().isoformat(),
        'voice_mode': voice_mode,
        'language': language
    }
    
    return result

def generate_code(query):
    """
    Generate code based on the user's query
    """
    language_patterns = {
        'python': [r'python', r'\.py'],
        'javascript': [r'javascript', r'js', r'node'],
        'html': [r'html', r'web page', r'webpage'],
        'css': [r'css', r'style sheet'],
        'java': [r'java', r'\.java'],
        'c': [r'c programming', r'\.c'],
        'cpp': [r'c\+\+', r'cpp', r'\.cpp'],
        'bash': [r'bash', r'shell script', r'\.sh'],
        'sql': [r'sql', r'database query']
    }
    
    code_language = 'python'  # Default
    
    # Determine the programming language requested
    for lang, patterns in language_patterns.items():
        if any(re.search(pattern, query, re.IGNORECASE) for pattern in patterns):
            code_language = lang
            break
    
    # In a real system, this would call an AI code generation API
    # For demonstration, we'll return hardcoded examples
    if code_language == 'python':
        if 'web scraper' in query or 'scrape' in query:
            return {
                'code': '''
import requests
from bs4 import BeautifulSoup

def scrape_website(url):
    """Scrape a website and extract all links"""
    response = requests.get(url)
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
        links = []
        for link in soup.find_all('a'):
            href = link.get('href')
            if href:
                links.append(href)
        return links
    else:
        return f"Error: {response.status_code}"

# Example usage
if __name__ == "__main__":
    url = "https://example.com"
    links = scrape_website(url)
    for link in links:
        print(link)
''',
                'language': 'python',
                'explanation': 'This Python script uses requests to download a webpage and BeautifulSoup to parse it and extract all links.'
            }
        else:
            return {
                'code': '''
def fibonacci(n):
    """Generate the Fibonacci sequence up to n"""
    sequence = [0, 1]
    
    while sequence[-1] + sequence[-2] <= n:
        sequence.append(sequence[-1] + sequence[-2])
    
    return sequence

# Example usage
print(fibonacci(100))  # [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]
''',
                'language': 'python',
                'explanation': 'This function generates the Fibonacci sequence up to a given number n.'
            }
    elif code_language == 'javascript':
        return {
            'code': '''
function fetchData(url) {
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Data fetched successfully:', data);
      return data;
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
}

// Example usage
fetchData('https://api.example.com/data')
  .then(data => {
    // Do something with the data
    document.getElementById('result').textContent = JSON.stringify(data, null, 2);
  });
''',
            'language': 'javascript',
            'explanation': 'This JavaScript function fetches data from a URL and handles the response and errors.'
        }
    elif code_language == 'html':
        return {
            'code': '''
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Responsive Web Page</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 0;
      color: #333;
    }
    
    .container {
      width: 80%;
      margin: 0 auto;
      padding: 20px;
    }
    
    header {
      background-color: #f4f4f4;
      padding: 20px;
      text-align: center;
      margin-bottom: 20px;
    }
    
    .hero {
      background-color: #e9e9e9;
      padding: 40px;
      text-align: center;
      margin-bottom: 20px;
    }
    
    .content {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
    }
    
    .card {
      flex: 0 0 30%;
      background-color: #f9f9f9;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    
    footer {
      background-color: #333;
      color: white;
      text-align: center;
      padding: 20px;
      margin-top: 20px;
    }
    
    @media (max-width: 768px) {
      .card {
        flex: 0 0 100%;
      }
    }
  </style>
</head>
<body>
  <header>
    <h1>My Website</h1>
    <nav>
      <a href="#">Home</a> | 
      <a href="#">About</a> | 
      <a href="#">Services</a> | 
      <a href="#">Contact</a>
    </nav>
  </header>
  
  <div class="container">
    <div class="hero">
      <h2>Welcome to My Website</h2>
      <p>This is a simple responsive webpage template</p>
    </div>
    
    <div class="content">
      <div class="card">
        <h3>Service 1</h3>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      </div>
      
      <div class="card">
        <h3>Service 2</h3>
        <p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
      </div>
      
      <div class="card">
        <h3>Service 3</h3>
        <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
      </div>
    </div>
  </div>
  
  <footer>
    <p>&copy; 2023 My Website. All rights reserved.</p>
  </footer>
</body>
</html>
''',
            'language': 'html',
            'explanation': 'This is a responsive HTML page with CSS styling that adapts to different screen sizes.'
        }
    
    # Add more languages as needed
    
    # Default response if no specific code is available
    return {
        'code': f"// Generated {code_language.capitalize()} code would appear here\n// Based on your request: {query}",
        'language': code_language,
        'explanation': f'A custom {code_language} implementation would be generated here based on your requirements.'
    }

def handle_system_command(query):
    """
    Handle system commands like opening applications
    """
    # Extract the command and application name
    # For safety, we'll just return what we would do, not actually execute commands
    if 'open' in query or 'launch' in query or 'start' in query:
        if 'notepad' in query:
            return "I would open Notepad for you."
        elif 'calculator' in query:
            return "I would open Calculator for you."
        elif 'browser' in query or 'chrome' in query or 'firefox' in query:
            return "I would open a web browser for you."
        else:
            # Try to find what to open
            words = query.split()
            for i, word in enumerate(words):
                if word in ['open', 'launch', 'start']:
                    if i+1 < len(words):
                        app = words[i+1]
                        return f"I would open {app} for you."
    
    return "I can't execute that system command for safety reasons."

def get_weather(query):
    """
    Get weather information
    """
    # In a real implementation, this would call a weather API
    # For demonstration, return a sample response
    
    # Try to extract location
    location_match = re.search(r'in ([a-zA-Z\s]+)', query)
    location = location_match.group(1) if location_match else "your location"
    
    # Generate random weather data for demo purposes
    temp = random.randint(50, 90)
    conditions = random.choice(['sunny', 'partly cloudy', 'cloudy', 'rainy', 'stormy', 'snowy'])
    
    return f"The weather in {location} is currently {conditions} with a temperature of {temp}°F. Forecast shows similar conditions throughout the day."

def get_time(query):
    """
    Get current time, possibly in a specific timezone
    """
    now = datetime.datetime.now()
    
    # Check if a specific location/timezone is mentioned
    location_match = re.search(r'in ([a-zA-Z\s]+)', query)
    
    if location_match:
        location = location_match.group(1).strip()
        # In a real implementation, we would convert to the requested timezone
        # For demonstration, just mention that we would do this
        return f"The current time in {location} would be displayed here. Your local time is {now.strftime('%I:%M %p')}."
    else:
        return f"The current time is {now.strftime('%I:%M %p')}."

def get_joke():
    """
    Return a random joke
    """
    jokes = [
        "Why don't scientists trust atoms? Because they make up everything!",
        "Why did the scarecrow win an award? Because he was outstanding in his field!",
        "I told my wife she was drawing her eyebrows too high. She looked surprised.",
        "What do you call a fake noodle? An impasta!",
        "How do you organize a space party? You planet!",
        "Why couldn't the bicycle stand up by itself? It was two tired!",
        "I'm reading a book about anti-gravity. It's impossible to put down!",
        "Did you hear about the mathematician who's afraid of negative numbers? He'll stop at nothing to avoid them!",
        "Why do we tell actors to 'break a leg?' Because every play has a cast.",
        "What's the best thing about Switzerland? I don't know, but the flag is a big plus."
    ]
    return random.choice(jokes)

def calculate(query):
    """
    Perform a calculation
    """
    # Strip words and extract just the math expression
    # This is a simplified implementation
    expression = query.lower()
    
    # Replace words with operators
    word_to_op = {
        'plus': '+',
        'add': '+',
        'sum': '+',
        'minus': '-',
        'subtract': '-',
        'difference': '-',
        'times': '*',
        'multiply': '*',
        'multiplied by': '*',
        'divided by': '/',
        'divide': '/',
        'over': '/',
        'percent': '%',
        'percent of': '*0.01*'
    }
    
    for word, op in word_to_op.items():
        expression = expression.replace(word, op)
    
    # Extract all numbers and operators
    expression = re.sub(r'[^0-9+\-*/()%\.\s]', '', expression)
    expression = expression.strip()
    
    # Safety check before evaluating
    if not expression or not any(char.isdigit() for char in expression):
        return "I couldn't extract a valid calculation from your query."
    
    try:
        # WARNING: eval is unsafe for user input in production
        # In a real implementation, use a safer method to evaluate expressions
        result = eval(expression)
        return f"The result of {expression} is {result}"
    except Exception as e:
        return f"Sorry, I couldn't calculate that. Error: {str(e)}"

def handle_general_query(query):
    """
    Handle general queries that don't match specific intents
    """
    # In a real implementation, this would call an AI API or use a knowledge base
    # For demonstration, return a simple response
    responses = [
        "I don't have enough information to answer that question properly. Could you provide more details?",
        "That's an interesting question. In a full implementation, I would provide a detailed answer.",
        "I'm designed to understand that query, but my knowledge base is limited in this demo.",
        "I'd normally respond with information from reliable sources, but I'm running in demo mode.",
        "Great question! I'd usually connect to an external API to get you the most up-to-date information."
    ]
    return random.choice(responses)

# If run directly, test with a sample query
if __name__ == "__main__":
    sample_query = "What's the weather in New York?"
    result = process_query(sample_query)
    print(json.dumps(result, indent=2))