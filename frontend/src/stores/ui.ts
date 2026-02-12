import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUiStore = defineStore('ui', () => {
  const leftDrawerOpen = ref(false);
  const submitDrawerOpen = ref(false);
  const createUserDrawerOpen = ref(false);

  function toggleLeftDrawer() {
    leftDrawerOpen.value = !leftDrawerOpen.value;
  }

  function closeLeftDrawer() {
    leftDrawerOpen.value = false;
  }

  function openSubmitDrawer() {
    submitDrawerOpen.value = true;
  }

  function closeSubmitDrawer() {
    submitDrawerOpen.value = false;
  }

  function openCreateUserDrawer() {
    createUserDrawerOpen.value = true;
  }

  function closeCreateUserDrawer() {
    createUserDrawerOpen.value = false;
  }

  return {
    leftDrawerOpen,
    toggleLeftDrawer,
    closeLeftDrawer,
    submitDrawerOpen,
    openSubmitDrawer,
    closeSubmitDrawer,
    createUserDrawerOpen,
    openCreateUserDrawer,
    closeCreateUserDrawer,
  };
});

