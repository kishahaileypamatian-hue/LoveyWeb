
import { createRouter, createWebHistory } from 'vue-router'

import LoginView from '../views/LoginView.vue'
import HomeView from '../views/HomeView.vue'
import LetterView from '../views/LetterView.vue'
import FlowersView from '../views/FlowersView.vue'
import AdminView from '../views/AdminView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
      meta: { public: true },
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/letter',
      name: 'letter',
      component: LetterView,
    },
    {
      path: '/flowers',
      name: 'flowers',
      component: FlowersView,
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
      meta: { requiresAdmin: true },
    },
  ],
})

router.beforeEach((to) => {
  const isUnlocked =
    sessionStorage.getItem('flowerGardenUnlocked') === 'true'

  const isAdmin =
    sessionStorage.getItem('adminUnlocked') === 'true'

  if (to.meta.requiresAdmin && !isAdmin) {
    return { name: 'login' }
  }

  if (
    !to.meta.public &&
    !to.meta.requiresAdmin &&
    !isUnlocked
  ) {
    return { name: 'login' }
  }

  if (to.name === 'login') {
    if (isAdmin) return { name: 'admin' }
    if (isUnlocked) return { name: 'home' }
  }
})

export default router
