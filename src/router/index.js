
import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabase'

import LoginView from '../views/LoginView.vue'
import HomeView from '../views/HomeView.vue'
import LetterView from '../views/LetterView.vue'
import FlowersView from '../views/FlowersView.vue'
import AdminView from '../views/AdminView.vue'
import AcceptInviteView from '../views/AcceptInviteView.vue'


const ADMIN_UID = '35cdbed0-c2b7-4203-bcb7-1572c8491e22'

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
  path: '/accept-invite',
  name: 'accept-invite',
  component: AcceptInviteView,
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

router.beforeEach(async (to) => {

    if (to.name === 'accept-invite') {
  return true
}

  if (to.name === 'login') {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const user = session?.user

    if (user?.id === ADMIN_UID) {
      return { name: 'admin' }
    }

    if (user) {
      return { name: 'home' }
    }

    return true
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const user = session?.user
  const isAdmin = user?.id === ADMIN_UID

  if (to.meta.requiresAdmin) {
    return isAdmin ? true : { name: 'login' }
  }

  if (!user) {
    return { name: 'login' }
  }

  return true
})

export default router
