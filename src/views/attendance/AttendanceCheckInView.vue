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
          {{ isAdminOrPendeta ? 'Pusat Manajemen & Absensi' : 'Portal Mandiri GSM' }}
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          {{ isAdminOrPendeta ? 'Dashboard Absensi & Monitoring' : 'Absensi & Kehadiran Pelayanan' }}
        </h1>
        <p class="text-slate-300 text-xs sm:text-sm max-w-xl font-normal leading-relaxed">
          {{ isAdminOrPendeta 
            ? 'Pantau kehadiran pelayan secara langsung (real-time), tandai hadir manual, dan cetak rekapitulasi evaluasi pelayanan.' 
            : 'Catat kehadiran ibadah dan pelayanan Anda secara mandiri dengan verifikasi waktu dan geolokasi otomatis.' 
          }}
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

    <!-- 2. Profile Bar & Tab Navigasi Role-Based -->
    <div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700 font-bold text-sm shadow-xs">
          {{ userInitials }}
        </div>
        <div>
          <p class="text-sm font-bold text-slate-800 leading-tight">
            {{ authStore.user?.name || 'Pengguna' }}
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
      <div class="flex flex-wrap items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200 shrink-0 gap-1">
        <!-- Tab 1: Check-in Mandiri (Semua Role) -->
        <button
          @click="activeTab = 'checkin'"
          :class="[
            'px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer',
            activeTab === 'checkin'
              ? 'bg-white text-cyan-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          ]"
        >
          <ClipboardCheck class="w-4 h-4 text-cyan-600" />
          <span>Check-In Acara</span>
          <span
            v-if="events.length > 0"
            class="px-1.5 py-0.2 rounded-full bg-cyan-100 text-cyan-800 text-[10px] font-extrabold"
          >
            {{ events.length }}
          </span>
        </button>

        <!-- Tab 2: Monitoring Live (Khusus Admin & Pendeta) -->
        <button
          v-if="isAdminOrPendeta"
          @click="switchToMonitoringTab"
          :class="[
            'px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer',
            activeTab === 'monitoring'
              ? 'bg-white text-cyan-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          ]"
        >
          <Activity class="w-4 h-4 text-cyan-600" />
          <span>Monitoring Live</span>
          <span class="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
            Live
          </span>
        </button>

        <!-- Tab 3: Rekap Evaluasi (Khusus Admin & Pendeta) -->
        <button
          v-if="isAdminOrPendeta"
          @click="switchToRecapTab"
          :class="[
            'px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer',
            activeTab === 'recap'
              ? 'bg-white text-cyan-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          ]"
        >
          <FileSpreadsheet class="w-4 h-4 text-cyan-600" />
          <span>Rekap & Laporan</span>
        </button>

        <!-- Tab 4: Riwayat Pribadi -->
        <button
          @click="activeTab = 'history'"
          :class="[
            'px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer',
            activeTab === 'history'
              ? 'bg-white text-cyan-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          ]"
        >
          <History class="w-4 h-4 text-cyan-600" />
          <span>{{ isAdminOrPendeta ? 'Riwayat Saya' : 'Riwayat Kehadiran' }}</span>
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
        <button @click="toastMessage = ''" class="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
          <X class="w-3.5 h-3.5" />
        </button>
      </div>
    </transition>

    <!-- ========================================================================================= -->
    <!-- 4. TAB 1: DAFTAR ACARA UNTUK CHECK-IN MANDIRI                                             -->
    <!-- ========================================================================================= -->
    <div v-if="activeTab === 'checkin'" class="space-y-4">
      <div v-if="loadingEvents" class="p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <div class="w-8 h-8 border-3 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p class="text-xs font-semibold text-slate-600">Memeriksa jadwal ibadah aktif...</p>
      </div>

      <div
        v-else-if="events.length === 0"
        class="p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs"
      >
        <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
          <CalendarX class="w-8 h-8" />
        </div>
        <h3 class="text-base font-bold text-slate-800">Tidak Ada Acara Aktif</h3>
        <p class="text-xs text-slate-500 max-w-md mx-auto mt-1">
          Saat ini belum ada acara ibadah atau kegiatan yang membuka sesi absensi.
        </p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div
          v-for="evt in events"
          :key="evt.id"
          class="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
        >
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

            <h3 class="text-base font-extrabold text-slate-800 leading-snug">
              {{ evt.title }}
            </h3>

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

          <div class="p-5 bg-slate-50/50 flex-1 flex flex-col justify-center">
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

    <!-- ========================================================================================= -->
    <!-- 5. TAB 2: MONITORING KEHADIRAN REALTIME (ADMIN & PENDETA)                                 -->
    <!-- ========================================================================================= -->
    <div v-if="activeTab === 'monitoring' && isAdminOrPendeta" class="space-y-5">
      <!-- Selector Acara & Tombol Aksi -->
      <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div class="flex-1 max-w-md">
          <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Pilih Acara yang Dipantau:
          </label>
          <div class="relative">
            <select
              v-model="selectedEventId"
              @change="fetchMonitoringData"
              class="w-full pl-3 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20 transition-all cursor-pointer"
            >
              <option v-for="e in events" :key="e.id" :value="e.id">
                [{{ e.event_type }}] {{ e.title }} ({{ e.event_date }})
              </option>
            </select>
            <ChevronDown class="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div class="flex items-center gap-2.5 self-end sm:self-auto">
          <button
            @click="fetchMonitoringData"
            :disabled="loadingMonitoring"
            class="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Refresh Data Kehadiran"
          >
            <RefreshCw :class="['w-4 h-4 text-slate-500', loadingMonitoring && 'animate-spin']" />
            <span class="hidden sm:inline">Segarkan</span>
          </button>

          <button
            @click="openManualCheckInModal"
            class="px-4 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <UserCheck class="w-4 h-4" />
            <span>Tandai Hadir Manual</span>
          </button>
        </div>
      </div>

      <!-- Kartu Metrik Kehadiran (Statistik) -->
      <div v-if="monitoringData?.stats" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Total Bertugas -->
        <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
            <Users class="w-6 h-6" />
          </div>
          <div>
            <p class="text-xs font-medium text-slate-500">Petugas Terjadwal</p>
            <h4 class="text-2xl font-extrabold text-slate-800 mt-0.5">
              {{ monitoringData.stats.total_scheduled }}
            </h4>
          </div>
        </div>

        <!-- Sudah Hadir (Terjadwal) -->
        <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 class="w-6 h-6" />
          </div>
          <div>
            <p class="text-xs font-medium text-slate-500">Hadir Terjadwal</p>
            <h4 class="text-2xl font-extrabold text-emerald-700 mt-0.5">
              {{ monitoringData.stats.attended_scheduled }}
            </h4>
          </div>
        </div>

        <!-- Belum Hadir -->
        <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
            <Clock class="w-6 h-6" />
          </div>
          <div>
            <p class="text-xs font-medium text-slate-500">Belum Hadir</p>
            <h4 class="text-2xl font-extrabold text-amber-600 mt-0.5">
              {{ monitoringData.stats.unattended_scheduled }}
            </h4>
          </div>
        </div>

        <!-- Tingkat Kehadiran (%) -->
        <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <p class="text-xs font-medium text-slate-500">Tingkat Kehadiran</p>
            <span class="text-xs font-extrabold text-cyan-700">
              {{ monitoringData.stats.attendance_percentage }}%
            </span>
          </div>
          <div class="w-full bg-slate-100 rounded-full h-2.5 mt-2 overflow-hidden">
            <div
              class="bg-cyan-600 h-2.5 rounded-full transition-all duration-500"
              :style="{ width: `${monitoringData.stats.attendance_percentage}%` }"
            ></div>
          </div>
          <p class="text-[11px] text-slate-400 mt-1">
            +{{ monitoringData.stats.additional_attendees }} Pelayan Tambahan
          </p>
        </div>
      </div>

      <!-- Loading Monitoring -->
      <div v-if="loadingMonitoring" class="p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <div class="w-8 h-8 border-3 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p class="text-xs font-semibold text-slate-600">Memuat status kehadiran...</p>
      </div>

      <!-- Tabel 1: Petugas Terjadwal -->
      <div v-else class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div class="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 class="text-sm font-bold text-slate-800">Daftar Petugas Terjadwal</h3>
            <p class="text-xs text-slate-500">Status kehadiran seluruh pelayan yang ditugaskan pada acara ini</p>
          </div>
          <span class="text-xs font-mono font-medium text-slate-400">
            Total: {{ monitoringData?.scheduled_assignments?.length || 0 }} Kategori
          </span>
        </div>

        <div v-if="!monitoringData?.scheduled_assignments || monitoringData.scheduled_assignments.length === 0" class="p-8 text-center text-slate-400">
          <Users class="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p class="text-xs font-medium">Belum ada penugasan kategori pada acara ini.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <th class="py-3 px-4">Kategori Pelayanan</th>
                <th class="py-3 px-4">Petugas (GSM)</th>
                <th class="py-3 px-4">Status Kehadiran</th>
                <th class="py-3 px-4">Waktu Check-In</th>
                <th class="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              <tr
                v-for="item in monitoringData.scheduled_assignments"
                :key="item.assignment_id"
                class="hover:bg-slate-50/80 transition-colors"
              >
                <!-- Kategori -->
                <td class="py-3 px-4 font-bold text-slate-800 whitespace-nowrap">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 font-semibold text-slate-700 text-xs">
                    {{ item.category_name }}
                  </span>
                </td>

                <!-- Petugas GSM -->
                <td class="py-3 px-4 whitespace-nowrap">
                  <div v-if="item.user_id">
                    <p class="font-bold text-slate-800">{{ item.user_name }}</p>
                    <p class="text-[11px] text-slate-400 font-mono">{{ item.user_email }}</p>
                  </div>
                  <span v-else class="text-slate-400 italic text-xs">
                    (Belum di-assign)
                  </span>
                </td>

                <!-- Status Kehadiran -->
                <td class="py-3 px-4 whitespace-nowrap">
                  <span
                    v-if="item.is_attended"
                    class="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg text-xs border border-emerald-200"
                  >
                    <CheckCircle2 class="w-3.5 h-3.5" />
                    Hadir
                  </span>
                  <span
                    v-else-if="item.user_id"
                    class="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-lg text-xs border border-amber-200"
                  >
                    <Clock class="w-3.5 h-3.5" />
                    Belum Hadir
                  </span>
                  <span v-else class="text-slate-400 text-xs">-</span>
                </td>

                <!-- Waktu Check-In -->
                <td class="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-600">
                  <span v-if="item.check_in_time">
                    {{ formatTime(item.check_in_time) }} WIB
                    <span v-if="item.photo_proof?.includes('MANUAL')" class="ml-1 text-[10px] text-purple-600 font-semibold">(Manual)</span>
                  </span>
                  <span v-else class="text-slate-400 italic">-</span>
                </td>

                <!-- Aksi -->
                <td class="py-3 px-4 whitespace-nowrap text-center">
                  <!-- Jika Belum Hadir & Ada User: Tombol Tandai Hadir Cepat -->
                  <button
                    v-if="!item.is_attended && item.user_id"
                    @click="quickCheckIn(item.user_id, item.user_name)"
                    class="px-2.5 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-700 font-semibold text-[11px] border border-cyan-200 transition-colors cursor-pointer"
                  >
                    Tandai Hadir
                  </button>

                  <!-- Jika Sudah Hadir: Tombol Batalkan -->
                  <button
                    v-else-if="item.is_attended && item.attendance_id"
                    @click="cancelAttendance(item.attendance_id, item.user_name)"
                    class="px-2 py-1 rounded-lg hover:bg-rose-50 text-rose-500 hover:text-rose-700 font-medium text-[11px] transition-colors cursor-pointer"
                    title="Batalkan Kehadiran"
                  >
                    Batalkan
                  </button>
                  <span v-else class="text-slate-300">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tabel 2: Pelayan Tambahan (Jika Ada) -->
      <div
        v-if="monitoringData?.additional_attendees && monitoringData.additional_attendees.length > 0"
        class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden"
      >
        <div class="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 class="text-sm font-bold text-slate-800">Pelayan Tambahan / Pengganti (Hadir)</h3>
            <p class="text-xs text-slate-500">GSM yang hadir pada acara ini meski tidak terdaftar pada jadwal awal</p>
          </div>
          <span class="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
            {{ monitoringData.additional_attendees.length }} Orang
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <th class="py-3 px-4">Nama Pelayan</th>
                <th class="py-3 px-4">Email</th>
                <th class="py-3 px-4">Waktu Check-In</th>
                <th class="py-3 px-4">Keterangan</th>
                <th class="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              <tr v-for="att in monitoringData.additional_attendees" :key="att.attendance_id" class="hover:bg-slate-50/80 transition-colors">
                <td class="py-3 px-4 font-bold text-slate-800 whitespace-nowrap">{{ att.user_name }}</td>
                <td class="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">{{ att.user_email }}</td>
                <td class="py-3 px-4 font-mono font-medium text-slate-700 whitespace-nowrap">{{ formatTime(att.check_in_time) }} WIB</td>
                <td class="py-3 px-4 whitespace-nowrap text-slate-500 text-xs">
                  {{ att.photo_proof?.includes('MANUAL') ? 'Dicatat Manual oleh Admin' : 'Check-In Mandiri' }}
                </td>
                <td class="py-3 px-4 whitespace-nowrap text-center">
                  <button
                    @click="cancelAttendance(att.attendance_id, att.user_name)"
                    class="px-2 py-1 rounded-lg hover:bg-rose-50 text-rose-500 hover:text-rose-700 font-medium text-[11px] transition-colors cursor-pointer"
                  >
                    Batalkan
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ========================================================================================= -->
    <!-- 6. TAB 3: REKAPITULASI & LAPORAN ABSENSI (ADMIN & PENDETA)                                 -->
    <!-- ========================================================================================= -->
    <div v-if="activeTab === 'recap' && isAdminOrPendeta" class="space-y-5">
      <!-- Filter Bar -->
      <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-end justify-between gap-4">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
          <!-- Filter Tipe Acara -->
          <div>
            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tipe Acara</label>
            <select
              v-model="recapFilter.event_type"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-cyan-600 transition-all cursor-pointer"
            >
              <option value="ALL">Semua Tipe Acara</option>
              <option value="MINGGU">Ibadah Minggu</option>
              <option value="SERMON">Sermon Guru Sekolah Minggu</option>
              <option value="LAINNYA">Acara Lainnya</option>
            </select>
          </div>

          <!-- Dari Tanggal -->
          <div>
            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Dari Tanggal</label>
            <input
              v-model="recapFilter.startDate"
              type="date"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-cyan-600 transition-all cursor-pointer"
            />
          </div>

          <!-- Sampai Tanggal -->
          <div>
            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Sampai Tanggal</label>
            <input
              v-model="recapFilter.endDate"
              type="date"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-cyan-600 transition-all cursor-pointer"
            />
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="fetchRecapData"
            class="px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Filter class="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>
          <button
            @click="resetRecapFilter"
            class="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 rounded-xl transition-colors cursor-pointer"
          >
            Reset
          </button>
          <button
            @click="printRecapReport"
            class="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer class="w-3.5 h-3.5" />
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      <!-- Printable Area -->
      <div id="printable-recap" class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div class="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 class="text-base font-extrabold text-slate-800">Rekapitulasi Kehadiran Pelayanan GSM</h3>
            <p class="text-xs text-slate-500">Evaluasi keaktifan kehadiran Guru Sekolah Minggu berdasarkan acara ibadah</p>
          </div>
          <span class="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
            Total Sesi: {{ recapData?.total_events || 0 }} Acara
          </span>
        </div>

        <div v-if="loadingRecap" class="p-12 text-center">
          <div class="w-6 h-6 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p class="text-xs text-slate-500">Menghitung rekapitulasi kehadiran...</p>
        </div>

        <div v-else-if="!recapData?.recap || recapData.recap.length === 0" class="p-8 text-center text-slate-400">
          <Users class="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p class="text-xs font-medium">Tidak ada data rekapitulasi pada filter yang dipilih.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <th class="py-3 px-4">Nama Guru Sekolah Minggu</th>
                <th class="py-3 px-4">Email / Akun</th>
                <th class="py-3 px-4 text-center">Total Ditugaskan</th>
                <th class="py-3 px-4 text-center">Hadir Terjadwal</th>
                <th class="py-3 px-4 text-center">Hadir Tambahan</th>
                <th class="py-3 px-4 text-center">Total Kehadiran</th>
                <th class="py-3 px-4 text-center">Persentase Keaktifan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              <tr v-for="r in recapData.recap" :key="r.user_id" class="hover:bg-slate-50/80 transition-colors">
                <td class="py-3 px-4 font-bold text-slate-800 whitespace-nowrap">{{ r.user_name }}</td>
                <td class="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">{{ r.user_email }}</td>
                <td class="py-3 px-4 text-center font-bold text-slate-700 whitespace-nowrap">{{ r.total_assignments }}x</td>
                <td class="py-3 px-4 text-center font-bold text-emerald-700 whitespace-nowrap">{{ r.attended_scheduled }}x</td>
                <td class="py-3 px-4 text-center text-slate-600 whitespace-nowrap">{{ r.attended_additional }}x</td>
                <td class="py-3 px-4 text-center whitespace-nowrap">
                  <span class="inline-flex px-2.5 py-1 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-800 font-extrabold text-xs">
                    {{ r.total_attendances }}x Hadir
                  </span>
                </td>
                <td class="py-3 px-4 text-center whitespace-nowrap">
                  <div class="flex items-center justify-center gap-2">
                    <span class="font-extrabold text-slate-800 min-w-[36px]">
                      {{ r.total_assignments > 0 ? Math.round((r.attended_scheduled / r.total_assignments) * 100) : (r.total_attendances > 0 ? 100 : 0) }}%
                    </span>
                    <div class="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        class="bg-emerald-600 h-1.5 rounded-full"
                        :style="{ width: `${r.total_assignments > 0 ? Math.min(100, Math.round((r.attended_scheduled / r.total_assignments) * 100)) : (r.total_attendances > 0 ? 100 : 0)}%` }"
                      ></div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ========================================================================================= -->
    <!-- 7. TAB 4: RIWAYAT KEHADIRAN SAYA                                                          -->
    <!-- ========================================================================================= -->
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

    <!-- ========================================================================================= -->
    <!-- 8. MODAL: TANDAI HADIR MANUAL                                                             -->
    <!-- ========================================================================================= -->
    <div
      v-if="isManualModalOpen"
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700">
              <UserCheck class="w-4 h-4" />
            </div>
            <h3 class="font-extrabold text-slate-800 text-sm">Tandai Hadir Manual</h3>
          </div>
          <button @click="isManualModalOpen = false" class="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
            <X class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="submitManualCheckIn" class="space-y-4 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Pilih Guru Sekolah Minggu (GSM)</label>
            <select
              v-model="manualForm.user_id"
              required
              class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-semibold focus:outline-none focus:border-cyan-600 cursor-pointer"
            >
              <option value="" disabled>-- Pilih Akun GSM --</option>
              <option
                v-for="u in monitoringData?.available_gsm_users"
                :key="u.id"
                :value="u.id"
              >
                {{ u.name }} ({{ u.email }})
              </option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Keterangan / Alasan (Opsional)</label>
            <input
              v-model="manualForm.notes"
              type="text"
              placeholder="Contoh: Baterai HP habis, melapor langsung"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:border-cyan-600"
            />
          </div>

          <div class="pt-2 flex justify-end gap-2">
            <button
              type="button"
              @click="isManualModalOpen = false"
              class="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold rounded-xl cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="submittingManual"
              class="px-5 py-2 bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded-xl shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              <span v-if="submittingManual" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Simpan Kehadiran</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
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
  RefreshCw,
  Activity,
  FileSpreadsheet,
  ChevronDown,
  UserCheck,
  Filter,
  Printer
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

