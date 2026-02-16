<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  nickname: '',
});

const error = ref('');
const success = ref('');
const showPassword = ref(false);

const handleSubmit = async () => {
  error.value = '';
  success.value = '';
  
  if (!form.username || !form.password || !form.nickname) {
    error.value = '请填写完整信息';
    return;
  }

  if (form.password !== form.confirmPassword) {
    error.value = '两次输入的密码不一致';
    return;
  }

  if (form.password.length < 6) {
    error.value = '密码长度至少6位';
    return;
  }

  const result = await authStore.register(form.username, form.password, form.nickname);
  
  if (result.success) {
    success.value = result.message || '注册申请已提交，请等待管理员审核';
    setTimeout(() => {
      router.push('/login');
    }, 3000);
  } else {
    error.value = result.message || '注册失败';
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
          <h1 class="text-2xl font-serif font-bold text-ancient-gradient">申请访问</h1>
          <p class="text-ink-500 dark:text-ink-400 mt-2">注册后需等待管理员审核</p>
        </div>

        <!-- 错误提示 -->
        <div v-if="error" class="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {{ error }}
        </div>

        <!-- 成功提示 -->
        <div v-if="success" class="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm">
          {{ success }}
        </div>

        <!-- 注册表单 -->
        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1.5">
              用户名
            </label>
            <input 
              v-model="form.username"
              type="text"
              class="input"
              placeholder="请输入用户名（2-20个字符）"
              autocomplete="username"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1.5">
              昵称
            </label>
            <input 
              v-model="form.nickname"
              type="text"
              class="input"
              placeholder="请输入昵称"
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
                placeholder="请输入密码（至少6位）"
                autocomplete="new-password"
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

          <div>
            <label class="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1.5">
              确认密码
            </label>
            <input 
              v-model="form.confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              class="input"
              placeholder="请再次输入密码"
              autocomplete="new-password"
            />
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
              提交中...
            </span>
            <span v-else>提交申请</span>
          </button>
        </form>

        <!-- 登录链接 -->
        <p class="mt-6 text-center text-ink-500 dark:text-ink-400">
          已有账号？
          <router-link to="/login" class="text-primary-500 hover:text-primary-600 font-medium">
            立即登录
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>
