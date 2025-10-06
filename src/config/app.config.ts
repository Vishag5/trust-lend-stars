export const APP_CONFIG = {
  mode: import.meta.env.VITE_APP_MODE || "demo",
  env: import.meta.env.VITE_APP_ENV || "development",
  debug: import.meta.env.VITE_APP_DEBUG === "true",
  mockData: import.meta.env.VITE_APP_MOCK_DATA === "true",
  
  features: {
    demo: {
      allowGuestAccess: true,
      mockData: true,
      skipAuth: true,
      showDebugInfo: true,
      enableLogging: true
    },
    production: {
      requireAuth: true,
      realPayments: true,
      strictValidation: true,
      showDebugInfo: false,
      enableLogging: false
    }
  }
};

export const isDemoMode = () => APP_CONFIG.mode === "demo";
export const isProductionMode = () => APP_CONFIG.mode === "production";
