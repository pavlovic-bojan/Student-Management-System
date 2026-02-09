import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUiStore = defineStore('ui', () => {
  const leftDrawerOpen = ref(true);
  const submitDrawerOpen = ref(false);

  function toggleLeftDrawer() {
    leftDrawerOpen.value = !leftDrawerOpen.value;
  }

  function openSubmitDrawer() {
    submitDrawerOpen.value = true;
  }

  function closeSubmitDrawer() {
    submitDrawerOpen.value = false;
  }

  return {
    leftDrawerOpen,
    toggleLeftDrawer,
    submitDrawerOpen,
    openSubmitDrawer,
    closeSubmitDrawer,
  };
});

