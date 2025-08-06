import { useState, useEffect, useRef } from "react";
import { useAudio } from "../lib/stores/useAudio";
import { motion } from "framer-motion";

type TerminalProps = {
  onClose: () => void;
};

const INITIAL_MESSAGES = [
  { text: "PentestAI Terminal v1.0.3", type: "system" },
  { text: "Type 'help' for available commands", type: "system" }
];

const HELP_TEXT = `
Available commands:
  help         - Display this help message
  scan         - Scan for vulnerabilities
  exploit      - Run exploit on target
  clear        - Clear the terminal
  exit         - Close the terminal
`;

export function Terminal({ onClose }: TerminalProps) {
  const [messages, setMessages] = useState<Array<{text: string, type: string}>>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { playHit, playSuccess } = useAudio();

  // Auto-focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle user input
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user command to terminal
    setMessages(prev => [...prev, { text: input, type: "user" }]);
    playHit();
    
    // Process command
    processCommand(input);
    
    // Clear input
    setInput("");
  };

  // Command processor
  const processCommand = (command: string) => {
    const cmd = command.trim().toLowerCase();
    
    switch (cmd) {
      case "help":
        setMessages(prev => [...prev, { text: HELP_TEXT, type: "system" }]);
        break;
        
      case "clear":
        setMessages(INITIAL_MESSAGES);
        break;
        
      case "exit":
        onClose();
        break;
        
      case "scan":
        setMessages(prev => [...prev, { text: "Starting vulnerability scan...", type: "system" }]);
        setIsTyping(true);
        
        // Simulate scan with delayed messages
        const scanSteps = [
          "Initializing scanner...",
          "Performing port scan...",
          "Ports 22, 80, 443, 3306 open",
          "Running service detection on open ports...",
          "SSH: OpenSSH 8.2p1",
          "HTTP: Apache/2.4.41",
          "HTTPS: Apache/2.4.41",
          "MySQL: 8.0.28",
          "Checking for known vulnerabilities...",
          "Found 3 potential vulnerabilities:",
          "  [HIGH] CVE-2021-44228: Log4j vulnerability",
          "  [MEDIUM] CVE-2022-22965: Spring Framework RCE",
          "  [LOW] CVE-2021-41773: Apache Path Traversal",
          "Scan complete. Results saved."
        ];
        
        scanSteps.forEach((step, index) => {
          setTimeout(() => {
            setMessages(prev => [...prev, { text: step, type: "system" }]);
            
            // End typing animation and play success sound when complete
            if (index === scanSteps.length - 1) {
              setIsTyping(false);
              playSuccess();
            }
          }, 500 + index * 500);
        });
        break;
        
      case "exploit":
        setMessages(prev => [
          ...prev, 
          { text: "Usage: exploit <target> <vulnerability>", type: "system" },
          { text: "Example: exploit 192.168.1.10 CVE-2021-44228", type: "system" }
        ]);
        break;
        
      default:
        if (cmd.startsWith("exploit ")) {
          // Process exploit command with arguments
          const args = cmd.split(" ");
          if (args.length >= 3) {
            const target = args[1];
            const vuln = args[2];
            
            setMessages(prev => [...prev, 
              { text: `Attempting to exploit ${vuln} on ${target}...`, type: "system" }
            ]);
            
            setIsTyping(true);
            
            setTimeout(() => {
              setMessages(prev => [...prev,
                { text: "Generating exploit payload...", type: "system" },
                { text: "Sending payload to target...", type: "system" },
                { text: "Exploit successful! Obtained shell access.", type: "success" }
              ]);
              setIsTyping(false);
              playSuccess();
            }, 2000);
          } else {
            setMessages(prev => [...prev, 
              { text: "Invalid command format. Use: exploit <target> <vulnerability>", type: "error" }
            ]);
          }
        } else {
          setMessages(prev => [...prev, { text: `Command not found: ${cmd}`, type: "error" }]);
        }
    }
  };

  return (
    <motion.div 
      className="terminal"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="terminal-header">
        <div className="terminal-title">PentestAI Terminal</div>
        <button 
          className="terminal-close" 
          onClick={onClose}
          aria-label="Close terminal"
        >
          ×
        </button>
      </div>
      
      <div className="terminal-body">
        {messages.map((msg, index) => (
          <div key={index} className={`terminal-message ${msg.type}`}>
            {msg.type === "user" ? (
              <span className="terminal-prompt">$ {msg.text}</span>
            ) : (
              msg.text
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="terminal-message typing">
            <span className="typing-indicator">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form className="terminal-input-form" onSubmit={handleSubmit}>
        <span className="terminal-prompt-symbol">$</span>
        <input
          ref={inputRef}
          type="text"
          className="terminal-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a command..."
          autoFocus
        />
      </form>
    </motion.div>
  );
}
