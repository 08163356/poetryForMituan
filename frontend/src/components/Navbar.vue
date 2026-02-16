<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useThemeStore } from '../stores/theme';

const router = useRouter();
const authStore = useAuthStore();
const themeStore = useThemeStore();
const showMobileMenu = ref(false);

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
  showMobileMenu.value = false;
};

const toggleMenu = () => {
  showMobileMenu.value = !showMobileMenu.value;
};

const closeMenu = () => {
  showMobileMenu.value = false;
};
</script>

<template>
  <nav class="sticky top-0 z-50 glass border-b border-white/20 dark:border-ink-700/30">
    <div class="max-w-6xl mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <router-link to="/" class="flex items-center space-x-2" @click="closeMenu">
          <span class="text-2xl">🌸</span>
          <span class="text-xl font-serif font-semibold text-ancient-gradient">诗词古韵</span>
        </router-link>

        <!-- 桌面端菜单 -->
        <div class="hidden md:flex items-center space-x-6">
          <router-link to="/" class="btn-ghost">首页</router-link>
          <template v-if="authStore.isLoggedIn">
            <router-link to="/create" class="btn-ghost">创作</router-link>
            <router-link v-if="authStore.isAdmin" to="/admin" class="btn-ghost">管理</router-link>
            <router-link to="/profile" class="btn-ghost">
              {{ authStore.user?.nickname }}
            </router-link>
            <button @click="handleLogout" class="btn-ghost text-red-500">退出</button>
          </template>
          <template v-else>
            <router-link to="/login" class="btn-secondary">登录</router-link>
            <router-link to="/register" class="btn-primary">注册</router-link>
          </template>
          
          <!-- 主题切换 -->
          <button 
            @click="themeStore.toggleTheme" 
            class="p-2 rounded-full hover:bg-primary-100 dark:hover:bg-ink-700 transition-colors"
            :title="themeStore.isDark ? '切换到日间模式' : '切换到夜间模式'"
          >
            <span v-if="themeStore.isDark" class="text-xl">🌙</span>
            <span v-else class="text-xl">☀️</span>
          </button>
        </div>

        <!-- 移动端菜单按钮 -->
        <div class="flex md:hidden items-center space-x-2">
          <button 
            @click="themeStore.toggleTheme" 
            class="p-2 rounded-full hover:bg-primary-100 dark:hover:bg-ink-700 transition-colors"
          >
            <span v-if="themeStore.isDark" class="text-xl">🌙</span>
            <span v-else class="text-xl">☀️</span>
          </button>
          <button 
            @click="toggleMenu" 
            class="p-2 rounded-lg hover:bg-primary-100 dark:hover:bg-ink-700 transition-colors"
          >
            <svg v-if="!showMobileMenu" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 移动端菜单 -->
    <transition name="slide">
      <div v-if="showMobileMenu" class="md:hidden glass border-t border-white/20 dark:border-ink-700/30">
        <div class="px-4 py-4 space-y-3">
          <router-link to="/" class="block py-2 px-4 rounded-lg hover:bg-primary-100 dark:hover:bg-ink-700" @click="closeMenu">
            首页
          </router-link>
          <template v-if="authStore.isLoggedIn">
            <router-link to="/create" class="block py-2 px-4 rounded-lg hover:bg-primary-100 dark:hover:bg-ink-700" @click="closeMenu">
              创作
            </router-link>
            <router-link v-if="authStore.isAdmin" to="/admin" class="block py-2 px-4 rounded-lg hover:bg-primary-100 dark:hover:bg-ink-700" @click="closeMenu">
              后台管理
            </router-link>
            <router-link to="/profile" class="block py-2 px-4 rounded-lg hover:bg-primary-100 dark:hover:bg-ink-700" @click="closeMenu">
              个人中心 ({{ authStore.user?.nickname }})
            </router-link>
            <button @click="handleLogout" class="w-full text-left py-2 px-4 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
              退出登录
            </button>
          </template>
          <template v-else>
            <router-link to="/login" class="block py-2 px-4 rounded-lg hover:bg-primary-100 dark:hover:bg-ink-700" @click="closeMenu">
              登录
            </router-link>
            <router-link to="/register" class="block py-2 px-4 rounded-lg bg-primary-400 text-white hover:bg-primary-500" @click="closeMenu">
              注册
            </router-link>
          </template>
        </div>
      </div>
    </transition>
  </nav>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  max-height: 400px;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
