import { createRouter, createWebHistory } from 'vue-router'
import MainPageView from '../views/MainPageView.vue'
import AuthView from '../views/AuthView.vue'
import MyPageView from '../views/MyPageView.vue'
import SeatSelection from '../views/SeatSelection.vue'
import ConcertCreate from "@/views/ConcertCreate.vue";
import VenueCreate from "@/views/VenueCreate.vue";
import AdminLogin from "@/views/AdminLogin.vue";
import AdminPage from "@/views/AdminPage.vue";
import CouponPage from "@/views/CouponPage.vue";
import SearchConcertView from '@/views/SearchConcertView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/admin/coupons',
      name: 'couponPage',
      component: CouponPage,
      meta: { requiresAuth: true, requiresAdminHeader: true },
    },
    {
      path: '/',
      name: 'home',
      component: MainPageView,
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
    },
    {
      path: "/search",
      name: "searchResults",
      component: SearchConcertView,
      meta: { requiresHeader: true }
    }
  ]
})

import VueJwtDecode from 'vue-jwt-decode'

router.beforeEach((to, from, next) => {
  // URL에 token 파라미터가 있는지 확인
  const tokenFromQuery = to.query.token
  if (tokenFromQuery) {
    console.log('Token detected in URL:', tokenFromQuery)
    localStorage.setItem('token', tokenFromQuery)
    // token 파라미터를 제거하고 같은 경로로 리다이렉트
    const query = { ...to.query }
    delete query.token
    next({ path: '/', query })
    return
  }

  // 인증이 필요한 페이지에 대한 처리
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token')

    if (token) {
      try {
        const decodedToken = VueJwtDecode.decode(token)
        const currentTime = Math.floor(Date.now() / 1000)

        if (decodedToken.exp && decodedToken.exp < currentTime) {
          localStorage.removeItem('token')
          next({ name: 'adminLogin' })
        } else if (decodedToken.userRole === 'ADMIN') {
          next()
        } else {
          next({ name: 'adminLogin' })
        }
      } catch (error) {
        localStorage.removeItem('token')
        next({ name: 'adminLogin' })
      }
    } else {
      next({ name: 'adminLogin' })
    }
  } else {
    next()
  }
})

export default router
