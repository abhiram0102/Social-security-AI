import { create } from "zustand";
import { getLocalStorage, setLocalStorage } from "../utils";

interface SettingsState {
  isMuted: boolean;
  useGlitchEffect: boolean;
  performanceMode: boolean;
  
  // Actions
  toggleMute: () => void;
  toggleGlitchEffect: () => void;
  togglePerformanceMode: () => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS = {
  isMuted: true,
  useGlitchEffect: true,
  performanceMode: false
};

// Get saved settings from localStorage or use defaults
const getSavedSettings = () => {
  const savedSettings = getLocalStorage("pentestAI-settings");
  return savedSettings || DEFAULT_SETTINGS;
};

export const useSettings = create<SettingsState>((set) => {
  const savedSettings = getSavedSettings();
  
  return {
    // Initial state from localStorage
    isMuted: savedSettings.isMuted,
    useGlitchEffect: savedSettings.useGlitchEffect,
    performanceMode: savedSettings.performanceMode,
    
    // Toggle mute state
    toggleMute: () => {
      set((state) => {
        const newSettings = { ...state, isMuted: !state.isMuted };
        setLocalStorage("pentestAI-settings", newSettings);
        return newSettings;
      });
    },
    
    // Toggle glitch effect
    toggleGlitchEffect: () => {
      set((state) => {
        const newSettings = { ...state, useGlitchEffect: !state.useGlitchEffect };
        setLocalStorage("pentestAI-settings", newSettings);
        return newSettings;
      });
    },
    
    // Toggle performance mode
    togglePerformanceMode: () => {
      set((state) => {
        const newSettings = { ...state, performanceMode: !state.performanceMode };
        setLocalStorage("pentestAI-settings", newSettings);
        return newSettings;
      });
    },
    
    // Reset all settings to defaults
    resetSettings: () => {
      setLocalStorage("pentestAI-settings", DEFAULT_SETTINGS);
      set(DEFAULT_SETTINGS);
    }
  };
});
