import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useProductionAuthStore } from '@/store/productionAuthStore';

export type AppMode = 'demo' | 'production';

export function useModeManager() {
  const { isAdmin: demoIsAdmin } = useAuthStore();
  const { isAdmin: prodIsAdmin } = useProductionAuthStore();
  const [currentMode, setCurrentMode] = useState<AppMode>('production'); // Default to production
  const [isModeLocked, setIsModeLocked] = useState(false);

  // Initialize mode from localStorage or default to production
  useEffect(() => {
    // Clear any existing mode and force production
    localStorage.removeItem('app-mode');
    setCurrentMode('production');
  }, []);

  // Save mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('app-mode', currentMode);
  }, [currentMode]);

  // Get the appropriate admin status based on current mode
  const isAdmin = currentMode === 'demo' ? demoIsAdmin : prodIsAdmin;

  // Lock mode for non-admin users
  useEffect(() => {
    // All users should be in production mode by default
    setCurrentMode('production');
    
    if (!isAdmin) {
      setIsModeLocked(true); // Regular users can't switch to demo mode
    } else {
      setIsModeLocked(false); // Admins can switch modes
    }
  }, [isAdmin]);

  const changeMode = (mode: AppMode) => {
    if (!isModeLocked && isAdmin) {
      setCurrentMode(mode);
    }
  };

  const toggleMode = () => {
    if (!isModeLocked && isAdmin) {
      setCurrentMode(currentMode === 'demo' ? 'production' : 'demo');
    }
  };

  return {
    currentMode,
    isModeLocked,
    isAdmin,
    changeMode,
    toggleMode,
    canChangeMode: !isModeLocked && isAdmin
  };
}
