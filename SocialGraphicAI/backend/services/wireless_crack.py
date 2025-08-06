# backend/services/wireless_crack.py

import subprocess
import os

def crack_wifi(handshake_file, wordlist_file):
    if not os.path.exists(handshake_file) or not os.path.exists(wordlist_file):
        return {"error": "Missing files"}

    try:
        result = subprocess.run(
            ["aircrack-ng", "-w", wordlist_file, "-b", "XX:XX:XX:XX:XX:XX", handshake_file],
            capture_output=True, text=True
        )
        return {"output": result.stdout}
    except Exception as e:
        return {"error": str(e)}