// Monitoring State
const selectedEventId = ref(null)
const monitoringData = ref(null)
const loadingMonitoring = ref(false)

// Manual Check-in Modal
const isManualModalOpen = ref(false)
const manualForm = reactive({
  user_id: '',
  notes: ''
})
const submittingManual = ref(false)

// Recap State
const recapFilter = reactive({
  event_type: 'ALL',
  startDate: '',
  endDate: ''
})
const recapData = ref(null)
const loadingRecap = ref(false)

// Role Check
const isAdminOrPendeta = computed(() => {
  const roles = authStore.userRoles || []
  return roles.some(r => r.code === 'ADMIN' || r.code === 'PENDETA')
})

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
      if (events.value.length > 0 && !selectedEventId.value) {
        selectedEventId.value = events.value[0].id
      }
    }
  } catch (err) {
    console.error('Error fetchEvents:', err)
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

// Handle Check-In Mandiri
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
      await fetchEvents()
      await fetchHistory()
      if (selectedEventId.value === evt.id) {
        await fetchMonitoringData()
      }
    }
  } catch (err) {
    console.error('Error checkIn:', err)
    const errorMsg = err.response?.data?.message || 'Gagal melakukan check-in'
    showToast(errorMsg, 'error')
  } finally {
    submittingEventId.value = null
  }
}

