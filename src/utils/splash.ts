/**
 * Utility functions for managing splash screen behavior
 */

const SPLASH_STORAGE_KEY = "senja-app-visited";
const SPLASH_VERSION_KEY = "senja-splash-version";
const CURRENT_SPLASH_VERSION = "1.0.0";

export const splashUtils = {
  /**
   * Check if user should see splash screen
   * Returns true if:
   * - First time visitor in this session
   * - Splash screen version has been updated
   */
  shouldShowSplash(): boolean {
    if (typeof window === "undefined") return false;
    
    try {
      const hasVisited = window.sessionStorage.getItem(SPLASH_STORAGE_KEY);
      const splashVersion = window.sessionStorage.getItem(SPLASH_VERSION_KEY);
      
      // Show splash if never visited in this session or splash version changed
      return !hasVisited || splashVersion !== CURRENT_SPLASH_VERSION;
    } catch {
      console.warn("sessionStorage not available, showing splash screen");
      return true;
    }
  },

  /**
   * Mark that user has seen the splash screen in this session
   */
  markSplashSeen(): void {
    if (typeof window === "undefined") return;
    
    try {
      window.sessionStorage.setItem(SPLASH_STORAGE_KEY, "true");
      window.sessionStorage.setItem(SPLASH_VERSION_KEY, CURRENT_SPLASH_VERSION);
    } catch {
      console.warn("Could not save splash screen state to sessionStorage");
    }
  },

  /**
   * Reset splash screen state (for testing purposes)
   */
  resetSplashState(): void {
    if (typeof window === "undefined") return;
    
    try {
      window.sessionStorage.removeItem(SPLASH_STORAGE_KEY);
      window.sessionStorage.removeItem(SPLASH_VERSION_KEY);
    } catch {
      console.warn("Could not reset splash screen state");
    }
  },

  /**
   * Force splash screen to show on next visit
   */
  forceSplashOnNextVisit(): void {
    if (typeof window === "undefined") return;
    
    try {
      window.sessionStorage.removeItem(SPLASH_STORAGE_KEY);
    } catch {
      console.warn("Could not force splash screen");
    }
  }
};
