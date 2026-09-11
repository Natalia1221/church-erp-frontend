<template>
  <div class="space-y-4">
    <!-- 1. Top Bar: Status Tabs (All / Active / Inactive) & Create New Button -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <!-- Status Tabs -->
      <div class="inline-flex p-1 rounded-xl bg-white border border-slate-200 shadow-xs">
        <button
          @click="statusTab = 'all'"
          :class="[
            'px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
            statusTab === 'all'
              ? 'bg-slate-100 text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          ]"
        >
          All
        </button>
        <button
          @click="statusTab = 'active'"
          :class="[
            'px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
            statusTab === 'active'
              ? 'bg-slate-100 text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          ]"
        >
          Active
        </button>
        <button
          @click="statusTab = 'inactive'"
          :class="[
            'px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
            statusTab === 'inactive'
              ? 'bg-slate-100 text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          ]"
        >
          Inactive
        </button>
      </div>

      <!-- Create New Button -->
      <button
        @click="openAddModal"
        class="px-5 py-2 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
      >
        <span>+ Tambah Kategori Baru</span>
      </button>
    </div>

    <!-- Alert Notification -->
    <div
      v-if="alert.message"
      :class="[
        'p-3.5 rounded-xl text-xs border flex items-center justify-between',
        alert.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
      ]"
    >
      <span>{{ alert.message }}</span>
      <button @click="alert.message = ''" class="text-xs hover:opacity-75 cursor-pointer">✕</button>
    </div>

    <!-- 2. Action Toolbar: Global Search + Action Buttons Group + Refresh -->
    <div class="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
        <!-- Global Search Input -->
        <div class="relative w-64 max-w-full">
          <input
            v-model="globalSearch"
            type="text"
            placeholder="Cari nama, deskripsi..."
            class="w-full pl-9 pr-7 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
          <button
            v-if="globalSearch"
            @click="globalSearch = ''"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        <!-- Action Buttons Group (Delete, View, Edit, Duplicate) -->
        <div class="flex items-center gap-1.5">
          <!-- Delete (Red) -->
          <button
            @click="handleDeleteSelected"
            :disabled="!selectedCategory"
            :class="[
              'w-8 h-8 rounded-lg flex items-center justify-center text-white transition-all cursor-pointer shadow-xs',
              selectedCategory
                ? 'bg-rose-500 hover:bg-rose-600 active:scale-95'
                : 'bg-rose-300 opacity-50 cursor-not-allowed'
            ]"
            title="Hapus Kategori Terpilih"
          >
            <span class="text-sm">🗑️</span>
          </button>

          <!-- View Detail (Green) -->
          <button
            @click="handleViewSelected"
            :disabled="!selectedCategory"
            :class="[
              'w-8 h-8 rounded-lg flex items-center justify-center text-white transition-all cursor-pointer shadow-xs',
              selectedCategory
                ? 'bg-emerald-500 hover:bg-emerald-600 active:scale-95'
                : 'bg-emerald-300 opacity-50 cursor-not-allowed'
            ]"
            title="Lihat Detail Kategori"
          >
            <span class="text-sm">👁️</span>
          </button>

          <!-- Edit (Blue) -->
          <button
            @click="handleEditSelected"
            :disabled="!selectedCategory"
            :class="[
              'w-8 h-8 rounded-lg flex items-center justify-center text-white transition-all cursor-pointer shadow-xs',
              selectedCategory
                ? 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                : 'bg-blue-300 opacity-50 cursor-not-allowed'
            ]"
            title="Edit Kategori Terpilih"
          >
            <span class="text-sm">✏️</span>
          </button>

          <!-- Duplicate / Copy (Slate) -->
          <button
            @click="handleDuplicateSelected"
            :disabled="!selectedCategory"
            :class="[
              'w-8 h-8 rounded-lg flex items-center justify-center text-white transition-all cursor-pointer shadow-xs',
              selectedCategory
                ? 'bg-slate-700 hover:bg-slate-800 active:scale-95'
                : 'bg-slate-400 opacity-50 cursor-not-allowed'
            ]"
            title="Duplikat Kategori Terpilih"
          >
            <span class="text-sm">📋</span>
          </button>
        </div>
      </div>

      <!-- Refresh Button -->
      <button
        @click="fetchCategories"
        :disabled="loading"
        class="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
        title="Muat Ulang Data"
      >
        <span :class="['text-sm inline-block', loading ? 'animate-spin' : '']">🔄</span>
      </button>
    </div>

    <!-- 3. Main Data Table with Column-Level Search Filters -->
    <div class="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-600 whitespace-nowrap">
          <thead class="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-[11px] uppercase tracking-wider">
            <!-- Header Row 1: Titles -->
            <tr>
              <th class="py-3 px-3 w-10 text-center"></th>
              <th class="py-3 px-3 w-12 text-center">No</th>
              <th class="py-3 px-4 min-w-[180px]">Nama Kategori Pelayanan</th>
              <th class="py-3 px-3 min-w-[240px]">Deskripsi / Catatan</th>
              <th class="py-3 px-3 text-center w-28">Sequence</th>
              <th class="py-3 px-3 text-center w-28">Status</th>
              <th class="py-3 px-4 text-center w-24">Aksi</th>
            </tr>

            <!-- Header Row 2: Per-column Filter Inputs -->
            <tr class="bg-white border-t border-slate-100 normal-case tracking-normal">
              <!-- Radio Col -->
              <th class="py-2 px-2 text-center"></th>

              <!-- No Col -->
              <th class="py-2 px-2 text-center"></th>

              <!-- Search Name -->
              <th class="py-2 px-4">
                <div class="relative">
                  <span class="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">🔍</span>
                  <input
                    v-model="filters.name"
                    type="text"
                    placeholder="Filter nama..."
                    class="w-full pl-6 pr-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-[11px] placeholder-slate-400 font-normal focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </th>

              <!-- Search Description -->
              <th class="py-2 px-3">
                <div class="relative">
                  <span class="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">🔍</span>
                  <input
                    v-model="filters.description"
                    type="text"
                    placeholder="Filter deskripsi..."
                    class="w-full pl-6 pr-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-[11px] placeholder-slate-400 font-normal focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </th>

              <!-- Sequence Filter -->
              <th class="py-2 px-2 text-center"></th>

              <!-- Status Dropdown Filter -->
              <th class="py-2 px-3 text-center">
                <select
                  v-model="filters.status"
                  class="w-full py-1 px-1.5 bg-slate-50 border border-slate-200 rounded-md text-[11px] text-slate-600 font-normal focus:bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Semua</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </th>

              <!-- Action Col -->
              <th class="py-2 px-2 text-center"></th>
            </tr>
          </thead>

          <!-- Table Body -->
          <tbody class="divide-y divide-slate-100 font-normal">
            <!-- Loading -->
            <tr v-if="loading">
              <td colspan="7" class="py-12 text-center text-slate-400">
                <span class="inline-block w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></span>
                Memuat data kategori pelayanan...
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-else-if="paginatedCategories.length === 0">
              <td colspan="7" class="py-12 text-center text-slate-400">
                <p class="text-sm font-medium text-slate-600">Tidak ada data kategori pelayanan yang cocok.</p>
                <p class="text-xs text-slate-400 mt-1">Coba sesuaikan filter pencarian atau buat kategori baru.</p>
              </td>
            </tr>

            <!-- Data Rows -->
            <tr
              v-for="(item, index) in paginatedCategories"
              :key="item.id"
              @click="selectCategory(item)"
              :class="[
                'transition-colors cursor-pointer',
                selectedCategory?.id === item.id ? 'bg-blue-50/60' : 'hover:bg-slate-50/70'
              ]"
            >
              <!-- Radio Select -->
              <td class="py-3 px-3 text-center" @click.stop>
                <input
                  type="radio"
                  name="selected_category"
                  :checked="selectedCategory?.id === item.id"
                  @change="selectCategory(item)"
                  class="text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </td>

              <!-- No -->
              <td class="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">
                {{ (currentPage - 1) * pageSize + index + 1 }}
              </td>

              <!-- Nama Kategori Pelayanan -->
              <td class="py-3 px-4 font-semibold text-slate-900">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>{{ item.name }}</span>
                </div>
              </td>

              <!-- Deskripsi / Catatan -->
              <td class="py-3 px-3 text-slate-500 truncate max-w-xs">
                {{ item.description || '-' }}
              </td>

              <!-- Sequence -->
              <td class="py-3 px-3 text-center">
                <span class="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 font-mono text-[11px] font-semibold text-slate-700">
                  {{ item.sequence !== null ? item.sequence : 0 }}
                </span>
              </td>

              <!-- Status -->
              <td class="py-3 px-3 text-center">
                <span
                  :class="[
                    'px-2.5 py-0.5 rounded-full text-[11px] font-semibold border',
                    item.is_active
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  ]"
                >
                  {{ item.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>

              <!-- Action Inline -->
              <td class="py-3 px-4 text-center" @click.stop>
                <div class="flex items-center justify-center gap-1.5">
                  <button
                    @click="openViewModal(item)"
                    class="p-1 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                    title="Detail"
                  >
                    👁️
                  </button>
                  <button
                    @click="openEditModal(item)"
                    class="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    @click="confirmDelete(item)"
                    class="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Hapus"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 4. Table Pagination Footer -->
      <div class="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div class="flex items-center gap-4">
          <span>{{ paginationInfo }}</span>
          <div class="flex items-center gap-1.5">
            <span>Show</span>
            <select
              v-model.number="pageSize"
              @change="currentPage = 1"
              class="px-2 py-1 rounded-md border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
            <span>entries</span>
          </div>
        </div>

        <!-- Page Buttons -->
        <div class="flex items-center gap-1" v-if="totalPages > 1">
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="px-2.5 py-1 rounded-md border border-slate-200 text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            &larr; Prev
          </button>

          <button
            v-for="page in displayedPages"
            :key="page"
            @click="typeof page === 'number' && (currentPage = page)"
            :disabled="page === '...'"
            :class="[
              'px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer',
              currentPage === page
                ? 'bg-blue-600 text-white'
                : page === '...'
                ? 'text-slate-400 cursor-default'
                : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
            ]"
          >
            {{ page }}
          </button>

          <button
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="px-2.5 py-1 rounded-md border border-slate-200 text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            Next &rarr;
          </button>
        </div>
      </div>
    </div>

    <!-- 5. Modal Form (Create / Edit Kategori) -->
    <div
      v-if="isFormModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto"
    >
      <div class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 w-full max-w-lg shadow-2xl space-y-4 my-auto">
        <!-- Modal Header -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 class="text-base font-bold text-slate-900">
              {{ isEdit ? 'Edit Kategori Pelayanan' : 'Tambah Kategori Pelayanan Baru' }}
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">
              {{ isEdit ? 'Perbarui informasi kategori pelayanan' : 'Tambahkan kategori baru untuk jadwal pelayanan ibadah' }}
            </p>
          </div>
          <button @click="isFormModalOpen = false" class="text-slate-400 hover:text-slate-600 cursor-pointer text-lg">✕</button>
        </div>

        <form @submit.prevent="saveCategory" class="space-y-4">
          <!-- Nama Kategori -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Nama Kategori Pelayanan <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="Contoh: Pujian, Horong 1, Horong 2, Horong 3, Pemusik"
              class="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-blue-600"
            />
          </div>

          <!-- Sequence (Urutan) -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Urutan (Sequence)
            </label>
            <input
              v-model.number="form.sequence"
              type="number"
              step="any"
              placeholder="Contoh: 1, 2, 3..."
              class="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-blue-600"
            />
            <p class="text-[11px] text-slate-400 mt-1">Urutan posisi kategori saat ditampilkan pada pembuatan jadwal.</p>
          </div>

          <!-- Deskripsi / Catatan -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Deskripsi / Catatan
            </label>
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="Keterangan mengenai tugas atau kriteria kategori ini..."
              class="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-blue-600 resize-y"
            ></textarea>
          </div>

          <!-- Status Aktif -->
          <div class="pt-1">
            <label class="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                v-model="form.is_active"
                type="checkbox"
                class="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
              />
              <span class="text-xs font-semibold text-slate-700">Status Aktif</span>
            </label>
          </div>

          <!-- Actions -->
          <div class="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              @click="isFormModalOpen = false"
              class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {{ submitting ? 'Menyimpan...' : 'Simpan Kategori' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 6. Modal Detail (View Only) -->
    <div
      v-if="isViewModalOpen && viewingCategory"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
    >
      <div class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 w-full max-w-md shadow-2xl space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 class="text-base font-bold text-slate-900">Detail Kategori Pelayanan</h3>
            <p class="text-xs text-slate-500 mt-0.5">Informasi lengkap data kategori</p>
          </div>
          <button @click="isViewModalOpen = false" class="text-slate-400 hover:text-slate-600 cursor-pointer text-lg">✕</button>
        </div>

        <div class="space-y-3 text-xs text-slate-600 divide-y divide-slate-100">
          <div class="flex justify-between py-1">
            <span class="font-semibold text-slate-500">Nama Kategori:</span>
            <span class="font-bold text-slate-900">{{ viewingCategory.name }}</span>
          </div>
          <div class="flex justify-between py-1">
            <span class="font-semibold text-slate-500">Sequence:</span>
            <span class="font-mono font-bold text-slate-800">{{ viewingCategory.sequence }}</span>
          </div>
          <div class="flex justify-between py-1">
            <span class="font-semibold text-slate-500">Status:</span>
            <span
              :class="[
                'px-2 py-0.5 rounded-full text-[11px] font-semibold border',
                viewingCategory.is_active
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              ]"
            >
              {{ viewingCategory.is_active ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <div class="py-1">
            <span class="font-semibold text-slate-500 block mb-1">Deskripsi / Catatan:</span>
            <p class="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 leading-relaxed">
              {{ viewingCategory.description || 'Tidak ada catatan.' }}
            </p>
          </div>
          <div class="flex justify-between py-1 text-[11px] text-slate-400">
            <span>Dibuat pada:</span>
            <span>{{ new Date(viewingCategory.created_at).toLocaleString('id-ID') }}</span>
          </div>
        </div>

        <div class="pt-3 flex justify-end border-t border-slate-100">
          <button
            type="button"
            @click="isViewModalOpen = false"
            class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import apiClient from '@/api/axios'

const categories = ref([])
const loading = ref(false)
const submitting = ref(false)
const selectedCategory = ref(null)

// Status Tab filter: 'all' | 'active' | 'inactive'
const statusTab = ref('all')

// Global Search
const globalSearch = ref('')

// Column-level filters
const filters = reactive({
  name: '',
  description: '',
  status: ''
})

// Pagination
const pageSize = ref(10)
const currentPage = ref(1)

// Modal states
const isFormModalOpen = ref(false)
const isEdit = ref(false)
const currentId = ref(null)

const isViewModalOpen = ref(false)
const viewingCategory = ref(null)

const alert = reactive({
  type: 'success',
  message: ''
})

const form = reactive({
  name: '',
  description: '',
  sequence: 1,
  is_active: true
})

// Fetch all categories from API
const fetchCategories = async () => {
  loading.value = true
  try {
    const res = await apiClient.get('/categories')
    if (res.success) {
      categories.value = res.data || []
      // Re-link selectedCategory jika masih ada
      if (selectedCategory.value) {
        selectedCategory.value = categories.value.find(c => c.id === selectedCategory.value.id) || null
      }
    }
  } catch (error) {
    console.error('Error fetchCategories:', error)
    alert.type = 'error'
    alert.message = error.message || 'Gagal mengambil data kategori pelayanan'
  } finally {
    loading.value = false
  }
}

// Filtered categories
const filteredCategories = computed(() => {
  return categories.value.filter(cat => {
    // 1. Status Tab filter
    if (statusTab.value === 'active' && !cat.is_active) return false
    if (statusTab.value === 'inactive' && cat.is_active) return false

    // 2. Column-level status filter
    if (filters.status === 'active' && !cat.is_active) return false
    if (filters.status === 'inactive' && cat.is_active) return false

    // 3. Global search
    if (globalSearch.value.trim()) {
      const q = globalSearch.value.toLowerCase().trim()
      const matchName = cat.name && cat.name.toLowerCase().includes(q)
      const matchDesc = cat.description && cat.description.toLowerCase().includes(q)
      if (!matchName && !matchDesc) return false
    }

    // 4. Column name filter
    if (filters.name.trim()) {
      const q = filters.name.toLowerCase().trim()
      if (!cat.name || !cat.name.toLowerCase().includes(q)) return false
    }

    // 5. Column description filter
    if (filters.description.trim()) {
      const q = filters.description.toLowerCase().trim()
      if (!cat.description || !cat.description.toLowerCase().includes(q)) return false
    }

    return true
  })
})

// Pagination Computeds
const totalPages = computed(() => Math.ceil(filteredCategories.value.length / pageSize.value) || 1)

const paginatedCategories = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredCategories.value.slice(start, start + pageSize.value)
})

const paginationInfo = computed(() => {
  const total = filteredCategories.value.length
  if (total === 0) return 'Showing 0 to 0 of 0 results'
  const start = (currentPage.value - 1) * pageSize.value + 1
  const end = Math.min(start + pageSize.value - 1, total)
  return `Showing ${start} to ${end} of ${total} results`
})

const displayedPages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const pages = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (current < total - 2) pages.push('...')
    pages.push(total)
  }
  return pages
})

