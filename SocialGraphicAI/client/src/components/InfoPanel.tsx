import { useEffect, useState } from "react";

type InfoPanelProps = {
  title: string;
  value: string;
  icon?: string;
};

export function InfoPanel({ title, value, icon }: InfoPanelProps) {
  const [visible, setVisible] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);
  
  // Entry animation + occasional glitch effect
  useEffect(() => {
    // Delayed appearance
    const showTimer = setTimeout(() => {
      setVisible(true);
    }, Math.random() * 500 + 200);
    
    // Random glitch effect
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.8) {
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 200);
      }
    }, 3000);
    
    return () => {
      clearTimeout(showTimer);
      clearInterval(glitchInterval);
    };
  }, []);

  return (
    <div className={`info-panel ${visible ? 'visible' : ''} ${glitchActive ? 'glitch' : ''}`}>
      <div className="info-panel-header">
        {icon && <span className="info-icon">{icon}</span>}
        <h3 className="info-title">{title}</h3>
      </div>
      <div className="info-value">{value}</div>
      
      {/* Grid overlay for cyberpunk effect */}
      <div className="info-panel-grid"></div>
      
      {/* Animated corners */}
      <div className="corner top-left"></div>
      <div className="corner top-right"></div>
      <div className="corner bottom-left"></div>
      <div className="corner bottom-right"></div>
    </div>
  );
}
