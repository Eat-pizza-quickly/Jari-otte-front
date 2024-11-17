import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AuthView from '../views/AuthView.vue'
import MyPageView from '../views/MyPageView.vue'
import SeatSelection from '../views/SeatSelection.vue'
import ConcertCreate from "@/views/ConcertCreate.vue";
import VenueCreate from "@/views/VenueCreate.vue";

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
      meta: { requiresHeader: true },
    },
    {
      path: '/venue-create',
      name: 'venueCreate',
      component: VenueCreate,
      meta: { requiresHeader: true },
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
    }
  ]
})

export default router
