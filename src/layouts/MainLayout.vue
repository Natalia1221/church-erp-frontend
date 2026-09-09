<template>
  <div class="flex h-screen bg-[#070d19] text-slate-100 overflow-hidden font-sans">
    <!-- Mobile Backdrop Overlay -->
    <div
      v-if="isMobileMenuOpen"
      @click="isMobileMenuOpen = false"
      class="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity md:hidden"
    ></div>

    <!-- Sidebar Container -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 flex flex-col bg-[#0b1426] border-r border-[#15233e] transition-all duration-300 ease-in-out md:static select-none',
        // Responsive Mobile handling
        isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0',
        // Desktop Collapse handling
        isCollapsed ? 'md:w-[72px]' : 'md:w-64'
      ]"
    >
      <!-- 1. Header Sidebar (Brand Logo) -->
      <div class="flex items-center justify-between h-[70px] px-4 border-b border-[#15233e] shrink-0">
        <div class="flex items-center gap-3 overflow-hidden">
          <!-- Logo Box -->
          <div class="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-md shadow-black/30 shrink-0 text-[#0b1426]">
            <svg class="w-6 h-6 text-[#0b1426]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>

          <!-- Brand Text (Hidden when collapsed) -->
          <div v-show="!isCollapsed" class="min-w-0 transition-opacity duration-200">
            <h1 class="text-base font-extrabold tracking-wide text-white leading-tight truncate">
              CHURCH <span class="text-cyan-400">ERP</span>
            </h1>
            <p class="text-[11px] text-[#7e95b7] font-medium tracking-tight truncate">
              ERP System v1.0
            </p>
          </div>
        </div>

        <!-- Mobile Close Button -->
        <button
          @click="isMobileMenuOpen = false"
          class="md:hidden text-[#7e95b7] hover:text-white p-1 rounded-lg hover:bg-[#15233e]"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- 2. Search Menu Box (Hidden when collapsed) -->
      <div v-show="!isCollapsed" class="px-3 pt-4 pb-2 shrink-0">
        <div class="relative">
          <Search class="w-4 h-4 text-[#7e95b7] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            placeholder="Cari Menu (Ctrl+K)"
            class="w-full pl-9 pr-3 py-2 bg-[#101c34] border border-[#1c2e50] rounded-lg text-xs text-slate-200 placeholder-[#7e95b7] focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 transition-colors"
          />
          <span
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#7e95b7] hover:text-white cursor-pointer"
          >
            ✕
          </span>
        </div>
      </div>

      <!-- 3. Navigation Menu List -->
      <div class="flex-1 overflow-y-auto px-2.5 py-3 space-y-1 custom-scroll">
        <!-- If searching and no match found -->
        <div v-if="searchQuery && filteredNavList.length === 0" class="px-3 py-6 text-center text-xs text-[#7e95b7]">
          Menu "{{ searchQuery }}" tidak ditemukan
        </div>

        <!-- Render Menu Items -->
        <div v-for="menu in filteredNavList" :key="menu.id" class="space-y-0.5">
          <!-- Single Menu Item (No Children) -->
          <router-link
            v-if="!menu.children || menu.children.length === 0"
            :to="menu.path || '#'"
            :title="isCollapsed ? menu.name : undefined"
            :class="[
              'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150',
              isRouteActive(menu.path)
                ? 'bg-[#16274a] text-white'
                : 'text-[#cbd5e1] hover:bg-[#12203a] hover:text-white',
              isCollapsed ? 'justify-center px-2' : ''
            ]"
          >
            <component :is="getMenuIcon(menu.icon, menu.name)" class="w-4 h-4 shrink-0 text-[#94a3b8] group-hover:text-white" />
            <span v-show="!isCollapsed" class="truncate text-[13.5px]">{{ menu.name }}</span>
          </router-link>

          <!-- Parent Menu Item with Children (Collapsible) -->
          <div v-else class="space-y-0.5">
            <button
              @click="toggleSubmenu(menu.id)"
              :title="isCollapsed ? menu.name : undefined"
              :class="[
                'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150',
                isParentActive(menu)
                  ? 'bg-[#132342] text-white'
                  : 'text-[#cbd5e1] hover:bg-[#12203a] hover:text-white',
                isCollapsed ? 'justify-center px-2' : ''
              ]"
            >
              <div class="flex items-center gap-3 min-w-0">
                <component :is="getMenuIcon(menu.icon, menu.name)" class="w-4 h-4 shrink-0 text-[#94a3b8] group-hover:text-white" />
                <span v-show="!isCollapsed" class="truncate text-[13.5px] text-left">{{ menu.name }}</span>
              </div>
              <ChevronRight
                v-show="!isCollapsed"
                :class="[
                  'w-4 h-4 shrink-0 text-[#7e95b7] transition-transform duration-200',
                  openSubmenus[menu.id] || searchQuery ? 'rotate-90 text-white' : ''
                ]"
              />
            </button>

            <!-- Submenu Accordion -->
            <div
              v-show="(!isCollapsed && (openSubmenus[menu.id] || searchQuery))"
              class="pl-7 pr-1 py-1 space-y-0.5 border-l border-[#1a2d52] ml-5"
            >
              <router-link
                v-for="sub in menu.children"
                :key="sub.id"
                :to="sub.path || '#'"
                :class="[
                  'flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors',
                  isRouteActive(sub.path)
                    ? 'bg-[#1b2f56] text-white font-semibold'
                    : 'text-[#94a3b8] hover:text-white hover:bg-[#142340]'
                ]"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" :class="isRouteActive(sub.path) ? 'bg-cyan-400' : ''"></span>
                <span class="truncate">{{ sub.name }}</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. Bottom Profile Section & Floating Popover Card -->
      <div class="relative p-3 border-t border-[#15233e] bg-[#0b1426] shrink-0">
        <!-- Floating Popover Card (muncul di atas profil saat diklik) -->
        <div
          v-if="isProfilePopoverOpen"
          class="absolute bottom-[72px] left-3 right-3 bg-[#111e38] border border-[#1e345e] rounded-xl shadow-2xl p-1.5 space-y-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
          <button
            @click="openChangeRoleModal"
            class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-[#182b4e] hover:text-white transition-colors"
          >
            <UserCheck class="w-4 h-4 text-cyan-400" />
            <span>Change Akses Repo</span>
          </button>

          <button
            @click="handleLogout"
            class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-300 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut class="w-4 h-4 text-red-400" />
            <span>Logout</span>
          </button>
        </div>

        <!-- Profile Bar Button -->
        <button
          @click="isProfilePopoverOpen = !isProfilePopoverOpen"
          :class="[
            'w-full flex items-center justify-between p-2 rounded-xl transition-all',
            isProfilePopoverOpen ? 'bg-[#152442]' : 'hover:bg-[#101b33]',
            isCollapsed ? 'justify-center p-1' : ''
          ]"
        >
          <div class="flex items-center gap-3 min-w-0">
            <!-- Avatar Cyan Circle -->
            <div class="w-9 h-9 rounded-full bg-[#06b6d4] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
              {{ getUserInitials() }}
            </div>
            <!-- Name & Subtext -->
            <div v-show="!isCollapsed" class="text-left min-w-0">
              <p class="text-[13px] font-bold text-white truncate leading-snug">
                {{ authStore.user?.name || 'Admin Pusat' }}
              </p>
              <p class="text-[11px] text-[#7e95b7] truncate leading-tight">
                {{ authStore.userRoles[0]?.code?.toLowerCase() || 'admin-pusat' }}
              </p>
            </div>
          </div>

          <!-- Caret Icon -->
          <ChevronUp
            v-show="!isCollapsed"
            :class="[
              'w-4 h-4 text-[#7e95b7] transition-transform duration-200 shrink-0',
              isProfilePopoverOpen ? 'rotate-180 text-white' : ''
            ]"
          />
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#070d19]">
      <!-- Top Header Navbar -->
      <header class="h-[70px] flex items-center justify-between px-6 bg-[#091122]/90 backdrop-blur-md border-b border-[#15233e] shrink-0">
        <!-- Left Section: Toggle & Title -->
        <div class="flex items-center gap-3">
          <!-- Desktop Sidebar Collapse Toggle -->
          <button
            @click="isCollapsed = !isCollapsed"
            class="hidden md:flex p-2 rounded-lg text-[#7e95b7] hover:text-white hover:bg-[#13203c] transition-colors"
            title="Sembunyikan / Tampilkan Sidebar"
          >
            <PanelLeftClose v-if="!isCollapsed" class="w-5 h-5" />
            <PanelLeftOpen v-else class="w-5 h-5" />
          </button>

          <!-- Mobile Hamburger Toggle -->
          <button
            @click="isMobileMenuOpen = true"
            class="md:hidden p-2 rounded-lg text-[#7e95b7] hover:text-white hover:bg-[#13203c] transition-colors"
          >
            <MenuIcon class="w-5 h-5" />
          </button>

          <div>
            <h2 class="text-sm font-bold text-white tracking-wide">
              {{ currentRouteTitle }}
            </h2>
            <p class="text-[11px] text-[#7e95b7] hidden sm:block">
              Sistem Manajemen Gereja & Hak Akses Terpadu
            </p>
          </div>
        </div>

        <!-- Right Section: Status, Date & Quick Info -->
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            TiDB Online
          </div>

          <div class="hidden sm:block text-xs text-[#7e95b7] border-l border-[#1c2e50] pl-3">
            {{ formattedCurrentDate }}
          </div>
        </div>
      </header>

      <!-- Router Page Content Container -->
      <main class="flex-1 overflow-y-auto p-6 bg-[#070d19] custom-scroll">
        <div class="max-w-7xl mx-auto">
          <router-view />
        </div>
      </main>
    </div>

    <!-- Modal Change Role / Akses Repo -->
    <div
      v-if="isChangeRoleModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
    >
      <div class="bg-[#0f1b33] border border-[#1e345e] rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-[#1a2e54]">
          <h3 class="text-sm font-bold text-white flex items-center gap-2">
            <UserCheck class="w-4 h-4 text-cyan-400" />
            <span>Peran & Hak Akses Aktif</span>
          </h3>
          <button @click="isChangeRoleModalOpen = false" class="text-[#7e95b7] hover:text-white">✕</button>
        </div>

        <p class="text-xs text-[#94a3b8]">
          Pengguna saat ini: <strong class="text-white">{{ authStore.user?.name }}</strong>
        </p>

        <div class="space-y-2">
          <div
            v-for="r in authStore.userRoles"
            :key="r.id"
            class="p-3 rounded-xl bg-[#142342] border border-cyan-500/40 flex items-center justify-between text-xs"
          >
            <div>
              <p class="font-bold text-white">{{ r.name }}</p>
              <p class="text-[#7e95b7] font-mono text-[10px]">{{ r.code }}</p>
            </div>
            <span class="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-semibold text-[10px]">
              Aktif
            </span>
          </div>

          <div v-if="!authStore.userRoles || authStore.userRoles.length === 0" class="text-xs text-[#7e95b7] italic py-2">
            Belum ada role lain yang di-assign ke akun Anda.
          </div>
        </div>

        <div class="pt-2 flex justify-end">
          <button
            @click="isChangeRoleModalOpen = false"
            class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Menu as MenuIcon,
  Layers,
  Search,
  ChevronRight,
  ChevronUp,
  LogOut,
  UserCheck,
  PanelLeftClose,
  PanelLeftOpen,
  Calendar,
  DollarSign,
  FileCheck,
  Settings,
  ShoppingCart,
  Boxes,
  Megaphone,
  ShoppingBag,
  Wrench,
  Calculator,
  X
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// State Navigation
const isCollapsed = ref(false)
const isMobileMenuOpen = ref(false)
const isProfilePopoverOpen = ref(false)
const isChangeRoleModalOpen = ref(false)
const searchQuery = ref('')
const searchInputRef = ref(null)
const openSubmenus = reactive({
  setup: true,
  operational: false
})