// ==========================================
// MONITORING FUNCTIONS (ADMIN & PENDETA)
// ==========================================
const switchToMonitoringTab = async () => {
  activeTab.value = 'monitoring'
  if (!selectedEventId.value && events.value.length > 0) {
    selectedEventId.value = events.value[0].id
  }
  if (selectedEventId.value) {
    await fetchMonitoringData()
  }
}

const fetchMonitoringData = async () => {
  if (!selectedEventId.value) return
  loadingMonitoring.value = true
  try {
    const res = await axios.get(`/attendances/events/${selectedEventId.value}/monitoring`)
    if (res.data.success) {
      monitoringData.value = res.data.data
    }
  } catch (err) {
    console.error('Error fetchMonitoringData:', err)
    showToast('Gagal memuat data monitoring acara', 'error')
  } finally {
    loadingMonitoring.value = false
  }
}

const openManualCheckInModal = () => {
  manualForm.user_id = ''
  manualForm.notes = ''
  isManualModalOpen.value = true
}

const quickCheckIn = async (userId, userName) => {
  if (!confirm(`Konfirmasi kehadiran untuk ${userName}?`)) return
  try {
    const res = await axios.post('/attendances/manual-checkin', {
      event_id: selectedEventId.value,
      user_id: userId,
      notes: 'Tandai cepat oleh admin'
    })
    if (res.data.success) {
      showToast(`Kehadiran ${userName} berhasil dicatat!`, 'success')
      await fetchMonitoringData()
      await fetchEvents()
    }
  } catch (err) {
    console.error('Error quickCheckIn:', err)
    showToast(err.response?.data?.message || 'Gagal mencatat kehadiran', 'error')
  }
}

