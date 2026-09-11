<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Jadwal Sermon</h1>
        <p class="text-sm text-slate-500 mt-0.5">Kelola agenda sermon dan absensi Guru Sekolah Minggu (GSM)</p>
      </div>

      <button
        @click="openAddModal"
        class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>➕</span>
        <span>Tambah Sermon</span>
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
          placeholder="Cari acara atau tanggal..."
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
        @click="fetchSermons"
        :disabled="loading"
        class="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        title="Muat ulang data"
      >
        <span :class="['inline-block', loading ? 'animate-spin' : '']">🔄</span>
        <span>Refresh</span>
      </button>
    </div>

    <!-- Table Sermon -->
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
                Memuat data sermon...
              </td>
            </tr>

            <!-- Empty -->
            <tr v-else-if="filteredSermons.length === 0">
              <td colspan="5" class="py-12 text-center text-slate-400">
                <p class="text-sm font-medium text-slate-600">Belum ada jadwal acara sermon.</p>
                <p class="text-xs text-slate-400 mt-1">Klik tombol "Tambah Sermon" untuk membuat jadwal baru.</p>
              </td>
            </tr>

            <!-- Rows -->
            <tr
              v-for="(item, index) in filteredSermons"
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
                  <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
                  <span class="font-mono text-indigo-700">{{ item.title }}</span>
                </div>
              </td>

              <!-- Tanggal -->
              <td class="py-3.5 px-4 text-slate-700 font-medium">
                {{ formatTanggal(item.event_date) }}
              </td>

              <!-- Jumlah Kehadiran (Dihitung dari t_attendances dengan id_event yang sesuai) -->
              <td class="py-3.5 px-4 text-center">
                <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold text-xs">
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

    <!-- ==================== MODAL TAMBAH SERMON ==================== -->
    <div
      v-if="isAddModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto"
    >
      <div class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 w-full max-w-md shadow-2xl space-y-5 my-auto">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 class="text-base font-bold text-slate-900">Tambah Acara Sermon Baru</h3>
            <p class="text-xs text-slate-500 mt-0.5">Tentukan tanggal sermon dan pengaturan absensi GSM</p>
          </div>
          <button @click="isAddModalOpen = false" class="text-slate-400 hover:text-slate-600 cursor-pointer text-lg">✕</button>
        </div>

        <form @submit.prevent="submitCreateSermon" class="space-y-4">
          <!-- 1. Input Tanggal (Diisi terlebih dahulu) -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Tanggal Acara <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="form.event_date"
              @change="onDateChange"
              type="date"
              required
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-indigo-600 cursor-pointer"
            />
          </div>

          <!-- 2. Acara / Title (Terbentuk Otomatis & Read Only) -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Acara / Title <span class="text-slate-400 font-normal lowercase">(read-only)</span>
              </label>
              <span class="text-[10px] text-indigo-600 font-medium">Format: SERMON_TANGGAL</span>
            </div>
            <input
              v-model="form.title"
              type="text"
              readonly
              placeholder="Pilih tanggal terlebih dahulu..."
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-mono text-sm focus:outline-none cursor-not-allowed font-bold"
            />
          </div>

          <!-- 3. Checkbox MELAKUKAN ABSENSI (Default Tercentang) -->
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
              Jika dicentang, sistem otomatis mendaftarkan seluruh user dengan role <strong>GSM</strong> ke daftar absensi acara sermon ini.
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
              :disabled="submitting || !form.event_date"
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
              <span class="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono text-[11px] font-bold border border-indigo-100">
                SERMON
              </span>
              <h3 class="text-base font-bold text-slate-900">{{ currentSermon?.title }}</h3>
            </div>
            <p class="text-xs text-slate-500 mt-1">
              Tanggal: <strong>{{ formatTanggal(currentSermon?.event_date) }}</strong> &bull;
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

