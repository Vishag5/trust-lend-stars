import { APP_CONFIG } from '@/config/app.config';

export const useFeatureFlag = (flag: string) => {
  const { mode } = APP_CONFIG;
  return APP_CONFIG.features[mode][flag];
};

export const useAppConfig = () => APP_CONFIG;
