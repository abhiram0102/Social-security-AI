# backend/services/password_cracking.py

import subprocess
import os

def crack_hash(hash_file, wordlist_file, hash_type="0"):
    if not os.path.exists(hash_file) or not os.path.exists(wordlist_file):
        return {"error": "Missing hash or wordlist file"}

    try:
        result = subprocess.run(
            ["hashcat", "-m", hash_type, "-a", "0", hash_file, wordlist_file, "--force"],
            capture_output=True, text=True
        )
        return {"output": result.stdout}
    except Exception as e:
        return {"error": str(e)}
