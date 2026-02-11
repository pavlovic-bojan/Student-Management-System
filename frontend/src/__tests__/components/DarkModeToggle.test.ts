import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { Quasar } from 'quasar';
import { i18n } from '@/i18n';
import DarkModeToggle from '@/components/common/DarkModeToggle.vue';

describe('DarkModeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('toggles dark mode preference in localStorage', async () => {
    const wrapper = mount(DarkModeToggle, {
      global: {
        plugins: [Quasar, i18n],
      },
    });

    const btn = wrapper.get('[data-test=\"button-dark-mode-toggle\"]');

    expect(localStorage.getItem('darkMode')).toBeNull();

    await btn.trigger('click');
    expect(localStorage.getItem('darkMode')).toBe('true');

    await btn.trigger('click');
    expect(localStorage.getItem('darkMode')).toBe('false');
  });
});

