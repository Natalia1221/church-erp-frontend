<template>
  <div class="space-y-6">
    <!-- 1. Header Banner & Real-time Digital Clock -->
    <div class="rounded-2xl bg-gradient-to-r from-[#0b1426] via-[#101f3c] to-[#152a52] p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10 border border-slate-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
      <!-- Ambient Background Glow -->
      <div class="absolute -right-16 -top-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -left-16 -bottom-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10 space-y-1.5">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wide">
          <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          Portal Mandiri GSM
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Absensi & Kehadiran Pelayanan
        </h1>
        <p class="text-slate-300 text-xs sm:text-sm max-w-xl font-normal leading-relaxed">
          Catat kehadiran ibadah dan pelayanan Anda secara mandiri dengan verifikasi waktu dan geolokasi otomatis.
        </p>
      </div>

      <!-- Jam Digital & Tanggal Hari Ini -->
      <div class="relative z-10 bg-[#070e1d]/80 backdrop-blur-md border border-slate-600/40 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center min-w-[220px] shadow-inner text-center shrink-0">
        <div class="flex items-center gap-1.5 text-xs text-cyan-400 font-medium tracking-wide mb-1">
          <Calendar class="w-3.5 h-3.5" />
          <span>{{ currentDateFormatted }}</span>
        </div>
        <div class="text-3xl sm:text-4xl font-mono font-extrabold text-white tracking-wider drop-shadow-sm">
          {{ currentTimeFormatted }}
        </div>
        <div class="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-1">
          <MapPin class="w-3 h-3 text-cyan-400" />
          <span>{{ gpsStatusText }}</span>
        </div>
      </div>
    </div>

    <!-- 2. Profile Bar & Tab Navigasi -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700 font-bold text-sm shadow-xs">
          {{ userInitials }}
        </div>
        <div>
          <p class="text-sm font-bold text-slate-800 leading-tight">
            {{ authStore.user?.name || 'Pelayan Gereja' }}
          </p>
          <div class="flex items-center gap-2 mt-0.5">
            <span class="text-[11px] text-slate-500 font-medium">Akun: {{ authStore.user?.email }}</span>
            <span class="px-2 py-0.2 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px] uppercase border border-slate-200">
              {{ currentRoleName }}
            </span>
          </div>
        </div>
      </div>

      <!-- Tab Buttons -->
      <div class="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200 shrink-0">
        <button
          @click="activeTab = 'checkin'"
          :class="[
            'px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer',
            activeTab === 'checkin'
              ? 'bg-white text-cyan-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          ]"
        >
          <ClipboardCheck class="w-4 h-4 text-cyan-600" />
          <span>Check-In Acara</span>
          <span
            v-if="events.length > 0"
            class="ml-1 px-1.5 py-0.2 rounded-full bg-cyan-100 text-cyan-800 text-[10px] font-extrabold"
          >
            {{ events.length }}
          </span>
        </button>

        <button
          @click="activeTab = 'history'"
          :class="[
            'px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer',
            activeTab === 'history'
              ? 'bg-white text-cyan-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          ]"
        >
          <History class="w-4 h-4 text-cyan-600" />
          <span>Riwayat Kehadiran</span>
        </button>
      </div>
    </div>

    <!-- 3. Alert / Pesan Notifikasi -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="toastMessage"
        :class="[
          'p-4 rounded-xl border flex items-center justify-between text-xs font-medium shadow-sm',
          toastType === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        ]"
      >
        <div class="flex items-center gap-2">
          <CheckCircle2 v-if="toastType === 'success'" class="w-4 h-4 text-emerald-600 shrink-0" />
          <AlertCircle v-else class="w-4 h-4 text-rose-600 shrink-0" />
          <span>{{ toastMessage }}</span>
        </div>
        <button @click="toastMessage = ''" class="text-slate-400 hover:text-slate-700 p-1">
          <X class="w-3.5 h-3.5" />
        </button>
      </div>
    </transition>

    <!-- 4. TAB 1: DAFTAR ACARA UNTUK CHECK-IN -->
    <div v-if="activeTab === 'checkin'" class="space-y-4">
      <!-- Loading State -->
      <div v-if="loadingEvents" class="p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <div class="w-8 h-8 border-3 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p class="text-xs font-semibold text-slate-600">Memeriksa jadwal ibadah aktif...</p>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="events.length === 0"
        class="p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs"
      >
        <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
          <CalendarX class="w-8 h-8" />
        </div>
        <h3 class="text-base font-bold text-slate-800">Tidak Ada Acara Aktif</h3>
        <p class="text-xs text-slate-500 max-w-md mx-auto mt-1">
          Saat ini belum ada acara ibadah atau kegiatan yang membuka sesi absensi. Silakan hubungi Administrator atau Pendeta jika jadwal belum muncul.
        </p>
      </div>

      <!-- Event Cards Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div
          v-for="evt in events"
          :key="evt.id"
          class="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
        >
          <!-- Card Header & Badge -->
          <div class="p-5 border-b border-slate-100">
            <div class="flex items-center justify-between gap-3 mb-2.5">
              <span
                :class="[
                  'px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-wide uppercase',
                  evt.event_type === 'MINGGU'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : evt.event_type === 'SERMON'
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                ]"
              >
                {{ evt.event_type }}
              </span>

              <div class="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Clock class="w-3.5 h-3.5 text-slate-400" />
                <span>{{ formatDateIndo(evt.event_date) }}</span>
              </div>
            </div>

            <!-- Title -->
            <h3 class="text-base font-extrabold text-slate-800 leading-snug">
              {{ evt.title }}
            </h3>

            <!-- Status Penugasan GSM -->
            <div class="mt-3">
              <div
                v-if="evt.is_assigned"
                class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold"
              >
                <Award class="w-4 h-4 text-amber-600 shrink-0" />
                <span>Terjadwal: <strong>{{ evt.assigned_category }}</strong></span>
              </div>
              <div
                v-else
                class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium"
              >
                <Users class="w-4 h-4 text-slate-400 shrink-0" />
                <span>Pelayan Pendamping / Tambahan</span>
              </div>
            </div>
          </div>

          <!-- Card Body: Status Kehadiran / Tombol Check-In -->
          <div class="p-5 bg-slate-50/50 flex-1 flex flex-col justify-center">
            <!-- Kasus A: SUDAH CHECK-IN -->
            <div
              v-if="evt.is_checked_in"
              class="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 flex flex-col gap-2"
            >
              <div class="flex items-center gap-2.5 font-bold text-sm text-emerald-800">
                <CheckCircle2 class="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Anda Sudah Hadir (Check-In)</span>
              </div>
              <div class="text-xs text-emerald-700 space-y-1 pl-7">
                <p>
                  Waktu: <strong>{{ formatTime(evt.attendance_details?.check_in_time) }} WIB</strong>
                </p>
                <p v-if="evt.attendance_details?.latitude && evt.attendance_details?.longitude" class="text-[11px] text-emerald-600 font-mono">
                  📍 Koordinat: {{ evt.attendance_details.latitude }}, {{ evt.attendance_details.longitude }}
                </p>
              </div>
            </div>

            <!-- Kasus B: BELUM CHECK-IN -->
            <div v-else class="space-y-3">
              <p class="text-xs text-slate-500">
                Tekan tombol di bawah untuk mencatat kehadiran Anda pada sesi ibadah ini.
              </p>
              <button
                @click="handleCheckIn(evt)"
                :disabled="submittingEventId === evt.id"
                class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#0b1426] to-[#152a52] hover:from-[#11203d] hover:to-[#1c386d] text-white font-bold text-xs sm:text-sm shadow-md shadow-slate-900/15 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                <span
                  v-if="submittingEventId === evt.id"
                  class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                ></span>
                <MapPin v-else class="w-4 h-4 text-cyan-400" />
                <span>{{ submittingEventId === evt.id ? 'Memproses Check-In...' : 'Check-In Kehadiran Sekarang' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 5. TAB 2: RIWAYAT ABSENSI SAYA -->
    <div v-if="activeTab === 'history'" class="space-y-4">
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div class="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 class="text-sm font-bold text-slate-800">Catatan Kehadiran Saya</h3>
            <p class="text-xs text-slate-500">Daftar riwayat check-in yang pernah Anda lakukan</p>
          </div>
          <button
            @click="fetchHistory"
            :disabled="loadingHistory"
            class="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw :class="['w-3.5 h-3.5 text-slate-500', loadingHistory && 'animate-spin']" />
            <span>Segarkan</span>
          </button>
        </div>

        <!-- Table / List History -->
        <div v-if="loadingHistory" class="p-8 text-center">
          <div class="w-6 h-6 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p class="text-xs text-slate-500">Memuat riwayat...</p>
        </div>

        <div v-else-if="historyList.length === 0" class="p-8 text-center text-slate-400">
          <History class="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p class="text-xs font-medium">Belum ada riwayat kehadiran yang tercatat.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <th class="py-3 px-4">Waktu Check-In</th>
                <th class="py-3 px-4">Acara Ibadah</th>
                <th class="py-3 px-4">Tipe Acara</th>
                <th class="py-3 px-4">Status Penugasan</th>
                <th class="py-3 px-4">Lokasi GPS</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              <tr v-for="h in historyList" :key="h.id" class="hover:bg-slate-50/80 transition-colors">
                <td class="py-3 px-4 font-mono font-medium text-slate-900 whitespace-nowrap">
                  {{ formatDateTime(h.check_in_time) }}
                </td>
                <td class="py-3 px-4 font-bold text-slate-800 whitespace-nowrap">
                  {{ h.event_title }}
                </td>
                <td class="py-3 px-4 whitespace-nowrap">
                  <span
                    :class="[
                      'px-2 py-0.5 rounded text-[10px] font-bold uppercase',
                      h.event_type === 'MINGGU'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : h.event_type === 'SERMON'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    ]"
                  >
                    {{ h.event_type }}
                  </span>
                </td>
                <td class="py-3 px-4 whitespace-nowrap">
                  <span
                    v-if="h.is_scheduled"
                    class="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-[10px] border border-emerald-200"
                  >
                    <CheckCircle2 class="w-3 h-3" />
                    Terjadwal ({{ h.assigned_category_name || 'Petugas' }})
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center gap-1 text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded text-[10px] border border-slate-200"
                  >
                    Pelayan Tambahan
                  </span>
                </td>
                <td class="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                  <span v-if="h.latitude && h.longitude">
                    {{ Number(h.latitude).toFixed(4) }}, {{ Number(h.longitude).toFixed(4) }}
                  </span>
                  <span v-else class="text-slate-400 italic">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from '@/api/axios'
import {
  Calendar,
  Clock,
  MapPin,
  ClipboardCheck,
  History,
  CheckCircle2,
  AlertCircle,
  X,
  CalendarX,
  Award,
  Users,
  RefreshCw
} from 'lucide-vue-next'

const authStore = useAuthStore()

// State
const activeTab = ref('checkin')
const events = ref([])
const historyList = ref([])
const loadingEvents = ref(false)
const loadingHistory = ref(false)
const submittingEventId = ref(null)

const toastMessage = ref('')
const toastType = ref('success')

// Digital Clock State
const currentTime = ref(new Date())
let clockInterval = null

// GPS State
const currentCoords = ref(null)
const gpsStatusText = ref('Mendeteksi GPS...')

const showToast = (msg, type = 'success') => {
  toastMessage.value = msg
  toastType.value = type
  setTimeout(() => {
    if (toastMessage.value === msg) {
      toastMessage.value = ''
    }
  }, 4000)
}

// User Computed
const userInitials = computed(() => {
  const name = authStore.user?.name || 'User'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
})

const currentRoleName = computed(() => {
  return authStore.userRoles?.[0]?.name || authStore.userRoles?.[0]?.code || 'GSM'
})

// Clock Formatters
const currentTimeFormatted = computed(() => {
  return currentTime.value.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
})

const currentDateFormatted = computed(() => {
  return currentTime.value.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

const formatDateIndo = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const formatTime = (timeStr) => {
  if (!timeStr) return '-'
  const d = new Date(timeStr)
  return d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Request Location
const requestGPS = () => {
  if (!navigator.geolocation) {
    gpsStatusText.value = 'GPS tidak didukung browser'
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      currentCoords.value = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }
      gpsStatusText.value = 'GPS Terkoneksi'
    },
    (err) => {
      console.warn('Geolocation warning:', err.message)
      gpsStatusText.value = 'GPS Izin Ditolak (Tetap Dapat Check-In)'
    },
    { enableHighAccuracy: true, timeout: 5000 }
  )
}

// Fetch Events for Check-In
const fetchEvents = async () => {
  loadingEvents.value = true
  try {
    const res = await axios.get('/attendances/today-events')
    if (res.data.success) {
      events.value = res.data.data || []
    }
  } catch (err) {
    console.error('Error fetchEvents:', err)
    showToast('Gagal memuat daftar acara aktif', 'error')
  } finally {
    loadingEvents.value = false
  }
}

// Fetch Personal Attendance History
const fetchHistory = async () => {
  loadingHistory.value = true
  try {
    const res = await axios.get('/attendances/my-history')
    if (res.data.success) {
      historyList.value = res.data.data || []
    }
  } catch (err) {
    console.error('Error fetchHistory:', err)
  } finally {
    loadingHistory.value = false
  }
}

// Handle Check-In
const handleCheckIn = async (evt) => {
  submittingEventId.value = evt.id
  try {
    const payload = {
      event_id: evt.id,
      latitude: currentCoords.value?.latitude || null,
      longitude: currentCoords.value?.longitude || null
    }

    const res = await axios.post('/attendances/check-in', payload)

    if (res.data.success) {
      showToast(`Check-in berhasil untuk ${evt.title}!`, 'success')
      // Refresh event list & history
      await fetchEvents()
      await fetchHistory()
    }
  } catch (err) {
    console.error('Error checkIn:', err)
    const errorMsg = err.response?.data?.message || 'Gagal melakukan check-in'
    showToast(errorMsg, 'error')
  } finally {
    submittingEventId.value = null
  }
}

onMounted(() => {
  clockInterval = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)

  requestGPS()
  fetchEvents()
  fetchHistory()
})

onUnmounted(() => {
  if (clockInterval) clearInterval(clockInterval)
})
</script>
