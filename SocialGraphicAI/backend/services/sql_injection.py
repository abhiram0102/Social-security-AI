# backend/services/sql_injection.py

import requests

def test_sql_injection(url: str, param: str = 'id') -> dict:
    vulnerable = False
    payloads = ["1'", "1' OR '1'='1", "1'--", "1' OR 1=1--"]

    for payload in payloads:
        try:
            response = requests.get(url, params={param: payload}, timeout=5)
            if any(err in response.text.lower() for err in ['sql syntax', 'mysql_fetch', 'odbc', 'unterminated']):
                vulnerable = True
                return {
                    "vulnerable": True,
                    "payload": payload,
                    "status_code": response.status_code
                }
        except Exception as e:
            continue

    return {"vulnerable": False}