const sermons = ref([])
const loading = ref(false)
const submitting = ref(false)
const searchQuery = ref('')

const isAddModalOpen = ref(false)
const isDetailModalOpen = ref(false)
const currentSermon = ref(null)

const detailData = reactive({
  attendances: [],
  attended_count: 0
})

const alert = reactive({
  type: 'success',
  message: ''
})

const form = reactive({
  event_date: '',
  title: '',
  is_attendance: true // Default mencentang checkbox MELAKUKAN ABSENSI
})

// Format tanggal lokal (Contoh: 12 September 2026)
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

// Saat tanggal diinput, otomatis bentuk title SERMON_TANGGAL
const onDateChange = () => {
  if (form.event_date) {
    form.title = `SERMON_${form.event_date}`
  } else {
    form.title = ''
  }
}

// Fetch seluruh sermon
const fetchSermons = async () => {
  loading.value = true
  try {
    const res = await apiClient.get('/sermons')
    if (res.success) {
      sermons.value = res.data || []
    }
  } catch (error) {
    console.error('Error fetchSermons:', error)
    alert.type = 'error'
    alert.message = error.message || 'Gagal memuat daftar sermon'
  } finally {
    loading.value = false
  }
}

// Filtered Sermons
const filteredSermons = computed(() => {
  if (!searchQuery.value.trim()) return sermons.value
  const q = searchQuery.value.toLowerCase().trim()
  return sermons.value.filter(s => {
    const matchTitle = s.title && s.title.toLowerCase().includes(q)
    const matchDate = s.event_date && s.event_date.toLowerCase().includes(q)
    return matchTitle || matchDate
  })
})

// Buka Modal Tambah
const openAddModal = () => {
  const today = new Date().toISOString().split('T')[0]
  form.event_date = today
  form.title = `SERMON_${today}`
  form.is_attendance = true // Default tercentang
  isAddModalOpen.value = true
}

// Submit Acara Sermon Baru
const submitCreateSermon = async () => {
  if (!form.event_date) {
    alert.type = 'error'
    alert.message = 'Tanggal acara wajib dipilih'
    return
  }

  submitting.value = true
  alert.message = ''
  try {
    const payload = {
      event_date: form.event_date,
      is_attendance: Boolean(form.is_attendance)
    }

    const res = await apiClient.post('/sermons', payload)
    if (res.success) {
      alert.type = 'success'
      alert.message = `Acara "${res.data?.title || form.title}" berhasil dibuat dengan ${res.data?.total_attendance || 0} GSM terdaftar!`
      isAddModalOpen.value = false
      await fetchSermons()
    }
  } catch (error) {
    alert.type = 'error'
    alert.message = error.message || 'Gagal membuat acara sermon'
  } finally {
    submitting.value = false
  }
}

// Buka Modal Detail Kehadiran GSM
const openDetailModal = async (sermon) => {
  currentSermon.value = sermon
  detailData.attendances = []
  detailData.attended_count = 0
  isDetailModalOpen.value = true

  try {
    const res = await apiClient.get(`/sermons/${sermon.id}`)
    if (res.success && res.data) {
      detailData.attendances = res.data.attendances || []
      detailData.attended_count = res.data.attended_count || 0
    }
  } catch (error) {
    console.error('Error openDetailModal:', error)
  }
}

// Hapus Acara
const handleDelete = async (sermon) => {
  if (confirm(`Hapus acara "${sermon.title}"? Data absensi terkait pada acara ini juga akan dihapus.`)) {
    try {
      const res = await apiClient.delete(`/sermons/${sermon.id}`)
      if (res.success) {
        alert.type = 'success'
        alert.message = `Acara "${sermon.title}" berhasil dihapus`
        await fetchSermons()
      }
    } catch (error) {
      alert.type = 'error'
      alert.message = error.message || 'Gagal menghapus acara'
    }
  }
}

onMounted(() => {
  fetchSermons()
})
</script>
