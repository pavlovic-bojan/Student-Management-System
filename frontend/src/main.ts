import { createApp } from 'vue';
import { Quasar } from 'quasar';
import { createPinia } from 'pinia';
import { i18n } from './i18n';
import router from './router';
import App from './App.vue';

import 'quasar/src/css/index.sass';
import './css/app.scss';

const app = createApp(App);

app.use(Quasar, {
  plugins: {},
});

app.use(createPinia());
app.use(i18n);
app.use(router);

app.mount('#q-app');

