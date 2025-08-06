import { create } from "zustand";
import { toast } from "sonner";

// Message types
export type MessageRole = "user" | "assistant" | "system";
export type ThreatLevel = "low" | "medium" | "high" | "critical";

export interface MessageMetadata {
  threatLevel?: ThreatLevel;
  tool?: string;
  timestamp?: string;
  confidence?: number;
}

export interface Message {
  role: MessageRole;
  content: string;
  metadata?: MessageMetadata;
}

// Command processors
const processNmapCommand = (target: string): { 
  content: string; 
  metadata: { 
    tool: string; 
    threatLevel: ThreatLevel; 
    timestamp: string; 
  }
} => {
  return {
    content: `Nmap scan results for ${target}:\n\n` +
      "PORT     STATE  SERVICE    VERSION\n" +
      "22/tcp   open   ssh        OpenSSH 8.2p1\n" +
      "80/tcp   open   http       Apache 2.4.41\n" +
      "443/tcp  open   https      Apache 2.4.41\n" +
      "3306/tcp open   mysql      MySQL 8.0.28\n" +
      "\nHost appears to be running Linux Ubuntu 20.04 (Focal Fossa)",
    metadata: {
      tool: "nmap",
      threatLevel: "low" as ThreatLevel,
      timestamp: new Date().toISOString()
    }
  };
};

const processExploitCommand = (target: string, vulnerability: string): { 
  content: string; 
  metadata: { 
    tool: string; 
    threatLevel: ThreatLevel; 
    timestamp: string; 
  }
} => {
  return {
    content: `[*] Starting exploit module for ${vulnerability}\n` +
      `[*] Target: ${target}\n` +
      "[*] Checking target vulnerability...\n" +
      "[+] Target appears vulnerable!\n" +
      "[*] Generating payload...\n" +
      "[*] Sending payload to target...\n" +
      "[+] Exploit successful!\n" +
      "[*] Creating session...\n" +
      "[+] Meterpreter session 1 opened",
    metadata: {
      tool: "metasploit",
      threatLevel: "high" as ThreatLevel,
      timestamp: new Date().toISOString()
    }
  };
};

const processBruteForceCommand = (target: string, service: string): { 
  content: string; 
  metadata: { 
    tool: string; 
    threatLevel: ThreatLevel; 
    timestamp: string; 
  }
} => {
  return {
    content: `[*] Starting brute force attack on ${service} service at ${target}\n` +
      "[*] Using default wordlist: /usr/share/wordlists/rockyou.txt\n" +
      "[*] Trying username: admin\n" +
      "...\n" +
      "[*] Trying username: root\n" +
      "...\n" +
      "[+] Credentials found!\n" +
      "[+] Username: admin\n" +
      "[+] Password: Password123!",
    metadata: {
      tool: "hydra",
      threatLevel: "medium" as ThreatLevel,
      timestamp: new Date().toISOString()
    }
  };
};

const processVulnerabilityCommand = (target: string): { 
  content: string; 
  metadata: { 
    tool: string; 
    threatLevel: ThreatLevel; 
    timestamp: string; 
  }
} => {
  return {
    content: `Vulnerability scan results for ${target}:\n\n` +
      "[+] Found 3 vulnerabilities:\n\n" +
      "1. CVE-2021-44228 (Log4j RCE) - CRITICAL\n" +
      "   Apache Log4j Remote Code Execution Vulnerability\n\n" +
      "2. CVE-2022-22965 (Spring4Shell) - HIGH\n" +
      "   Spring Framework Remote Code Execution Vulnerability\n\n" +
      "3. CVE-2021-41773 (Apache Path Traversal) - MEDIUM\n" +
      "   Apache HTTP Server Path Traversal Vulnerability",
    metadata: {
      tool: "openvas",
      threatLevel: "critical",
      timestamp: new Date().toISOString()
    }
  };
};

const processMalwareCommand = (target: string, type: string): { 
  content: string; 
  metadata: { 
    tool: string; 
    threatLevel: ThreatLevel; 
    timestamp: string; 
  }
} => {
  return {
    content: `[*] Generating ${type} malware simulation\n` +
      `[*] Target: ${target}\n` +
      "[*] Creating staged payload...\n" +
      "[*] Encoding payload to evade detection...\n" +
      "[+] Malware simulation created\n" +
      "[*] Running detection tests against common antivirus solutions...\n" +
      "[+] Evasion success rate: 85%",
    metadata: {
      tool: "malware-lab",
      threatLevel: "critical",
      timestamp: new Date().toISOString()
    }
  };
};

