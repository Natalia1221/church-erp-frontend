<template>
  <div class="space-y-5">
    <!-- 1. Header Page Title & Top Actions -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            Modul Keuangan
          </span>
          <span class="text-slate-400 text-xs">•</span>
          <span class="text-slate-500 text-xs font-medium">Master Data</span>
        </div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Kategori Keuangan</h1>
        <p class="text-xs text-slate-500 mt-0.5">Kelola kategori penerimaan, pengeluaran kas gereja, dan kelompok pos anggaran</p>
      </div>

      <button
        v-if="canCreate"
        @click="openAddModal"
        class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
      >
        <Plus class="w-4 h-4" />
        <span>+ Tambah Kategori Baru</span>
      </button>
    </div>

    <!-- 2. Top Summary KPI Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <!-- Total Kategori -->
      <div class="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Kategori</p>
          <p class="text-2xl font-black text-slate-900 mt-0.5">{{ categories.length }}</p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center font-bold">
          <Layers class="w-5 h-5" />
        </div>
      </div>

      <!-- Kategori Pemasukan -->
      <div class="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Pemasukan (Income)</p>
          <p class="text-2xl font-black text-emerald-600 mt-0.5">{{ countByType('INCOME') }}</p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
          <ArrowDownLeft class="w-5 h-5" />
        </div>
      </div>

      <!-- Kategori Pengeluaran -->
      <div class="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-wider text-rose-600">Pengeluaran (Expense)</p>
          <p class="text-2xl font-black text-rose-600 mt-0.5">{{ countByType('EXPENSE') }}</p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
          <ArrowUpRight class="w-5 h-5" />
        </div>
      </div>

      <!-- Kategori Aktif -->
      <div class="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-wider text-cyan-600">Status Aktif</p>
          <p class="text-2xl font-black text-cyan-700 mt-0.5">{{ countActive }}</p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-600 flex items-center justify-center">
          <CheckCircle2 class="w-5 h-5" />
        </div>
      </div>
    </div>

    <!-- Alert Notification -->
    <div
      v-if="alert.message"
      :class="[
        'p-3.5 rounded-xl text-xs border flex items-center justify-between transition-all',
        alert.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
      ]"
    >
      <div class="flex items-center gap-2">
        <span v-if="alert.type === 'success'">✅</span>
        <span v-else>⚠️</span>
        <span class="font-medium">{{ alert.message }}</span>
      </div>
      <button @click="alert.message = ''" class="text-xs hover:opacity-75 cursor-pointer">✕</button>
    </div>

    <!-- 3. Toolbar & Filters -->
    <div class="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <!-- Status Tabs: All, Active, Inactive -->
        <div class="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/70 self-start">
          <button
            @click="statusTab = 'all'"
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              statusTab === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            ]"
          >
            Semua ({{ categories.length }})
          </button>
          <button
            @click="statusTab = 'active'"
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              statusTab === 'active'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            ]"
          >
            Aktif ({{ countActive }})
          </button>
          <button
            @click="statusTab = 'inactive'"
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              statusTab === 'inactive'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            ]"
          >
            Nonaktif ({{ categories.length - countActive }})
          </button>
        </div>

        <!-- Filter Jenis Transaksi & Search -->
        <div class="flex flex-wrap items-center gap-2.5">
          <!-- Filter Tipe Transaksi Dropdown -->
          <div class="relative">
            <select
              v-model="typeFilter"
              class="pl-3 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-blue-500 focus:bg-white cursor-pointer transition-all"
            >
              <option value="ALL">Semua Jenis Transaksi</option>
              <option value="INCOME">Pemasukan (INCOME)</option>
              <option value="EXPENSE">Pengeluaran (EXPENSE)</option>
              <option value="BUKAN KEDUANYA">Lainnya (Bukan Keduanya)</option>
            </select>
          </div>

          <!-- Search Input -->
          <div class="relative w-64 max-w-full">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari kategori, kelompok..."
              class="w-full pl-9 pr-7 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>

          <!-- Refresh Button -->
          <button
            @click="fetchCategories"
            :disabled="loading"
            class="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
            title="Muat Ulang"
          >
            <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
          </button>
        </div>
      </div>
    </div>

    <!-- 4. Data Table -->
    <div class="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-600">
          <thead class="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200/80">
            <tr>
              <th class="py-3.5 px-4 w-12 text-center">No</th>
              <th class="py-3.5 px-4">Nama Kategori Keuangan</th>
              <th class="py-3.5 px-4">Kelompok / Golongan</th>
              <th class="py-3.5 px-4">Jenis Transaksi</th>
              <th class="py-3.5 px-4 text-center">Status</th>
              <th class="py-3.5 px-4 text-center w-36">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <!-- Loading State -->
            <tr v-if="loading">
              <td colspan="6" class="py-12 text-center text-slate-400">
                <span class="inline-block w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></span>
                <p>Memuat data kategori keuangan...</p>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-else-if="filteredCategories.length === 0">
              <td colspan="6" class="py-12 text-center text-slate-400">
                <p class="font-semibold text-slate-600">Tidak ada kategori keuangan yang sesuai</p>
                <p class="text-[11px] mt-1 text-slate-400">Silakan ubah filter atau tambahkan kategori baru.</p>
              </td>
            </tr>

            <!-- Rows -->
            <tr
              v-for="(cat, index) in filteredCategories"
              :key="cat.id"
              class="hover:bg-slate-50/80 transition-colors"
            >
              <td class="py-3.5 px-4 text-center text-slate-400 font-mono">
                {{ index + 1 }}
              </td>

              <!-- Nama Kategori -->
              <td class="py-3.5 px-4 font-bold text-slate-900">
                {{ cat.name }}
              </td>

              <!-- Kelompok / Group -->
              <td class="py-3.5 px-4 text-slate-600 font-medium">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px]">
                  📁 {{ cat.group }}
                </span>
              </td>

              <!-- Jenis Transaksi -->
              <td class="py-3.5 px-4">
                <span
                  v-if="cat.type === 'INCOME'"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[11px]"
                >
                  <ArrowDownLeft class="w-3.5 h-3.5 text-emerald-600" />
                  Pemasukan (INCOME)
                </span>
                <span
                  v-else-if="cat.type === 'EXPENSE'"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-bold text-[11px]"
                >
                  <ArrowUpRight class="w-3.5 h-3.5 text-rose-600" />
                  Pengeluaran (EXPENSE)
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[11px]"
                >
                  <Layers class="w-3.5 h-3.5 text-slate-500" />
                  Bukan Keduanya
                </span>
              </td>

              <!-- Status -->
              <td class="py-3.5 px-4 text-center">
                <span
                  :class="[
                    'px-2.5 py-0.5 rounded-full text-[10px] font-bold border',
                    cat.is_active
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  ]"
                >
                  {{ cat.is_active ? 'Aktif' : 'Nonaktif' }}
                </span>
              </td>

              <!-- Aksi -->
              <td class="py-3.5 px-4 text-center">
                <div class="flex items-center justify-center gap-1.5">
                  <button
                    v-if="canShow"
                    @click="openViewModal(cat)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                    title="Lihat Detail"
                  >
                    👁️
                  </button>
                  <button
                    v-if="canUpdate"
                    @click="openEditModal(cat)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                    title="Edit Kategori"
                  >
                    ✏️
                  </button>
                  <button
                    v-if="canDelete"
                    @click="confirmDelete(cat)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Hapus Kategori"
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

    <!-- ==================== MODAL FORM (TAMBAH / EDIT) ==================== -->
    <Teleport to="body">
      <div
        v-if="isFormModalOpen"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto"
      >
        <div class="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 class="text-base font-bold text-slate-900">
              {{ formMode === 'add' ? 'Tambah Kategori Keuangan Baru' : 'Edit Kategori Keuangan' }}
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">
              {{ formMode === 'add' ? 'Tambahkan nama pos keuangan gereja baru' : 'Perbarui data kategori keuangan' }}
            </p>
          </div>
          <button @click="isFormModalOpen = false" class="text-slate-400 hover:text-slate-700 text-sm cursor-pointer">
            ✕
          </button>
        </div>

        <!-- Modal Body Form -->
        <form @submit.prevent="handleSaveForm" class="p-6 space-y-4">
          <!-- Nama Kategori -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700">
              Nama Kategori Keuangan <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="Contoh: Persembahan Ibadah Minggu"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
            />
          </div>

          <!-- Kelompok / Golongan (Group) -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700">
              Kelompok / Golongan Pos
            </label>
            <input
              v-model="form.group"
              type="text"
              placeholder="Contoh: Penerimaan Ibadah, Operasional, Pelayanan"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
            />
            <p class="text-[10px] text-slate-400">
              Digunakan untuk mengelompokkan pos anggaran pada laporan keuangan.
            </p>
          </div>

          <!-- Jenis Transaksi (Type) -->
          <div class="space-y-2">
            <label class="block text-xs font-bold text-slate-700">
              Jenis Transaksi <span class="text-rose-500">*</span>
            </label>
            <div class="grid grid-cols-3 gap-2.5">
              <!-- INCOME -->
              <label
                :class="[
                  'flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all text-center',
                  form.type === 'INCOME'
                    ? 'bg-emerald-50/80 border-emerald-500 text-emerald-800 font-bold ring-1 ring-emerald-500'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                ]"
              >
                <input
                  type="radio"
                  v-model="form.type"
                  value="INCOME"
                  class="hidden"
                />
                <ArrowDownLeft class="w-5 h-5 mb-1 text-emerald-600" />
                <span class="text-xs">Pemasukan</span>
                <span class="text-[9px] text-emerald-600 uppercase font-semibold">INCOME</span>
              </label>

              <!-- EXPENSE -->
              <label
                :class="[
                  'flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all text-center',
                  form.type === 'EXPENSE'
                    ? 'bg-rose-50/80 border-rose-500 text-rose-800 font-bold ring-1 ring-rose-500'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                ]"
              >
                <input
                  type="radio"
                  v-model="form.type"
                  value="EXPENSE"
                  class="hidden"
                />
                <ArrowUpRight class="w-5 h-5 mb-1 text-rose-600" />
                <span class="text-xs">Pengeluaran</span>
                <span class="text-[9px] text-rose-600 uppercase font-semibold">EXPENSE</span>
              </label>

              <!-- BUKAN KEDUANYA -->
              <label
                :class="[
                  'flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all text-center',
                  form.type === 'BUKAN KEDUANYA'
                    ? 'bg-blue-50/80 border-blue-500 text-blue-800 font-bold ring-1 ring-blue-500'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                ]"
              >
                <input
                  type="radio"
                  v-model="form.type"
                  value="BUKAN KEDUANYA"
                  class="hidden"
                />
                <Layers class="w-5 h-5 mb-1 text-slate-500" />
                <span class="text-xs">Lainnya</span>
                <span class="text-[9px] text-slate-500 uppercase font-semibold">NON-ARUS</span>
              </label>
            </div>
          </div>

          <!-- Status Aktif -->
          <div class="pt-2 flex items-center justify-between border-t border-slate-100">
            <div>
              <p class="text-xs font-bold text-slate-800">Status Kategori</p>
              <p class="text-[11px] text-slate-400">Aktifkan agar dapat dipilih pada transaksi kas</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="form.is_active" class="sr-only peer" />
              <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <!-- Modal Footer Actions -->
          <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              @click="isFormModalOpen = false"
              class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm cursor-pointer transition-colors disabled:opacity-50"
            >
              {{ submitting ? 'Menyimpan...' : 'Simpan Kategori' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>

    <!-- ==================== MODAL VIEW DETAIL ==================== -->
    <Teleport to="body">
      <div
        v-if="isViewModalOpen && selectedItem"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto"
      >
        <div class="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] p-6 space-y-4 my-auto">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-base font-bold text-slate-900">Detail Kategori Keuangan</h3>
          <button @click="isViewModalOpen = false" class="text-slate-400 hover:text-slate-700">✕</button>
        </div>

        <div class="space-y-3 text-xs">
          <div class="flex justify-between py-1.5 border-b border-slate-100">
            <span class="text-slate-400">ID Kategori</span>
            <span class="font-mono text-slate-700 text-[11px]">{{ selectedItem.id }}</span>
          </div>
          <div class="flex justify-between py-1.5 border-b border-slate-100">
            <span class="text-slate-400">Nama Kategori</span>
            <span class="font-bold text-slate-900">{{ selectedItem.name }}</span>
          </div>
          <div class="flex justify-between py-1.5 border-b border-slate-100">
            <span class="text-slate-400">Kelompok / Golongan</span>
            <span class="font-medium text-slate-800">{{ selectedItem.group }}</span>
          </div>
          <div class="flex justify-between py-1.5 border-b border-slate-100">
            <span class="text-slate-400">Jenis Transaksi</span>
            <span class="font-bold" :class="selectedItem.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'">
              {{ selectedItem.type }}
            </span>
          </div>
          <div class="flex justify-between py-1.5">
            <span class="text-slate-400">Status</span>
            <span class="font-bold" :class="selectedItem.is_active ? 'text-emerald-600' : 'text-slate-400'">
              {{ selectedItem.is_active ? 'Aktif' : 'Nonaktif' }}
            </span>
          </div>
        </div>

        <div class="pt-3 flex justify-end">
          <button
            @click="isViewModalOpen = false"
            class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '@/api/axios'
import {
  Layers,
  Plus,
  RefreshCw,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2
} from 'lucide-vue-next'
import { usePermissions } from '@/composables/usePermissions'

const { canRead, canCreate, canShow, canUpdate, canDelete, canPrint } = usePermissions()

// State
const categories = ref([])
const loading = ref(false)
const submitting = ref(false)

const statusTab = ref('all') // 'all' | 'active' | 'inactive'
const typeFilter = ref('ALL') // 'ALL' | 'INCOME' | 'EXPENSE' | 'BUKAN KEDUANYA'
const searchQuery = ref('')

const isFormModalOpen = ref(false)
const isViewModalOpen = ref(false)
const formMode = ref('add') // 'add' | 'edit'
const selectedItem = ref(null)

const form = reactive({
  id: null,
  name: '',
  group: '',
  type: 'INCOME',
  is_active: true
})

const alert = reactive({
  type: 'success',
  message: ''
})

// Calculations
const countByType = (type) => {
  return categories.value.filter(c => c.type === type).length
}

const countActive = computed(() => {
  return categories.value.filter(c => c.is_active).length
})

// Filtered data
const filteredCategories = computed(() => {
  return categories.value.filter(item => {
    // 1. Status Filter Tab
    if (statusTab.value === 'active' && !item.is_active) return false
    if (statusTab.value === 'inactive' && item.is_active) return false

    // 2. Type Filter
    if (typeFilter.value !== 'ALL' && item.type !== typeFilter.value) return false

    // 3. Search Query
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      const matchName = item.name.toLowerCase().includes(q)
      const matchGroup = (item.group || '').toLowerCase().includes(q)
      return matchName || matchGroup
    }

    return true
  })
})

// API Fetch
const fetchCategories = async () => {
  loading.value = true
  try {
    const res = await api.get('/finance-categories')
    if (res.success && res.data) {
      categories.value = res.data
    }
  } catch (err) {
    console.error('Gagal mengambil kategori keuangan:', err)
    alert.type = 'error'
    alert.message = err.message || 'Gagal memuat kategori keuangan'
  } finally {
    loading.value = false
  }
}

// Modal Handlers
const openAddModal = () => {
  formMode.value = 'add'
  form.id = null
  form.name = ''
  form.group = ''
  form.type = 'INCOME'
  form.is_active = true
  isFormModalOpen.value = true
}

const openEditModal = (cat) => {
  formMode.value = 'edit'
  form.id = cat.id
  form.name = cat.name
  form.group = cat.group === '-' ? '' : cat.group
  form.type = cat.type
  form.is_active = cat.is_active
  isFormModalOpen.value = true
}

const openViewModal = (cat) => {
  selectedItem.value = cat
  isViewModalOpen.value = true
}

// Save Form (Create / Update)
const handleSaveForm = async () => {
  if (!form.name || !form.name.trim()) {
    alert.type = 'error'
    alert.message = 'Nama kategori wajib diisi!'
    return
  }

  submitting.value = true
  alert.message = ''

  try {
    const payload = {
      name: form.name.trim(),
      group: form.group ? form.group.trim() : null,
      type: form.type,
      is_active: form.is_active
    }

    if (formMode.value === 'edit') {
      const res = await api.put(`/finance-categories/${form.id}`, payload)
      if (res.success) {
        alert.type = 'success'
        alert.message = `Kategori "${form.name}" berhasil diperbarui!`
        isFormModalOpen.value = false
        await fetchCategories()
      }
    } else {
      const res = await api.post('/finance-categories', payload)
      if (res.success) {
        alert.type = 'success'
        alert.message = `Kategori baru "${form.name}" berhasil ditambahkan!`
        isFormModalOpen.value = false
        await fetchCategories()
      }
    }
  } catch (err) {
    alert.type = 'error'
    alert.message = err.message || 'Gagal menyimpan kategori keuangan'
  } finally {
    submitting.value = false
  }
}

// Delete Handler
const confirmDelete = async (cat) => {
  if (confirm(`Hapus kategori keuangan "${cat.name}"?`)) {
    try {
      const res = await api.delete(`/finance-categories/${cat.id}`)
      if (res.success) {
        alert.type = 'success'
        alert.message = `Kategori "${cat.name}" berhasil dihapus!`
        await fetchCategories()
      }
    } catch (err) {
      alert.type = 'error'
      alert.message = err.message || 'Gagal menghapus kategori keuangan'
    }
  }
}

onMounted(() => {
  fetchCategories()
})
</script>
