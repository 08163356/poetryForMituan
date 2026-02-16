<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useThemeStore } from './stores/theme';
import { useAuthStore } from './stores/auth';
import { onMounted } from 'vue';
import Navbar from './components/Navbar.vue';
import Footer from './components/Footer.vue';

const themeStore = useThemeStore();
const authStore = useAuthStore();

onMounted(() => {
  // 初始化用户信息
  if (authStore.token) {
    authStore.fetchUser();
  }
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-warm dark:bg-gradient-dark transition-colors duration-300">
    <!-- 背景装饰 -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <div class="absolute top-20 left-10 w-32 h-32 bg-primary-200/30 dark:bg-primary-800/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-40 right-20 w-48 h-48 bg-warm-300/30 dark:bg-primary-700/20 rounded-full blur-3xl"></div>
      <div class="absolute top-1/2 left-1/3 w-24 h-24 bg-primary-100/40 dark:bg-primary-900/20 rounded-full blur-2xl"></div>
    </div>

    <!-- 导航栏 -->
    <Navbar />

    <!-- 主内容区 -->
    <main class="flex-1 relative z-10 safe-area-inset-top safe-area-inset-bottom">
      <RouterView v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>

    <!-- 页脚 -->
    <Footer />
  </div>
</template>

<style scoped>
</style>
