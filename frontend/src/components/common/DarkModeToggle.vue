<template>
  <q-btn
    flat
    round
    dense
    :icon="isDark ? 'light_mode' : 'dark_mode'"
    @click="toggleDarkMode"
    data-test="button-dark-mode-toggle"
  >
    <q-tooltip>{{ isDark ? t('theme.lightMode') : t('theme.darkMode') }}</q-tooltip>
  </q-btn>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

const $q = useQuasar();
const { t } = useI18n();

const isDark = computed(() => $q.dark.isActive);

onMounted(() => {
  const darkModePreference = localStorage.getItem('darkMode');
  if (darkModePreference === 'true' && !$q.dark.isActive) {
    $q.dark.set(true);
  } else if (darkModePreference === 'false' && $q.dark.isActive) {
    $q.dark.set(false);
  }
});

const toggleDarkMode = () => {
  $q.dark.toggle();
  localStorage.setItem('darkMode', String($q.dark.isActive));
};
</script>