const submitManualCheckIn = async () => {
  if (!manualForm.user_id) return
  submittingManual.value = true
  try {
    const res = await axios.post('/attendances/manual-checkin', {
      event_id: selectedEventId.value,
      user_id: manualForm.user_id,
      notes: manualForm.notes
    })
    if (res.data.success) {
      showToast('Kehadiran berhasil dicatat secara manual!', 'success')
      isManualModalOpen.value = false
      await fetchMonitoringData()
      await fetchEvents()
    }
  } catch (err) {
    console.error('Error submitManualCheckIn:', err)
    showToast(err.response?.data?.message || 'Gagal menyimpan kehadiran manual', 'error')
  } finally {
    submittingManual.value = false
  }
}

const cancelAttendance = async (attendanceId, userName) => {
  if (!confirm(`Batalkan kehadiran untuk ${userName || 'pelayan ini'}?`)) return
  try {
    const res = await axios.delete(`/attendances/${attendanceId}`)
    if (res.data.success) {
      showToast('Catatan kehadiran berhasil dibatalkan', 'success')
      await fetchMonitoringData()
      await fetchEvents()
    }
  } catch (err) {
    console.error('Error cancelAttendance:', err)
    showToast('Gagal membatalkan kehadiran', 'error')
  }
}

// ==========================================
// RECAP FUNCTIONS (ADMIN & PENDETA)
// ==========================================
const switchToRecapTab = async () => {
  activeTab.value = 'recap'
  await fetchRecapData()
}

