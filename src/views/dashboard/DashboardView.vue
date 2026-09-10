<template>
  <div class="space-y-6">
    <!-- Welcome Header Banner (White Enterprise Card) -->
    <div class="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <!-- Subtle top decorative gradient line -->
      <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600"></div>

      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-semibold mb-3">
            ✨ Church Enterprise System v1.0
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Selamat Datang, {{ authStore.user?.name || 'Administrator' }}!
          </h1>
          <p class="text-slate-500 text-sm mt-1.5 max-w-xl leading-relaxed">
            Sistem informasi terintegrasi untuk pengelolaan jadwal ibadah, absensi jemaat, keuangan kas gereja, dan manajemen hak akses (RBAC).
          </p>
        </div>

        <div class="flex items-center gap-3 shrink-0">
          <router-link
            to="/users"
            class="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-2"
          >
            <span>👥</span>
            <span>Kelola User</span>
          </router-link>
          <router-link
            to="/roles"
            class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold text-xs transition-all flex items-center gap-2"
          >
            <span>🛡️</span>
            <span>Hak Akses</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Quick Stats Grid (White Cards) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      <!-- Total Users -->
      <div class="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-slate-300 transition-all">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Pengguna</p>
            <p class="text-2xl font-extrabold text-slate-900 mt-1">{{ stats.users }}</p>
          </div>
          <div class="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center text-lg font-bold">
            👤
          </div>
        </div>
        <div class="mt-3 flex items-center text-xs text-slate-500">
          <span class="text-emerald-600 font-semibold">Aktif</span> &nbsp;di sistem gereja
        </div>
      </div>

      <!-- Total Roles -->
      <div class="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-slate-300 transition-all">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Peran Sistem</p>
            <p class="text-2xl font-extrabold text-slate-900 mt-1">{{ stats.roles }}</p>
          </div>
          <div class="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-600 flex items-center justify-center text-lg font-bold">
            🛡️
          </div>
        </div>
        <div class="mt-3 flex items-center text-xs text-slate-500">
          Hak akses RBAC terproteksi
        </div>
      </div>

      <!-- Total Menus -->
      <div class="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-slate-300 transition-all">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Menu Terdaftar</p>
            <p class="text-2xl font-extrabold text-slate-900 mt-1">{{ stats.menus }}</p>
          </div>
          <div class="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center text-lg font-bold">
            📂
          </div>
        </div>
        <div class="mt-3 flex items-center text-xs text-slate-500">
          Navigasi terintegrasi
        </div>
      </div>

      <!-- Database Status -->
      <div class="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-slate-300 transition-all">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">TiDB Cloud</p>
            <p class="text-2xl font-extrabold text-emerald-600 mt-1">Online</p>
          </div>
          <div class="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center text-lg font-bold">
            ⚡
          </div>
        </div>
        <div class="mt-3 flex items-center text-xs text-slate-500">
          Latency: <span class="font-medium text-slate-700 ml-1">~120ms</span>
        </div>
      </div>
    </div>

    <!-- Informasi Modul Gereja & Log Aktivitas (White Cards) -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Modul Status -->
      <div class="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 class="text-base font-bold text-slate-900">Kesiapan Modul ERP</h2>
            <p class="text-xs text-slate-500 mt-0.5">Status modul fungsional sistem gereja</p>
          </div>
          <span class="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
            Sprint 1
          </span>
        </div>

        <div class="space-y-3">
          <div class="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/60 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-lg">🔐</span>
              <div>
                <p class="text-xs font-bold text-slate-800">Autentikasi & RBAC (Users, Roles, Menus)</p>
                <p class="text-[11px] text-slate-500">Manajemen akses multi-role dan menu dinamis</p>
              </div>
            </div>
            <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-semibold">
              Aktif
            </span>
          </div>

          <div class="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/60 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-lg">📅</span>
              <div>
                <p class="text-xs font-bold text-slate-800">Manajemen Ibadah & Event Gereja</p>
                <p class="text-[11px] text-slate-500">Penjadwalan ibadah raya, komisi, dan penugasan pelayan</p>
              </div>
            </div>
            <span class="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-semibold">
              Database Ready
            </span>
          </div>

          <div class="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/60 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-lg">💰</span>
              <div>
                <p class="text-xs font-bold text-slate-800">Keuangan & Kas Persembahan</p>
                <p class="text-[11px] text-slate-500">Pencatatan persembahan, kas masuk/keluar, dan laporan</p>
              </div>
            </div>
            <span class="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-semibold">
              Database Ready
            </span>
          </div>

          <div class="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/60 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-lg">📋</span>
              <div>
                <p class="text-xs font-bold text-slate-800">Absensi Jemaat & Pelayan</p>
                <p class="text-[11px] text-slate-500">Pencatatan kehadiran ibadah dan pelayan altar</p>
              </div>
            </div>
            <span class="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-semibold">
              Database Ready
            </span>
          </div>
        </div>
      </div>

      <!-- Quick Info Card -->
      <div class="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <div class="border-b border-slate-100 pb-4">
          <h2 class="text-base font-bold text-slate-900">Informasi Sesi</h2>
          <p class="text-xs text-slate-500 mt-0.5">Detail akun yang sedang aktif</p>
        </div>

        <div class="space-y-3 text-xs">
          <div class="flex justify-between py-1.5 border-b border-slate-100">
            <span class="text-slate-500">Nama Pengguna</span>
            <span class="font-bold text-slate-800">{{ authStore.user?.name || '-' }}</span>
          </div>
          <div class="flex justify-between py-1.5 border-b border-slate-100">
            <span class="text-slate-500">Email</span>
            <span class="font-semibold text-slate-800">{{ authStore.user?.email || '-' }}</span>
          </div>
          <div class="flex justify-between py-1.5 border-b border-slate-100">
            <span class="text-slate-500">Role Terpilih</span>
            <span class="px-2 py-0.5 rounded bg-cyan-50 text-cyan-700 font-semibold text-[11px]">
              {{ authStore.userRoles[0]?.name || 'Admin Pusat' }}
            </span>
          </div>
          <div class="flex justify-between py-1.5 border-b border-slate-100">
            <span class="text-slate-500">Server Backend</span>
            <span class="text-emerald-600 font-semibold">Port 3000 (Active)</span>
          </div>
        </div>

        <div class="pt-3">
          <router-link
            to="/users"
            class="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <span>Buka Manajemen User</span>
            <span>→</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/api/axios'

const authStore = useAuthStore()

const stats = reactive({
  users: 0,
  roles: 0,
  menus: 0
})

const fetchDashboardStats = async () => {
  try {
    const [usersRes, rolesRes, menusRes] = await Promise.allSettled([
      api.get('/users'),
      api.get('/roles'),
      api.get('/menus')
    ])

    if (usersRes.status === 'fulfilled' && usersRes.value.data.success) {
      stats.users = usersRes.value.data.data.length
    }
    if (rolesRes.status === 'fulfilled' && rolesRes.value.data.success) {
      stats.roles = rolesRes.value.data.data.length
    }
    if (menusRes.status === 'fulfilled' && menusRes.value.data.success) {
      stats.menus = menusRes.value.data.data.length
    }
  } catch (err) {
    console.warn('Gagal memuat sebagian stats dashboard:', err)
  }
}

onMounted(() => {
  fetchDashboardStats()
})
</script>