// Menu Fallback Template sesuai referensi foto jika database belum memiliki menu
const defaultSystemMenus = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard'
  },
  {
    id: 'approval',
    name: 'Approval',
    path: '/dashboard',
    icon: 'FileCheck'
  },
  {
    id: 'setup',
    name: 'Setup',
    icon: 'Settings',
    children: [
      { id: 'users', name: 'Manajemen Pengguna', path: '/users' },
      { id: 'roles', name: 'Peran & Izin (RBAC)', path: '/roles' },
      { id: 'menus', name: 'Daftar Menu Sistem', path: '/menus' }
    ]
  },
  {
    id: 'purchasing',
    name: 'Purchasing',
    icon: 'ShoppingCart',
    children: [
      { id: 'pur-1', name: 'Permintaan Barang', path: '/dashboard' },
      { id: 'pur-2', name: 'Order Pembelian', path: '/dashboard' }
    ]
  },
  {
    id: 'inventory',
    name: 'Inventory',
    icon: 'Boxes',
    children: [
      { id: 'inv-1', name: 'Stok Barang', path: '/dashboard' },
      { id: 'inv-2', name: 'Mutasi Gudang', path: '/dashboard' }
    ]
  },
  {
    id: 'marketing',
    name: 'Marketing',
    icon: 'Megaphone',
    children: [
      { id: 'mkt-1', name: 'Program Kegiatan', path: '/dashboard' }
    ]
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce',
    icon: 'ShoppingBag',
    children: [
      { id: 'ec-1', name: 'Toko Buku & Donasi', path: '/dashboard' }
    ]
  },
  {
    id: 'service',
    name: 'Service',
    icon: 'Wrench',
    children: [
      { id: 'srv-1', name: 'Pemeliharaan Gedung', path: '/dashboard' }
    ]
  },
  {
    id: 'accounting',
    name: 'Accounting',
    icon: 'Calculator',
    children: [
      { id: 'acc-1', name: 'Kas Masuk & Keluar', path: '/dashboard' },
      { id: 'acc-2', name: 'Laporan Keuangan', path: '/dashboard' }
    ]
  }
]

