import { APP_CONFIG, isDemoMode, isProductionMode, hasFeature, isFeatureEnabled } from '@/config/app.config';

// Feature Flag Hook
export const useFeatureFlag = (flag: string) => {
  return isFeatureEnabled(flag);
};

// App Configuration Hook
export const useAppConfig = () => {
  return APP_CONFIG;
};

// Mode Detection Hooks
export const useIsDemoMode = () => {
  return isDemoMode();
};

export const useIsProductionMode = () => {
  return isProductionMode();
};

// Feature-specific hooks
export const useSecurityTests = () => {
  return hasFeature('securityTests');
};

export const useUIUXTests = () => {
  return hasFeature('uiuxTests');
};

export const useDebugPanel = () => {
  return hasFeature('debugPanel');
};

export const useMockData = () => {
  return hasFeature('mockData');
};

export const useGuestAccess = () => {
  return hasFeature('guestAccess');
};

// Mode-specific feature hooks
export const useDemoFeatures = () => {
  return {
    allowGuestAccess: APP_CONFIG.demo.allowGuestAccess,
    mockData: APP_CONFIG.demo.mockData,
    skipAuth: APP_CONFIG.demo.skipAuth,
    showDebugInfo: APP_CONFIG.demo.showDebugInfo,
    enableLogging: APP_CONFIG.demo.enableLogging
  };
};

export const useProductionFeatures = () => {
  return {
    requireAuth: APP_CONFIG.production.requireAuth,
    realPayments: APP_CONFIG.production.realPayments,
    strictValidation: APP_CONFIG.production.strictValidation,
    showDebugInfo: APP_CONFIG.production.showDebugInfo,
    enableLogging: APP_CONFIG.production.enableLogging
  };
};