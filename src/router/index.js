import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/customer-login',
    name: 'CustomerLogin',
    component: () => import('@/views/customer-login/index.vue')
  },
  {
    path: '/projects',
    name: 'Projects',
    component: () => import('@/views/projects/index.vue')
  },
  {
    path: '/projects/:id',
    name: 'ProjectDetail',
    component: () => import('@/views/projects/detail.vue')
  },
  {
    path: '/intake',
    name: 'Intake',
    component: () => import('@/views/intake/index.vue')
  },
  {
    path: '/',
    redirect: '/projects'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to) => {
  if (to.path === '/customer-login') return true
  if (!localStorage.getItem('customerToken')) {
    return { path: '/customer-login', query: { redirect: to.fullPath } }
  }
  return true
})

export default router
