// Environment security configuration
export const ENV_CONFIG = {
  NODE_ENV: import.meta.env.MODE || "development",
  APP_MODE: import.meta.env.VITE_APP_MODE || "demo",
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
};

// Validate required environment variables
export function validateEnvironment() {
  const required = ["SUPABASE_URL", "SUPABASE_KEY"];
  const missing = required.filter(key => !ENV_CONFIG[key as keyof typeof ENV_CONFIG]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
  
  return true;
}

// Secure API key handling
export function getSecureConfig() {
  validateEnvironment();
  return {
    supabaseUrl: ENV_CONFIG.SUPABASE_URL,
    supabaseKey: ENV_CONFIG.SUPABASE_KEY,
    isProduction: ENV_CONFIG.APP_MODE === "production",
    isDemo: ENV_CONFIG.APP_MODE === "demo",
  };
}
