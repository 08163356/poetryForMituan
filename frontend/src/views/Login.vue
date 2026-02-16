<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const form = reactive({
  username: 'family1',
  password: 'family123',
});

const error = ref('');
const showPassword = ref(false);

const handleSubmit = async () => {
  error.value = '';
  
  if (!form.username || !form.password) {
    error.value = '请输入用户名和密码';
    return;
  }

  const result = await authStore.login(form.username, form.password);
  
  if (result.success) {
    const redirect = route.query.redirect as string;
    router.push(redirect || '/');
  } else {
    error.value = result.message || '登录失败';
  }
};
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <div class="glass-card p-8 animate-fade-in">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="text-5xl mb-3">🌸</div>
          <h1 class="text-2xl font-serif font-bold text-ancient-gradient">诗词古韵</h1>
          <p class="text-ink-500 dark:text-ink-400 mt-2">登录以继续</p>
        </div>

        <!-- 错误提示 -->
        <div v-if="error" class="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {{ error }}
        </div>

        <!-- 登录表单 -->
        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1.5">
              用户名
            </label>
            <input 
              v-model="form.username"
              type="text"
              class="input"
              placeholder="请输入用户名"
              autocomplete="username"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1.5">
              密码
            </label>
            <div class="relative">
              <input 
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="input pr-10"
                placeholder="请输入密码"
                autocomplete="current-password"
              />
              <button 
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
              >
                {{ showPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            class="btn-primary w-full py-3"
            :disabled="authStore.loading"
          >
            <span v-if="authStore.loading" class="flex items-center justify-center">
              <span class="loading-dots mr-2">
                <span></span><span></span><span></span>
              </span>
              登录中...
            </span>
            <span v-else>登录</span>
          </button>
        </form>

        <!-- 注册链接 -->
        <p class="mt-6 text-center text-ink-500 dark:text-ink-400">
          还没有账号？
          <router-link to="/register" class="text-primary-500 hover:text-primary-600 font-medium">
            申请访问
          </router-link>
        </p>
      </div>

      <!-- 预设账号提示 -->
      <div class="mt-6 glass-card p-4 text-center text-sm text-ink-500 dark:text-ink-400">
        <p class="font-medium mb-2">预设账号</p>
        <p>管理员：admin / admin123</p>
        <p>家人：family1 / family123</p>
      </div>
    </div>
  </div>
</template>
