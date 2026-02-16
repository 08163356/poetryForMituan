<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePoetryStore } from '../stores/poetry';
import { useAuthStore } from '../stores/auth';
import { getImageUrl } from '../services/api';

const route = useRoute();
const router = useRouter();
const poetryStore = usePoetryStore();
const authStore = useAuthStore();

const showShareModal = ref(false);
const showImageModal = ref(false);
const currentImageIndex = ref(0);

// 监听路由变化，加载不同的诗词
watch(() => route.params.id, async (newId) => {
  if (newId) {
    await poetryStore.fetchPoetry(newId as string);
  }
}, { immediate: true });

onMounted(async () => {
  // 确保有诗词列表用于上一首/下一首导航
  if (poetryStore.poetries.length === 0) {
    await poetryStore.fetchPoetries({ limit: 100 });
  }
});

const poetry = computed(() => poetryStore.currentPoetry);

// 获取当前诗词在列表中的索引
const currentIndex = computed(() => {
  if (!poetry.value) return -1;
  return poetryStore.poetries.findIndex(p => p._id === poetry.value?._id);
});

// 上一首诗词
const prevPoetry = computed(() => {
  if (currentIndex.value <= 0) return null;
  return poetryStore.poetries[currentIndex.value - 1];
});

// 下一首诗词
const nextPoetry = computed(() => {
  if (currentIndex.value < 0 || currentIndex.value >= poetryStore.poetries.length - 1) return null;
  return poetryStore.poetries[currentIndex.value + 1];
});

// 跳转到上一首
const goToPrev = () => {
  if (prevPoetry.value) {
    router.push(`/poetry/${prevPoetry.value._id}`);
  }
};

// 跳转到下一首
const goToNext = () => {
  if (nextPoetry.value) {
    router.push(`/poetry/${nextPoetry.value._id}`);
  }
};

// 状态信息
const statusInfo = computed(() => {
  if (!poetry.value) return null;
  
  const verify = poetry.value.verifyStatus;
  const image = poetry.value.imageGenStatus;
  
  const result = [];
  
  if (verify === 'processing') {
    result.push({ text: 'AI校验中', class: 'badge-warning', icon: '⏳' });
  } else if (verify === 'failed') {
    result.push({ text: '校验失败', class: 'badge-error', icon: '⚠️' });
  } else if (verify === 'completed' && poetry.value.verifiedContent !== poetry.value.originalContent) {
    result.push({ text: '已校正', class: 'badge-success', icon: '✓' });
  }
  
  if (image === 'processing') {
    result.push({ text: 'AI生图中', class: 'badge-warning', icon: '🎨' });
  } else if (image === 'failed') {
    result.push({ text: '生图失败', class: 'badge-error', icon: '⚠️' });
  } else if (image === 'completed' && poetry.value.aiGeneratedImage) {
    result.push({ text: 'AI配图', class: 'badge-info', icon: '🖼️' });
  }
  
  return result.length > 0 ? result : null;
});

// 显示的图片
const displayImages = computed(() => {
  if (!poetry.value) return [];
  const images = [...(poetry.value.images || [])];
  if (poetry.value.aiGeneratedImage && !images.includes(poetry.value.aiGeneratedImage)) {
    images.push(poetry.value.aiGeneratedImage);
  }
  return images.map(img => getImageUrl(img));
});

// 打开图片大图
const openImageModal = (index: number) => {
  currentImageIndex.value = index;
  showImageModal.value = true;
};

// 切换到上一张图片
const prevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--;
  } else {
    currentImageIndex.value = displayImages.value.length - 1;
  }
};

// 切换到下一张图片
const nextImage = () => {
  if (currentImageIndex.value < displayImages.value.length - 1) {
    currentImageIndex.value++;
  } else {
    currentImageIndex.value = 0;
  }
};

// 点赞
const handleLike = async () => {
  if (!poetry.value) return;
  await poetryStore.likePoetry(poetry.value._id);
};

// 分享
const handleShare = () => {
  showShareModal.value = true;
};

// 复制链接
const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);
    alert('链接已复制到剪贴板');
  } catch {
    alert('复制失败，请手动复制');
  }
};

// 删除
const handleDelete = async () => {
  if (!poetry.value) return;
  if (!confirm('确定要删除这首古诗吗？')) return;
  
  const result = await poetryStore.deletePoetry(poetry.value._id);
  if (result.success) {
    router.push('/');
  } else {
    alert(result.message || '删除失败');
  }
};

