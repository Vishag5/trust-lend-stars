// App Configuration System
export const APP_CONFIG = {
  mode: import.meta.env.VITE_APP_MODE || 'demo',
  env: import.meta.env.VITE_APP_ENV || 'development',
  debug: import.meta.env.VITE_APP_DEBUG === 'true',
  mockData: import.meta.env.VITE_APP_MOCK_DATA === 'true',
  
  // Feature Flags
  features: {
    securityTests: import.meta.env.VITE_ENABLE_SECURITY_TESTS === 'true',
    uiuxTests: import.meta.env.VITE_ENABLE_UIUX_TESTS === 'true',
    debugPanel: import.meta.env.VITE_ENABLE_DEBUG_PANEL === 'true',
    mockData: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true',
    guestAccess: import.meta.env.VITE_ENABLE_GUEST_ACCESS === 'true',
  },
  
  // Mode Settings
  demo: {
    allowGuestAccess: import.meta.env.VITE_ENABLE_GUEST_ACCESS === 'true',
    mockData: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true',
    skipAuth: import.meta.env.VITE_SKIP_AUTH === 'true',
    showDebugInfo: import.meta.env.VITE_SHOW_DEBUG_INFO === 'true',
    enableLogging: import.meta.env.VITE_ENABLE_LOGGING === 'true'
  },
  production: {
    requireAuth: import.meta.env.VITE_REQUIRE_AUTH === 'true',
    realPayments: import.meta.env.VITE_REAL_PAYMENTS === 'true',
    strictValidation: import.meta.env.VITE_STRICT_VALIDATION === 'true',
    showDebugInfo: import.meta.env.VITE_SHOW_DEBUG_INFO === 'true',
    enableLogging: import.meta.env.VITE_ENABLE_LOGGING === 'true'
  }
};

// Mode Detection
export const isDemoMode = () => APP_CONFIG.mode === 'demo';
export const isProductionMode = () => APP_CONFIG.mode === 'production';

// Feature Flag Helpers
export const hasFeature = (feature: keyof typeof APP_CONFIG.features) => {
  return APP_CONFIG.features[feature];
};

export const isFeatureEnabled = (feature: string) => {
  return APP_CONFIG.features[feature as keyof typeof APP_CONFIG.features] || false;
};

// Mode-specific helpers
export const getModeConfig = () => {
  return isDemoMode() ? APP_CONFIG.demo : APP_CONFIG.production;
};

// Environment helpers
export const isDevelopment = () => APP_CONFIG.env === 'development';
export const isProduction = () => APP_CONFIG.env === 'production';