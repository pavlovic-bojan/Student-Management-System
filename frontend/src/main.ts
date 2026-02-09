import { createApp } from 'vue';
import { Quasar } from 'quasar';
import { createPinia } from 'pinia';
import { i18n } from './i18n';
import router from './router';
import App from './App.vue';

// Icon font (same as Park – required for q-icon to display)
import '@quasar/extras/material-icons/material-icons.css';

import 'quasar/src/css/index.sass';
import './css/app.scss';
import './css/tailwind.css';

const app = createApp(App);

app.use(Quasar, {
  plugins: { Dark: true },
});

app.use(createPinia());
app.use(i18n);
app.use(router);

app.mount('#q-app');

// Apply saved theme after mount (Quasar Dark)
const darkModePreference = localStorage.getItem('darkMode');
if (darkModePreference === 'true') {
  import('quasar').then(({ Dark }) => {
    Dark.set(true);
  });
}

