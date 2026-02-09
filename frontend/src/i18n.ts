import { createI18n } from 'vue-i18n';
import enCommon from './locales/en/common.json';
import enDashboard from './locales/en/dashboard.json';
import enAuth from './locales/en/pages/auth.json';
import srLatCommon from './locales/sr-lat/common.json';
import srLatDashboard from './locales/sr-lat/dashboard.json';
import srLatAuth from './locales/sr-lat/pages/auth.json';
import srCyrCommon from './locales/sr-cyr/common.json';
import srCyrDashboard from './locales/sr-cyr/dashboard.json';
import srCyrAuth from './locales/sr-cyr/pages/auth.json';

const messages = {
  en: { ...enCommon, ...enDashboard, pages: { auth: enAuth } },
  'sr-lat': { ...srLatCommon, ...srLatDashboard, pages: { auth: srLatAuth } },
  'sr-cyr': { ...srCyrCommon, ...srCyrDashboard, pages: { auth: srCyrAuth } },
};

export const i18n = createI18n({
  legacy: false,
  locale: 'sr-lat',
  fallbackLocale: 'en',
  messages,
});
