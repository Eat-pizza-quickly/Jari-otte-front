import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AuthView from '../views/AuthView.vue'
import MyPageView from '../views/MyPageView.vue'
import SeatSelection from '../views/SeatSelection.vue'
import ConcertCreate from "@/views/ConcertCreate.vue";
import VenueCreate from "@/views/VenueCreate.vue";
import AdminLogin from "@/views/AdminLogin.vue";
import AdminPage from "@/views/AdminPage.vue";

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
      path: '/concert-create',
      name: 'concertCreate',
      component: ConcertCreate,
      meta: { requiresHeader: true, requiresAuth: true },
    },
    {
      path: '/venue-create',
      name: 'venueCreate',
      component: VenueCreate,
      meta: { requiresHeader: true, requiresAuth: true },
    },
    {
      path: '/admin',
      name: 'adminPage',
      component: AdminPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/seat',
      name: 'seatSelection',
      component: SeatSelection,
      meta: { requiresHeader: true },
    },
    {
      path: '/mypage',
      name: 'mypage',
      component: MyPageView,
      meta: { requiresHeader: true },
    },
    {
      path: '/admin/login',
      name: 'adminLogin',
      component: AdminLogin,
      meta: { requiresHeader: false },
    }
  ]
})

import VueJwtDecode from 'vue-jwt-decode'

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        // 토큰 디코딩
        const decodedToken = VueJwtDecode.decode(token);

        // 토큰 만료 여부 확인
        const currentTime = Math.floor(Date.now() / 1000); // 현재 시간(초 단위)
        if (decodedToken.exp && decodedToken.exp < currentTime) {
          // 토큰이 만료됨
          localStorage.removeItem('token'); // 만료된 토큰 제거
          next({ name: 'adminLogin' });
        } else if (decodedToken.userRole === 'ADMIN') {
          // userRole이 ADMIN이면 접근 허용
          next();
        } else {
          // userRole이 ADMIN이 아님
          next({ name: 'adminLogin' });
        }
      } catch (error) {
        // 토큰이 유효하지 않음
        localStorage.removeItem('token'); // 유효하지 않은 토큰 제거
        next({ name: 'adminLogin' });
      }
    } else {
      // 토큰이 없음
      next({ name: 'adminLogin' });
    }
  } else {
    next();
  }
});
export default router
