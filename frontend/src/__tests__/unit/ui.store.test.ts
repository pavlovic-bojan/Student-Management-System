import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUiStore } from '@/stores/ui';

describe('ui store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('toggleLeftDrawer flips leftDrawerOpen', () => {
    const store = useUiStore();
    expect(store.leftDrawerOpen).toBe(false);
    store.toggleLeftDrawer();
    expect(store.leftDrawerOpen).toBe(true);
    store.toggleLeftDrawer();
    expect(store.leftDrawerOpen).toBe(false);
  });

  it('closeLeftDrawer sets leftDrawerOpen to false', () => {
    const store = useUiStore();
    store.leftDrawerOpen = true;
    store.closeLeftDrawer();
    expect(store.leftDrawerOpen).toBe(false);
  });

  it('openSubmitDrawer and closeSubmitDrawer', () => {
    const store = useUiStore();
    expect(store.submitDrawerOpen).toBe(false);
    store.openSubmitDrawer();
    expect(store.submitDrawerOpen).toBe(true);
    store.closeSubmitDrawer();
    expect(store.submitDrawerOpen).toBe(false);
  });

  it('openCreateUserDrawer and closeCreateUserDrawer', () => {
    const store = useUiStore();
    expect(store.createUserDrawerOpen).toBe(false);
    store.openCreateUserDrawer();
    expect(store.createUserDrawerOpen).toBe(true);
    store.closeCreateUserDrawer();
    expect(store.createUserDrawerOpen).toBe(false);
  });
});