// Gabungan menu dinamis dari backend atau default list
const combinedNavList = computed(() => {
  if (authStore.myMenus && authStore.myMenus.length > 0) {
    return authStore.myMenus
  }
  return defaultSystemMenus
})

// Filter menu berdasarkan input pencarian
const filteredNavList = computed(() => {
  if (!searchQuery.value.trim()) {
    return combinedNavList.value
  }

  const query = searchQuery.value.toLowerCase()
  return combinedNavList.value
    .map(item => {
      // Check if parent matches
      const parentMatches = item.name.toLowerCase().includes(query)

      // Check if any children match
      if (item.children && item.children.length > 0) {
        const matchingChildren = item.children.filter(child =>
          child.name.toLowerCase().includes(query)
        )
        if (matchingChildren.length > 0 || parentMatches) {
          return {
            ...item,
            children: matchingChildren.length > 0 ? matchingChildren : item.children
          }
        }
      }

      return parentMatches ? item : null
    })
    .filter(Boolean)
})

// Pemetaan Ikon Lucide dinamis
const getMenuIcon = (iconName, title = '') => {
  const map = {
    LayoutDashboard,
    FileCheck,
    Settings,
    ShoppingCart,
    Boxes,
    Megaphone,
    ShoppingBag,
    Wrench,
    Calculator,
    Users,
    ShieldCheck,
    Calendar,
    DollarSign
  }

  if (map[iconName]) return map[iconName]

  const lower = title.toLowerCase()
  if (lower.includes('dashboard')) return LayoutDashboard
  if (lower.includes('approval') || lower.includes('setuju')) return FileCheck
  if (lower.includes('setup') || lower.includes('pengaturan')) return Settings
  if (lower.includes('purchase') || lower.includes('beli')) return ShoppingCart
  if (lower.includes('inventory') || lower.includes('gudang') || lower.includes('stok')) return Boxes
  if (lower.includes('market') || lower.includes('kegiatan')) return Megaphone
  if (lower.includes('commerce') || lower.includes('toko')) return ShoppingBag
  if (lower.includes('service') || lower.includes('pemeliharaan')) return Wrench
  if (lower.includes('account') || lower.includes('kas') || lower.includes('keuangan')) return Calculator
  if (lower.includes('user') || lower.includes('pengguna')) return Users
  if (lower.includes('role') || lower.includes('hak akses')) return ShieldCheck
  if (lower.includes('jadwal') || lower.includes('ibadah')) return Calendar

  return Layers
}

