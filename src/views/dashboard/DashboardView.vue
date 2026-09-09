<template>
  <div class="space-y-6">
    <!-- Welcome Header Banner (Clean Enterprise Light) -->
    <div class="rounded-2xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-3">
            ✨ Church ERP System v1.0
          </div>
          <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Selamat Datang, {{ authStore.user?.name || 'Administrator' }}!
          </h1>
          <p class="text-slate-500 text-sm mt-1 max-w-xl leading-relaxed">
            Sistem informasi terintegrasi untuk pengelolaan jadwal ibadah, absensi, keuangan kas, dan hak akses gereja.
          </p>
        </div>

        <div class="flex items-center gap-3 shrink-0">
          <router-link
            to="/users"
            class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs transition-all shadow-sm flex items-center gap-2"
          >
            <span>Kelola User</span>
          </router-link>
          <router-link
            to="/roles"
            class="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium text-xs transition-all flex items-center gap-2"
          >
            <span>Hak Akses</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Quick Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <!-- Total Users -->
      <div class="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-slate-300 transition-all">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Pengguna</p>
            <p class="text-2xl font-bold text-slate-900 mt-1">{{ stats.users }}</p>
          </div>
          <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
            👥
          </div>
        </div>
        <div class="mt-3 flex items-center text-xs text-slate-500">
          <span class="text-emerald-600 font-medium font-semibold">Aktif</span> &nbsp;di sistem
        </div>
      </div>

      <!-- Total Roles -->
      <div class="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-slate-300 transition-all">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Peran Sistem</p>
            <p class="text-2xl font-bold text-slate-900 mt-1">{{ stats.roles }}</p>
          </div>
          <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
            🛡️
          </div>
        </div>
        <div class="mt-3 flex items-center text-xs text-slate-500">
          Hak akses RBAC terpasang
        </div>
      </div>

      <!-- Total Menus -->
      <div class="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-slate-300 transition-all">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Menu Terdaftar</p>
            <p class="text-2xl font-bold text-slate-900 mt-1">{{ stats.menus }}</p>
          </div>
          <div class="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
            📑
          </div>
        </div>
        <div class="mt-3 flex items-center text-xs text-slate-500">
          Navigasi dinamis
        </div>
      </div>

      <!-- Database Status -->
      <div class="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-slate-300 transition-all">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Status Database</p>
            <p class="text-2xl font-bold text-emerald-600 mt-1">Online</p>
          </div>
          <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
            ⚡
          </div>
        </div>
        <div class="mt-3 flex items-center text-xs text-slate-500">
          TiDB Cloud MySQL
        </div>
      </div>
    </div>

    <!-- Modul Roadmap Cards -->
    <div class="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
        Modul ERP Gereja
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Module 1 -->
        <div class="p-4 rounded-xl border border-indigo-100 bg-indigo-50/30">
          <div class="flex items-center justify-between mb-2">
            <span class="text-lg">🔐</span>
            <span class="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">Siap</span>
          </div>
          <h4 class="font-bold text-slate-900 text-sm">Modul 1: Otentikasi & RBAC</h4>
          <p class="text-xs text-slate-500 mt-1">Users, Roles, Dynamic Menus, dan Audit Trail.</p>
        </div>

        <!-- Module 2 -->
        <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
          <div class="flex items-center justify-between mb-2">
            <span class="text-lg">📅</span>
            <span class="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">Berikutnya</span>
          </div>
          <h4 class="font-bold text-slate-800 text-sm">Modul 2: Jadwal & Absensi</h4>
          <p class="text-xs text-slate-500 mt-1">Jadwal ibadah, penugasan pelayan, dan absensi kehadiran.</p>
        </div>

        <!-- Module 3 -->
        <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
          <div class="flex items-center justify-between mb-2">
            <span class="text-lg">💰</span>
            <span class="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">Rencana</span>
          </div>
          <h4 class="font-bold text-slate-800 text-sm">Modul 3: Keuangan Kas</h4>
          <p class="text-xs text-slate-500 mt-1">Kas masuk (kolekte/donasi), kas keluar, dan mutasi.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import apiClient from '@/api/axios'

const authStore = useAuthStore()

const stats = reactive({
  users: 0,
  roles: 0,
  menus: 0
})

const fetchStats = async () => {
  try {
    const [uRes, rRes, mRes] = await Promise.all([
      apiClient.get('/users'),
      apiClient.get('/roles'),
      apiClient.get('/menus')
    ])
    if (uRes.success) stats.users = uRes.data?.length || 0
    if (rRes.success) stats.roles = rRes.data?.length || 0
    if (mRes.success) stats.menus = mRes.data?.length || 0
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
  }
}

onMounted(() => {
  fetchStats()
})
</script>
