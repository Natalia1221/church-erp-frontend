<template>
  <div>
    <!-- Mobile Backdrop Overlay -->
    <transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isMobileOpen"
        @click="$emit('closeMobile')"
        class="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
      ></div>
    </transition>

    <!-- Sidebar Container -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200/80 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-300 ease-in-out md:static select-none',
        // Mobile Drawer behavior
        isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0',
        // Desktop Collapse behavior
        isCollapsed ? 'md:w-20' : 'md:w-64'
      ]"
    >
      <!-- Header Brand -->
      <div class="h-16 flex items-center justify-between px-4 border-b border-slate-100 shrink-0">
        <div class="flex items-center gap-3 overflow-hidden">
          <!-- Logo Icon -->
          <div class="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0 font-bold text-lg">
            ✝
          </div>

          <!-- Brand Text (Collapsible) -->
          <div
            v-show="!isCollapsed"
            class="min-w-0 transition-opacity duration-200"
          >
            <h1 class="text-sm font-bold tracking-tight text-slate-900 leading-none">
              CHURCH <span class="text-indigo-600">ERP</span>
            </h1>
            <p class="text-[11px] text-slate-400 font-medium mt-1">
              Enterprise System v1.0
            </p>
          </div>
        </div>

        <!-- Mobile Close Button -->
        <button
          @click="$emit('closeMobile')"
          class="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Navigation Menu List -->
      <div class="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 custom-scroll">
        <!-- Section Label -->
        <div
          v-if="!isCollapsed"
          class="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400"
        >
          Menu Utama
        </div>

        <!-- Loop Menus -->
        <div v-for="menu in menuList" :key="menu.id" class="space-y-1">
          <!-- Single Menu Item without children -->
          <router-link
            v-if="!menu.children || menu.children.length === 0"
            :to="menu.path"
            @click="handleNavClick"
            :title="isCollapsed ? menu.name : undefined"
            :class="[
              'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
              isRouteActive(menu.path)
                ? 'bg-indigo-50/80 text-indigo-600 font-semibold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              isCollapsed ? 'justify-center px-0' : ''
            ]"
          >
            <component
              :is="menu.iconComponent"
              :class="[
                'w-5 h-5 shrink-0 transition-colors',
                isRouteActive(menu.path) ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-700'
              ]"
            />
            <span v-show="!isCollapsed" class="truncate">{{ menu.name }}</span>
          </router-link>

          <!-- Parent Menu with Accordion Submenu -->
          <div v-else class="space-y-1">
            <button
              @click="toggleSubmenu(menu.id)"
              :title="isCollapsed ? menu.name : undefined"
              :class="[
                'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isParentActive(menu)
                  ? 'text-indigo-600 bg-indigo-50/40 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                isCollapsed ? 'justify-center px-0' : ''
              ]"
            >
              <div class="flex items-center gap-3 min-w-0">
                <component
                  :is="menu.iconComponent"
                  :class="[
                    'w-5 h-5 shrink-0 transition-colors',
                    isParentActive(menu) ? 'text-indigo-600' : 'text-slate-400'
                  ]"
                />
                <span v-show="!isCollapsed" class="truncate">{{ menu.name }}</span>
              </div>
              <ChevronDown
                v-show="!isCollapsed"
                :class="[
                  'w-4 h-4 text-slate-400 transition-transform duration-200',
                  openSubmenus[menu.id] ? 'rotate-180 text-slate-700' : ''
                ]"
              />
            </button>

            <!-- Submenu Accordion Items -->
            <div
              v-show="!isCollapsed && openSubmenus[menu.id]"
              class="pl-9 pr-1 py-1 space-y-1 border-l-2 border-slate-100 ml-5"
            >
              <router-link
                v-for="sub in menu.children"
                :key="sub.id"
                :to="sub.path"
                @click="handleNavClick"
                :class="[
                  'flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                  isRouteActive(sub.path)
                    ? 'bg-indigo-50 text-indigo-600 font-semibold'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                ]"
              >
                <span class="truncate">{{ sub.name }}</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom User Profile Bar -->
      <div class="p-3 border-t border-slate-100 bg-slate-50/50 shrink-0">
        <div
          :class="[
            'flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/60 shadow-xs transition-all',
            isCollapsed ? 'justify-center p-1.5' : ''
          ]"
        >
          <div class="flex items-center gap-3 min-w-0">
            <!-- User Avatar Circle -->
            <div class="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
              {{ getUserInitials() }}
            </div>
            <!-- Name & Role (Hidden when collapsed) -->
            <div v-show="!isCollapsed" class="min-w-0">
              <p class="text-xs font-bold text-slate-900 truncate">
                {{ authStore.user?.name || 'Administrator' }}
              </p>
              <p class="text-[10px] text-slate-500 truncate">
                {{ authStore.userRoles[0]?.name || 'Admin Gereja' }}
              </p>
            </div>
          </div>

          <!-- Logout Button -->
          <button
            v-show="!isCollapsed"
            @click="handleLogout"
            title="Keluar"
            class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
          >
            <LogOut class="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Layers,
  Settings,
  ChevronDown,
  LogOut,
  X
} from 'lucide-vue-next'

const props = defineProps({
  isCollapsed: {
    type: Boolean,
    default: false
  },
  isMobileOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['closeMobile'])

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// State Submenu
const openSubmenus = reactive({
  master: true
})

const toggleSubmenu = (menuId) => {
  openSubmenus[menuId] = !openSubmenus[menuId]
}

// Navigasi Standar Bersih
const menuList = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    path: '/dashboard',
    iconComponent: LayoutDashboard
  },
  {
    id: 'master',
    name: 'Master & RBAC',
    iconComponent: Settings,
    children: [
      { id: 'users', name: 'Manajemen Pengguna', path: '/users' },
      { id: 'roles', name: 'Peran & Hak Akses', path: '/roles' },
      { id: 'menus', name: 'Daftar Menu Sistem', path: '/menus' }
    ]
  }
]

const isRouteActive = (path) => {
  return route.path === path
}

const isParentActive = (menu) => {
  if (!menu.children) return false
  return menu.children.some(child => route.path.startsWith(child.path))
}

const getUserInitials = () => {
  const name = authStore.user?.name || 'Admin Gereja'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

const handleNavClick = () => {
  // Tutup drawer jika di mobile
  emit('closeMobile')
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  width: 4px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 9999px;
}
.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>
