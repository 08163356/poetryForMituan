<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { Poetry } from '../types';
import { getImageUrl } from '../services/api';

const props = defineProps<{
  poetry: Poetry;
  layout?: 'grid' | 'list';
}>();

const router = useRouter();

// 获取显示的图片
const displayImage = computed(() => {
  if (props.poetry.images && props.poetry.images.length > 0) {
    return getImageUrl(props.poetry.images[0]);
  }
  if (props.poetry.aiGeneratedImage) {
    return getImageUrl(props.poetry.aiGeneratedImage);
  }
  return '';
});

// 内容预览（只显示前几行）
const contentPreview = computed(() => {
  const lines = props.poetry.content.split('\n').filter(line => line.trim());
  return lines.slice(0, 4).join('\n');
});

// 状态显示
const statusInfo = computed(() => {
  const verify = props.poetry.verifyStatus;
  const image = props.poetry.imageGenStatus;
  
  if (verify === 'processing' || image === 'processing') {
    return { text: 'AI处理中', class: 'badge-warning', icon: '⏳' };
  }
  if (verify === 'failed' || image === 'failed') {
    return { text: '处理失败', class: 'badge-error', icon: '⚠️' };
  }
  if (verify === 'completed') {
    return { text: '已校验', class: 'badge-success', icon: '✓' };
  }
  return null;
});

const goToDetail = () => {
  router.push(`/poetry/${props.poetry._id}`);
};
</script>

<template>
  <div 
    class="poetry-card cursor-pointer group"
    @click="goToDetail"
  >
    <!-- 图片区域 -->
    <div v-if="displayImage" class="relative mb-4 rounded-xl overflow-hidden aspect-video">
      <img 
        :src="displayImage" 
        :alt="poetry.title"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
        @error="($event.target as HTMLImageElement).style.display = 'none'"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>

    <!-- 内容区域 -->
    <div class="space-y-3">
      <!-- 标题 -->
      <h3 class="text-lg font-serif font-semibold text-ink-800 dark:text-ink-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
        {{ poetry.title }}
      </h3>

      <!-- 作者和朝代 -->
      <div class="flex items-center space-x-2 text-sm text-ink-500 dark:text-ink-400">
        <span>{{ poetry.dynasty }}</span>
        <span>·</span>
        <span>{{ poetry.author }}</span>
      </div>

      <!-- 诗词内容预览 -->
      <p class="text-ink-600 dark:text-ink-300 font-serif text-sm leading-relaxed whitespace-pre-line line-clamp-4">
        {{ contentPreview }}
      </p>

      <!-- 底部信息 -->
      <div class="flex items-center justify-between pt-2">
        <!-- 标签 -->
        <div class="flex flex-wrap gap-1">
          <span 
            v-for="tag in poetry.tags.slice(0, 3)" 
            :key="tag"
            class="text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
          >
            {{ tag }}
          </span>
        </div>

        <!-- 状态和统计 -->
        <div class="flex items-center space-x-3 text-sm text-ink-400">
          <span v-if="statusInfo" :class="statusInfo.class">
            {{ statusInfo.icon }} {{ statusInfo.text }}
          </span>
          <span class="flex items-center space-x-1">
            <span>👁️</span>
            <span>{{ poetry.viewCount }}</span>
          </span>
          <span class="flex items-center space-x-1">
            <span>❤️</span>
            <span>{{ poetry.likeCount }}</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-4 {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
