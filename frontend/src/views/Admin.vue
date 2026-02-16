<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { authService } from '../services/auth';
import { usePoetryStore } from '../stores/poetry';
import type { User } from '../types';

const poetryStore = usePoetryStore();

const activeTab = ref('users');
const users = ref<User[]>([]);
const loading = ref(false);
const message = ref({ type: '', text: '' });

const pagination = ref({
  total: 0,
  page: 1,
  limit: 20,
  pages: 0,
});

const statusFilter = ref('');

onMounted(async () => {
  await Promise.all([
    loadUsers(),
    poetryStore.fetchStats(),
  ]);
});

const loadUsers = async () => {
  loading.value = true;
  try {
    const response = await authService.getUsers({
      status: statusFilter.value || undefined,
      page: pagination.value.page,
      limit: pagination.value.limit,
    });
    
    if (response.success && response.data) {
      users.value = (response.data as { users: User[]; pagination: typeof pagination.value }).users;
      pagination.value = (response.data as { users: User[]; pagination: typeof pagination.value }).pagination;
    }
  } catch (error) {
    console.error('获取用户列表失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleApprove = async (userId: string, status: 'active' | 'rejected', role?: string) => {
  message.value = { type: '', text: '' };
  
  try {
    const response = await authService.approveUser(userId, { status, role });
    
    if (response.success) {
      message.value = { type: 'success', text: status === 'active' ? '已通过审核' : '已拒绝申请' };
      await loadUsers();
    } else {
      message.value = { type: 'error', text: response.message || '操作失败' };
    }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    message.value = { type: 'error', text: err.response?.data?.message || '操作失败' };
  }
};

const handleDelete = async (userId: string) => {
  if (!confirm('确定要删除这个用户吗？')) return;
  
  message.value = { type: '', text: '' };
  
  try {
    const response = await authService.deleteUser(userId);
    
    if (response.success) {
      message.value = { type: 'success', text: '用户已删除' };
      await loadUsers();
    } else {
      message.value = { type: 'error', text: response.message || '删除失败' };
    }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    message.value = { type: 'error', text: err.response?.data?.message || '删除失败' };
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return '已激活';
    case 'pending': return '待审核';
    case 'rejected': return '已拒绝';
    default: return status;
  }
};

const getRoleText = (role: string) => {
  switch (role) {
    case 'admin': return '管理员';
    case 'family': return '家人';
    case 'guest': return '访客';
    default: return role;
  }
};
</script>

<template>
  <div class="min-h-screen py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <div class="glass-card p-6 md:p-8 animate-fade-in">
        <!-- 标题 -->
        <div class="text-center mb-8">
          <h1 class="text-2xl font-serif font-bold text-ancient-gradient">后台管理</h1>
        </div>

        <!-- 统计卡片 -->
        <div v-if="poetryStore.stats" class="grid grid-cols-3 gap-4 mb-8">
          <div class="glass p-4 rounded-xl text-center">
            <div class="text-2xl font-bold text-primary-500">{{ poetryStore.stats.totalPoetries }}</div>
            <div class="text-sm text-ink-500">诗词总数</div>
          </div>
          <div class="glass p-4 rounded-xl text-center">
            <div class="text-2xl font-bold text-primary-500">{{ poetryStore.stats.totalAuthors }}</div>
            <div class="text-sm text-ink-500">诗人数量</div>
          </div>
          <div class="glass p-4 rounded-xl text-center">
            <div class="text-2xl font-bold text-primary-500">{{ pagination.total }}</div>
            <div class="text-sm text-ink-500">用户数量</div>
          </div>
        </div>

        <!-- 标签页 -->
        <div class="flex border-b border-primary-100 dark:border-ink-700 mb-6">
          <button 
            @click="activeTab = 'users'"
            class="px-4 py-2 font-medium transition-colors"
            :class="activeTab === 'users' 
              ? 'text-primary-600 border-b-2 border-primary-500' 
              : 'text-ink-500 hover:text-ink-700'"
          >
            用户管理
          </button>
          <button 
            @click="activeTab = 'content'"
            class="px-4 py-2 font-medium transition-colors"
            :class="activeTab === 'content' 
              ? 'text-primary-600 border-b-2 border-primary-500' 
              : 'text-ink-500 hover:text-ink-700'"
          >
            内容管理
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

        <!-- 用户管理 -->
        <div v-if="activeTab === 'users'">
          <!-- 筛选 -->
          <div class="mb-4">
            <select v-model="statusFilter" @change="loadUsers" class="input w-auto">
              <option value="">全部状态</option>
              <option value="pending">待审核</option>
              <option value="active">已激活</option>
              <option value="rejected">已拒绝</option>
            </select>
          </div>

          <!-- 用户列表 -->
          <div v-if="loading" class="flex justify-center py-8">
            <div class="loading-dots">
              <span></span><span></span><span></span>
            </div>
          </div>

          <div v-else-if="users.length === 0" class="text-center py-8 text-ink-500">
            暂无用户
          </div>

          <div v-else class="space-y-4">
            <div 
              v-for="user in users" 
              :key="user.id"
              class="glass p-4 rounded-xl flex flex-wrap items-center justify-between gap-4"
            >
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-full bg-gradient-to-r from-primary-400 to-primary-500 flex items-center justify-center text-white font-medium">
                  {{ user.nickname?.charAt(0) || '?' }}
                </div>
                <div>
                  <div class="font-medium text-ink-800 dark:text-ink-100">{{ user.nickname }}</div>
                  <div class="text-sm text-ink-500">@{{ user.username }}</div>
                </div>
              </div>

              <div class="flex items-center space-x-2">
                <span 
                  class="px-2 py-1 rounded text-xs"
                  :class="{
                    'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400': user.status === 'active',
                    'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400': user.status === 'pending',
                    'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400': user.status === 'rejected',
                  }"
                >
                  {{ getStatusText(user.status) }}
                </span>
                <span class="px-2 py-1 rounded text-xs bg-ink-100 text-ink-600 dark:bg-ink-700 dark:text-ink-300">
                  {{ getRoleText(user.role) }}
                </span>
              </div>

              <div class="flex items-center space-x-2">
                <template v-if="user.status === 'pending'">
                  <button 
                    @click="handleApprove(user.id, 'active', 'family')"
                    class="btn-ghost text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                  >
                    通过
                  </button>
                  <button 
                    @click="handleApprove(user.id, 'rejected')"
                    class="btn-ghost text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    拒绝
                  </button>
                </template>
                <button 
                  v-if="user.role !== 'admin'"
                  @click="handleDelete(user.id)"
                  class="btn-ghost text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 内容管理 -->
        <div v-if="activeTab === 'content'">
          <div v-if="poetryStore.stats" class="space-y-6">
            <!-- 最近诗词 -->
            <div>
              <h3 class="font-medium text-ink-700 dark:text-ink-300 mb-3">最近发布</h3>
              <div class="space-y-2">
                <router-link 
                  v-for="poetry in poetryStore.stats.recentPoetries" 
                  :key="poetry._id"
                  :to="`/poetry/${poetry._id}`"
                  class="block glass p-3 rounded-lg hover:bg-primary-50 dark:hover:bg-ink-700 transition-colors"
                >
                  <div class="font-medium text-ink-800 dark:text-ink-100">{{ poetry.title }}</div>
                  <div class="text-sm text-ink-500">{{ poetry.dynasty }} · {{ poetry.author }}</div>
                </router-link>
              </div>
            </div>

            <!-- 热门诗词 -->
            <div>
              <h3 class="font-medium text-ink-700 dark:text-ink-300 mb-3">热门诗词</h3>
              <div class="space-y-2">
                <router-link 
                  v-for="poetry in poetryStore.stats.popularPoetries" 
                  :key="poetry._id"
                  :to="`/poetry/${poetry._id}`"
                  class="block glass p-3 rounded-lg hover:bg-primary-50 dark:hover:bg-ink-700 transition-colors"
                >
                  <div class="flex justify-between">
                    <div class="font-medium text-ink-800 dark:text-ink-100">{{ poetry.title }}</div>
                    <div class="text-sm text-ink-500">👁️ {{ poetry.viewCount }}</div>
                  </div>
                  <div class="text-sm text-ink-500">{{ poetry.dynasty }} · {{ poetry.author }}</div>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
