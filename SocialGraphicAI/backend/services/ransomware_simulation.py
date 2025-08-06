# backend/services/ransomware_simulation.py

from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
import os

def simulate_encrypt(file_path: str, key: bytes = None):
    if not key:
        key = get_random_bytes(16)  # 128-bit key
    cipher = AES.new(key, AES.MODE_EAX)
    encrypted_data = b''

    with open(file_path, 'rb') as f:
        data = f.read()
        ciphertext, tag = cipher.encrypt_and_digest(data)
        encrypted_data = cipher.nonce + tag + ciphertext

    encrypted_path = file_path + ".enc"
    with open(encrypted_path, 'wb') as f:
        f.write(encrypted_data)

    return {"status": "encrypted", "output": encrypted_path, "key": key.hex()}
