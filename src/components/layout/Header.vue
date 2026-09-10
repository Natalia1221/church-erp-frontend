<template>
  <header class="h-[70px] flex items-center justify-between px-4 sm:px-6 bg-[#091122] border-b border-[#15233e] shrink-0 select-none">
    <!-- Left Section: Toggle Buttons & Page Title -->
    <div class="flex items-center gap-3">
      <!-- Desktop Sidebar Toggle Button (Collapse / Expand) -->
      <button
        @click="$emit('toggleCollapse')"
        class="hidden md:flex items-center justify-center p-2 rounded-lg text-[#7e95b7] hover:text-white hover:bg-[#13203c] transition-colors"
        :title="isCollapsed ? 'Perluas Sidebar' : 'Kecilkan Sidebar'"
      >
        <PanelLeftClose v-if="!isCollapsed" class="w-5 h-5" />
        <PanelLeftOpen v-else class="w-5 h-5" />
      </button>

      <!-- Mobile Hamburger Button -->
      <button
        @click="$emit('toggleMobile')"
        class="md:hidden flex items-center justify-center p-2 rounded-lg text-[#7e95b7] hover:text-white hover:bg-[#13203c] transition-colors"
      >
        <Menu class="w-5 h-5" />
      </button>

      <!-- Page Title & Breadcrumbs -->
      <div>
        <h2 class="text-sm sm:text-base font-bold text-white leading-tight tracking-wide">
          {{ pageTitle }}
        </h2>
        <p class="text-[11px] text-[#7e95b7] font-medium hidden sm:block">
          Sistem Informasi Administrasi Gereja & Hak Akses
        </p>
      </div>
    </div>

    <!-- Right Section: Status Badge, Date & Notification -->
    <div class="flex items-center gap-3 sm:gap-4">
      <!-- Server Status Badge -->
      <div class="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span class="hidden sm:inline">TiDB Cloud Connected</span>
        <span class="sm:hidden">Online</span>
      </div>

      <!-- Current Date -->
      <div class="hidden lg:block text-xs font-medium text-[#7e95b7] border-l border-[#1c2e50] pl-4">
        {{ currentDate }}
      </div>

      <!-- Notification Bell -->
      <div class="relative hidden sm:block">
        <button class="p-2 rounded-lg text-[#7e95b7] hover:text-white hover:bg-[#13203c] transition-colors">
          <Bell class="w-4 h-4" />
        </button>
        <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400"></span>
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
