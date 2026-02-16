<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useAuthStore } from '../stores/auth';
import { authService } from '../services/auth';

const authStore = useAuthStore();

const activeTab = ref('profile');
const message = ref({ type: '', text: '' });

const profileForm = reactive({
  nickname: authStore.user?.nickname || '',
});

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

// 更新个人信息
const updateProfile = async () => {
  message.value = { type: '', text: '' };
  
  if (!profileForm.nickname.trim()) {
    message.value = { type: 'error', text: '昵称不能为空' };
    return;
  }
  
  const result = await authStore.updateProfile({ nickname: profileForm.nickname.trim() });
  
  if (result.success) {
    message.value = { type: 'success', text: '更新成功' };
  } else {
    message.value = { type: 'error', text: result.message || '更新失败' };
  }
};

// 修改密码
const changePassword = async () => {
  message.value = { type: '', text: '' };
  
  if (!passwordForm.currentPassword || !passwordForm.newPassword) {
    message.value = { type: 'error', text: '请填写完整信息' };
    return;
  }
  
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    message.value = { type: 'error', text: '两次输入的密码不一致' };
    return;
  }
  
  if (passwordForm.newPassword.length < 6) {
    message.value = { type: 'error', text: '新密码长度至少6位' };
    return;
  }
  
  try {
    const response = await authService.changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
    
    if (response.success) {
      message.value = { type: 'success', text: '密码修改成功' };
      passwordForm.currentPassword = '';
      passwordForm.newPassword = '';
      passwordForm.confirmPassword = '';
    } else {
      message.value = { type: 'error', text: response.message || '修改失败' };
    }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    message.value = { type: 'error', text: err.response?.data?.message || '修改失败' };
  }
};
</script>

<template>
  <div class="min-h-screen py-8 px-4">
    <div class="max-w-2xl mx-auto">
      <div class="glass-card p-6 md:p-8 animate-fade-in">
        <!-- 用户信息 -->
        <div class="text-center mb-8">
          <div class="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-primary-400 to-primary-500 flex items-center justify-center text-3xl text-white mb-4">
            {{ authStore.user?.nickname?.charAt(0) || '?' }}
          </div>
          <h1 class="text-xl font-serif font-bold text-ink-800 dark:text-ink-100">
            {{ authStore.user?.nickname }}
          </h1>
          <p class="text-ink-500 dark:text-ink-400 mt-1">
            @{{ authStore.user?.username }}
          </p>
          <span 
            class="inline-block mt-2 px-3 py-1 rounded-full text-sm"
            :class="{
              'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400': authStore.user?.role === 'admin',
              'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400': authStore.user?.role === 'family',
              'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400': authStore.user?.role === 'guest',
            }"
          >
            {{ authStore.user?.role === 'admin' ? '管理员' : authStore.user?.role === 'family' ? '家人' : '访客' }}
          </span>
        </div>

        <!-- 标签页 -->
        <div class="flex border-b border-primary-100 dark:border-ink-700 mb-6">
          <button 
            @click="activeTab = 'profile'"
            class="px-4 py-2 font-medium transition-colors"
            :class="activeTab === 'profile' 
              ? 'text-primary-600 border-b-2 border-primary-500' 
              : 'text-ink-500 hover:text-ink-700'"
          >
            个人信息
          </button>
          <button 
            @click="activeTab = 'password'"
            class="px-4 py-2 font-medium transition-colors"
            :class="activeTab === 'password' 
              ? 'text-primary-600 border-b-2 border-primary-500' 
              : 'text-ink-500 hover:text-ink-700'"
          >
            修改密码
          </button>
        </div>

        <!-- 消息提示 -->
        <div 
          v-if="message.text"
          class="mb-6 p-3 rounded-lg text-sm"
          :class="message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'"
        >
          {{ message.text }}
        </div>

        <!-- 个人信息表单 -->
        <form v-if="activeTab === 'profile'" @submit.prevent="updateProfile" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1.5">
              用户名
            </label>
            <input 
              :value="authStore.user?.username"
              type="text"
              class="input bg-ink-100 dark:bg-ink-800"
              disabled
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1.5">
              昵称
            </label>
            <input 
              v-model="profileForm.nickname"
              type="text"
              class="input"
              placeholder="请输入昵称"
            />
          </div>

          <button type="submit" class="btn-primary w-full py-3">
            保存修改
          </button>
        </form>

        <!-- 修改密码表单 -->
        <form v-if="activeTab === 'password'" @submit.prevent="changePassword" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1.5">
              当前密码
            </label>
            <input 
              v-model="passwordForm.currentPassword"
              type="password"
              class="input"
              placeholder="请输入当前密码"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1.5">
              新密码
            </label>
            <input 
              v-model="passwordForm.newPassword"
              type="password"
              class="input"
              placeholder="请输入新密码（至少6位）"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1.5">
              确认新密码
            </label>
            <input 
              v-model="passwordForm.confirmPassword"
              type="password"
              class="input"
              placeholder="请再次输入新密码"
            />
          </div>

          <button type="submit" class="btn-primary w-full py-3">
            修改密码
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
