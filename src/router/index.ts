import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import HiscoresView from '@/views/HiscoresView.vue'
import SettingsView from '@/views/SettingsView.vue'
import GameView from '@/views/GameView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/game',
      name: 'game',
      component: GameView
    },
    {
      path: '/hiscores',
      name: 'hiscores',
      component: HiscoresView
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView
    },
  ],
})

export default router
