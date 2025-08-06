import { useState, useEffect } from "react";

/**
 * A hook that creates a typewriter effect for text
 * @param text The text to animate
 * @param speed The speed of typing in milliseconds
 * @param startDelay Optional delay before starting the animation
 * @returns The currently displayed text
 */
export function useTypewriter(
  text: string,
  speed: number = 50,
  startDelay: number = 0
): string {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  
  // Handle start delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsStarted(true);
    }, startDelay);
    
    return () => clearTimeout(timer);
  }, [startDelay]);
  
  // Handle text update - reset if text changes
  useEffect(() => {
    setCurrentIndex(0);
    setDisplayedText("");
  }, [text]);
  
  // Handle typewriter effect
  useEffect(() => {
    if (!isStarted) return;
    
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, speed, text, isStarted]);
  
  return displayedText;
}
