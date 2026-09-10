<template>
  <div class="space-y-6">
    <!-- Welcome Header Banner (Dark Enterprise Navy) -->
    <div class="relative overflow-hidden rounded-2xl bg-[#0b1426] border border-[#15233e] p-6 sm:p-8 shadow-2xl">
      <!-- Ambient Glow -->
      <div class="absolute -top-24 -right-24 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-3">
            ✨ Church Enterprise System v1.0
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Selamat Datang, {{ authStore.user?.name || 'Administrator' }}!
          </h1>
          <p class="text-[#7e95b7] text-sm mt-1.5 max-w-xl leading-relaxed">
            Sistem informasi terintegrasi untuk pengelolaan jadwal ibadah, absensi, keuangan kas, dan hak akses gereja.
          </p>
        </div>

        <div class="flex items-center gap-3 shrink-0">
          <router-link
            to="/users"
            class="px-4 py-2.5 rounded-xl bg-[#162a52] hover:bg-[#1c3668] border border-[#23427f] text-white font-semibold text-xs transition-all shadow-md flex items-center gap-2"
          >
            <span>👥</span>
            <span>Kelola User</span>
          </router-link>
          <router-link
            to="/roles"
            class="px-4 py-2.5 rounded-xl bg-[#101c34] hover:bg-[#152442] text-slate-200 border border-[#1c2e50] font-semibold text-xs transition-all flex items-center gap-2"
          >
            <span>🛡️</span>
            <span>Hak Akses</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Quick Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      <!-- Total Users -->
      <div class="bg-[#0b1426] border border-[#15233e] rounded-2xl p-5 shadow-xl hover:border-[#1e345e] transition-all">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-wider text-[#7e95b7]">Total Pengguna</p>
            <p class="text-2xl font-extrabold text-white mt-1">{{ stats.users }}</p>
          </div>
          <div class="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-lg font-bold">
            👤
          </div>
        </div>
        <div class="mt-3 flex items-center text-xs text-[#7e95b7]">
          <span class="text-cyan-400 font-semibold">Aktif</span> &nbsp;di sistem gereja
        </div>
      </div>

      <!-- Total Roles -->
      <div class="bg-[#0b1426] border border-[#15233e] rounded-2xl p-5 shadow-xl hover:border-[#1e345e] transition-all">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-wider text-[#7e95b7]">Peran Sistem</p>
            <p class="text-2xl font-extrabold text-white mt-1">{{ stats.roles }}</p>
          </div>
          <div class="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center text-lg font-bold">
            🛡️
          </div>
        </div>
        <div class="mt-3 flex items-center text-xs text-[#7e95b7]">
          Hak akses RBAC terproteksi
        </div>
      </div>

      <!-- Total Menus -->
      <div class="bg-[#0b1426] border border-[#15233e] rounded-2xl p-5 shadow-xl hover:border-[#1e345e] transition-all">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-wider text-[#7e95b7]">Menu Terdaftar</p>
            <p class="text-2xl font-extrabold text-white mt-1">{{ stats.menus }}</p>
          </div>
          <div class="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-lg font-bold">
            📑
          </div>
        </div>
        <div class="mt-3 flex items-center text-xs text-[#7e95b7]">
          Navigasi dinamis
        </div>
      </div>

      <!-- Database Status -->
      <div class="bg-[#0b1426] border border-[#15233e] rounded-2xl p-5 shadow-xl hover:border-[#1e345e] transition-all">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-wider text-[#7e95b7]">Status Database</p>
            <p class="text-2xl font-extrabold text-emerald-400 mt-1">Online</p>
          </div>
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg font-bold">
            ⚡
          </div>
        </div>
        <div class="mt-3 flex items-center text-xs text-emerald-400">
          TiDB Cloud MySQL
        </div>
      </div>
    </div>

    <!-- Modul Roadmap Cards -->
    <div class="bg-[#0b1426] border border-[#15233e] rounded-2xl p-6 shadow-xl">
      <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">
        Rangkaian Modul ERP Gereja
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Module 1 -->
        <div class="p-4 rounded-xl bg-[#101c34] border border-[#1c2e50]">
          <div class="flex items-center justify-between mb-2">
            <span class="text-lg">🔐</span>
            <span class="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">Aktif</span>
          </div>
          <h4 class="font-bold text-white text-sm">Modul 1: Otentikasi & RBAC</h4>
          <p class="text-xs text-[#7e95b7] mt-1">Users, Roles, Dynamic Menus, dan Audit Trail.</p>
        </div>

        <!-- Module 2 -->
        <div class="p-4 rounded-xl bg-[#101c34]/50 border border-[#172644]">
          <div class="flex items-center justify-between mb-2">
            <span class="text-lg">📅</span>
            <span class="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">Berikutnya</span>
          </div>
          <h4 class="font-bold text-slate-200 text-sm">Modul 2: Jadwal & Absensi</h4>
          <p class="text-xs text-[#7e95b7] mt-1">Jadwal ibadah, penugasan pelayan, dan absensi kehadiran.</p>
        </div>

        <!-- Module 3 -->
        <div class="p-4 rounded-xl bg-[#101c34]/50 border border-[#172644]">
          <div class="flex items-center justify-between mb-2">
            <span class="text-lg">💰</span>
            <span class="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">Rencana</span>
          </div>
          <h4 class="font-bold text-slate-200 text-sm">Modul 3: Keuangan Kas</h4>
          <p class="text-xs text-[#7e95b7] mt-1">Kas masuk (kolekte/donasi), kas keluar, dan mutasi.</p>
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