const fetchRecapData = async () => {
  loadingRecap.value = true
  try {
    const params = {}
    if (recapFilter.event_type && recapFilter.event_type !== 'ALL') {
      params.event_type = recapFilter.event_type
    }
    if (recapFilter.startDate) params.startDate = recapFilter.startDate
    if (recapFilter.endDate) params.endDate = recapFilter.endDate

    const res = await axios.get('/attendances/recap', { params })
    if (res.data.success) {
      recapData.value = res.data.data
    }
  } catch (err) {
    console.error('Error fetchRecapData:', err)
    showToast('Gagal memuat data rekapitulasi', 'error')
  } finally {
    loadingRecap.value = false
  }
}

const resetRecapFilter = () => {
  recapFilter.event_type = 'ALL'
  recapFilter.startDate = ''
  recapFilter.endDate = ''
  fetchRecapData()
}

const printRecapReport = () => {
  window.print()
}

onMounted(async () => {
  clockInterval = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)

  requestGPS()
  await fetchEvents()
  await fetchHistory()
})

onUnmounted(() => {
  if (clockInterval) clearInterval(clockInterval)
})
</script>

<style>
@media print {
  body * {
    visibility: hidden;
  }
  #printable-recap, #printable-recap * {
    visibility: visible;
  }
  #printable-recap {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    border: none !important;
    box-shadow: none !important;
  }
}
</style>
