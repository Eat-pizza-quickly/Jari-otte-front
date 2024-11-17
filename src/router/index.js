import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AuthView from '../views/AuthView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresHeader: true }, // 헤더를 포함할 페이지
    },
    {
      path: '/auth',
      name: 'auth',
      component: AuthView,
      meta: { requiresHeader: false }, // 헤더를 숨길 페이지
    }
  ]
})

export default router
