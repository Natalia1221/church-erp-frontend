import { createRouter, createWebHistory } from 'vue-router'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import { useAuthStore } from '@/stores/auth'

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
        path: 'absensi/check-in-acara',
        name: 'AttendanceCheckIn',
        component: () => import('@/views/attendance/AttendanceCheckInView.vue')
      },
      {
        path: 'absensi/rekap-laporan',
        name: 'AttendanceRecap',
        component: () => import('@/views/attendance/AttendanceRecapView.vue')
      },
      {
        path: 'absensi',
        redirect: '/absensi/check-in-acara'
      },
      {
        path: 'keuangan/kategori',
        name: 'FinanceCategory',
        component: () => import('@/views/finance/FinanceCategoryView.vue')
      },
      {
        path: 'keuangan/persembahan',
        name: 'Persembahan',
        component: () => import('@/views/finance/PersembahanView.vue')
      },
      {
        path: 'persembahan',
        redirect: '/keuangan/persembahan'
      },
      {
        path: 'keuangan/lainnya',
        name: 'KasLainnya',
        component: () => import('@/views/finance/KasLainnyaView.vue')
      },
      {
        path: 'keuangan/laporan',
        name: 'FinancialReport',
        component: () => import('@/views/finance/FinancialReportView.vue')
      },
      {
        path: 'laporan-keuangan',
        redirect: '/keuangan/laporan'
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

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth && !token) {
    return next({ name: 'Login' })
  }

  if (to.meta.guestOnly && token) {
    return next({ name: 'Dashboard' })
  }

  // Verifikasi izin akses menu (can_read) untuk halaman terproteksi
  if (to.meta.requiresAuth && token) {
    const authStore = useAuthStore()

    // Muat menu jika belum ada di state
    if ((!authStore.myMenus || authStore.myMenus.length === 0) && !authStore.loadingMenus) {
      await authStore.fetchMyMenus()
    }

    const cleanPath = (to.path || '').split('?')[0].replace(/\/+$/, '') || '/'
    // Abaikan rute dashboard atau root
    if (cleanPath !== '/dashboard' && cleanPath !== '') {
      const perms = authStore.getPermissionsByPath(cleanPath)
      if (perms && perms.can_read === false) {
        console.warn(`[AuthGuard] Akses ditolak ke path: ${cleanPath}. can_read = false`)
        return next({ name: 'Dashboard' })
      }
    }
  }

  next()
})

export default router