const toggleSubmenu = (menuId) => {
  openSubmenus[menuId] = !openSubmenus[menuId]
}

const isRouteActive = (path) => {
  if (!path || path === '#') return false
  return route.path === path
}

const isParentActive = (menu) => {
  if (!menu.children) return false
  return menu.children.some(child => child.path && route.path.startsWith(child.path))
}

const getUserInitials = () => {
  const name = authStore.user?.name || 'Admin Pusat'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

const currentRouteTitle = computed(() => {
  const path = route.path
  if (path.startsWith('/users')) return 'Manajemen Pengguna'
  if (path.startsWith('/roles')) return 'Peran & Hak Akses (RBAC)'
  if (path.startsWith('/menus')) return 'Daftar Menu Sistem'
  return 'Dashboard Overview'
})

const formattedCurrentDate = computed(() => {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
})

const openChangeRoleModal = () => {
  isProfilePopoverOpen.value = false
  isChangeRoleModalOpen.value = true
}

const handleLogout = () => {
  isProfilePopoverOpen.value = false
  authStore.logout()
  router.push('/login')
}

// Global Keyboard Shortcut (Ctrl+K untuk fokus pencarian)
const handleKeyDown = (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    if (searchInputRef.value) {
      searchInputRef.value.focus()
    }
  }
}

// Tutup popover jika mengklik di luar area
const handleClickOutside = (e) => {
  const target = e.target
  if (!target.closest('aside')) {
    isProfilePopoverOpen.value = false
  }
}

onMounted(async () => {
  window.addEventListener('keydown', handleKeyDown)
  document.addEventListener('click', handleClickOutside)
  await authStore.fetchMe()
  await authStore.fetchMyMenus()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Scrollbar halus khusus untuk sidebar */
.custom-scroll::-webkit-scrollbar {
  width: 4px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #1b2c50;
  border-radius: 9999px;
}
.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: #253d6e;
}
</style>
