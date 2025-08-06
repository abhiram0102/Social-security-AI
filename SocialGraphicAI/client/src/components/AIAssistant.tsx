import { useState, useEffect, useRef } from "react";
import { useAudio } from "../lib/stores/useAudio";
import { motion, AnimatePresence } from "framer-motion";
import { Globe } from "./Globe";
import { useTypewriter } from "../lib/hooks/useTypewriter";
import { Canvas } from "@react-three/fiber";
import { useAIAssistant } from "../lib/stores/useAIAssistant";
import { Minimize2, Maximize2 } from "lucide-react";

type AIAssistantProps = {
  onClose: () => void;
};

export function AIAssistant({ onClose }: AIAssistantProps) {
  const [minimized, setMinimized] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcription, setTranscription] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { playHit, playSuccess } = useAudio();
  
  const {
    messages,
    inputMessage,
    isProcessing,
    stealthMode,
    sendMessage,
    setInputMessage,
    toggleStealthMode,
    clearConversation
  } = useAIAssistant();

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Simulate voice recognition
  const toggleVoiceRecognition = () => {
    if (listening) {
      // Stop listening
      setListening(false);
      playSuccess();
      
      // If we have a transcription, send it as a message
      if (transcription) {
        sendMessage(transcription);
        setTranscription("");
      }
    } else {
      // Start listening
      setListening(true);
      playHit();
      
      // Simulate speech recognition with a timeout
      const simulatedSpeechTimeout = setTimeout(() => {
        const simulatedTexts = [
          "Run a port scan on 192.168.1.10",
          "Check for vulnerabilities in the target system",
          "What exploits are available for Apache 2.4.41?",
          "Analyze the network traffic for suspicious activity"
        ];
        
        // Pick a random simulated command
        setTranscription(simulatedTexts[Math.floor(Math.random() * simulatedTexts.length)]);
        
        // Auto-stop after getting transcription
        setListening(false);
        playSuccess();
      }, 3000);
      
      return () => clearTimeout(simulatedSpeechTimeout);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && !isProcessing) {
      sendMessage(inputMessage);
    }
  };

  return (
    <motion.div 
      className={`ai-assistant ${minimized ? 'minimized' : 'fullscreen'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="ai-assistant-header">
        <div className="ai-assistant-title">
          Cybersecurity AI Assistant
          {stealthMode && <span className="stealth-mode-badge">STEALTH MODE</span>}
        </div>
        <div className="ai-assistant-controls">
          <button 
            className={`ai-control-button ${stealthMode ? 'active' : ''}`} 
            onClick={toggleStealthMode}
            title="Toggle Stealth Mode"
          >
            🔐
          </button>
          <button 
            className="ai-control-button" 
            onClick={clearConversation}
            title="Clear Conversation"
          >
            🗑️
          </button>
          <button 
            className="ai-control-button" 
            onClick={() => setMinimized(!minimized)}
            title={minimized ? "Maximize" : "Minimize"}
          >
            {minimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button 
            className="ai-assistant-close" 
            onClick={onClose}
            aria-label="Close AI Assistant"
          >
            ×
          </button>
        </div>
      </div>
      
      <div className="ai-assistant-body">
        <div className="ai-assistant-avatar-container">
          <div className="ai-avatar-wrapper">
            <div className="ai-face-container">
              <div className="ai-face">
                {isProcessing || listening ? (
                  <div className="ai-face-speaking">
                    <div className="ai-eyes">
                      <div className="ai-eye left"></div>
                      <div className="ai-eye right"></div>
                    </div>
                    <div className="ai-mouth speaking">
                      <div className="ai-mouth-line"></div>
                      <div className="ai-mouth-animation">
                        <div className="ai-mouth-wave"></div>
                        <div className="ai-mouth-wave"></div>
                        <div className="ai-mouth-wave"></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="ai-face-idle">
                    <div className="ai-eyes">
                      <div className="ai-eye left"></div>
                      <div className="ai-eye right"></div>
                    </div>
                    <div className="ai-mouth idle">
                      <div className="ai-mouth-line"></div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="ai-circuits">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="ai-circuit" 
                    style={{
                      left: `${Math.random() * 80 + 10}%`,
                      top: `${Math.random() * 80 + 10}%`,
                      width: `${Math.random() * 25 + 5}px`,
                      height: `${Math.random() * 2 + 1}px`,
                      animationDelay: `${Math.random() * 2}s`
                    }}
                  ></div>
                ))}
              </div>
              
              <div className="ai-data-overlay">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="ai-data-point" 
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 3}s`
                    }}
                  ></div>
                ))}
              </div>
            </div>
            
            <div className={`ai-assistant-voice-indicator ${listening ? 'active' : ''}`}>
              <div className="voice-wave"></div>
              <div className="voice-wave"></div>
              <div className="voice-wave"></div>
            </div>
          </div>
          
          <button 
            className={`ai-voice-button ${listening ? 'listening' : ''}`}
            onClick={toggleVoiceRecognition}
          >
            {listening ? 'Listening...' : 'Voice Input'}
          </button>
          
          {transcription && (
            <div className="transcription-text">"{transcription}"</div>
          )}
        </div>
        
        <div className="ai-assistant-chat" ref={chatContainerRef}>
          <div className="ai-welcome-message">
            <h3>Cybersecurity AI Assistant</h3>
            <p>I'm your advanced pentesting AI. I can help with:</p>
            <ul>
              <li>Vulnerability scanning & exploitation</li>
              <li>Malware analysis & simulation</li>
              <li>Network reconnaissance</li>
              <li>Security assessment reports</li>
            </ul>
            <p>What would you like to do today?</p>
          </div>
          
          {messages.map((msg: any, index: number) => (
            <div key={index} className={`ai-chat-message ${msg.role}`}>
              <div className="message-header">
                {msg.role === 'user' ? '👤 You' : '🤖 AI Assistant'}
              </div>
              <div className="message-content">{msg.content}</div>
              {msg.role === 'assistant' && msg.metadata && (
                <div className="message-metadata">
                  {msg.metadata.threatLevel && (
                    <span className={`threat-badge ${msg.metadata.threatLevel}`}>
                      {msg.metadata.threatLevel.toUpperCase()}
                    </span>
                  )}
                  {msg.metadata.tool && (
                    <span className="tool-badge">
                      {msg.metadata.tool}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
          
          {isProcessing && (
            <div className="ai-chat-message assistant">
              <div className="message-header">🤖 AI Assistant</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <form className="ai-assistant-input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="ai-assistant-input"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your security command or question..."
          disabled={isProcessing}
        />
        <button 
          type="submit" 
          className="ai-assistant-send-button"
          disabled={isProcessing || !inputMessage.trim()}
        >
          Send
        </button>
      </form>
      
      <div className="ai-assistant-footer">
        <div className="admin-options">
          <details>
            <summary>ADMIN OPTIONS</summary>
            <div className="admin-menu">
              <button className="admin-button">🕵️ View Logs</button>
              <button className="admin-button">⚙️ Attack Settings</button>
              <button className="admin-button">🧠 AI Tactics</button>
              <button className="admin-button">🚨 Alert Systems</button>
              <button className="admin-button">📊 Generate Report</button>
              <button className="admin-button">🧪 RAT Deployment</button>
            </div>
          </details>
        </div>
      </div>
    </motion.div>
  );
}