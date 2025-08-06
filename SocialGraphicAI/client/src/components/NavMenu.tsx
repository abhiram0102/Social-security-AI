import { useState } from "react";
import { useKeyboardControls } from "@react-three/drei";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function NavMenu() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Menu keyboard control
  const isMenuPressed = useKeyboardControls((state) => state.menu);
  
  useEffect(() => {
    if (isMenuPressed) {
      setIsOpen(prev => !prev);
    }
  }, [isMenuPressed]);

  const menuVariants = {
    hidden: { x: "-100%", opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        damping: 25, 
        stiffness: 500 
      }
    },
    exit: { 
      x: "-100%", 
      opacity: 0,
      transition: { 
        duration: 0.3 
      }
    }
  };

  const menuItemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: (i: number) => ({ 
      x: 0, 
      opacity: 1,
      transition: { 
        delay: i * 0.1,
        duration: 0.5
      }
    })
  };

  return (
    <>
      {/* Floating nav button */}
      <button 
        className="nav-toggle"
        onClick={() => setIsOpen(prev => !prev)}
        aria-label="Toggle navigation menu"
      >
        <div className={`nav-icon ${isOpen ? 'open' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
      
      {/* Full menu panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="nav-menu"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={menuVariants}
          >
            <div className="nav-header">
              <div className="nav-logo">PENTEST<span className="text-neon-cyan">AI</span></div>
              <button 
                className="nav-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close navigation menu"
              >
                ×
              </button>
            </div>
            
            <ul className="nav-items">
              {[
                { name: "Dashboard", icon: "🏠" },
                { name: "Scan Network", icon: "🔍" },
                { name: "Vulnerabilities", icon: "⚠️" },
                { name: "Exploits", icon: "⚡" },
                { name: "Reports", icon: "📊" },
                { name: "Settings", icon: "⚙️" },
                { name: "Help", icon: "❓" }
              ].map((item, i) => (
                <motion.li 
                  key={item.name} 
                  className="nav-item"
                  custom={i}
                  variants={menuItemVariants}
                  initial="hidden"
                  animate="visible"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="nav-item-icon">{item.icon}</span>
                  {item.name}
                </motion.li>
              ))}
            </ul>
            
            <div className="nav-footer">
              <div className="nav-version">PentestAI v1.0.3</div>
              <div className="nav-status">Connected</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Overlay when menu is open */}
      {isOpen && (
        <div 
          className="nav-overlay"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
}
