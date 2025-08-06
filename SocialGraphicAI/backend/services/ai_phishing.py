# backend/services/ai_phishing.py

import openai

def generate_phishing_email(target_name, lure_topic, api_key):
    openai.api_key = api_key
    prompt = f"""
Generate a convincing phishing email to {target_name}, pretending it's about "{lure_topic}". 
Use social engineering, no real malicious intent.
"""

    try:
        res = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}]
        )
        return {"email_text": res.choices[0].message.content.strip()}
    except Exception as e:
        return {"error": str(e)}
