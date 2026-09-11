import { createRouter, createWebHistory } from 'vue-router'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue')
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/users/UserListView.vue')
      },
      {
        path: 'roles',
        name: 'Roles',
        component: () => import('@/views/roles/RoleListView.vue')
      },
      {
        path: 'setup/role',
        name: 'SetupRole',
        component: () => import('@/views/roles/RoleListView.vue')
      },
      {
        path: 'menus',
        name: 'Menus',
        component: () => import('@/views/menus/MenuListView.vue')
      },
      {
        path: 'penjadwalan/kategori',
        name: 'CategoryList',
        component: () => import('@/views/categories/CategoryListView.vue')
      },
      {
        path: 'categories',
        redirect: '/penjadwalan/kategori'
      },
      {
        path: 'penjadwalan/jadwal/sermon',
        name: 'SermonList',
        component: () => import('@/views/sermons/SermonListView.vue')
      },
      {
        path: 'sermon',
        redirect: '/penjadwalan/jadwal/sermon'
      },
      {
        path: 'penjadwalan/jadwal/minggu',
        name: 'MingguList',
        component: () => import('@/views/minggu/MingguListView.vue')
      },
      {
        path: 'minggu',
        redirect: '/penjadwalan/jadwal/minggu'
      },
      {
        path: 'penjadwalan/jadwal/lainnya',
        name: 'LainnyaList',
        component: () => import('@/views/lainnya/LainnyaListView.vue')
      },
      {
        path: 'lainnya',
        redirect: '/penjadwalan/jadwal/lainnya'
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/settings/SettingListView.vue')
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth && !token) {
    return next({ name: 'Login' })
  }

  if (to.meta.guestOnly && token) {
    return next({ name: 'Dashboard' })
  }

  next()
})

export default router
