# backend/services/ai_recon.py

import subprocess
import openai

def ai_generate_recon_targets(domain, api_key):
    openai.api_key = api_key
    prompt = f"Generate reconnaissance suggestions for domain: {domain}"

    try:
        res = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
        )
        return {"ai_targets": res.choices[0].message.content.strip()}
    except Exception as e:
        return {"error": str(e)}

def nmap_scan(host):
    try:
        result = subprocess.run(["nmap", "-sV", host], capture_output=True, text=True)
        return {"nmap_result": result.stdout}
    except Exception as e:
        return {"error": str(e)}
