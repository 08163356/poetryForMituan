import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(localStorage.getItem('theme') === 'dark');

  function toggleTheme() {
    isDark.value = !isDark.value;
  }

  function setTheme(dark: boolean) {
    isDark.value = dark;
  }

  // 监听主题变化
  watch(isDark, (newVal) => {
    localStorage.setItem('theme', newVal ? 'dark' : 'light');
    if (newVal) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, { immediate: true });

  return {
    isDark,
    toggleTheme,
    setTheme,
  };
});
