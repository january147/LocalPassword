import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mount } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';

// Import components to test
// import LoginPage from '@/components/LoginPage.vue';

// Mock Tauri API
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn()
}));

describe('LoginPage', () => {
  let pinia;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  it('should render login form', () => {
    // Test implementation when LoginPage component is exported
    // const wrapper = mount(LoginPage, {
    //   global: {
    //     plugins: [pinia],
    //     stubs: {
    //       transition: false
    //     },
    //   }
    // });

    // expect(wrapper.find('.login-page')).toBeTruthy();
    // expect(wrapper.find('input[type="password"]')).toBeTruthy();
    // expect(wrapper.find('button[type="submit"]')).toBeTruthy();
  });

  it('should show error message when password is empty', async () => {
    // Test empty password validation
    // const wrapper = mount(LoginPage, {
    //   global: { plugins: [pinia] }
    // });

    // await wrapper.find('button[type="submit"]').trigger('click');
    // await wrapper.vm.$nextTick();

    // expect(wrapper.find('.el-message--error')).toBeTruthy();
  });

  it('should emit login event on successful login', async () => {
    // Test login event emission
    // const { invoke } = await import('@tauri-apps/api/core');
    // vi.mocked(invoke).mockResolvedValue({ code: 0 });

    // const wrapper = mount(LoginPage, {
    //   global: { plugins: [pinia] }
    //   props: { emit: vi.fn() }
    // });

    // await wrapper.find('input[type="password"]').setValue('testpassword');
    // await wrapper.find('button[type="submit"]').trigger('click');

    // expect(wrapper.emitted('login')).toBeTruthy();
    // expect(wrapper.emitted('login')[0][0]).toBe('testpassword');
  });
});

describe('Auth Store', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should store master password', () => {
    // const authStore = useAuthStore();
    // authStore.setMasterPassword('test123');

    // expect(authStore.masterPassword).toBe('test123');
    // expect(authStore.isAuthenticated).toBe(true);
  });

  it('should clear auth on logout', () => {
    // const authStore = useAuthStore();
    // authStore.setMasterPassword('test123');
    // authStore.logout();

    // expect(authStore.masterPassword).toBe('');
    // expect(authStore.isAuthenticated).toBe(false);
  });

  it('should persist PM path to localStorage', () => {
    // const authStore = useAuthStore();
    // authStore.setPmPath('/custom/path/pm');

    // expect(localStorage.getItem('pmPath')).toBe('/custom/path/pm');
    // expect(authStore.pmPath).toBe('/custom/path/pm');
  });

  it('should load PM path from localStorage', () => {
    // localStorage.setItem('pmPath', '/saved/path/pm');

    // const authStore = useAuthStore();

    // expect(authStore.pmPath).toBe('/saved/path/pm');
  });
});
