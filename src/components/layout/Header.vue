<template>
  <header class="h-[70px] flex items-center justify-between px-4 sm:px-6 bg-white border-b border-slate-200 shrink-0 select-none shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
    <!-- Left Section: Toggle Buttons & Page Title -->
    <div class="flex items-center gap-3">
      <!-- Desktop Sidebar Toggle Button (Collapse / Expand) -->
      <button
        @click="$emit('toggleCollapse')"
        class="hidden md:flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        :title="isCollapsed ? 'Perluas Sidebar' : 'Kecilkan Sidebar'"
      >
        <PanelLeftClose v-if="!isCollapsed" class="w-5 h-5" />
        <PanelLeftOpen v-else class="w-5 h-5" />
      </button>

      <!-- Mobile Hamburger Button -->
      <button
        @click="$emit('toggleMobile')"
        class="md:hidden flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
      >
        <Menu class="w-5 h-5" />
      </button>

      <!-- Page Title & Breadcrumbs -->
      <div>
        <h2 class="text-sm sm:text-base font-bold text-slate-900 leading-tight tracking-wide">
          {{ pageTitle }}
        </h2>
        <p class="text-[11px] text-slate-500 font-medium hidden sm:block">
          Sistem Informasi Administrasi Gereja & Hak Akses
        </p>
      </div>
    </div>

    <!-- Right Section: Status Badge, Date & Notification -->
    <div class="flex items-center gap-3 sm:gap-4">
      <!-- Server Status Badge -->
      <div class="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span class="hidden sm:inline">TiDB Cloud Connected</span>
        <span class="sm:hidden">Online</span>
      </div>

      <!-- Current Date -->
      <div class="hidden lg:block text-xs font-medium text-slate-500 border-l border-slate-200 pl-4">
        {{ currentDate }}
      </div>

      <!-- Notification Bell -->
      <div class="relative hidden sm:block">
        <button class="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
          <Bell class="w-4 h-4" />
        </button>
        <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-600"></span>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Bell
} from 'lucide-vue-next'

defineProps({
  isCollapsed: {
    type: Boolean,
    default: false
  }
})

defineEmits(['toggleCollapse', 'toggleMobile'])

const route = useRoute()

const pageTitle = computed(() => {
  const path = route.path
  if (path.startsWith('/users')) return 'Manajemen Pengguna'
  if (path.startsWith('/roles')) return 'Peran & Hak Akses (RBAC)'
  if (path.startsWith('/menus')) return 'Daftar Menu Sistem'
  return 'Dashboard Overview'
})

const currentDate = computed(() => {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
})
</script>
