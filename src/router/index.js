import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import AuthView from '../views/AuthView.vue';
import SeatSelection from '../views/SeatSelection.vue'; // SeatSelection 컴포넌트 추가

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresHeader: true },
    },
    {
      path: '/auth',
      name: 'auth',
      component: AuthView,
      meta: { requiresHeader: false },
    },
    {
      path: '/seat', // SeatSelection 경로 추가
      name: 'seatSelection',
      component: SeatSelection,
      meta: { requiresHeader: true },
    },
  ],
});

export default router;