// 返回
const goBack = () => {
  router.back();
};
</script>

<template>
  <div class="min-h-screen py-8 px-4">
    <div class="max-w-3xl mx-auto">
      <!-- 顶部导航 -->
      <div class="flex items-center justify-between mb-6">
        <button @click="goBack" class="btn-ghost flex items-center">
          <span class="mr-2">←</span> 返回
        </button>
        
        <!-- 上一首/下一首 导航 -->
        <div class="flex items-center space-x-2">
          <button 
            @click="goToPrev"
            :disabled="!prevPoetry"
            class="btn-ghost flex items-center disabled:opacity-30 disabled:cursor-not-allowed"
            :title="prevPoetry ? `上一首: ${prevPoetry.title}` : '没有上一首了'"
          >
            <span class="mr-1">‹</span> 上一首
          </button>
          <span class="text-ink-300">|</span>
          <button 
            @click="goToNext"
            :disabled="!nextPoetry"
            class="btn-ghost flex items-center disabled:opacity-30 disabled:cursor-not-allowed"
            :title="nextPoetry ? `下一首: ${nextPoetry.title}` : '没有下一首了'"
          >
            下一首 <span class="ml-1">›</span>
          </button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="poetryStore.loading" class="flex justify-center py-20">
        <div class="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <!-- 诗词详情 -->
      <div v-else-if="poetry" class="glass-card p-6 md:p-8 animate-fade-in">
        <!-- 状态标识 -->
        <div v-if="statusInfo" class="flex flex-wrap gap-2 mb-4">
          <span v-for="(status, index) in statusInfo" :key="index" :class="status.class">
            {{ status.icon }} {{ status.text }}
          </span>
        </div>

        <!-- 图片展示 -->
        <div v-if="displayImages.length > 0" class="mb-6">
          <div class="grid gap-4" :class="displayImages.length > 1 ? 'grid-cols-2' : 'grid-cols-1'">
            <div 
              v-for="(img, index) in displayImages" 
              :key="index"
              class="rounded-xl overflow-hidden cursor-pointer group relative"
              @click="openImageModal(index)"
            >
              <img 
                :src="img" 
                :alt="poetry.title"
                class="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <!-- 悬浮遮罩 -->
              <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <span class="text-white opacity-0 group-hover:opacity-100 transition-opacity text-lg">🔍 查看大图</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 标题 -->
        <h1 class="text-3xl md:text-4xl font-serif font-bold text-center text-ink-800 dark:text-ink-100 mb-4">
          {{ poetry.title }}
        </h1>

        <!-- 作者信息 -->
        <div class="text-center text-ink-500 dark:text-ink-400 mb-6">
          <span>{{ poetry.dynasty }}</span>
          <span class="mx-2">·</span>
          <span>{{ poetry.author }}</span>
        </div>

        <!-- 分隔线 -->
        <div class="ancient-line text-center text-primary-300 dark:text-primary-600 mb-6">
          ❀ ❀ ❀
        </div>

        <!-- 诗词内容 -->
        <div class="text-center mb-8">
          <p class="text-lg md:text-xl font-serif leading-loose text-ink-700 dark:text-ink-200 whitespace-pre-line">
            {{ poetry.content }}
          </p>
        </div>

        <!-- 原文对比（如果有校正） -->
        <div v-if="poetry.verifiedContent && poetry.verifiedContent !== poetry.originalContent" class="mb-6 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
          <p class="text-sm font-medium text-yellow-800 dark:text-yellow-400 mb-2">原文（已校正）：</p>
          <p class="text-sm text-yellow-700 dark:text-yellow-300 whitespace-pre-line">{{ poetry.originalContent }}</p>
        </div>

        <!-- 标签 -->
        <div v-if="poetry.tags && poetry.tags.length > 0" class="flex flex-wrap justify-center gap-2 mb-6">
          <span 
            v-for="tag in poetry.tags" 
            :key="tag"
            class="px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
          >
            {{ tag }}
          </span>
        </div>

        <!-- 统计和操作 -->
        <div class="flex items-center justify-between border-t border-primary-100 dark:border-ink-700 pt-6">
          <div class="flex items-center space-x-4 text-ink-500 dark:text-ink-400">
            <span class="flex items-center space-x-1">
              <span>👁️</span>
              <span>{{ poetry.viewCount }}</span>
            </span>
            <button @click="handleLike" class="flex items-center space-x-1 hover:text-red-500 transition-colors">
              <span>❤️</span>
              <span>{{ poetry.likeCount }}</span>
            </button>
          </div>

          <div class="flex items-center space-x-2">
            <button @click="handleShare" class="btn-secondary text-sm">
              分享
            </button>
            <button 
              v-if="authStore.isAdmin || poetry.createdBy?._id === authStore.user?.id"
              @click="handleDelete" 
              class="btn-ghost text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              删除
            </button>
          </div>
        </div>

        <!-- 创建者信息 -->
        <div class="mt-6 pt-4 border-t border-primary-100 dark:border-ink-700 text-center text-sm text-ink-400">
          由 {{ poetry.createdBy?.nickname || '匿名' }} 分享于 
          {{ new Date(poetry.createdAt).toLocaleDateString('zh-CN') }}
        </div>
      </div>

      <!-- 未找到 -->
      <div v-else class="text-center py-20">
        <div class="text-6xl mb-4">📜</div>
        <h2 class="text-xl font-serif text-ink-600 dark:text-ink-300">诗词不存在</h2>
        <router-link to="/" class="btn-primary mt-6 inline-block">返回首页</router-link>
      </div>

      <!-- 底部上一首/下一首导航 -->
      <div v-if="poetry && (prevPoetry || nextPoetry)" class="mt-8 grid grid-cols-2 gap-4">
        <button 
          v-if="prevPoetry"
          @click="goToPrev"
          class="glass-card p-4 text-left hover:shadow-lg transition-shadow"
        >
          <div class="text-sm text-ink-400 mb-1">← 上一首</div>
          <div class="font-serif font-medium text-ink-700 dark:text-ink-200">{{ prevPoetry.title }}</div>
          <div class="text-sm text-ink-500">{{ prevPoetry.author }}</div>
        </button>
        <div v-else></div>
        
        <button 
          v-if="nextPoetry"
          @click="goToNext"
          class="glass-card p-4 text-right hover:shadow-lg transition-shadow"
        >
          <div class="text-sm text-ink-400 mb-1">下一首 →</div>
          <div class="font-serif font-medium text-ink-700 dark:text-ink-200">{{ nextPoetry.title }}</div>
          <div class="text-sm text-ink-500">{{ nextPoetry.author }}</div>
        </button>
      </div>
    </div>

    <!-- 分享弹窗 -->
    <teleport to="body">
      <transition name="fade">
        <div v-if="showShareModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" @click.self="showShareModal = false">
          <div class="glass-card p-6 w-full max-w-sm animate-slide-up">
            <h3 class="text-lg font-serif font-semibold text-center mb-4">分享诗词</h3>
            
            <div class="space-y-3">
              <button @click="copyLink" class="w-full btn-secondary">
                📋 复制链接
              </button>
            </div>

            <button 
              @click="showShareModal = false"
              class="w-full mt-4 text-center text-ink-500 hover:text-ink-700"
            >
              关闭
            </button>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- 图片大图弹窗 -->
    <teleport to="body">
      <transition name="fade">
        <div 
          v-if="showImageModal" 
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          @click.self="showImageModal = false"
        >
          <!-- 关闭按钮 -->
          <button 
            @click="showImageModal = false"
            class="absolute top-4 right-4 text-white/80 hover:text-white text-4xl z-10"
          >
            ×
          </button>
          
          <!-- 图片 -->
          <div class="relative max-w-[90vw] max-h-[90vh]">
            <img 
              :src="displayImages[currentImageIndex]"
              :alt="poetry?.title"
              class="max-w-full max-h-[90vh] object-contain"
            />
          </div>
          
          <!-- 左右切换按钮 -->
          <template v-if="displayImages.length > 1">
            <button 
              @click.stop="prevImage"
              class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 text-white text-2xl flex items-center justify-center transition-colors"
            >
              ‹
            </button>
            <button 
              @click.stop="nextImage"
              class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 text-white text-2xl flex items-center justify-center transition-colors"
            >
              ›
            </button>
          </template>
          
          <!-- 图片计数 -->
          <div v-if="displayImages.length > 1" class="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm">
            {{ currentImageIndex + 1 }} / {{ displayImages.length }}
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>
