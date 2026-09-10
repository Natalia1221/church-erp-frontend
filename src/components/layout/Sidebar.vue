<template>
  <div class="h-full shrink-0 flex">
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
        class="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs md:hidden"
      ></div>
    </transition>

    <!-- Sidebar Container -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 flex flex-col h-full max-h-screen bg-[#0b1426] border-r border-[#15233e] shadow-[4px_0_24px_rgba(0,0,0,0.3)] transition-all duration-300 ease-in-out md:static select-none text-slate-200 shrink-0',
        // Mobile Drawer behavior
        isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0',
        // Desktop Collapse behavior
        isCollapsed ? 'md:w-20' : 'md:w-64'
      ]"
    >
      <!-- 1. Header Brand -->
      <div class="h-[70px] flex items-center justify-between px-4 border-b border-[#15233e] shrink-0">
        <div class="flex items-center gap-3 overflow-hidden">
          <!-- Logo Box (Square white box matching reference) -->
          <div class="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-md shadow-black/40 shrink-0 text-[#0b1426]">
            <svg class="w-6 h-6 text-[#0b1426]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>

          <!-- Brand Text (Hidden when collapsed) -->
          <div v-show="!isCollapsed" class="min-w-0 transition-opacity duration-200">
            <h1 class="text-sm font-extrabold tracking-wide text-white leading-tight truncate">
              CHURCH <span class="text-cyan-400">ERP</span>
            </h1>
            <p class="text-[11px] text-[#7e95b7] font-medium tracking-tight truncate">
              ERP System v1.0
            </p>
          </div>
        </div>

        <!-- Mobile Close Button -->
        <button
          @click="$emit('closeMobile')"
          class="md:hidden text-[#7e95b7] hover:text-white p-1 rounded-lg hover:bg-[#15233e] transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- 2. Search Menu Box (Hidden when collapsed) -->
      <div v-show="!isCollapsed" class="px-3 pt-3.5 pb-1 shrink-0">
        <div class="relative">
          <Search class="w-3.5 h-3.5 text-[#7e95b7] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            placeholder="Cari Menu (Ctrl+K)"
            class="w-full pl-8 pr-3 py-1.5 bg-[#101c34] border border-[#1c2e50] rounded-lg text-xs text-slate-200 placeholder-[#7e95b7] focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 transition-colors"
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

      <!-- 3. Navigation Menu List (Dari data m_menus di Database) -->
      <div class="flex-1 overflow-y-auto px-2.5 py-3 space-y-0.5 custom-scroll">
        <!-- Loading State -->
        <div v-if="authStore.loadingMenus && combinedNavList.length === 0" class="py-8 text-center text-xs text-[#7e95b7]">
          <span class="inline-block w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-2"></span>
          <p v-show="!isCollapsed">Memuat menu...</p>
        </div>

        <!-- Empty State: Jika m_menus belum memiliki menu -->
        <div v-else-if="combinedNavList.length === 0" class="py-8 px-3 text-center text-xs text-[#7e95b7]">
          <p v-show="!isCollapsed">Belum ada menu di m_menus.</p>
        </div>

        <!-- If searching and no match found -->
        <div v-else-if="searchQuery && filteredNavList.length === 0" class="px-3 py-6 text-center text-xs text-[#7e95b7]">
          Menu "{{ searchQuery }}" tidak ditemukan
        </div>

        <!-- Loop Menus dari m_menus -->
        <div v-for="menu in filteredNavList" :key="menu.id" class="space-y-0.5">
          <!-- Single Menu Item without children -->
          <router-link
            v-if="!menu.children || menu.children.length === 0"
            :to="menu.path || '#'"
            @click="handleNavClick"
            :title="isCollapsed ? menu.name : undefined"
            :class="[
              'group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
              isRouteActive(menu.path)
                ? 'bg-[#16274a] text-white font-semibold'
                : 'text-[#cbd5e1] hover:bg-[#12203a] hover:text-white',
              isCollapsed ? 'justify-center px-0 py-2.5' : ''
            ]"
          >
            <component
              :is="getMenuIcon(menu.icon, menu.name)"
              :class="[
                'w-4 h-4 shrink-0 transition-colors',
                isRouteActive(menu.path) ? 'text-cyan-400' : 'text-[#94a3b8] group-hover:text-white'
              ]"
            />
            <span v-show="!isCollapsed" class="truncate text-[13px]">{{ menu.name }}</span>
          </router-link>

          <!-- Parent Menu with Accordion Submenu -->
          <div v-else class="space-y-0.5">
            <button
              @click="toggleSubmenu(menu.id)"
              :title="isCollapsed ? menu.name : undefined"
              :class="[
                'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
                isParentActive(menu)
                  ? 'bg-[#132342] text-white'
                  : 'text-[#cbd5e1] hover:bg-[#12203a] hover:text-white',
                isCollapsed ? 'justify-center px-0 py-2.5' : ''
              ]"
            >
              <div class="flex items-center gap-3 min-w-0">
                <component
                  :is="getMenuIcon(menu.icon, menu.name)"
                  :class="[
                    'w-4 h-4 shrink-0 transition-colors',
                    isParentActive(menu) ? 'text-cyan-400' : 'text-[#94a3b8]'
                  ]"
                />
                <span v-show="!isCollapsed" class="truncate text-[13px] text-left">{{ menu.name }}</span>
              </div>
              <ChevronRight
                v-show="!isCollapsed"
                :class="[
                  'w-3.5 h-3.5 text-[#7e95b7] transition-transform duration-200 shrink-0',
                  isSubmenuOpen(menu) ? 'rotate-90 text-white' : ''
                ]"
              />
            </button>

            <!-- Submenu Accordion Items (Level 2 & Level 3) -->
            <div
              v-show="!isCollapsed && isSubmenuOpen(menu)"
              class="pl-4 pr-1 py-0.5 space-y-0.5 border-l border-[#1a2d52] ml-5"
            >
              <template v-for="sub in menu.children" :key="sub.id">
                <!-- Level 2 without children -->
                <router-link
                  v-if="!sub.children || sub.children.length === 0"
                  :to="sub.path || '#'"
                  @click="handleNavClick"
                  :class="[
                    'flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                    isRouteActive(sub.path)
                      ? 'bg-[#1b2f56] text-white font-semibold'
                      : 'text-[#94a3b8] hover:bg-[#142340] hover:text-white'
                  ]"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" :class="isRouteActive(sub.path) ? 'bg-cyan-400' : ''"></span>
                  <span class="truncate">{{ sub.name }}</span>
                </router-link>

                <!-- Level 2 WITH children (e.g. Jadwal Pelayanan -> Sermon, Minggu, Lainnya) -->
                <div v-else class="space-y-0.5">
                  <button
                    @click="toggleSubmenu(sub.id)"
                    :class="[
                      'w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer',
                      isParentActive(sub)
                        ? 'bg-[#182b4e] text-white font-semibold'
                        : 'text-[#94a3b8] hover:bg-[#142340] hover:text-white'
                    ]"
                  >
                    <div class="flex items-center gap-2 min-w-0">
                      <span class="w-1.5 h-1.5 rounded-full bg-cyan-500/60 shrink-0"></span>
                      <span class="truncate">{{ sub.name }}</span>
                    </div>
                    <ChevronRight
                      :class="[
                        'w-3 h-3 text-[#7e95b7] transition-transform duration-200 shrink-0',
                        isSubmenuOpen(sub) ? 'rotate-90 text-white' : ''
                      ]"
                    />
                  </button>

                  <!-- Level 3 Children (Sermon, Minggu, Lainnya) -->
                  <div
                    v-show="isSubmenuOpen(sub)"
                    class="pl-4 pr-1 py-0.5 space-y-0.5 border-l border-[#1f3764] ml-3"
                  >
                    <router-link
                      v-for="sub3 in sub.children"
                      :key="sub3.id"
                      :to="sub3.path || '#'"
                      @click="handleNavClick"
                      :class="[
                        'flex items-center gap-2 px-2 py-1 rounded-md text-[11px] font-medium transition-colors',
                        isRouteActive(sub3.path)
                          ? 'bg-[#223d6f] text-cyan-300 font-semibold'
                          : 'text-[#829bbd] hover:bg-[#152747] hover:text-white'
                      ]"
                    >
                      <span class="w-1 h-1 rounded-full bg-slate-500 shrink-0" :class="isRouteActive(sub3.path) ? 'bg-cyan-400' : ''"></span>
                      <span class="truncate">{{ sub3.name }}</span>
                    </router-link>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. Bottom Section: FIXED User Profile & Logout Button -->
      <div class="mt-auto p-3 border-t border-[#15233e] bg-[#0b1426] shrink-0 space-y-2">
        <!-- User Profile Row -->
        <div
          :class="[
            'flex items-center gap-2.5 p-1.5 rounded-xl bg-[#101c34]/60 border border-[#162544]',
            isCollapsed ? 'justify-center p-1 border-0 bg-transparent' : ''
          ]"
        >
          <!-- User Avatar Circle in Cyan (#06b6d4) -->
          <div
            class="w-8 h-8 rounded-full bg-[#06b6d4] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm"
            :title="authStore.user?.name"
          >
            {{ getUserInitials() }}
          </div>

          <!-- Name & Role (Hidden when collapsed) -->
          <div v-show="!isCollapsed" class="text-left min-w-0 flex-1">
            <p class="text-[12px] font-bold text-white truncate leading-tight">
              {{ authStore.user?.name || 'Admin Pusat' }}
            </p>
            <p class="text-[10px] text-[#7e95b7] truncate leading-tight mt-0.5">
              {{ authStore.userRoles[0]?.code?.toLowerCase() || 'admin-pusat' }}
            </p>
          </div>

          <!-- Quick Role / Access Modal Trigger (Hidden when collapsed) -->
          <button
            v-show="!isCollapsed"
            @click="openChangeRoleModal"
            class="text-[#7e95b7] hover:text-cyan-400 p-1.5 rounded-lg hover:bg-[#15233e] transition-colors shrink-0"
            title="Lihat Peran & Akses Aktif"
          >
            <UserCheck class="w-4 h-4" />
          </button>
        </div>

        <!-- FIXED Logout Button At The Bottom -->
        <div>
          <!-- Expanded Mode: Full Width Button with Text -->
          <button
            v-if="!isCollapsed"
            @click="handleLogout"
            class="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 transition-all group shadow-xs cursor-pointer"
          >
            <LogOut class="w-4 h-4 text-rose-400 group-hover:-translate-x-0.5 transition-transform shrink-0" />
            <span>Keluar Sistem</span>
          </button>

          <!-- Collapsed Mode: Icon-Only Centered Button -->
          <button
            v-else
            @click="handleLogout"
            title="Keluar Sistem"
            class="w-10 h-10 mx-auto flex items-center justify-center rounded-xl text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
          >
            <LogOut class="w-4 h-4 text-rose-400" />
          </button>
        </div>
      </div>
    </aside>

    <!-- Modal Change Role / Akses Repo -->
    <div
      v-if="isChangeRoleModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
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
          Pengguna: <strong class="text-white">{{ authStore.user?.name }}</strong>
        </p>

        <div class="space-y-2">
          <div
            v-for="r in authStore.userRoles"
            :key="r.id"
            class="p-2.5 rounded-xl bg-[#142342] border border-cyan-500/40 flex items-center justify-between text-xs"
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
            class="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
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
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Layers,
  Settings,
  Search,
  ChevronRight,
  ChevronUp,
  LogOut,
  UserCheck,
  Calendar,
  DollarSign,
  FileCheck,
  ShoppingCart,
  Boxes,
  Megaphone,
  ShoppingBag,
  Wrench,
  Calculator,
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

// State
const isChangeRoleModalOpen = ref(false)
const searchQuery = ref('')
const searchInputRef = ref(null)

const openSubmenus = reactive({})

const toggleSubmenu = (menuId) => {
  openSubmenus[menuId] = !isSubmenuOpen({ id: menuId })
}

const isSubmenuOpen = (menu) => {
  if (searchQuery.value) return true
  if (openSubmenus[menu.id] !== undefined) return openSubmenus[menu.id]
  return isParentActive(menu) || true
}

// Nav list riil yang diambil langsung dari database (tabel m_menus)
const combinedNavList = computed(() => {
  return authStore.myMenus || []
})

// Filter menu based on search query
const filteredNavList = computed(() => {
  if (!searchQuery.value.trim()) {
    return combinedNavList.value
  }

  const query = searchQuery.value.toLowerCase()
  return combinedNavList.value
    .map(item => {
      const parentMatches = item.name.toLowerCase().includes(query)
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

// Dynamic Icon Resolver
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
    DollarSign,
    Layers
  }

  if (map[iconName]) return map[iconName]

  const lower = (title || '').toLowerCase()
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
  if (lower.includes('jadwal') || lower.includes('ibadah') || lower.includes('event')) return Calendar

  return Layers
}

const isRouteActive = (path) => {
  if (!path || path === '#') return false
  return route.path === path
}

const isParentActive = (menu) => {
  if (!menu.children || menu.children.length === 0) return false
  return menu.children.some(child => {
    if (child.path && route.path.startsWith(child.path)) return true
    if (child.children && child.children.length > 0) {
      return isParentActive(child)
    }
    return false
  })
}

const getUserInitials = () => {
  const name = authStore.user?.name || 'Admin Pusat'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

const handleNavClick = () => {
  emit('closeMobile')
}

const openChangeRoleModal = () => {
  isChangeRoleModalOpen.value = true
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

// Global Keyboard Shortcut (Ctrl+K)
const handleKeyDown = (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    if (searchInputRef.value) {
      searchInputRef.value.focus()
    }
  }
}

onMounted(async () => {
  window.addEventListener('keydown', handleKeyDown)
  // Ambil data menu riil dari database (tabel m_menus)
  if (authStore.token) {
    await authStore.fetchMyMenus()
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
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
