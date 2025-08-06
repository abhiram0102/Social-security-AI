import socket
import nmap
import whois
import dns.resolver

def run_recon(domain: str) -> dict:
    result = {
        "ip_address": None,
        "open_ports": [],
        "os_detection": {},
        "dns_records": {},
        "whois_data": {}
    }

    try:
        ip = socket.gethostbyname(domain)
        result["ip_address"] = ip

        # DNS Lookup
        try:
            dns_records = dns.resolver.resolve(domain, 'A')
            result["dns_records"]["A"] = [r.to_text() for r in dns_records]
        except:
            result["dns_records"]["A"] = []

        # WHOIS
        try:
            w = whois.whois(domain)
            result["whois_data"] = {k: str(v) for k, v in w.items()}
        except Exception as e:
            result["whois_data"] = {"error": str(e)}

        # Nmap Scan
        nm = nmap.PortScanner()
        nm.scan(ip, arguments="-O -T4")

        if ip in nm.all_hosts():
            result["open_ports"] = list(nm[ip]['tcp'].keys()) if 'tcp' in nm[ip] else []
            result["os_detection"] = nm[ip]['osmatch'][0] if nm[ip].get('osmatch') else {}

    except Exception as e:
        result["error"] = str(e)

    return result
