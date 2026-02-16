<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePoetryStore } from '../stores/poetry';

const router = useRouter();
const poetryStore = usePoetryStore();

const form = reactive({
  title: '',
  content: '',
  author: '',
  dynasty: '',
  tags: '',
});

const imageFiles = ref<File[]>([]);
const imagePreviews = ref<string[]>([]);
const error = ref('');
const submitting = ref(false);

// 常用朝代选项
const dynastyOptions = [
  '先秦', '两汉', '魏晋', '南北朝', '隋代', '唐代', 
  '五代', '宋代', '金朝', '元代', '明代', '清代', '近现代'
];

onMounted(() => {
  poetryStore.fetchDynasties();
});

// 处理图片选择
const handleImageSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  
  if (!files) return;
  
  // 最多2张图片
  const newFiles = Array.from(files).slice(0, 2 - imageFiles.value.length);
  
  for (const file of newFiles) {
    if (!file.type.startsWith('image/')) {
      error.value = '请选择图片文件';
      continue;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      error.value = '图片大小不能超过10MB';
      continue;
    }
    
    imageFiles.value.push(file);
    
    // 创建预览
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreviews.value.push(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }
  
  // 清空input
  target.value = '';
};

// 移除图片
const removeImage = (index: number) => {
  imageFiles.value.splice(index, 1);
  imagePreviews.value.splice(index, 1);
};

// 提交表单
const handleSubmit = async () => {
  error.value = '';
  
  if (!form.title.trim()) {
    error.value = '请输入诗词标题';
    return;
  }
  
  if (!form.content.trim()) {
    error.value = '请输入诗词内容';
    return;
  }
  
  if (!form.author.trim()) {
    error.value = '请输入作者';
    return;
  }
  
  if (!form.dynasty.trim()) {
    error.value = '请选择朝代';
    return;
  }
  
  submitting.value = true;
  
  try {
    const formData = new FormData();
    formData.append('title', form.title.trim());
    formData.append('content', form.content.trim());
    formData.append('author', form.author.trim());
    formData.append('dynasty', form.dynasty.trim());
    
    if (form.tags.trim()) {
      formData.append('tags', form.tags.trim());
    }
    
    for (const file of imageFiles.value) {
      formData.append('images', file);
    }
    
    const result = await poetryStore.createPoetry(formData);
    
    if (result.success) {
      router.push(`/poetry/${result.data?._id}`);
    } else {
      error.value = result.message || '创建失败';
    }
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen py-8 px-4">
    <div class="max-w-2xl mx-auto">
      <div class="glass-card p-6 md:p-8 animate-fade-in">
        <!-- 标题 -->
        <div class="text-center mb-8">
          <h1 class="text-2xl font-serif font-bold text-ancient-gradient">创作古诗</h1>
          <p class="text-ink-500 dark:text-ink-400 mt-2">分享你喜爱的诗词</p>
        </div>

        <!-- 错误提示 -->
        <div v-if="error" class="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {{ error }}
        </div>

        <!-- 表单 -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- 标题 -->
          <div>
            <label class="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1.5">
              诗词标题 <span class="text-red-500">*</span>
            </label>
            <input 
              v-model="form.title"
              type="text"
              class="input"
              placeholder="如：静夜思"
            />
          </div>

          <!-- 作者和朝代 -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1.5">
                作者 <span class="text-red-500">*</span>
              </label>
              <input 
                v-model="form.author"
                type="text"
                class="input"
                placeholder="如：李白"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1.5">
                朝代 <span class="text-red-500">*</span>
              </label>
              <select v-model="form.dynasty" class="input">
                <option value="">请选择朝代</option>
                <option v-for="d in dynastyOptions" :key="d" :value="d">{{ d }}</option>
              </select>
            </div>
          </div>

          <!-- 诗词内容 -->
          <div>
            <label class="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1.5">
              诗词内容 <span class="text-red-500">*</span>
            </label>
            <textarea 
              v-model="form.content"
              class="textarea h-40 font-serif"
              placeholder="床前明月光，&#10;疑是地上霜。&#10;举头望明月，&#10;低头思故乡。"
            ></textarea>
            <p class="mt-1 text-xs text-ink-400">每行一句，AI会自动校验错别字</p>
          </div>

          <!-- 标签 -->
          <div>
            <label class="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1.5">
              标签
            </label>
            <input 
              v-model="form.tags"
              type="text"
              class="input"
              placeholder="多个标签用逗号分隔，如：思乡,明月,五言绝句"
            />
          </div>

          <!-- 图片上传 -->
          <div>
            <label class="block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1.5">
              配图 (可选，最多2张)
            </label>
            
            <!-- 图片预览 -->
            <div v-if="imagePreviews.length > 0" class="grid grid-cols-2 gap-4 mb-4">
              <div 
                v-for="(preview, index) in imagePreviews" 
                :key="index"
                class="relative rounded-xl overflow-hidden"
              >
                <img :src="preview" alt="预览" class="w-full h-32 object-cover" />
                <button 
                  type="button"
                  @click="removeImage(index)"
                  class="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white text-sm flex items-center justify-center hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            </div>

            <!-- 上传按钮 -->
            <label 
              v-if="imagePreviews.length < 2"
              class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary-200 dark:border-ink-600 rounded-xl cursor-pointer hover:border-primary-400 dark:hover:border-ink-500 transition-colors"
            >
              <span class="text-3xl mb-2">📷</span>
              <span class="text-sm text-ink-500">点击上传图片</span>
              <span class="text-xs text-ink-400 mt-1">不上传则AI自动生成配图</span>
              <input 
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleImageSelect"
              />
            </label>
          </div>

          <!-- 提交按钮 -->
          <button 
            type="submit"
            class="btn-primary w-full py-3"
            :disabled="submitting"
          >
            <span v-if="submitting" class="flex items-center justify-center">
              <span class="loading-dots mr-2">
                <span></span><span></span><span></span>
              </span>
              提交中...
            </span>
            <span v-else>发布古诗</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
