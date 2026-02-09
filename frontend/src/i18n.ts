import { createI18n } from 'vue-i18n';
import enCommon from './locales/en/common.json';
import enDashboard from './locales/en/dashboard.json';
import srLatCommon from './locales/sr-lat/common.json';
import srLatDashboard from './locales/sr-lat/dashboard.json';
import srCyrCommon from './locales/sr-cyr/common.json';
import srCyrDashboard from './locales/sr-cyr/dashboard.json';

const messages = {
  en: { ...enCommon, ...enDashboard },
  'sr-lat': { ...srLatCommon, ...srLatDashboard },
  'sr-cyr': { ...srCyrCommon, ...srCyrDashboard },
};

export const i18n = createI18n({
  legacy: false,
  locale: 'sr-lat',
  fallbackLocale: 'en',
  messages,
});
