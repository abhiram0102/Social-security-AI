import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

// Define schemas for validation
const userCredentialsSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100)
});

const scanRequestSchema = z.object({
  target: z.string().url(),
  scanType: z.enum(["quick", "full", "custom"]),
  options: z.object({
    ports: z.array(z.number()).optional(),
    timeout: z.number().optional(),
    serviceDetection: z.boolean().optional()
  }).optional()
});

// Sample threat data
const threatData = [
  {
    id: 1,
    type: "Brute Force",
    severity: "medium",
    source: "203.0.113.42",
    target: "192.168.1.10:22",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    description: "Multiple failed SSH login attempts detected"
  },
  {
    id: 2,
    type: "SQL Injection",
    severity: "critical",
    source: "198.51.100.73",
    target: "app.example.com/login",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    description: "SQL injection attempt targeting login form"
  },
  {
    id: 3,
    type: "XSS Attack",
    severity: "high",
    source: "72.14.192.15",
    target: "blog.example.com/comments",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    description: "Cross-site scripting attempt in comment form"
  },
  {
    id: 4,
    type: "Data Exfiltration",
    severity: "critical",
    source: "internal",
    target: "209.85.218.22",
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    description: "Unusual data transfer to external IP"
  },
  {
    id: 5,
    type: "Malware Detected",
    severity: "high",
    source: "internal",
    target: "workstation-27",
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    description: "Trojan.Emotet detected on workstation"
  },
  {
    id: 6,
    type: "Ransomware Activity",
    severity: "critical",
    source: "fileshare.local",
    target: "multiple",
    timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    description: "Suspicious file encryption activity detected"
  }
];

// Sample vulnerabilities data
const vulnerabilitiesData = [
  {
    id: 1,
    name: "CVE-2021-44228",
    description: "Log4j Remote Code Execution Vulnerability",
    severity: "critical",
    cvssScore: 10.0,
    affectedSystems: ["app-server-01", "app-server-02"],
    remediation: "Update Log4j to version 2.15.0 or higher"
  },
  {
    id: 2,
    name: "CVE-2022-22965",
    description: "Spring Framework RCE Vulnerability (Spring4Shell)",
    severity: "high",
    cvssScore: 9.8,
    affectedSystems: ["web-app-01"],
    remediation: "Update Spring Framework to patched version"
  },
  {
    id: 3,
    name: "CVE-2021-41773",
    description: "Apache HTTP Server Path Traversal & RCE",
    severity: "medium",
    cvssScore: 7.5,
    affectedSystems: ["web-server-03"],
    remediation: "Update Apache HTTP Server to version 2.4.51 or higher"
  },
  {
    id: 4,
    name: "CVE-2021-3156",
    description: "Sudo Heap-Based Buffer Overflow",
    severity: "high",
    cvssScore: 8.8,
    affectedSystems: ["linux-server-01", "linux-server-02", "linux-server-03"],
    remediation: "Update sudo package to patched version"
  }
];

// Sample scan results data
const scanResultsData = {
  scanId: "scan-20230615-001",
  timestamp: new Date().toISOString(),
  target: "192.168.1.0/24",
  duration: "00:05:32",
  hostsScanned: 254,
  hostsUp: 12,
  portsScanned: 1000,
  openPorts: 47,
  vulnerabilitiesFound: 8,
  criticalVulnerabilities: 2,
  highVulnerabilities: 3,
  mediumVulnerabilities: 2,
  lowVulnerabilities: 1,
  results: [
    {
      host: "192.168.1.10",
      status: "up",
      hostname: "web-server",
      openPorts: [
        { port: 22, service: "SSH", version: "OpenSSH 8.2p1" },
        { port: 80, service: "HTTP", version: "Apache 2.4.41" },
        { port: 443, service: "HTTPS", version: "Apache 2.4.41" }
      ],
      os: "Ubuntu 20.04",
      vulnerabilities: [
        { id: 1, name: "CVE-2021-41773", severity: "medium" }
      ]
    },
    {
      host: "192.168.1.20",
      status: "up",
      hostname: "app-server",
      openPorts: [
        { port: 22, service: "SSH", version: "OpenSSH 8.2p1" },
        { port: 8080, service: "HTTP", version: "Tomcat 9.0.40" },
        { port: 3306, service: "MySQL", version: "MySQL 8.0.28" }
      ],
      os: "Debian 11",
      vulnerabilities: [
        { id: 1, name: "CVE-2021-44228", severity: "critical" },
        { id: 2, name: "CVE-2022-22965", severity: "high" }
      ]
    }
  ]
};

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes with /api prefix
  
  // User routes
  app.post("/api/register", async (req, res) => {
    try {
      const { username, password } = userCredentialsSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      // Create new user
      const user = await storage.createUser({ username, password });
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = userCredentialsSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Threats API
  app.get("/api/threats", (_req, res) => {
    res.json(threatData);
  });
  
  // Vulnerabilities API
  app.get("/api/vulnerabilities", (_req, res) => {
    res.json(vulnerabilitiesData);
  });
  
  // Scan API
  app.post("/api/scan", (req, res) => {
    try {
      const scanRequest = scanRequestSchema.parse(req.body);
      
      // In a real implementation, this would initiate an actual scan
      // For now, just return a scan ID
      res.status(202).json({
        scanId: `scan-${Date.now()}`,
        status: "initiated",
        message: `Scan of ${scanRequest.target} initiated successfully`,
        estimatedTime: scanRequest.scanType === "quick" ? "30 seconds" : "5 minutes"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get scan results
  app.get("/api/scan/:scanId", (req, res) => {
    const { scanId } = req.params;
    
    // In a real implementation, fetch actual scan results
    // For now, return sample data
    if (scanId) {
      res.json({
        ...scanResultsData,
        scanId
      });
    } else {
      res.status(404).json({ message: "Scan not found" });
    }
  });
  
  // System status API
  app.get("/api/status", (_req, res) => {
    res.json({
      status: "operational",
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
      version: "1.0.3",
      activeScanners: 0,
      queuedScans: 0
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
