<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Daftar Menu Sistem</h1>
        <p class="text-sm text-slate-500 mt-0.5">Kelola struktur navigasi dan hierarki menu aplikasi</p>
      </div>

      <button
        @click="openAddMenuModal"
        class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2"
      >
        <span>➕</span>
        <span>Tambah Menu</span>
      </button>
    </div>

    <!-- Alert Message -->
    <div
      v-if="alert.message"
      :class="[
        'p-4 rounded-xl text-sm border flex items-center justify-between',
        alert.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'
      ]"
    >
      <span>{{ alert.message }}</span>
      <button @click="alert.message = ''" class="text-xs hover:opacity-75">✕</button>
    </div>

    <!-- Menus Table Card -->
    <div class="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-600">
          <thead class="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th class="py-3.5 px-6 font-semibold">Nama Menu</th>
              <th class="py-3.5 px-6 font-semibold">URL Path</th>
              <th class="py-3.5 px-6 font-semibold">Parent Menu</th>
              <th class="py-3.5 px-6 font-semibold text-center">Urutan</th>
              <th class="py-3.5 px-6 font-semibold">Status</th>
              <th class="py-3.5 px-6 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="loading">
              <td colspan="6" class="py-10 text-center text-slate-400">
                <span class="inline-block w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-2"></span>
                Memuat data menu...
              </td>
            </tr>

            <tr v-else-if="menus.length === 0">
              <td colspan="6" class="py-10 text-center text-slate-400">
                Belum ada menu yang dibuat.
              </td>
            </tr>

            <tr v-for="menu in menus" :key="menu.id" class="hover:bg-slate-50/60 transition-colors">
              <td class="py-4 px-6 font-semibold text-slate-900">
                <div class="flex items-center gap-2">
                  <span :class="menu.parent_id ? 'pl-4 text-slate-600' : 'font-bold text-slate-900'">
                    {{ menu.name }}
                  </span>
                </div>
              </td>
              <td class="py-4 px-6 text-indigo-600 font-mono text-xs">{{ menu.path || '-' }}</td>
              <td class="py-4 px-6 text-xs text-slate-500">
                {{ getParentName(menu.parent_id) }}
              </td>
              <td class="py-4 px-6 text-center text-xs font-semibold text-slate-700">
                {{ menu.sequence }}
              </td>
              <td class="py-4 px-6">
                <span
                  :class="[
                    'px-2.5 py-0.5 rounded-full text-xs font-semibold',
                    menu.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                  ]"
                >
                  {{ menu.is_active ? 'Aktif' : 'Non-Aktif' }}
                </span>
              </td>
              <td class="py-4 px-6 text-right space-x-2">
                <button
                  @click="openEditMenuModal(menu)"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  Edit
                </button>
                <button
                  @click="handleDeleteMenu(menu)"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                >
                  Hapus
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form (Create / Edit Menu) -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
    >
      <div class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-xl space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 class="text-base font-bold text-slate-900">
            {{ isEditMode ? 'Edit Menu' : 'Tambah Menu Baru' }}
          </h3>
          <button @click="isModalOpen = false" class="text-slate-400 hover:text-slate-700">✕</button>
        </div>

        <form @submit.prevent="saveMenu" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Nama Menu</label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="Contoh: Jadwal Ibadah"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">URL Path</label>
            <input
              v-model="form.path"
              type="text"
              placeholder="Contoh: /schedules"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Ikon Key</label>
              <input
                v-model="form.icon"
                type="text"
                placeholder="Calendar / Settings"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Urutan</label>
              <input
                v-model.number="form.sequence"
                type="number"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Parent Menu (Opsional)</label>
            <select
              v-model="form.parent_id"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value="">-- Menu Utama (Root) --</option>
              <option
                v-for="m in parentOptions"
                :key="m.id"
                :value="m.id"
              >
                {{ m.name }}
              </option>
            </select>
          </div>

          <div class="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="menu_is_active"
              v-model="form.is_active"
              class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label for="menu_is_active" class="text-sm font-medium text-slate-700">Menu Aktif</label>
          </div>

          <div class="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              @click="isModalOpen = false"
              class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all disabled:opacity-50"
            >
              {{ submitting ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import apiClient from '@/api/axios'

const menus = ref([])
const loading = ref(false)
const submitting = ref(false)
const isModalOpen = ref(false)
const isEditMode = ref(false)
const currentMenuId = ref(null)

const alert = reactive({
  type: 'success',
  message: ''
})

const form = reactive({
  name: '',
  path: '',
  icon: 'Layers',
  sequence: 1,
  parent_id: '',
  is_active: true
})

const parentOptions = computed(() => {
  return menus.value.filter(m => !m.parent_id && m.id !== currentMenuId.value)
})

const getParentName = (parentId) => {
  if (!parentId) return 'Menu Utama'
  const parent = menus.value.find(m => m.id === parentId)
  return parent ? parent.name : '-'
}

const fetchMenus = async () => {
  loading.value = true
  try {
    const res = await apiClient.get('/menus')
    if (res.success) {
      menus.value = res.data || []
    }
  } catch (error) {
    console.error('Error fetching menus:', error)
  } finally {
    loading.value = false
  }
}

const openAddMenuModal = () => {
  isEditMode.value = false
  currentMenuId.value = null
  form.name = ''
  form.path = ''
  form.icon = 'Layers'
  form.sequence = (menus.value.length + 1) * 10
  form.parent_id = ''
  form.is_active = true
  isModalOpen.value = true
}

const openEditMenuModal = (menu) => {
  isEditMode.value = true
  currentMenuId.value = menu.id
  form.name = menu.name
  form.path = menu.path || ''
  form.icon = menu.icon || 'Layers'
  form.sequence = menu.sequence || 0
  form.parent_id = menu.parent_id || ''
  form.is_active = Boolean(menu.is_active)
  isModalOpen.value = true
}

const saveMenu = async () => {
  submitting.value = true
  alert.message = ''
  try {
    const payload = {
      ...form,
      parent_id: form.parent_id || null
    }

    if (isEditMode.value) {
      const res = await apiClient.put(`/menus/${currentMenuId.value}`, payload)
      if (res.success) {
        alert.type = 'success'
        alert.message = 'Menu berhasil diperbarui'
        isModalOpen.value = false
        await fetchMenus()
      }
    } else {
      const res = await apiClient.post('/menus', payload)
      if (res.success) {
        alert.type = 'success'
        alert.message = 'Menu baru berhasil ditambahkan'
        isModalOpen.value = false
        await fetchMenus()
      }
    }
  } catch (error) {
    alert.type = 'error'
    alert.message = error.message || 'Gagal menyimpan menu'
  } finally {
    submitting.value = false
  }
}

const handleDeleteMenu = async (menu) => {
  if (confirm(`Apakah Anda yakin ingin menghapus menu "${menu.name}"? Submenu di dalamnya juga akan terhapus.`)) {
    try {
      const res = await apiClient.delete(`/menus/${menu.id}`)
      if (res.success) {
        alert.type = 'success'
        alert.message = 'Menu berhasil dihapus'
        await fetchMenus()
      }
    } catch (error) {
      alert.type = 'error'
      alert.message = error.message || 'Gagal menghapus menu'
    }
  }
}

onMounted(() => {
  fetchMenus()
})
</script>