// Process messages based on content
const processMessage = (message: string): { 
  content: string; 
  metadata: { 
    tool: string; 
    threatLevel: ThreatLevel; 
    timestamp: string; 
  }
} => {
  // Convert to lowercase for easier matching
  const lowerMsg = message.toLowerCase();
  
  // Check for scan commands
  if (lowerMsg.includes("port scan") || lowerMsg.includes("nmap")) {
    const target = extractTarget(message) || "192.168.1.10";
    return processNmapCommand(target);
  }
  
  // Check for vulnerability commands
  if (lowerMsg.includes("vulnerabilit")) {
    const target = extractTarget(message) || "192.168.1.10";
    return processVulnerabilityCommand(target);
  }
  
  // Check for exploit commands
  if (lowerMsg.includes("exploit")) {
    const target = extractTarget(message) || "192.168.1.10";
    const vuln = lowerMsg.includes("log4j") ? "CVE-2021-44228" : 
                lowerMsg.includes("spring") ? "CVE-2022-22965" : 
                "CVE-2021-41773";
    return processExploitCommand(target, vuln);
  }
  
  // Check for brute force commands
  if (lowerMsg.includes("brute force") || lowerMsg.includes("bruteforce") || lowerMsg.includes("password")) {
    const target = extractTarget(message) || "192.168.1.10";
    const service = lowerMsg.includes("ssh") ? "ssh" : 
                   lowerMsg.includes("ftp") ? "ftp" : 
                   "http-post-form";
    return processBruteForceCommand(target, service);
  }
  
  // Check for malware commands
  if (lowerMsg.includes("malware") || lowerMsg.includes("ransomware") || lowerMsg.includes("rat")) {
    const target = extractTarget(message) || "192.168.1.10";
    const type = lowerMsg.includes("ransomware") ? "ransomware" : 
                lowerMsg.includes("rat") ? "remote access trojan" :
                "generic trojan";
    return processMalwareCommand(target, type);
  }
  
  // Default responses for other queries
  if (lowerMsg.includes("help") || lowerMsg.includes("command")) {
    return {
      content: "I can help with the following security operations:\n\n" +
        "- Port scanning (e.g., 'Run a port scan on 192.168.1.10')\n" +
        "- Vulnerability scanning (e.g., 'Check for vulnerabilities in the target')\n" +
        "- Exploitation (e.g., 'Exploit the Log4j vulnerability on the target')\n" +
        "- Brute force attacks (e.g., 'Brute force SSH on 192.168.1.10')\n" +
        "- Malware simulation (e.g., 'Generate a ransomware simulation')\n\n" +
        "I can also explain security concepts and provide recommendations.",
      metadata: {
        tool: "help",
        threatLevel: "low",
        timestamp: new Date().toISOString()
      }
    };
  }
  
  // General security advice
  return {
    content: "I've analyzed your request but need more specific information to proceed. Could you please provide more details about what kind of security operation you'd like to perform? For example, specifying a target system, vulnerability type, or security objective would help me assist you better.",
    metadata: {
      tool: "assistant",
      threatLevel: "low",
      timestamp: new Date().toISOString()
    }
  };
};

// Helper function to extract IP address or hostname from message
const extractTarget = (message: string): string | null => {
  // Look for IP addresses in the message
  const ipRegex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
  const ipMatch = message.match(ipRegex);
  
  if (ipMatch) {
    return ipMatch[0];
  }
  
  // Look for domain names
  const domainRegex = /\b([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}\b/i;
  const domainMatch = message.match(domainRegex);
  
  if (domainMatch) {
    return domainMatch[0];
  }
  
  return null;
};

// Define our store interface
interface AIAssistantState {
  messages: Message[];
  inputMessage: string;
  isProcessing: boolean;
  stealthMode: boolean;
  
  // Actions
  sendMessage: (content: string) => void;
  setInputMessage: (content: string) => void;
  toggleStealthMode: () => void;
  clearConversation: () => void;
}

export const useAIAssistant = create<AIAssistantState>((set, get) => ({
  messages: [],
  inputMessage: "",
  isProcessing: false,
  stealthMode: false,
  
  // Send a new message
  sendMessage: (content: string) => {
    // Add user message
    set(state => ({
      messages: [...state.messages, { role: "user", content }],
      inputMessage: "",
      isProcessing: true
    }));
    
    // Process the message and generate AI response
    setTimeout(() => {
      const response = processMessage(content);
      
      set(state => ({
        messages: [...state.messages, { 
          role: "assistant", 
          content: response.content,
          metadata: response.metadata
        }],
        isProcessing: false
      }));
      
      // Show notification for high threat level operations
      const threatLevel = response.metadata?.threatLevel;
      if (threatLevel === "high" || threatLevel === "critical") {
        toast.warning(`High risk operation detected: ${threatLevel.toUpperCase()}`, {
          description: "This operation may trigger security alerts if used in a real environment."
        });
      }
    }, 1500); // Simulate processing delay
  },
  
  // Set the input message
  setInputMessage: (content: string) => {
    set({ inputMessage: content });
  },
  
  // Toggle stealth mode
  toggleStealthMode: () => {
    set(state => {
      const newMode = !state.stealthMode;
      
      // Add system message about mode change
      const systemMessage: Message = { 
        role: "system", 
        content: newMode 
          ? "🔐 STEALTH MODE ACTIVATED: All operations will now use enhanced anonymization techniques." 
          : "⚠️ STEALTH MODE DEACTIVATED: Operations will use standard security procedures."
      };
      
      return { 
        stealthMode: newMode,
        messages: [...state.messages, systemMessage]
      };
    });
  },
  
  // Clear the conversation
  clearConversation: () => {
    set({ messages: [] });
  }
}));