// Selection
const selectCategory = (category) => {
  if (selectedCategory.value?.id === category.id) {
    selectedCategory.value = null
  } else {
    selectedCategory.value = category
  }
}

// Modal Handlers
const openAddModal = () => {
  isEdit.value = false
  currentId.value = null
  form.name = ''
  form.description = ''
  form.sequence = (categories.value.length + 1) * 1.0
  form.is_active = true
  isFormModalOpen.value = true
}

const openEditModal = (item) => {
  isEdit.value = true
  currentId.value = item.id
  form.name = item.name
  form.description = item.description || ''
  form.sequence = item.sequence !== null ? item.sequence : 0
  form.is_active = Boolean(item.is_active)
  isFormModalOpen.value = true
}

const openViewModal = (item) => {
  viewingCategory.value = item
  isViewModalOpen.value = true
}

// Action Bar Buttons
const handleViewSelected = () => {
  if (selectedCategory.value) {
    openViewModal(selectedCategory.value)
  }
}

const handleEditSelected = () => {
  if (selectedCategory.value) {
    openEditModal(selectedCategory.value)
  }
}

const handleDuplicateSelected = () => {
  if (!selectedCategory.value) return
  isEdit.value = false
  currentId.value = null
  form.name = `${selectedCategory.value.name} (Copy)`
  form.description = selectedCategory.value.description || ''
  form.sequence = (Number(selectedCategory.value.sequence) || 0) + 1
  form.is_active = Boolean(selectedCategory.value.is_active)
  isFormModalOpen.value = true
}

