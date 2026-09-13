<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Pengaturan Sistem (m_settings)</h1>
        <p class="text-sm text-slate-500 mt-0.5">Kelola konfigurasi master parameter, modul, dan nilai pengaturan aplikasi</p>
      </div>

      <button
        @click="openAddModal"
        class="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>➕</span>
        <span>Tambah Pengaturan</span>
      </button>
    </div>

    <!-- Alert Message -->
    <div
      v-if="alert.message"
      :class="[
        'p-4 rounded-xl text-sm border flex items-center justify-between',
        alert.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
      ]"
    >
      <span>{{ alert.message }}</span>
      <button @click="alert.message = ''" class="text-xs hover:opacity-75 cursor-pointer">✕</button>
    </div>

    <!-- Filter & Search Controls -->
    <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col md:flex-row gap-3 items-center justify-between">
      <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <!-- Search Input -->
        <div class="relative min-w-[240px] flex-1 sm:flex-initial">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari group, key, atau nilai..."
            class="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-cyan-600 focus:bg-white transition-all"
          />
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
          >
            ✕
          </button>
        </div>

        <!-- Filter by Group -->
        <select
          v-model="selectedGroup"
          class="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs focus:outline-none focus:border-cyan-600"
        >
          <option value="">Semua Group</option>
          <option v-for="grp in distinctGroups" :key="grp" :value="grp">
            Group: {{ grp }}
          </option>
        </select>

        <!-- Filter by Status -->
        <select
          v-model="selectedStatus"
          class="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs focus:outline-none focus:border-cyan-600"
        >
          <option value="">Semua Status</option>
          <option value="active">Aktif Saja</option>
          <option value="inactive">Nonaktif Saja</option>
        </select>
      </div>

      <!-- Quick Group Shortcuts -->
      <div class="flex items-center gap-2 text-xs w-full md:w-auto justify-end overflow-x-auto pb-1 md:pb-0">
        <span class="text-slate-400 text-[11px]">Quick filter:</span>
        <button
          @click="selectedGroup = 'm_module'"
          :class="[
            'px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer',
            selectedGroup === 'm_module' ? 'bg-cyan-50 border-cyan-300 text-cyan-700 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
          ]"
        >
          m_module
        </button>
        <button
          @click="selectedGroup = 'm_submodule'"
          :class="[
            'px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer',
            selectedGroup === 'm_submodule' ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
          ]"
        >
          m_submodule
        </button>
      </div>
    </div>

    <!-- Settings Table Card -->
    <div class="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-600">
          <thead class="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th class="py-3.5 px-5 font-semibold">Group</th>
              <th class="py-3.5 px-5 font-semibold">Key (Kunci)</th>
              <th class="py-3.5 px-5 font-semibold">Value 1 (Utama)</th>
              <th class="py-3.5 px-5 font-semibold">Value 2 & 3 & 4</th>
              <th class="py-3.5 px-5 font-semibold text-center">Status</th>
              <th class="py-3.5 px-5 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="loading">
              <td colspan="6" class="py-12 text-center text-slate-400">
                <span class="inline-block w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin mr-2"></span>
                Memuat data pengaturan...
              </td>
            </tr>

            <tr v-else-if="filteredSettings.length === 0">
              <td colspan="6" class="py-12 text-center text-slate-400">
                <div class="space-y-2">
                  <span class="text-3xl">⚙️</span>
                  <p class="text-sm font-medium text-slate-600">Belum ada data di m_settings</p>
                  <p class="text-xs text-slate-400">Klik tombol "Tambah Pengaturan" di atas untuk menambahkan data baru.</p>
                </div>
              </td>
            </tr>

            <tr
              v-for="item in filteredSettings"
              :key="item.id"
              class="hover:bg-slate-50/70 transition-colors"
            >
              <!-- Group -->
              <td class="py-3.5 px-5">
                <span :class="[
                  'px-2.5 py-1 rounded-md text-xs font-semibold',
                  item.group === 'm_module' ? 'bg-cyan-50 text-cyan-700 border border-cyan-200' :
                  item.group === 'm_submodule' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                  'bg-slate-100 text-slate-700 border border-slate-200'
                ]">
                  {{ item.group }}
                </span>
              </td>

              <!-- Key -->
              <td class="py-3.5 px-5 font-bold font-mono text-xs text-slate-900">
                {{ item.key }}
              </td>

              <!-- Value 1 -->
              <td class="py-3.5 px-5 text-xs text-slate-800 max-w-xs truncate">
                <span v-if="item.value1" class="font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                  {{ item.value1 }}
                </span>
                <span v-else class="text-slate-300 italic">-</span>
              </td>

              <!-- Value 2, 3, 4 -->
              <td class="py-3.5 px-5 text-xs text-slate-500">
                <div class="flex flex-wrap gap-1">
                  <span v-if="item.value2" class="px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-600" title="Value 2">
                    V2: {{ item.value2 }}
                  </span>
                  <span v-if="item.value3" class="px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-600" title="Value 3">
                    V3: {{ item.value3 }}
                  </span>
                  <span v-if="item.value4" class="px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-600" title="Value 4">
                    V4: {{ item.value4 }}
                  </span>
                  <span v-if="!item.value2 && !item.value3 && !item.value4" class="text-slate-300 italic">
                    -
                  </span>
                </div>
              </td>

              <!-- Status -->
              <td class="py-3.5 px-5 text-center">
                <button
                  @click="toggleStatus(item)"
                  :class="[
                    'px-2.5 py-0.5 rounded-full text-xs font-semibold transition-opacity hover:opacity-80 cursor-pointer',
                    item.status ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                  ]"
                  :title="item.status ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'"
                >
                  {{ item.status ? 'Aktif' : 'Nonaktif' }}
                </button>
              </td>

              <!-- Actions -->
              <td class="py-3.5 px-5 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="openEditModal(item)"
                    class="p-1.5 text-slate-400 hover:text-cyan-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Edit Pengaturan"
                  >
                    ✏️
                  </button>
                  <button
                    @click="confirmDelete(item)"
                    class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Hapus Pengaturan"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form (Tambah / Edit) -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <div class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 w-full max-w-lg shadow-2xl space-y-5">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 class="text-base font-bold text-slate-900">
            {{ isEditing ? 'Edit Data Pengaturan' : 'Tambah Data Pengaturan Baru' }}
          </h3>
          <button @click="isModalOpen = false" class="text-slate-400 hover:text-slate-600 cursor-pointer text-lg">✕</button>
        </div>

        <form @submit.prevent="saveSetting" class="space-y-4">
          <!-- Group -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Group <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="form.group"
              type="text"
              required
              placeholder="Contoh: m_module, m_submodule, church_info"
              class="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600"
            />
            <div class="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-500">
              <span>Saran cepat:</span>
              <button
                type="button"
                @click="form.group = 'm_module'"
                class="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                m_module
              </button>
              <button
                type="button"
                @click="form.group = 'm_submodule'"
                class="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                m_submodule
              </button>
              <button
                type="button"
                @click="form.group = 'system'"
                class="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                system
              </button>
            </div>
          </div>

          <!-- Key -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Key (Kunci Parameter) <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="form.key"
              type="text"
              required
              placeholder="Contoh: MOD_IBADAH, KODE_KEUANGAN, MAX_USERS"
              class="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-mono focus:bg-white focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600"
            />
          </div>

          <!-- Value 1 (Utama) -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Value 1 (Nilai Utama)
            </label>
            <textarea
              v-model="form.value1"
              rows="2"
              placeholder="Nilai atau label parameter"
              class="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600"
            ></textarea>
          </div>

          <!-- Value 2, 3, 4 (Multi-Column Values) -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Value 2</label>
              <input
                v-model="form.value2"
                type="text"
                placeholder="Nilai 2"
                class="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-cyan-600"
              />
            </div>
            <div>
              <label class="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Value 3</label>
              <input
                v-model="form.value3"
                type="text"
                placeholder="Nilai 3"
                class="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-cyan-600"
              />
            </div>
            <div>
              <label class="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Value 4</label>
              <input
                v-model="form.value4"
                type="text"
                placeholder="Nilai 4"
                class="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-cyan-600"
              />
            </div>
          </div>

          <!-- Status Toggle -->
          <div class="flex items-center gap-2 pt-1">
            <input
              v-model="form.status"
              type="checkbox"
              id="settingStatus"
              class="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 w-4 h-4 cursor-pointer"
            />
            <label for="settingStatus" class="text-xs font-semibold text-slate-700 cursor-pointer">
              Status Aktif
            </label>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              @click="isModalOpen = false"
              class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="modalLoading"
              class="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span v-if="modalLoading" class="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>{{ isEditing ? 'Simpan Perubahan' : 'Simpan Pengaturan' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Konfirmasi Hapus -->
    <div
      v-if="isDeleteModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <div class="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
        <div class="text-center space-y-2">
          <span class="text-3xl">⚠️</span>
          <h3 class="text-base font-bold text-slate-900">Konfirmasi Hapus</h3>
          <p class="text-xs text-slate-500">
            Apakah Anda yakin ingin menghapus pengaturan
            <strong class="text-slate-800 font-mono">{{ deletingItem?.group }} - {{ deletingItem?.key }}</strong>?
          </p>
        </div>

        <div class="flex justify-center gap-3 pt-2">
          <button
            @click="isDeleteModalOpen = false"
            class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
          >
            Batal
          </button>
          <button
            @click="executeDelete"
            :disabled="deleteLoading"
            class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
          >
            {{ deleteLoading ? 'Menghapus...' : 'Ya, Hapus' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const settings = ref([])
const loading = ref(false)
const modalLoading = ref(false)
const deleteLoading = ref(false)

const searchQuery = ref('')
const selectedGroup = ref('')
const selectedStatus = ref('')

const alert = reactive({
  message: '',
  type: 'success'
})

const isModalOpen = ref(false)
const isEditing = ref(false)
const currentId = ref(null)

const form = reactive({
  group: '',
  key: '',
  value1: '',
  value2: '',
  value3: '',
  value4: '',
  status: true
})

const isDeleteModalOpen = ref(false)
const deletingItem = ref(null)

// Ambil data settings dari backend
const fetchSettings = async () => {
  loading.value = true
  try {
    const response = await api.get('/settings')
    if (response.success) {
      settings.value = response.data || []
    }
  } catch (error) {
    console.error('Gagal mengambil data settings:', error)
    showAlert('Gagal memuat data pengaturan', 'error')
  } finally {
    loading.value = false
  }
}

// Daftar group unik dari data yang ada
const distinctGroups = computed(() => {
  const set = new Set(settings.value.map(s => s.group).filter(Boolean))
  return Array.from(set).sort()
})

// Filter data settings berdasarkan input pencarian, group, dan status
const filteredSettings = computed(() => {
  return settings.value.filter(item => {
    // Filter Group
    if (selectedGroup.value && item.group !== selectedGroup.value) {
      return false
    }

    // Filter Status
    if (selectedStatus.value === 'active' && !item.status) return false
    if (selectedStatus.value === 'inactive' && item.status) return false

    // Filter Pencarian
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      const matchGroup = item.group?.toLowerCase().includes(q)
      const matchKey = item.key?.toLowerCase().includes(q)
      const matchV1 = item.value1?.toLowerCase().includes(q)
      const matchV2 = item.value2?.toLowerCase().includes(q)
      const matchV3 = item.value3?.toLowerCase().includes(q)
      const matchV4 = item.value4?.toLowerCase().includes(q)
      return matchGroup || matchKey || matchV1 || matchV2 || matchV3 || matchV4
    }

    return true
  })
})

const openAddModal = () => {
  isEditing.value = false
  currentId.value = null
  form.group = selectedGroup.value || ''
  form.key = ''
  form.value1 = ''
  form.value2 = ''
  form.value3 = ''
  form.value4 = ''
  form.status = true
  isModalOpen.value = true
}

const openEditModal = (item) => {
  isEditing.value = true
  currentId.value = item.id
  form.group = item.group || ''
  form.key = item.key || ''
  form.value1 = item.value1 || ''
  form.value2 = item.value2 || ''
  form.value3 = item.value3 || ''
  form.value4 = item.value4 || ''
  form.status = Boolean(item.status)
  isModalOpen.value = true
}

const saveSetting = async () => {
  modalLoading.value = true
  try {
    if (isEditing.value) {
      const res = await api.put(`/settings/${currentId.value}`, form)
      if (res.success) {
        showAlert('Pengaturan berhasil diperbarui', 'success')
        isModalOpen.value = false
        await fetchSettings()
        if (form.group === 'm_module' || form.group === 'm_submodule') {
          await authStore.fetchMyMenus()
        }
      } else {
        showAlert(res.message || 'Gagal memperbarui pengaturan', 'error')
      }
    } else {
      const res = await api.post('/settings', form)
      if (res.success) {
        showAlert('Pengaturan berhasil ditambahkan', 'success')
        isModalOpen.value = false
        await fetchSettings()
        if (form.group === 'm_module' || form.group === 'm_submodule') {
          await authStore.fetchMyMenus()
        }
      } else {
        showAlert(res.message || 'Gagal menambahkan pengaturan', 'error')
      }
    }
  } catch (error) {
    console.error('Error simpan setting:', error)
    showAlert(error.message || 'Terjadi kesalahan sistem', 'error')
  } finally {
    modalLoading.value = false
  }
}

const toggleStatus = async (item) => {
  try {
    const newStatus = !item.status
    const res = await api.put(`/settings/${item.id}`, {
      status: newStatus
    })
    if (res.success) {
      item.status = newStatus
      showAlert(`Status '${item.key}' diubah menjadi ${newStatus ? 'Aktif' : 'Nonaktif'}`, 'success')
      if (item.group === 'm_module' || item.group === 'm_submodule') {
        await authStore.fetchMyMenus()
      }
    }
  } catch (error) {
    showAlert('Gagal mengubah status', 'error')
  }
}

const confirmDelete = (item) => {
  deletingItem.value = item
  isDeleteModalOpen.value = true
}

const executeDelete = async () => {
  if (!deletingItem.value) return
  deleteLoading.value = true
  try {
    const res = await api.delete(`/settings/${deletingItem.value.id}`)
    if (res.success) {
      showAlert('Pengaturan berhasil dihapus', 'success')
      isDeleteModalOpen.value = false
      await fetchSettings()
      if (deletingItem.value.group === 'm_module' || deletingItem.value.group === 'm_submodule') {
        await authStore.fetchMyMenus()
      }
    } else {
      showAlert(res.message || 'Gagal menghapus pengaturan', 'error')
    }
  } catch (error) {
    showAlert(error.message || 'Gagal menghapus pengaturan', 'error')
  } finally {
    deleteLoading.value = false
  }
}

const showAlert = (message, type = 'success') => {
  alert.message = message
  alert.type = type
  setTimeout(() => {
    alert.message = ''
  }, 4000)
}

onMounted(() => {
  fetchSettings()
})
</script>
