import Vue from 'vue'
import VueRouter from 'vue-router'

import Stock from '@/views/Stock/Stock'

Vue.use(VueRouter)

const routes = [
  /** For Stock */
  {
    path: '/',
    name: 'Stock',
    component: Stock,
  },
  /** End For Stock */
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.VUE_APP_DOMAIN,
  routes,
})

export default router