import { createRouter, createWebHistory } from 'vue-router'
import WeatherHomeView from '@/views/WeatherHomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: WeatherHomeView, // 첫 화면은 즉시 로딩
  },
  {
    path: '/weather/:cityId',
    name: 'weather-detail',
    // 동적 경로 파라미터를 props로 전달
    props: true,
    // Lazy Loading: 이 경로에 처음 진입할 때 별도 청크로 내려받는다
    component: () => import('@/views/WeatherDetailView.vue'),
  },
  {
    path: '/alerts',
    name: 'alerts',
    component: () => import('@/views/WeatherAlertView.vue'),
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/WeatherAboutView.vue'),
  },
  {
    // Catch-all Route: 위에서 매칭되지 않은 모든 경로
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