const handleDeleteSelected = () => {
  if (selectedCategory.value) {
    confirmDelete(selectedCategory.value)
  }
}

// Save Category (Create / Update)
const saveCategory = async () => {
  if (!form.name || !form.name.trim()) {
    alert.type = 'error'
    alert.message = 'Nama kategori pelayanan wajib diisi'
    return
  }

  submitting.value = true
  alert.message = ''
  try {
    const payload = {
      name: form.name.trim(),
      description: form.description && form.description.trim() ? form.description.trim() : null,
      sequence: form.sequence !== undefined && form.sequence !== null && form.sequence !== '' ? Number(form.sequence) : 0,
      is_active: Boolean(form.is_active)
    }

    if (isEdit.value) {
      const res = await apiClient.put(`/categories/${currentId.value}`, payload)
      if (res.success) {
        alert.type = 'success'
        alert.message = `Kategori pelayanan "${form.name}" berhasil diperbarui`
        isFormModalOpen.value = false
        await fetchCategories()
      }
    } else {
      const res = await apiClient.post('/categories', payload)
      if (res.success) {
        alert.type = 'success'
        alert.message = `Kategori pelayanan baru "${form.name}" berhasil ditambahkan`
        isFormModalOpen.value = false
        await fetchCategories()
      }
    }
  } catch (error) {
    alert.type = 'error'
    alert.message = error.message || 'Gagal menyimpan kategori pelayanan'
  } finally {
    submitting.value = false
  }
}

// Delete Category
const confirmDelete = async (item) => {
  if (confirm(`Apakah Anda yakin ingin menghapus kategori pelayanan "${item.name}"?`)) {
    try {
      const res = await apiClient.delete(`/categories/${item.id}`)
      if (res.success) {
        alert.type = 'success'
        alert.message = `Kategori pelayanan "${item.name}" berhasil dihapus`
        if (selectedCategory.value?.id === item.id) {
          selectedCategory.value = null
        }
        await fetchCategories()
      }
    } catch (error) {
      alert.type = 'error'
      alert.message = error.message || 'Gagal menghapus kategori pelayanan'
    }
  }
}

onMounted(() => {
  fetchCategories()
})
</script>
