# backend/services/s3_bucket_scanner.py

import requests

def check_s3_bucket(bucket_name):
    url = f"http://{bucket_name}.s3.amazonaws.com"
    try:
        res = requests.get(url, timeout=5)
        if "AccessDenied" not in res.text and res.status_code == 200:
            return {"bucket": bucket_name, "public": True}
        return {"bucket": bucket_name, "public": False}
    except Exception as e:
        return {"error": str(e)}
