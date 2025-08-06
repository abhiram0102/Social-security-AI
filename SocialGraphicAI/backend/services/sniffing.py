# backend/services/sniffing.py

from scapy.all import sniff, wrpcap

def sniff_packets(interface="eth0", count=100, output_file="capture.pcap"):
    try:
        packets = sniff(iface=interface, count=count)
        wrpcap(output_file, packets)
        return {"captured": len(packets), "output": output_file}
    except Exception as e:
        return {"error": str(e)}

