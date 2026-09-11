<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Jadwal Acara Lainnya</h1>
        <p class="text-sm text-slate-500 mt-0.5">Kelola agenda kegiatan lainnya dan absensi Guru Sekolah Minggu (GSM)</p>
      </div>

      <button
        @click="openAddModal"
        class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>➕</span>
        <span>Tambah Acara Lainnya</span>
      </button>
    </div>

    <!-- Alert Notification -->
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

    <!-- Toolbar: Search & Refresh -->
    <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3">
      <div class="relative w-72 max-w-full">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari nama acara atau tanggal..."
          class="w-full pl-9 pr-7 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
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

      <button
        @click="fetchLainnya"
        :disabled="loading"
        class="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        title="Muat ulang data"
      >
        <span :class="['inline-block', loading ? 'animate-spin' : '']">🔄</span>
        <span>Refresh</span>
      </button>
    </div>

    <!-- Table Acara Lainnya -->
    <div class="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-600 whitespace-nowrap">
          <thead class="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
            <tr>
              <th class="py-3 px-4 w-12 text-center">No</th>
              <th class="py-3 px-4 min-w-[220px]">Acara</th>
              <th class="py-3 px-4 min-w-[150px]">Tanggal</th>
              <th class="py-3 px-4 text-center min-w-[160px]">Jumlah Kehadiran</th>
              <th class="py-3 px-4 text-center w-36">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-normal">
            <!-- Loading -->
            <tr v-if="loading">
              <td colspan="5" class="py-12 text-center text-slate-400">
                <span class="inline-block w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-2"></span>
                Memuat data acara lainnya...
              </td>
            </tr>

            <!-- Empty -->
            <tr v-else-if="filteredLainnya.length === 0">
              <td colspan="5" class="py-12 text-center text-slate-400">
                <p class="text-sm font-medium text-slate-600">Belum ada jadwal acara lainnya.</p>
                <p class="text-xs text-slate-400 mt-1">Klik tombol "Tambah Acara Lainnya" untuk membuat jadwal baru.</p>
              </td>
            </tr>

            <!-- Rows -->
            <tr
              v-for="(item, index) in filteredLainnya"
              :key="item.id"
              class="hover:bg-slate-50/70 transition-colors"
            >
              <!-- No -->
              <td class="py-3.5 px-4 text-center text-slate-400 font-mono text-[11px]">
                {{ index + 1 }}
              </td>

              <!-- Acara (Title) -->
              <td class="py-3.5 px-4 font-bold text-slate-900">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span class="text-slate-800">{{ item.title }}</span>
                </div>
              </td>

              <!-- Tanggal -->
              <td class="py-3.5 px-4 text-slate-700 font-medium">
                {{ formatTanggal(item.event_date) }}
              </td>

              <!-- Jumlah Kehadiran (Dihitung dari t_attendances dengan id_event yang sesuai) -->
              <td class="py-3.5 px-4 text-center">
                <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs">
                  <span>👥</span>
                  <span>{{ item.total_attendance }} Kehadiran</span>
                </div>
              </td>

              <!-- Aksi (Detail & Hapus) -->
              <td class="py-3.5 px-4 text-center">
                <div class="flex items-center justify-center gap-2">
                  <button
                    @click="openDetailModal(item)"
                    class="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                    title="Lihat Daftar GSM yang Berhadir"
                  >
                    <span>👁️</span>
                    <span>Detail</span>
                  </button>
                  <button
                    @click="handleDelete(item)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Hapus Acara"
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

    <!-- ==================== MODAL TAMBAH ACARA LAINNYA ==================== -->
    <div
      v-if="isAddModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto"
    >
      <div class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 w-full max-w-md shadow-2xl space-y-5 my-auto">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 class="text-base font-bold text-slate-900">Tambah Acara Lainnya</h3>
            <p class="text-xs text-slate-500 mt-0.5">Masukkan nama acara, tanggal, dan opsi absensi</p>
          </div>
          <button @click="isAddModalOpen = false" class="text-slate-400 hover:text-slate-600 cursor-pointer text-lg">✕</button>
        </div>

        <form @submit.prevent="submitCreateLainnya" class="space-y-4">
          <!-- 1. Input Nama Acara (Title) - Manual Input -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Nama Acara <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="form.title"
              type="text"
              required
              placeholder="Contoh: Retreat GSM, Latihan Pujian, dll."
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-indigo-600"
            />
          </div>

          <!-- 2. Input Tanggal Acara -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Tanggal Acara <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="form.event_date"
              type="date"
              required
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-indigo-600 cursor-pointer"
            />
          </div>

          <!-- 3. Checkbox MELAKUKAN ABSENSI (Default TIDAK Tercentang) -->
          <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <label class="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                v-model="form.is_attendance"
                type="checkbox"
                class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4"
              />
              <span class="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Melakukan Absensi
              </span>
            </label>
            <p class="text-[11px] text-slate-500 leading-relaxed pl-6">
              Jika dicentang, sistem otomatis mendaftarkan seluruh user dengan role <strong>GSM</strong> ke daftar absensi acara ini.
            </p>
          </div>

          <!-- Actions -->
          <div class="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              @click="isAddModalOpen = false"
              class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="submitting || !form.title.trim() || !form.event_date"
              class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {{ submitting ? 'Menyimpan...' : 'Simpan Acara' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ==================== MODAL DETAIL KEHADIRAN GSM ==================== -->
    <div
      v-if="isDetailModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto"
    >
      <div class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 w-full max-w-2xl shadow-2xl space-y-5 my-auto max-h-[90vh] flex flex-col">
        <!-- Header -->
        <div class="flex items-start justify-between pb-3 border-b border-slate-100 shrink-0">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-mono text-[11px] font-bold border border-amber-200">
                LAINNYA
              </span>
              <h3 class="text-base font-bold text-slate-900">{{ currentLainnya?.title }}</h3>
            </div>
            <p class="text-xs text-slate-500 mt-1">
              Tanggal: <strong>{{ formatTanggal(currentLainnya?.event_date) }}</strong> &bull;
              Daftar kehadiran Guru Sekolah Minggu (GSM)
            </p>
          </div>
          <button @click="isDetailModalOpen = false" class="text-slate-400 hover:text-slate-600 cursor-pointer text-lg">✕</button>
        </div>

        <!-- Summary Stats Cards -->
        <div class="grid grid-cols-3 gap-3 shrink-0">
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
            <span class="text-slate-400 text-[11px] block">Total GSM</span>
            <span class="text-lg font-bold text-slate-900">{{ detailData.attendances.length }}</span>
          </div>
          <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-center">
            <span class="text-emerald-600 text-[11px] block">Hadir</span>
            <span class="text-lg font-bold text-emerald-700">{{ detailData.attended_count }}</span>
          </div>
          <div class="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-center">
            <span class="text-amber-600 text-[11px] block">Belum Hadir</span>
            <span class="text-lg font-bold text-amber-700">
              {{ detailData.attendances.length - detailData.attended_count }}
            </span>
          </div>
        </div>

        <!-- Table GSM Attendances -->
        <div class="overflow-y-auto flex-1 border border-slate-200 rounded-xl">
          <table class="w-full text-left text-xs text-slate-600 whitespace-nowrap">
            <thead class="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 sticky top-0 uppercase text-[10px] tracking-wider">
              <tr>
                <th class="py-2.5 px-3 text-center w-10">No</th>
                <th class="py-2.5 px-4">Nama GSM</th>
                <th class="py-2.5 px-4">Email</th>
                <th class="py-2.5 px-3 text-center w-28">Status</th>
                <th class="py-2.5 px-4 text-center w-36">Waktu Absen</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="detailData.attendances.length === 0">
                <td colspan="5" class="py-8 text-center text-slate-400">
                  Tidak ada data GSM yang terdaftar pada acara ini (Melakukan Absensi tidak diaktifkan saat pembuatan).
                </td>
              </tr>
              <tr
                v-for="(gsm, idx) in detailData.attendances"
                :key="gsm.attendance_id"
                class="hover:bg-slate-50/70 transition-colors"
              >
                <td class="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                  {{ idx + 1 }}
                </td>
                <td class="py-2.5 px-4 font-semibold text-slate-900">
                  {{ gsm.gsm_name }}
                </td>
                <td class="py-2.5 px-4 text-slate-500 font-mono text-[11px]">
                  {{ gsm.gsm_email || '-' }}
                </td>
                <td class="py-2.5 px-3 text-center">
                  <span
                    :class="[
                      'px-2.5 py-0.5 rounded-full text-[10px] font-bold border',
                      gsm.is_present
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    ]"
                  >
                    {{ gsm.is_present ? 'Hadir' : 'Belum Hadir' }}
                  </span>
                </td>
                <td class="py-2.5 px-4 text-center text-slate-500 text-[11px]">
                  {{ gsm.check_in_time ? new Date(gsm.check_in_time).toLocaleString('id-ID') : '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Modal Footer -->
        <div class="pt-3 flex justify-end border-t border-slate-100 shrink-0">
          <button
            type="button"
            @click="isDetailModalOpen = false"
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

const lainnyaEvents = ref([])
const loading = ref(false)
const submitting = ref(false)
const searchQuery = ref('')

const isAddModalOpen = ref(false)
const isDetailModalOpen = ref(false)
const currentLainnya = ref(null)

const detailData = reactive({
  attendances: [],
  attended_count: 0
})

const alert = reactive({
  type: 'success',
  message: ''
})

const form = reactive({
  title: '',
  event_date: '',
  is_attendance: false // Secara default TIDAK tercentang
})

// Format tanggal lokal (Contoh: 14 September 2026)
const formatTanggal = (dateStr) => {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  } catch (e) {
    return dateStr
  }
}

// Fetch seluruh acara Lainnya
const fetchLainnya = async () => {
  loading.value = true
  try {
    const res = await apiClient.get('/lainnya')
    if (res.success) {
      lainnyaEvents.value = res.data || []
    }
  } catch (error) {
    console.error('Error fetchLainnya:', error)
    alert.type = 'error'
    alert.message = error.message || 'Gagal memuat daftar acara lainnya'
  } finally {
    loading.value = false
  }
}

// Filtered Events
const filteredLainnya = computed(() => {
  if (!searchQuery.value.trim()) return lainnyaEvents.value
  const q = searchQuery.value.toLowerCase().trim()
  return lainnyaEvents.value.filter(s => {
    const matchTitle = s.title && s.title.toLowerCase().includes(q)
    const matchDate = s.event_date && s.event_date.toLowerCase().includes(q)
    return matchTitle || matchDate
  })
})

// Buka Modal Tambah
const openAddModal = () => {
  const today = new Date().toISOString().split('T')[0]
  form.title = ''
  form.event_date = today
  form.is_attendance = false // Default tidak tercentang
  isAddModalOpen.value = true
}

// Submit Acara Lainnya Baru
const submitCreateLainnya = async () => {
  if (!form.title.trim()) {
    alert.type = 'error'
    alert.message = 'Nama acara wajib diisi'
    return
  }

  if (!form.event_date) {
    alert.type = 'error'
    alert.message = 'Tanggal acara wajib dipilih'
    return
  }

  submitting.value = true
  alert.message = ''
  try {
    const payload = {
      title: form.title.trim(),
      event_date: form.event_date,
      is_attendance: Boolean(form.is_attendance)
    }

    const res = await apiClient.post('/lainnya', payload)
    if (res.success) {
      alert.type = 'success'
      alert.message = `Acara "${res.data?.title || form.title}" berhasil dibuat${
        form.is_attendance ? ` dengan ${res.data?.total_attendance || 0} GSM terdaftar!` : '!'
      }`
      isAddModalOpen.value = false
      await fetchLainnya()
    }
  } catch (error) {
    alert.type = 'error'
    alert.message = error.message || 'Gagal membuat acara lainnya'
  } finally {
    submitting.value = false
  }
}

// Buka Modal Detail Kehadiran GSM
const openDetailModal = async (item) => {
  currentLainnya.value = item
  detailData.attendances = []
  detailData.attended_count = 0
  isDetailModalOpen.value = true

  try {
    const res = await apiClient.get(`/lainnya/${item.id}`)
    if (res.success && res.data) {
      detailData.attendances = res.data.attendances || []
      detailData.attended_count = res.data.attended_count || 0
    }
  } catch (error) {
    console.error('Error openDetailModal:', error)
  }
}

// Hapus Acara
const handleDelete = async (item) => {
  if (confirm(`Hapus acara "${item.title}"? Data absensi terkait pada acara ini juga akan dihapus.`)) {
    try {
      const res = await apiClient.delete(`/lainnya/${item.id}`)
      if (res.success) {
        alert.type = 'success'
        alert.message = `Acara "${item.title}" berhasil dihapus`
        await fetchLainnya()
      }
    } catch (error) {
      alert.type = 'error'
      alert.message = error.message || 'Gagal menghapus acara'
    }
  }
}

onMounted(() => {
  fetchLainnya()
})
</script>
