import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: '首页' },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录', guest: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { title: '注册', guest: true },
  },
  {
    path: '/poetry/:id',
    name: 'PoetryDetail',
    component: () => import('../views/PoetryDetail.vue'),
    meta: { title: '诗词详情' },
  },
  {
    path: '/create',
    name: 'Create',
    component: () => import('../views/Create.vue'),
    meta: { title: '创作古诗', auth: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { title: '个人中心', auth: true },
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/Admin.vue'),
    meta: { title: '后台管理', auth: true, admin: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: { title: '页面未找到' },
  },
];

const router = createRouter({
  // 使用 import.meta.env.BASE_URL 支持子路径部署
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  },
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // 设置页面标题
  document.title = `${to.meta.title || '古诗家园'} - 诗词古韵`;

  // 检查是否需要认证
  if (to.meta.auth && !authStore.isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } });
    return;
  }

  // 检查是否需要管理员权限
  if (to.meta.admin && !authStore.isAdmin) {
    next({ name: 'Home' });
    return;
  }

  // 已登录用户访问登录/注册页面
  if (to.meta.guest && authStore.isLoggedIn) {
    next({ name: 'Home' });
    return;
  }

  next();
});

export default router;
