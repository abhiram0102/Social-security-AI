# backend/services/xss_scanner.py

import requests
from urllib.parse import urlparse, urlencode

def scan_xss(target_url, param="q"):
    payload = "<script>alert('XSS')</script>"
    test_url = f"{target_url}?{urlencode({param: payload})}"

    try:
        response = requests.get(test_url, timeout=5)
        if payload in response.text:
            return {"vulnerable": True, "url": test_url}
        else:
            return {"vulnerable": False}
    except Exception as e:
        return {"error": str(e)}
