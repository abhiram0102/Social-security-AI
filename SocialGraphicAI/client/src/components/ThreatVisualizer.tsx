import { useState, useEffect } from "react";
import { apiRequest } from "../lib/queryClient";
import { motion } from "framer-motion";

type Threat = {
  id: number;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  source: string;
  target: string;
  timestamp: string;
  description: string;
};

export function ThreatVisualizer() {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch threats data
  useEffect(() => {
    const fetchThreats = async () => {
      try {
        const response = await apiRequest("GET", "/api/threats", undefined);
        const data = await response.json();
        setThreats(data);
      } catch (error) {
        console.error("Error fetching threats:", error);
        // Use some default threats if the API fails
        setThreats([
          {
            id: 1,
            type: "Brute Force",
            severity: "medium",
            source: "203.0.113.42",
            target: "192.168.1.10:22",
            timestamp: "2023-06-15T08:23:11Z",
            description: "Multiple failed SSH login attempts detected"
          },
          {
            id: 2,
            type: "SQL Injection",
            severity: "critical",
            source: "198.51.100.73",
            target: "app.example.com/login",
            timestamp: "2023-06-15T09:45:22Z",
            description: "SQL injection attempt targeting login form"
          },
          {
            id: 3,
            type: "XSS Attack",
            severity: "high",
            source: "72.14.192.15",
            target: "blog.example.com/comments",
            timestamp: "2023-06-15T10:12:05Z",
            description: "Cross-site scripting attempt in comment form"
          },
          {
            id: 4,
            type: "Data Exfiltration",
            severity: "critical",
            source: "internal",
            target: "209.85.218.22",
            timestamp: "2023-06-15T11:32:47Z",
            description: "Unusual data transfer to external IP"
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchThreats();
  }, []);

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low": return "var(--neon-green)";
      case "medium": return "var(--neon-yellow)";
      case "high": return "var(--neon-orange)";
      case "critical": return "var(--neon-magenta)";
      default: return "var(--neon-cyan)";
    }
  };

  // Handle threat selection
  const handleThreatClick = (threat: Threat) => {
    setSelectedThreat(prev => prev?.id === threat.id ? null : threat);
  };

  return (
    <div className="threat-visualizer">
      <h3 className="panel-title">Detected Threats</h3>
      
      {isLoading ? (
        <div className="threat-loading">
          <div className="threat-loading-text">Scanning for threats...</div>
          <div className="threat-loading-indicator"></div>
        </div>
      ) : (
        <>
          <div className="threat-map">
            {/* World map grid background */}
            <div className="threat-map-grid"></div>
            
            {/* Threat connections */}
            {threats.map(threat => (
              <div 
                key={threat.id}
                className={`threat-connection ${selectedThreat?.id === threat.id ? 'selected' : ''}`}
                style={{
                  '--connection-color': getSeverityColor(threat.severity),
                  '--start-x': `${20 + Math.random() * 20}%`,
                  '--start-y': `${20 + Math.random() * 60}%`,
                  '--end-x': `${60 + Math.random() * 20}%`,
                  '--end-y': `${20 + Math.random() * 60}%`,
                } as React.CSSProperties}
              >
                <div className="threat-connection-source"></div>
                <div className="threat-connection-line"></div>
                <div className="threat-connection-target"></div>
              </div>
            ))}
          </div>
          
          <div className="threat-list">
            {threats.map(threat => (
              <motion.div 
                key={threat.id}
                className={`threat-card ${selectedThreat?.id === threat.id ? 'selected' : ''}`}
                onClick={() => handleThreatClick(threat)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: threat.id * 0.1 }}
              >
                <div 
                  className="threat-severity" 
                  style={{ backgroundColor: getSeverityColor(threat.severity) }}
                >
                  {threat.severity.toUpperCase()}
                </div>
                
                <div className="threat-header">
                  <div className="threat-type">{threat.type}</div>
                  <div className="threat-time">{formatTime(threat.timestamp)}</div>
                </div>
                
                <div className="threat-details">
                  <div className="threat-connection-info">
                    <div className="threat-source">
                      <span className="label">Source:</span> {threat.source}
                    </div>
                    <div className="threat-target">
                      <span className="label">Target:</span> {threat.target}
                    </div>
                  </div>
                  
                  <div className="threat-description">{threat.description}</div>
                </div>
                
                {selectedThreat?.id === threat.id && (
                  <div className="threat-actions">
                    <button className="threat-button">Mitigate</button>
                    <button className="threat-button">Block Source</button>
                    <button className="threat-button">Analyze</button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
