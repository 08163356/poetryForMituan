<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { usePoetryStore } from '../stores/poetry';
import { useAuthStore } from '../stores/auth';
import PoetryCard from '../components/PoetryCard.vue';

const router = useRouter();
const poetryStore = usePoetryStore();
const authStore = useAuthStore();

const searchQuery = ref('');
const selectedDynasty = ref('');
const selectedAuthor = ref('');

onMounted(async () => {
  await Promise.all([
    poetryStore.fetchPoetries(),
    poetryStore.fetchDynasties(),
    poetryStore.fetchStats(),
  ]);
});

// 监听筛选条件变化
watch([selectedDynasty, selectedAuthor], () => {
  loadPoetries();
});

const loadPoetries = async (page = 1) => {
  await poetryStore.fetchPoetries({
    page,
    dynasty: selectedDynasty.value || undefined,
    author: selectedAuthor.value || undefined,
    search: searchQuery.value || undefined,
  });
};

const handleSearch = () => {
  loadPoetries();
};

const handleDynastyChange = async () => {
  selectedAuthor.value = '';
  if (selectedDynasty.value) {
    await poetryStore.fetchAuthors(selectedDynasty.value);
  }
};

// 全部作者点击处理
const handleAuthorClick = async () => {
  if (!selectedDynasty.value) {
    // 如果没有选择朝代，先加载所有朝代的作者
    await poetryStore.fetchAllAuthors();
  }
};

const handlePageChange = (page: number) => {
  loadPoetries(page);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const clearFilters = () => {
  searchQuery.value = '';
  selectedDynasty.value = '';
  selectedAuthor.value = '';
  loadPoetries();
};

// 跳转到创作页面
const goToCreate = () => {
  if (authStore.isLoggedIn) {
    router.push('/create');
  } else {
    router.push('/login?redirect=/create');
  }
};
</script>

<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <section class="relative py-4 px-4 text-center">
      <div class="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <!-- 统计数据 -->
        <div v-if="poetryStore.stats" class="flex justify-center space-x-8 pt-1">
          <div class="text-center">
            <div class="text-2xl font-bold text-primary-500">{{ poetryStore.stats.totalPoetries }}</div>
            <div class="text-sm text-ink-500">首诗词</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-primary-500">{{ poetryStore.stats.totalDynasties }}</div>
            <div class="text-sm text-ink-500">个朝代</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-primary-500">{{ poetryStore.stats.totalAuthors }}</div>
            <div class="text-sm text-ink-500">位诗人</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 搜索和筛选 -->
    <section class="max-w-6xl mx-auto px-4 mb-8">
      <div class="glass-card p-4 space-y-4">
        <!-- 搜索框 -->
        <div class="flex gap-2">
          <input 
            v-model="searchQuery"
            type="text"
            placeholder="搜索诗词、作者..."
            class="input flex-1"
            @keyup.enter="handleSearch"
          />
          <button @click="handleSearch" class="btn-primary">
            搜索
          </button>
        </div>

        <!-- 筛选条件 -->
        <div class="flex flex-wrap gap-3">
          <select 
            v-model="selectedDynasty"
            class="input w-auto min-w-[120px]"
            @change="handleDynastyChange"
          >
            <option value="">全部朝代</option>
            <option v-for="d in poetryStore.dynasties" :key="d" :value="d">{{ d }}</option>
          </select>

          <select 
            v-model="selectedAuthor"
            class="input w-auto min-w-[120px]"
            @click="handleAuthorClick"
          >
            <option value="">全部作者</option>
            <option v-for="a in poetryStore.authors" :key="a.name" :value="a.name">
              {{ a.name }} ({{ a.count }})
            </option>
          </select>

          <button 
            v-if="searchQuery || selectedDynasty || selectedAuthor"
            @click="clearFilters"
            class="btn-ghost text-sm"
          >
            清除筛选
          </button>
        </div>
      </div>
    </section>

    <!-- 古诗列表 -->
    <section class="max-w-6xl mx-auto px-4 pb-24">
      <!-- 加载状态 -->
      <div v-if="poetryStore.loading" class="flex justify-center py-12">
        <div class="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="poetryStore.poetries.length === 0" class="text-center py-16">
        <div class="text-6xl mb-4">📜</div>
        <h3 class="text-xl font-serif text-ink-600 dark:text-ink-300 mb-2">暂无诗词</h3>
        <p class="text-ink-500 dark:text-ink-400 mb-6">快来创作第一首古诗吧</p>
        <router-link v-if="authStore.isLoggedIn" to="/create" class="btn-primary">
          开始创作
        </router-link>
        <router-link v-else to="/login" class="btn-primary">
          登录后创作
        </router-link>
      </div>

      <!-- 诗词网格 - 使用统一的卡片布局 -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <PoetryCard 
          v-for="poetry in poetryStore.poetries" 
          :key="poetry._id"
          :poetry="poetry"
        />
      </div>

      <!-- 分页 -->
      <div v-if="poetryStore.pagination.pages > 1" class="flex justify-center mt-8 space-x-2">
        <button 
          v-for="page in poetryStore.pagination.pages" 
          :key="page"
          @click="handlePageChange(page)"
          class="w-10 h-10 rounded-full transition-all"
          :class="page === poetryStore.pagination.page 
            ? 'bg-primary-500 text-white' 
            : 'bg-white/50 dark:bg-ink-700/50 hover:bg-primary-100 dark:hover:bg-ink-600'"
        >
          {{ page }}
        </button>
      </div>
    </section>

    <!-- 右下角创作按钮 -->
    <button 
      @click="goToCreate"
      class="fixed right-6 bottom-6 w-14 h-14 rounded-full bg-gradient-to-r from-primary-400 to-primary-500 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center text-3xl z-40"
      title="创作诗词"
    >
      +
    </button>
  </div>
</template>
