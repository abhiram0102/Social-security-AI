import { useState, useEffect } from "react";
import { useKeyboardControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useTypewriter } from "../lib/hooks/useTypewriter";
import { InfoPanel } from "./InfoPanel";
import { ThreatVisualizer } from "./ThreatVisualizer";
import { useQuery } from "@tanstack/react-query";

type HudInterfaceProps = {
  onToggleTerminal: () => void;
  onToggleAIAssistant: () => void;
};

export function HudInterface({ onToggleTerminal, onToggleAIAssistant }: HudInterfaceProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reconnaissance' | 'exploitation' | 'threats' | 'systems' | 'ai-tools'>('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  
  // Terminal keyboard control
  const isConsolePressed = useKeyboardControls((state) => state.console);
  
  useEffect(() => {
    if (isConsolePressed) {
      onToggleTerminal();
    }
  }, [isConsolePressed, onToggleTerminal]);

  // Clock timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Scan simulation
  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setScanProgress(prev => {
          const newProgress = prev + Math.random() * 2;
          if (newProgress >= 100) {
            setIsScanning(false);
            clearInterval(interval);
            return 100;
          }
          return newProgress;
        });
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [isScanning]);

  // Typewriter effect for status message
  const statusMessage = useTypewriter(
    isScanning 
      ? "ACTIVE SCAN IN PROGRESS - DETECTING VULNERABILITIES" 
      : "SYSTEM IDLE - AWAITING COMMAND INPUT",
    100
  );

  // Start a new scan
  const startScan = () => {
    if (!isScanning) {
      setIsScanning(true);
      setScanProgress(0);
    }
  };

  // Format time for display
  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  return (
    <div className="hud-interface">
      {/* Top header bar with logo and menu */}
      <div className="hud-header">
        <div className="hud-logo">PENTEST<span className="text-neon-cyan">AI</span></div>
        
        {/* Main navigation menu */}
        <div className="main-menu">
          <div 
            className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="menu-icon">📊</span>
            <span className="menu-text">Dashboard</span>
          </div>
          <div 
            className={`menu-item ${activeTab === 'reconnaissance' ? 'active' : ''}`}
            onClick={() => setActiveTab('reconnaissance')}
          >
            <span className="menu-icon">🔍</span>
            <span className="menu-text">Reconnaissance</span>
          </div>
          <div 
            className={`menu-item ${activeTab === 'exploitation' ? 'active' : ''}`}
            onClick={() => setActiveTab('exploitation')}
          >
            <span className="menu-icon">⚡</span>
            <span className="menu-text">Exploitation</span>
          </div>
          <div 
            className={`menu-item ${activeTab === 'threats' ? 'active' : ''}`}
            onClick={() => setActiveTab('threats')}
          >
            <span className="menu-icon">⚠️</span>
            <span className="menu-text">Threats</span>
          </div>
          <div 
            className={`menu-item ${activeTab === 'systems' ? 'active' : ''}`}
            onClick={() => setActiveTab('systems')}
          >
            <span className="menu-icon">🖥️</span>
            <span className="menu-text">Systems</span>
          </div>
          <div 
            className={`menu-item ${activeTab === 'ai-tools' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai-tools')}
          >
            <span className="menu-icon">🧠</span>
            <span className="menu-text">AI Tools</span>
          </div>
        </div>
        
        {/* Right side controls */}
        <div className="top-controls">
          <div className="hud-status">
            <span className="status-indicator"></span>
            {statusMessage}
          </div>
          
          <div className="action-buttons">
            <button 
              className="action-button console-button"
              onClick={onToggleTerminal}
              title="Open Console"
            >
              <span className="action-icon">🖮</span>
            </button>
            <button 
              className="action-button ai-assistant-button"
              onClick={onToggleAIAssistant}
              title="AI Assistant"
            >
              <span className="action-icon">🤖</span>
            </button>
            <button 
              className={`action-button scan-button ${isScanning ? 'scanning' : ''}`}
              onClick={startScan}
              disabled={isScanning}
              title="Start Scan"
            >
              <span className="action-icon">{isScanning ? '⏳' : '🔄'}</span>
            </button>
          </div>
          
          <div className="hud-time">{formattedTime}</div>
        </div>
      </div>
      
      {/* Scan progress indicator */}
      {isScanning && (
        <div className="global-scan-progress">
          <div className="scan-progress-bar" style={{ width: `${scanProgress}%` }}></div>
          <div className="scan-progress-text">{Math.floor(scanProgress)}%</div>
        </div>
      )}
      
      {/* Main content area */}
      <div className="hud-content">
        
        {/* Main panel content based on active tab */}
        <div className="hud-main-panel">
          {activeTab === 'dashboard' && (
            <div className="dashboard-grid">
              <InfoPanel title="System Status" value="OPTIMAL" icon="🟢" />
              <InfoPanel title="Security Level" value="MAXIMUM" icon="🔒" />
              <InfoPanel title="Active Threats" value="0" icon="🛡️" />
              <InfoPanel title="Last Scan" value={isScanning ? "In Progress" : "Complete"} icon="🔍" />
              <div className="dashboard-wide-panel">
                <h3 className="panel-title">Network Activity</h3>
                <div className="network-activity-chart">
                  {/* Simple bar chart for network activity */}
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="network-bar" 
                      style={{ 
                        height: `${Math.random() * 80 + 20}%`,
                        backgroundColor: i % 4 === 0 ? 'var(--neon-magenta)' : 'var(--neon-cyan)' 
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'threats' && (
            <div className="threats-container">
              <ThreatVisualizer />
            </div>
          )}
          
          {activeTab === 'reconnaissance' && (
            <div className="reconnaissance-container">
              <div className="tool-header">
                <h3 className="panel-title">Reconnaissance Tools</h3>
                <div className="tool-controls">
                  <select className="tool-dropdown">
                    <option value="fingerprinting">Fingerprinting & OS Detection</option>
                    <option value="brute-force">Brute Force Attack</option>
                    <option value="port-scanning">Port Scanning</option>
                    <option value="web-scanning">Web Vulnerability Scanning</option>
                    <option value="dns-analysis">DNS Analysis</option>
                  </select>
                  <button className="tool-run-button">Execute <span className="tool-icon">▶</span></button>
                </div>
              </div>
              
              <div className="recon-visualization">
                <div className="recon-map">
                  <div className="recon-target-wrapper">
                    <div className="recon-target">
                      <div className="target-ring"></div>
                      <div className="target-ring"></div>
                      <div className="target-ring"></div>
                      <div className="target-icon">🎯</div>
                    </div>
                    <div className="target-ip">192.168.1.1</div>
                  </div>
                  
                  <div className="scan-paths">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} 
                        className="scan-path" 
                        style={{ 
                          transform: `rotate(${i * 45}deg)`,
                          animationDelay: `${i * 0.2}s`
                        }}>
                      </div>
                    ))}
                  </div>
                  
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} 
                      className="network-node" 
                      style={{ 
                        top: `${20 + Math.random() * 60}%`,
                        left: `${20 + Math.random() * 60}%`,
                        animationDelay: `${i * 0.3}s`
                      }}>
                      <div className="node-icon">{i % 2 === 0 ? '🖥️' : '📱'}</div>
                      <div className="node-ip">192.168.1.{i + 10}</div>
                    </div>
                  ))}
                </div>
                <div className="recon-results">
                  <div className="results-header">
                    <h4>Scan Results</h4>
                    <div className="results-status">Active</div>
                  </div>
                  <div className="results-content">
                    <div className="result-entry">
                      <span className="result-time">16:45:32</span>
                      <span className="result-type">OS Detection</span>
                      <span className="result-detail">Linux 5.4.0 (Ubuntu 20.04)</span>
                    </div>
                    <div className="result-entry">
                      <span className="result-time">16:45:28</span>
                      <span className="result-type">Port</span>
                      <span className="result-detail">22/tcp - SSH Open</span>
                    </div>
                    <div className="result-entry">
                      <span className="result-time">16:45:25</span>
                      <span className="result-type">Port</span>
                      <span className="result-detail">80/tcp - HTTP Open</span>
                    </div>
                    <div className="result-entry">
                      <span className="result-time">16:45:20</span>
                      <span className="result-type">Port</span>
                      <span className="result-detail">443/tcp - HTTPS Open</span>
                    </div>
                    <div className="result-entry">
                      <span className="result-time">16:45:15</span>
                      <span className="result-type">Service</span>
                      <span className="result-detail">Apache 2.4.41 on port 80</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'exploitation' && (
            <div className="exploitation-container">
              <div className="tool-header">
                <h3 className="panel-title">Exploitation Framework</h3>
                <div className="tool-status">
                  <span className="status-indicator online"></span>
                  Handler Active
                </div>
              </div>
              
              <div className="exploitation-content">
                <div className="exploits-list">
                  <div className="exploits-header">
                    <h4>Available Exploits</h4>
                    <input 
                      type="text" 
                      placeholder="Search exploits..." 
                      className="exploits-search" 
                      onChange={(e) => console.log('Search:', e.target.value)}
                    />
                  </div>
                  <div className="exploits-categories">
                    <span className="exploit-category active">All</span>
                    <span className="exploit-category">Remote</span>
                    <span className="exploit-category">Local</span>
                    <span className="exploit-category">Web</span>
                    <span className="exploit-category">DoS</span>
                  </div>
                  <div className="exploits-items">
                    {["CVE-2021-44228 (Log4Shell)", "CVE-2022-22965 (Spring4Shell)", 
                      "CVE-2021-41773 (Apache Path Traversal)", "CVE-2022-26134 (Atlassian Confluence)", 
                      "CVE-2022-27518 (Citrix Auth Bypass)", "CVE-2021-34527 (PrintNightmare)"].map((exploit, i) => (
                      <div key={i} className={`exploit-item ${i === 1 ? 'selected' : ''}`}>
                        <div className="exploit-name">{exploit}</div>
                        <div className="exploit-rating" style={{
                          backgroundColor: i % 3 === 0 ? 'rgba(255, 0, 0, 0.2)' : 
                                           i % 3 === 1 ? 'rgba(255, 165, 0, 0.2)' : 
                                           'rgba(0, 200, 100, 0.2)',
                          color: i % 3 === 0 ? 'rgb(255, 50, 50)' : 
                                 i % 3 === 1 ? 'rgb(255, 165, 0)' : 
                                 'rgb(0, 200, 100)',
                        }}>
                          {i % 3 === 0 ? 'Critical' : i % 3 === 1 ? 'High' : 'Medium'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="exploit-details">
                  <h4 className="exploit-title">CVE-2022-22965 (Spring4Shell)</h4>
                  <div className="exploit-description">
                    Remote Code Execution vulnerability in Spring Framework. This vulnerability allows attackers to execute arbitrary code via crafted HTTP requests.
                  </div>
                  
                  <div className="exploit-config">
                    <div className="config-section">
                      <h5>Target Settings</h5>
                      <div className="config-form">
                        <div className="form-group">
                          <label>Remote Host</label>
                          <input type="text" value="192.168.1.10" />
                        </div>
                        <div className="form-group">
                          <label>Remote Port</label>
                          <input type="text" value="8080" />
                        </div>
                        <div className="form-group">
                          <label>Target URI</label>
                          <input type="text" value="/spring-app" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="config-section">
                      <h5>Payload Settings</h5>
                      <div className="config-form">
                        <div className="form-group">
                          <label>Payload Type</label>
                          <select>
                            <option>Reverse TCP Shell</option>
                            <option>Meterpreter</option>
                            <option>Command Execution</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Local Host</label>
                          <input type="text" value="192.168.1.5" />
                        </div>
                        <div className="form-group">
                          <label>Local Port</label>
                          <input type="text" value="4444" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="exploit-actions">
                    <button className="exploit-check">Check Vulnerability</button>
                    <button className="exploit-run">Launch Exploit</button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'ai-tools' && (
            <div className="ai-tools-container">
              <div className="tool-header">
                <h3 className="panel-title">AI-Powered Security Tools</h3>
                <div className="ai-model-selector">
                  <span>Engine:</span>
                  <select className="ai-model">
                    <option>GPT-4 Pentesting</option>
                    <option>CyberLLM 7B</option>
                    <option>DeepHack 12B</option>
                  </select>
                </div>
              </div>
              
              <div className="ai-visualizer">
                <Canvas
                  camera={{
                    position: [0, 0, 5],
                    fov: 50,
                    near: 0.1,
                    far: 100
                  }}
                >
                  <ambientLight intensity={0.2} />
                  <pointLight position={[10, 10, 10]} intensity={0.8} />
                  <pointLight position={[-10, -10, -10]} color="#bf00ff" intensity={0.5} />
                  
                  <group>
                    <mesh position={[0, 0, 0]} rotation={[0, Math.PI * 0.1, 0]}>
                      <sphereGeometry args={[1.5, 32, 32]} />
                      <meshStandardMaterial 
                        color="#0088ff" 
                        wireframe={true} 
                        transparent={true}
                        opacity={0.3}
                      />
                    </mesh>
                    
                    <mesh position={[0, 0, 0]} rotation={[0, -Math.PI * 0.05, 0]}>
                      <sphereGeometry args={[1.2, 16, 16]} />
                      <meshStandardMaterial 
                        color="#00ffff" 
                        wireframe={true} 
                        transparent={true}
                        opacity={0.5}
                      />
                    </mesh>
                    
                    {/* Animated nodes */}
                    {Array.from({ length: 15 }).map((_, i) => (
                      <mesh 
                        key={i} 
                        position={[
                          Math.sin(i * Math.PI * 2 / 15) * 1.8, 
                          Math.cos(i * Math.PI * 2 / 15) * 1.8,
                          Math.sin(i * Math.PI * 0.7) * 1.8
                        ]}
                      >
                        <sphereGeometry args={[0.05, 8, 8]} />
                        <meshStandardMaterial 
                          color={i % 3 === 0 ? "#ff00ff" : i % 3 === 1 ? "#00ffff" : "#ffff00"} 
                          emissive={i % 3 === 0 ? "#ff00ff" : i % 3 === 1 ? "#00ffff" : "#ffff00"}
                          emissiveIntensity={0.5}
                        />
                      </mesh>
                    ))}
                    
                    {/* Neural connections */}
                    {Array.from({ length: 20 }).map((_, i) => (
                      <mesh 
                        key={`line-${i}`} 
                        position={[
                          Math.sin(i * Math.PI * 0.3) * 0.8, 
                          Math.cos(i * Math.PI * 0.5) * 0.8,
                          Math.sin(i * Math.PI * 0.1) * 0.8
                        ]}
                        rotation={[
                          Math.random() * Math.PI, 
                          Math.random() * Math.PI, 
                          Math.random() * Math.PI
                        ]}
                      >
                        <cylinderGeometry args={[0.01, 0.01, 2, 3]} />
                        <meshStandardMaterial 
                          color="#00ffff" 
                          transparent={true}
                          opacity={0.3}
                          emissive="#00ffff"
                          emissiveIntensity={0.3}
                        />
                      </mesh>
                    ))}
                  </group>
                </Canvas>
              </div>
            
              <div className="ai-tools-grid">
                <div className="ai-tool-card">
                  <div className="ai-tool-icon">🔍</div>
                  <div className="ai-tool-name">AI Reconnaissance</div>
                  <div className="ai-tool-description">
                    Automated target discovery and vulnerability identification using machine learning.
                  </div>
                  <button className="ai-tool-button">Launch</button>
                </div>
                
                <div className="ai-tool-card">
                  <div className="ai-tool-icon">🔐</div>
                  <div className="ai-tool-name">Password Cracking</div>
                  <div className="ai-tool-description">
                    AI-assisted password prediction and hash cracking with adaptive learning.
                  </div>
                  <button className="ai-tool-button">Launch</button>
                </div>
                
                <div className="ai-tool-card">
                  <div className="ai-tool-icon">🧠</div>
                  <div className="ai-tool-name">Exploit Generator</div>
                  <div className="ai-tool-description">
                    Generate custom exploits for identified vulnerabilities using GPT models.
                  </div>
                  <button className="ai-tool-button">Launch</button>
                </div>
                
                <div className="ai-tool-card">
                  <div className="ai-tool-icon">📊</div>
                  <div className="ai-tool-name">Threat Analysis</div>
                  <div className="ai-tool-description">
                    AI-powered analysis of potential threats and attack vectors with risk scoring.
                  </div>
                  <button className="ai-tool-button">Launch</button>
                </div>
                
                <div className="ai-tool-card">
                  <div className="ai-tool-icon">💬</div>
                  <div className="ai-tool-name">Social Engineering</div>
                  <div className="ai-tool-description">
                    Generate targeted phishing campaigns with AI-optimized content.
                  </div>
                  <button className="ai-tool-button">Launch</button>
                </div>
                
                <div className="ai-tool-card">
                  <div className="ai-tool-icon">🛡️</div>
                  <div className="ai-tool-name">Defense Bypass</div>
                  <div className="ai-tool-description">
                    AI techniques to evade security systems and bypass defensive measures.
                  </div>
                  <button className="ai-tool-button">Launch</button>
                </div>
              </div>
            </div>
          )}
        
          {activeTab === 'systems' && (
            <div className="systems-container">
              <h3 className="panel-title">Connected Systems</h3>
              <div className="systems-grid">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="system-card">
                    <div className="system-icon">💻</div>
                    <div className="system-name">System-{i+1}</div>
                    <div className="system-status">
                      <span className="status-dot online"></span> 
                      Online
                    </div>
                    <div className="system-details">
                      <div>IP: 192.168.1.{10+i}</div>
                      <div>Ports: 22, 80, 443</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Subtle footer with version info */}
      <div className="hud-footer">
        <div className="version-info">PENTEST AI v2.5.4</div>
        <div className="hud-shortcuts">
          <div className="shortcut-item" title="Toggle Console">
            <span className="shortcut-key">C</span>
          </div>
          <div className="shortcut-item" title="Menu">
            <span className="shortcut-key">M</span>
          </div>
          <div className="shortcut-item" title="Interact">
            <span className="shortcut-key">E</span>
          </div>
        </div>
      </div>
    </div>
  );
}
