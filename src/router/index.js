import {createRouter, createWebHistory} from 'vue-router'
import MainPageView from '../views/MainPageView.vue'
import AuthView from '../views/AuthView.vue'
import MyPageView from '../views/MyPageView.vue'
import SeatSelection from '../views/SeatSelection.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/category/:sidecategory',
      name: 'ConcertCategoryView',
      component: ConcertCategoryView,
      props: true, // sidecategory를 props로 전달
    },
    {
      path: '/admin/coupons',
      name: 'couponPage',
      component: CouponPage,
      meta: { requiresAdminHeader: true}
    },
    {
      path: '/',
      name: 'home',
      component: MainPageView,
      meta: {requiresHeader: true}
    },
    {
      path: '/auth',
      name: 'auth',
      component: AuthView,
      meta: {requiresHeader: false}
    },
    {
      path: '/concert-create',
      name: 'concertCreate',
      component: ConcertCreate,
      meta: {requiresHeader: true}
    },
    {
      path: '/venue-create',
      name: 'venueCreate',
      component: VenueCreate,
      meta: {requiresHeader: true}
    },
    {
      path: '/admin',
      name: 'adminPage',
      component: AdminPage,
      meta: {requiresAdminAuth: true}
    },
    {
      path: '/concerts/:concertId/seat',
      name: 'seatSelection',
      component: SeatSelection,
      meta: {requiresHeader: true}
    },
    {
      path: '/mypage',
      name: 'mypage',
      component: MyPageView,
      meta: {requiresHeader: true}
    },
    {
      path: '/concerts/:concertId',
      name: 'concert',
      component: ConcertDetailView,
      props: true,
      meta: {requiresHeader: true},
    },
    {
      path: '/admin/login',
      name: 'adminLogin',
      component: AdminLogin,
      meta: {requiresHeader: false},
    },
    {
      path: "/search",
      name: "searchResults",
      component: SearchConcertView,
      meta: {requiresHeader: true}
    },
    {
      path: '/concerts/:concertId/edit',
      name: 'concertEdit',
      component: ConcertEditView,
      props: true,
      meta: {requiresHeader: true},
    }
  ]
})

import VueJwtDecode from 'vue-jwt-decode'
import CouponPage from '@/views/CouponPage.vue'
import ConcertCreate from '@/views/ConcertCreate.vue'
import VenueCreate from '@/views/VenueCreate.vue'
import AdminPage from '@/views/AdminPage.vue'
import ConcertDetailView from '@/views/ConcertDetailView.vue'
import AdminLogin from '@/views/AdminLogin.vue'
import SearchConcertView from "@/views/SearchConcertView.vue";
import ConcertEditView from '@/views/ConcertEditView.vue'
import ConcertCategoryView from "@/components/ConcertCategoryView.vue";

router.beforeEach((to, from, next) => {
  // URL에 token 파라미터가 있는지 확인
  const tokenFromQuery = to.query.token
  if (tokenFromQuery) {
    console.log('Token detected in URL:', tokenFromQuery)
    localStorage.setItem('token', tokenFromQuery)
    // token 파라미터를 제거하고 같은 경로로 리다이렉트
    const query = {...to.query}
    delete query.token
    next({path: '/', query})
    return
  }

  // 인증이 필요한 페이지에 대한 처리
  if (to.meta.requiresAdminAuth) {
    const token = localStorage.getItem('token')

    if (token) {
      try {
        const decodedToken = VueJwtDecode.decode(token)
        const currentTime = Math.floor(Date.now() / 1000)

        if (decodedToken.exp && decodedToken.exp < currentTime) {
          localStorage.removeItem('token')
          next({name: 'adminLogin'})
        } else if (decodedToken.userRole === 'ADMIN') {
          next()
        } else {
          next({name: 'adminLogin'})
        }
      } catch (error) {
        localStorage.removeItem('token')
        next({name: 'adminLogin'})
      }
    } else {
      next({name: 'adminLogin'})
    }
  } else if (to.meta.requiresUserAuth) {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const decodedToken = VueJwtDecode.decode(token)
        const currentTime = Math.floor(Date.now() / 1000)

        if (decodedToken.exp && decodedToken.exp < currentTime) {
          localStorage.removeItem('token')
          next({name: 'auth'})
        } else if (decodedToken.userRole === 'USER' || decodedToken.user === 'HOST' || decodedToken.user === 'ADMIN') {
          next()
        } else {
          next({name: 'auth'})
        }
      } catch (error) {
        localStorage.removeItem('token')
        next({name: 'auth'})
      }
    } else {
      next({name: 'auth'})
    }
  } else {
    next()
  }
})

export default router
