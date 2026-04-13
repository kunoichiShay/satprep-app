import { createRouter, createWebHashHistory } from 'vue-router'
import { UserStore } from '../models/UserStore.js'
import LoginPage from '../pages/LoginPage.vue'
import HomePage  from '../pages/HomePage.vue'
import WordsPage from '../pages/WordsPage.vue'
import GamesPage from '../pages/GamesPage.vue'

const routes = [
  { path: '/login', component: LoginPage, name: 'login' },
  { path: '/',      component: HomePage,  name: 'home'  },
  { path: '/words', component: WordsPage, name: 'words' },
  { path: '/games', component: GamesPage, name: 'games' },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to) => {
  const loggedIn = !!UserStore.getCurrentUser()
  if (to.name !== 'login' && !loggedIn) return { name: 'login' }
  if (to.name === 'login' && loggedIn)  return { name: 'home' }
})

export default router
