import { createRouter, createWebHashHistory } from 'vue-router'
import HomePage  from '../pages/HomePage.vue'
import WordsPage from '../pages/WordsPage.vue'
import GamesPage from '../pages/GamesPage.vue'

const routes = [
  { path: '/',       component: HomePage,  name: 'home'  },
  { path: '/words',  component: WordsPage, name: 'words' },
  { path: '/games',  component: GamesPage, name: 'games' },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})
