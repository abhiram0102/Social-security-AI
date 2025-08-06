import { Suspense, useEffect, useState } from "react";
import { KeyboardControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { CyberScene } from "./components/CyberScene";
import { HudInterface } from "./components/HudInterface";
import { Terminal } from "./components/Terminal";
import { AIAssistant } from "./components/AIAssistant";
import { NavMenu } from "./components/NavMenu";
import { useAudio } from "./lib/stores/useAudio";
import { useSettings } from "./lib/stores/useSettings";
import { Toaster } from "sonner";
import "@fontsource/inter";

// Define control keys for navigation and interaction
const controls = [
  { name: "forward", keys: ["KeyW", "ArrowUp"] },
  { name: "backward", keys: ["KeyS", "ArrowDown"] },
  { name: "leftward", keys: ["KeyA", "ArrowLeft"] },
  { name: "rightward", keys: ["KeyD", "ArrowRight"] },
  { name: "interact", keys: ["KeyE"] },
  { name: "menu", keys: ["KeyM"] },
  { name: "console", keys: ["KeyC"] },
];

function App() {
  const [loading, setLoading] = useState(true);
  const [showTerminal, setShowTerminal] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const { toggleMute, isMuted } = useSettings();
  const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio();

  // Load audio files
  useEffect(() => {
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    setBackgroundMusic(bgMusic);

    const hitSfx = new Audio("/sounds/hit.mp3");
    setHitSound(hitSfx);

    const successSfx = new Audio("/sounds/success.mp3");
    setSuccessSound(successSfx);

    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
      if (!isMuted) {
        bgMusic.play().catch(err => console.log("Audio playback prevented:", err));
      }
    }, 3000);

    return () => {
      clearTimeout(timer);
      bgMusic.pause();
    };
  }, [setBackgroundMusic, setHitSound, setSuccessSound, isMuted]);

  // Toggle terminal visibility
  const handleToggleTerminal = () => {
    setShowTerminal(prev => !prev);
    if (showAIAssistant) setShowAIAssistant(false);
  };
  
  // Toggle AI Assistant visibility
  const handleToggleAIAssistant = () => {
    setShowAIAssistant(prev => !prev);
    if (showTerminal) setShowTerminal(false);
  };

  return (
    <KeyboardControls map={controls}>
      <div className="cyberpunk-app">
        {loading ? (
          <div className="loading-screen">
            <div className="loading-container">
              <div className="loading-text glitch-text" data-text="INITIALIZING SYSTEM">
                INITIALIZING SYSTEM
              </div>
              <div className="loading-bar-container">
                <div className="loading-bar"></div>
              </div>
              <div className="loading-percentage">0%</div>
            </div>
          </div>
        ) : (
          <>
            <NavMenu />

            <Canvas
              shadows
              camera={{
                position: [0, 2, 8],
                fov: 60,
                near: 0.1,
                far: 1000
              }}
              gl={{
                antialias: true,
                powerPreference: "high-performance"
              }}
            >
              <color attach="background" args={["#050510"]} />
              <fog attach="fog" args={["#070718", 10, 30]} />
              
              <Suspense fallback={null}>
                <CyberScene />
              </Suspense>
            </Canvas>

            <HudInterface 
              onToggleTerminal={handleToggleTerminal} 
              onToggleAIAssistant={handleToggleAIAssistant}
            />
            {showTerminal && <Terminal onClose={handleToggleTerminal} />}
            {showAIAssistant && <AIAssistant onClose={handleToggleAIAssistant} />}

            <div className="audio-controls">
              <button 
                className="audio-toggle" 
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? "🔇" : "🔊"}
              </button>
            </div>

            <Toaster position="top-right" theme="dark" />
          </>
        )}
      </div>
    </KeyboardControls>
  );
}

export default App;
