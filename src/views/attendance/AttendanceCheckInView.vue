<template>
  <div class="space-y-6">
    <!-- 1. Header Banner & Real-time Digital Clock -->
    <div class="rounded-2xl bg-gradient-to-r from-[#0b1426] via-[#101f3c] to-[#152a52] p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10 border border-slate-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
      <!-- Ambient Background Glow -->
      <div class="absolute -right-16 -top-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -left-16 -bottom-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10 space-y-2">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wide">
          <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          Portal Mandiri Kehadiran GSM
        </div>
        <h1 class="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
          <ClipboardCheck class="w-6 h-6 text-cyan-400 shrink-0" />
          {{ isAdminOrPendeta ? 'Kelola Kehadiran & Absensi GSM' : 'Check-In Acara & Kehadiran' }}
        </h1>
        <p class="text-slate-300 text-xs sm:text-sm max-w-xl font-normal leading-relaxed">
          {{ isAdminOrPendeta
            ? 'Pantau kehadiran serta kelola atau revisi absensi manual untuk Guru Sekolah Minggu (GSM) yang lupa check-in.'
            : 'Catat kehadiran ibadah dan pelayanan Anda secara mandiri dengan verifikasi waktu, geolokasi GPS, dan foto selfie.'
          }}
        </p>

        <!-- Status Geofencing Badge (Hanya untuk GSM yang melakukan absensi mandiri) -->
        <div v-if="!isAdminOrPendeta" class="pt-1 flex flex-wrap items-center gap-2 text-xs">
          <div
            v-if="currentCoords && churchConfig.church_latitude"
            :class="[
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium border text-xs',
              isWithinRadius
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            ]"
          >
            <MapPin class="w-3.5 h-3.5 shrink-0" :class="isWithinRadius ? 'text-emerald-400' : 'text-rose-400'" />
            <span v-if="isWithinRadius">
              Dalam Radius: <strong>{{ currentDistance }}m</strong> dari gereja (Maks: {{ churchConfig.max_radius_meters }}m)
            </span>
            <span v-else>
              Di Luar Radius: <strong>{{ currentDistance }}m</strong> (Batas Maksimal: {{ churchConfig.max_radius_meters }}m)
            </span>
          </div>
          <div v-else class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium bg-slate-800/80 text-slate-300 border border-slate-700 text-xs">
            <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span>{{ gpsStatusText }}</span>
          </div>
        </div>
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
          <Clock class="w-3 h-3 text-cyan-400" />
          <span>Waktu Indonesia Barat (WIB)</span>
        </div>
      </div>
    </div>

    <!-- 2. User Bar & Navigasi -->
    <div class="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      <!-- User Info Badge -->
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-2xl bg-cyan-600/10 border border-cyan-500/20 text-cyan-700 flex items-center justify-center font-black text-sm">
          {{ authStore.user?.name ? authStore.user.name.substring(0, 2).toUpperCase() : 'U' }}
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-bold text-slate-800">{{ authStore.user?.name }}</h3>
            <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-extrabold uppercase">
              {{ authStore.userRoles[0]?.code || 'GSM' }}
            </span>
          </div>
          <p class="text-xs text-slate-500 font-mono">Akun: {{ authStore.user?.username || authStore.user?.email }}</p>
        </div>
      </div>

      <!-- Submenu Navigasi -->
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
          <!-- Tab 1: Check-In / Daftar Acara -->
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
            <span>{{ isAdminOrPendeta ? 'Daftar Acara' : 'Check-In Acara' }}</span>
            <span
              v-if="events.length > 0"
              class="px-1.5 py-0.2 rounded-full bg-cyan-100 text-cyan-800 text-[10px] font-extrabold"
            >
              {{ events.length }}
            </span>
          </button>

          <!-- Tab 2: Riwayat Pribadi (Hanya untuk GSM / Pelayan yang diabsenkan) -->
          <button
            v-if="!isAdminOrPendeta"
            @click="activeTab = 'history'"
            :class="[
              'px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer',
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
    </div>

    <!-- 3. Alert / Toast Notifikasi -->
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
    <!-- 4. TAB 1: DAFTAR ACARA UNTUK CHECK-IN MANDIRI (DENGAN PEMBAGIAN MINGGU, SERMON, LAINNYA) -->
    <!-- ========================================================================================= -->
    <div v-if="activeTab === 'checkin'" class="space-y-4">
      <!-- Admin Mode Banner: Penjelasan Hak Akses Revisi & Absensi GSM Lupa Absen -->
      <div
        v-if="isAdminOrPendeta"
        class="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 text-blue-900 text-xs flex items-center justify-between flex-wrap gap-2 shadow-xs"
      >
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldAlert class="w-4 h-4" />
          </div>
          <div>
            <p class="font-bold text-slate-800 text-xs sm:text-sm">Mode Administrator & Pelayan Gereja</p>
            <p class="text-blue-700 text-[11px] mt-0.5">
              Anda dapat melakukan absensi manual / revisi kehadiran untuk GSM yang lupa absen pada setiap acara (termasuk acara lampau).
            </p>
          </div>
        </div>
        <span class="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-extrabold text-[10px] tracking-wide uppercase">
          Akses Revisi Aktif
        </span>
      </div>

      <!-- Category Filter Tabs: SEMUA, MINGGU, SERMON, LAINNYA -->
      <div class="flex items-center justify-between flex-wrap gap-3 bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-xs">
        <div class="flex items-center gap-1.5 flex-wrap">
          <button
            v-for="cat in categoryTabs"
            :key="cat.key"
            @click="selectedCategory = cat.key"
            :class="[
              'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer',
              selectedCategory === cat.key
                ? 'bg-[#0b1426] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            ]"
          >
            <span>{{ cat.label }}</span>
            <span
              :class="[
                'px-1.5 py-0.2 rounded-full text-[10px] font-extrabold',
                selectedCategory === cat.key ? 'bg-cyan-400 text-[#0b1426]' : 'bg-slate-200 text-slate-700'
              ]"
            >
              {{ cat.count }}
            </span>
          </button>
        </div>

        <button
          @click="fetchEvents"
          :disabled="loadingEvents"
          class="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          title="Segarkan Jadwal Acara"
        >
          <RefreshCw :class="['w-3.5 h-3.5 text-slate-500', loadingEvents && 'animate-spin']" />
          <span>Segarkan</span>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loadingEvents" class="p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <div class="w-8 h-8 border-3 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p class="text-xs font-semibold text-slate-600">Memeriksa jadwal ibadah aktif...</p>
      </div>

      <!-- Empty State: Jika tidak ada acara aktif sama sekali -->
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

      <!-- Empty State: Jika tidak ada acara pada tab kategori terpilih -->
      <div
        v-else-if="filteredEvents.length === 0"
        class="p-10 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs"
      >
        <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
          <CalendarX class="w-6 h-6" />
        </div>
        <h3 class="text-sm font-bold text-slate-800">Tidak Ada Acara Kategori {{ selectedCategoryLabel }}</h3>
        <p class="text-xs text-slate-500 max-w-md mx-auto mt-1">
          Tidak ada kegiatan aktif untuk kategori ini. Silakan periksa tab lainnya.
        </p>
      </div>

      <!-- Grid Cards Acara -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div
          v-for="evt in filteredEvents"
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

            <div v-if="!isAdminOrPendeta" class="mt-3">
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
                <span>Pelayan Tambahan / Mandiri</span>
              </div>
            </div>
          </div>

          <div class="p-5 bg-slate-50/50 flex-1 flex flex-col justify-center">
            <!-- ========================================== -->
            <!-- A. MODE KHUSUS ADMINISTRATOR / PENDETA     -->
            <!-- ========================================== -->
            <div v-if="isAdminOrPendeta" class="space-y-2">
              <!-- Tombol Utama: Kelola Kehadiran GSM & Revisi Absensi -->
              <button
                @click="openAdminManageModal(evt)"
                class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#0b1426] to-[#152a52] hover:from-[#11203d] hover:to-[#1c386d] text-white font-bold text-xs sm:text-sm shadow-md shadow-slate-900/15 transition-all flex items-center justify-between gap-2 cursor-pointer"
              >
                <div class="flex items-center gap-2">
                  <Users class="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Kelola Absensi GSM (Lupa Absen)</span>
                </div>
                <span class="px-2.5 py-1 rounded-full bg-cyan-400/20 text-cyan-300 text-[11px] font-extrabold shrink-0">
                  {{ evt.total_attendees || 0 }} Hadir
                </span>
              </button>
            </div>

            <!-- ========================================== -->
            <!-- B. MODE USER BIASA / GURU SEKOLAH MINGGU   -->
            <!-- ========================================== -->
            <div v-else>
              <!-- 1. Kondisi: Sudah Check-In -->
              <div
                v-if="evt.is_checked_in"
                class="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 flex flex-col gap-2.5"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2 font-bold text-sm text-emerald-800">
                    <CheckCircle2 class="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Anda Sudah Hadir (Check-In)</span>
                  </div>
                  <span
                    v-if="isManualAttendance(evt.attendance_details?.photo_proof)"
                    class="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-950 text-[10px] font-extrabold flex items-center gap-1"
                  >
                    <UserCheck class="w-3 h-3 text-amber-800" />
                    <span>Dicatat Admin</span>
                  </span>
                  <span
                    v-else
                    class="px-2 py-0.5 rounded-full bg-emerald-200/60 text-emerald-900 text-[10px] font-extrabold"
                  >
                    Terverifikasi
                  </span>
                </div>

                <div class="text-xs text-emerald-700 space-y-1.5 pl-7">
                  <p>
                    Waktu: <strong>{{ formatDateTime(evt.attendance_details?.check_in_time) }} WIB</strong>
                  </p>
                  <p v-if="evt.attendance_details?.latitude && evt.attendance_details?.longitude" class="text-[11px] text-emerald-600 font-mono">
                    📍 Koordinat: {{ Number(evt.attendance_details.latitude).toFixed(5) }}, {{ Number(evt.attendance_details.longitude).toFixed(5) }}
                  </p>

                  <!-- Bukti Kehadiran: Keterangan Admin jika Manual, atau Tombol Foto jika Selfie Mandiri -->
                  <div v-if="isManualAttendance(evt.attendance_details?.photo_proof)" class="pt-1">
                    <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-900 text-xs font-semibold shadow-2xs">
                      <UserCheck class="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>Absensi dicatat manual oleh Admin{{ getManualNote(evt.attendance_details?.photo_proof) }}</span>
                    </div>
                  </div>
                  <div v-else-if="evt.attendance_details?.photo_proof" class="pt-1">
                    <button
                      @click="previewPhoto(evt.attendance_details.photo_proof, evt.title)"
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      <Camera class="w-3.5 h-3.5 text-emerald-600" />
                      <span>Lihat Foto Bukti Kehadiran</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- 2. Kondisi: Belum Check-In -->
              <div v-else>
                <!-- KASUS 2A: HARI H ACARA (BISA CHECK-IN MANDIRI) -->
                <div v-if="evt.is_today" class="space-y-3">
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-slate-500">Persyaratan Check-in:</span>
                    <span class="font-medium text-slate-700 flex items-center gap-1">
                      <MapPin class="w-3 h-3 text-cyan-600" /> GPS &
                      <Camera class="w-3 h-3 text-cyan-600" /> Foto Selfie
                    </span>
                  </div>

                  <!-- Peringatan jika di luar jangkauan GPS -->
                  <div
                    v-if="churchConfig.require_gps && currentCoords && !isWithinRadius"
                    class="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2"
                  >
                    <AlertCircle class="w-4 h-4 text-rose-600 shrink-0" />
                    <span class="text-[11px]">
                      Anda berjarak {{ currentDistance }}m dari gereja. Absensi hanya dapat dilakukan di dalam radius {{ churchConfig.max_radius_meters }}m.
                    </span>
                  </div>

                  <button
                    @click="openCheckInModal(evt)"
                    :disabled="submittingEventId === evt.id"
                    class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#0b1426] to-[#152a52] hover:from-[#11203d] hover:to-[#1c386d] text-white font-bold text-xs sm:text-sm shadow-md shadow-slate-900/15 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    <Camera class="w-4 h-4 text-cyan-400" />
                    <span>Check-In Mandiri (Foto & GPS)</span>
                  </button>
                </div>

                <!-- KASUS 2B: ACARA SUDAH LEWAT HARI H (SESI DITUTUP, HUBUNGI ADMIN) -->
                <div v-else-if="evt.is_past" class="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-900 space-y-2">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-1.5 font-bold text-xs text-amber-800">
                      <AlertCircle class="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Sesi Absensi Ditutup</span>
                    </div>
                    <span class="px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900 text-[10px] font-extrabold">
                      Hari Sudah Lewat
                    </span>
                  </div>
                  <p class="text-[11px] text-amber-800/90 leading-relaxed">
                    Absensi hanya bisa dilakukan di hari H acara. Jika Anda hadir namun lupa absen, silakan hubungi <strong>Admin</strong> untuk revisi kehadiran.
                  </p>
                  <button
                    disabled
                    class="w-full py-2.5 px-3 rounded-xl bg-slate-200 text-slate-400 font-bold text-xs cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    <Clock class="w-3.5 h-3.5" />
                    <span>Sesi Absensi Telah Berakhir</span>
                  </button>
                </div>

                <!-- KASUS 2C: ACARA MENDATANG / BELUM HARI H -->
                <div v-else class="p-3.5 rounded-xl bg-sky-50/80 border border-sky-200/90 text-sky-900 space-y-2">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-1.5 font-bold text-xs text-sky-800">
                      <Clock class="w-4 h-4 text-sky-600 shrink-0" />
                      <span>Sesi Belum Dibuka</span>
                    </div>
                    <span class="px-2 py-0.5 rounded-full bg-sky-200/70 text-sky-900 text-[10px] font-extrabold">
                      Hari H
                    </span>
                  </div>
                  <p class="text-[11px] text-sky-800/90 leading-relaxed">
                    Sesi absensi mandiri akan dibuka pada hari pelaksanaan acara (<strong>{{ formatDateIndo(evt.event_date) }}</strong>).
                  </p>
                  <button
                    disabled
                    class="w-full py-2.5 px-3 rounded-xl bg-slate-200 text-slate-400 font-bold text-xs cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    <Clock class="w-3.5 h-3.5" />
                    <span>Dibuka {{ formatDateIndo(evt.event_date) }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================================= -->
    <!-- 5. TAB 2: RIWAYAT KEHADIRAN SAYA                                                          -->
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
                <th class="py-3 px-4">Foto Bukti</th>
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
                <td class="py-3 px-4">
                  <span
                    v-if="h.is_scheduled"
                    class="inline-flex items-center gap-1.5 text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg text-[11px] border border-emerald-200 leading-snug"
                  >
                    <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Terjadwal ({{ h.assigned_category_name || 'Petugas' }})</span>
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center gap-1 text-slate-600 font-medium bg-slate-100 px-2.5 py-1 rounded-lg text-[11px] border border-slate-200"
                  >
                    Pelayan Tambahan
                  </span>
                </td>
                <td class="py-3 px-4 whitespace-nowrap">
                  <span
                    v-if="isManualAttendance(h.photo_proof)"
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold"
                  >
                    <UserCheck class="w-3 h-3 text-amber-700 shrink-0" />
                    <span>Dicatat oleh Admin{{ getManualNote(h.photo_proof) }}</span>
                  </span>
                  <button
                    v-else-if="h.photo_proof"
                    @click="previewPhoto(h.photo_proof, h.event_title)"
                    class="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    <Camera class="w-3 h-3 text-cyan-600" />
                    <span>Lihat Foto</span>
                  </button>
                  <span v-else class="text-slate-400 italic text-[11px]">-</span>
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
    <!-- 6. MODAL KAMERA SELFIE & CHECK-IN VERIFICATION                                             -->
    <!-- ========================================================================================= -->
    <Teleport to="body">
      <div
        v-if="isModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
      >
      <div class="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <!-- Modal Header -->
        <div class="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div>
            <h3 class="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Camera class="w-5 h-5 text-cyan-600" />
              <span>Verifikasi Foto Selfie</span>
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">{{ selectedEvent?.title }}</p>
          </div>
          <button
            @click="closeModal"
            class="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Modal Body (Camera Stream & Preview) -->
        <div class="p-5 space-y-4 overflow-y-auto flex-1 custom-scroll">
          <!-- Status GPS Info di Modal -->
          <div
            :class="[
              'p-3 rounded-xl border flex items-center justify-between text-xs',
              isWithinRadius
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            ]"
          >
            <div class="flex items-center gap-2 min-w-0">
              <MapPin class="w-4 h-4 shrink-0" :class="isWithinRadius ? 'text-emerald-600' : 'text-rose-600'" />
              <span class="truncate">
                {{ isWithinRadius ? 'GPS Terverifikasi: Dalam Radius' : `Di Luar Radius: ${currentDistance}m (Maks: ${churchConfig.max_radius_meters}m)` }}
              </span>
            </div>
            <span class="font-bold shrink-0">{{ currentDistance !== null ? currentDistance + 'm' : '-' }}</span>
          </div>

          <!-- Area Kamera / Preview -->
          <div class="relative w-full aspect-4/3 bg-slate-950 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center border-2 border-slate-300">
            <!-- 1. Live Video Stream -->
            <video
              v-show="isCameraActive && !capturedPhoto"
              ref="videoRef"
              autoplay
              playsinline
              muted
              class="w-full h-full object-cover scale-x-[-1]"
            ></video>

            <!-- 2. Captured Image Preview -->
            <img
              v-if="capturedPhoto"
              :src="capturedPhoto"
              alt="Foto Bukti Kehadiran"
              class="w-full h-full object-cover scale-x-[-1]"
            />

            <!-- 3. Kamera Belum Aktif / Error -->
            <div
              v-if="!isCameraActive && !capturedPhoto"
              class="p-6 text-center text-slate-400 space-y-3"
            >
              <div class="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-300">
                <Camera class="w-6 h-6" />
              </div>
              <p class="text-xs font-medium">{{ cameraError || 'Menyiapkan kamera selfie...' }}</p>
              <button
                @click="startCamera"
                class="px-3.5 py-1.5 rounded-lg bg-cyan-600 text-white text-xs font-semibold hover:bg-cyan-700 transition-colors cursor-pointer"
              >
                Izinkan / Buka Kamera
              </button>
            </div>

            <!-- Overlay panduan wajah saat live stream -->
            <div
              v-if="isCameraActive && !capturedPhoto"
              class="absolute inset-0 pointer-events-none flex items-center justify-center"
            >
              <div class="w-48 h-56 rounded-full border-2 border-dashed border-cyan-400/60 shadow-xs"></div>
            </div>
          </div>

          <!-- Hidden Canvas untuk Snapshot -->
          <canvas ref="canvasRef" class="hidden"></canvas>
        </div>

        <!-- Modal Footer -->
        <div class="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3 shrink-0">
          <button
            @click="closeModal"
            class="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 cursor-pointer"
          >
            Batal
          </button>

          <!-- Tombol Jepret Foto -->
          <button
            v-if="isCameraActive && !capturedPhoto"
            @click="captureSnapshot"
            class="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Camera class="w-4 h-4" />
            <span>Jepret Foto</span>
          </button>

          <!-- Tombol Foto Ulang -->
          <button
            v-if="capturedPhoto"
            @click="retakePhoto"
            :disabled="submittingEventId"
            class="px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw class="w-3.5 h-3.5" />
            <span>Foto Ulang</span>
          </button>

          <!-- Tombol Konfirmasi & Simpan Absensi -->
          <button
            v-if="capturedPhoto"
            @click="submitCheckIn"
            :disabled="submittingEventId || (churchConfig.require_gps && !isWithinRadius)"
            class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-900/10 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <span v-if="submittingEventId" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <CheckCircle2 v-else class="w-4 h-4" />
            <span>{{ submittingEventId ? 'Menyimpan...' : 'Kirim & Simpan Absensi' }}</span>
          </button>
        </div>
      </div>
      </div>
    </Teleport>

    <!-- ========================================================================================= -->
    <!-- 7. MODAL KHUSUS ADMIN: KELOLA KEHADIRAN GSM & REVISI ABSENSI (UNTUK GSM LUPA ABSEN)      -->
    <!-- ========================================================================================= -->
    <Teleport to="body">
      <div
        v-if="adminManageModal.isOpen"
        class="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto"
        @click="closeAdminManageModal"
      >
        <div
          class="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full my-auto overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
          @click.stop
        >
          <!-- Modal Header -->
          <div class="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 text-white shrink-0">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-extrabold text-[10px] uppercase tracking-wider">
                  {{ adminManageModal.event?.event_type }}
                </span>
                <span class="text-xs text-slate-300">{{ formatDateIndo(adminManageModal.event?.event_date) }}</span>
              </div>
              <h3 class="text-base font-bold text-white flex items-center gap-2">
                <Users class="w-4 h-4 text-cyan-400" />
                <span>Kelola Absensi GSM - {{ adminManageModal.event?.title }}</span>
              </h3>
              <p class="text-xs text-slate-400 mt-0.5">
                Revisi dan catat absensi manual untuk Guru Sekolah Minggu (GSM) yang lupa melakukan check-in.
              </p>
            </div>
            <button
              @click="closeAdminManageModal"
              class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors cursor-pointer"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Filter & Search Bar -->
          <div class="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 flex-wrap shrink-0">
            <!-- Search Input -->
            <div class="relative flex-1 min-w-[200px]">
              <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                v-model="adminManageModal.searchQuery"
                type="text"
                placeholder="Cari nama atau username GSM..."
                class="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <!-- Status Filter Tabs (Semua, Belum Hadir, Sudah Hadir) -->
            <div class="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                @click="adminManageModal.filterStatus = 'all'"
                :class="['px-2.5 py-1 rounded-lg transition-colors cursor-pointer', adminManageModal.filterStatus === 'all' ? 'bg-[#0b1426] text-white' : 'text-slate-600 hover:bg-slate-100']"
              >
                Semua ({{ adminManageModal.gsmList.length }})
              </button>
              <button
                @click="adminManageModal.filterStatus = 'unattended'"
                :class="['px-2.5 py-1 rounded-lg transition-colors cursor-pointer', adminManageModal.filterStatus === 'unattended' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-100']"
              >
                Belum Hadir ({{ adminManageModal.gsmList.filter(g => !g.is_attended).length }})
              </button>
              <button
                @click="adminManageModal.filterStatus = 'attended'"
                :class="['px-2.5 py-1 rounded-lg transition-colors cursor-pointer', adminManageModal.filterStatus === 'attended' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100']"
              >
                Hadir ({{ adminManageModal.gsmList.filter(g => g.is_attended).length }})
              </button>
            </div>
          </div>

          <!-- List Content -->
          <div class="p-4 overflow-y-auto flex-1 custom-scroll space-y-3">
            <!-- Loading State -->
            <div v-if="adminManageModal.loading" class="p-8 text-center">
              <div class="w-7 h-7 border-3 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p class="text-xs font-semibold text-slate-500">Memuat data absensi GSM...</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="filteredAdminGsmList.length === 0" class="p-8 text-center text-slate-400">
              <UserX class="w-8 h-8 mx-auto mb-2 opacity-60" />
              <p class="text-xs font-semibold">Tidak ada data GSM yang cocok dengan pencarian / filter.</p>
            </div>

            <!-- GSM Items -->
            <div
              v-else
              v-for="gsm in filteredAdminGsmList"
              :key="gsm.user_id"
              class="p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              :class="gsm.is_attended ? 'bg-emerald-50/40 border-emerald-200/80' : 'bg-white border-slate-200 hover:border-slate-300'"
            >
              <!-- GSM Info -->
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0"
                  :class="gsm.is_attended ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700'"
                >
                  {{ gsm.user_name?.slice(0, 2).toUpperCase() }}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h4 class="text-xs font-bold text-slate-800">{{ gsm.user_name }}</h4>
                    <span v-if="gsm.category_name" class="px-2 py-0.2 rounded-md bg-amber-100 text-amber-900 text-[10px] font-extrabold">
                      {{ gsm.category_name }}
                    </span>
                  </div>
                  <p class="text-[11px] text-slate-500">{{ gsm.user_email }}</p>

                  <!-- Status Detail jika sudah hadir -->
                  <div v-if="gsm.is_attended" class="mt-1 flex items-center gap-2 flex-wrap text-[11px] text-emerald-700 font-medium">
                    <span>🕒 {{ formatDateTime(gsm.check_in_time) }} WIB</span>
                    <span v-if="isManualAttendance(gsm.photo_proof)" class="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold flex items-center gap-1">
                      <UserCheck class="w-3 h-3 text-amber-700" />
                      <span>Dicatat oleh Admin{{ getManualNote(gsm.photo_proof) }}</span>
                    </span>
                    <button
                      v-else-if="gsm.photo_proof"
                      @click="previewPhoto(gsm.photo_proof, gsm.user_name)"
                      class="text-cyan-700 hover:underline font-bold text-[10px] flex items-center gap-0.5 cursor-pointer"
                    >
                      <Camera class="w-3 h-3" /> Foto Bukti
                    </button>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <!-- Jika Sudah Hadir: Tombol Batalkan / Hapus untuk revisi -->
                <div v-if="gsm.is_attended" class="flex items-center gap-2">
                  <span class="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 class="w-3.5 h-3.5" />
                    <span>Hadir</span>
                  </span>
                  <button
                    @click="handleAdminDeleteAttendance(gsm)"
                    :disabled="adminManageModal.submitting"
                    class="px-2.5 py-1 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    title="Batalkan kehadiran (Revisi)"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                    <span>Batalkan</span>
                  </button>
                </div>

                <!-- Jika Belum Hadir: Tombol Tandai Hadir (Absenkan) -->
                <div v-else>
                  <!-- Form Input Catatan Terbuka -->
                  <div v-if="adminManageModal.selectedGsmForCheckIn?.user_id === gsm.user_id" class="flex items-center gap-1.5 flex-wrap">
                    <input
                      v-model="adminManageModal.manualNotes"
                      type="text"
                      placeholder="Alasan / Catatan (cth: Lupa bawa HP)"
                      class="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs w-48 focus:outline-none focus:border-cyan-600"
                      @keyup.enter="handleAdminManualCheckIn(gsm)"
                    />
                    <button
                      @click="handleAdminManualCheckIn(gsm)"
                      :disabled="adminManageModal.submitting"
                      class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Check class="w-3.5 h-3.5" />
                      <span>{{ adminManageModal.submitting ? 'Menyimpan...' : 'Simpan' }}</span>
                    </button>
                    <button
                      @click="adminManageModal.selectedGsmForCheckIn = null"
                      class="px-2 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs text-slate-600 cursor-pointer"
                    >
                      <X class="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <!-- Tombol Buka Input -->
                  <button
                    v-else
                    @click="selectGsmForCheckIn(gsm)"
                    class="px-3 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <UserCheck class="w-3.5 h-3.5" />
                    <span>Tandai Hadir</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0 text-xs text-slate-500">
            <span>* Catatan manual akan otomatis tersimpan dalam histori absensi.</span>
            <button
              @click="closeAdminManageModal"
              class="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 font-bold text-slate-700 cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ========================================================================================= -->
    <!-- 8. MODAL PREVIEW FOTO BUKTI BESAR (Z-INDEX TERTINGGI: Z-[80], TELEPORT KE BODY)            -->
    <!-- ========================================================================================= -->
    <Teleport to="body">
      <div
        v-if="previewPhotoModal.isOpen"
        class="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs"
        @click="previewPhotoModal.isOpen = false"
      >
        <div class="bg-white rounded-3xl overflow-hidden max-w-sm w-full shadow-2xl p-5 space-y-4 border border-slate-200" @click.stop>
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-extrabold text-slate-800 truncate pr-2">{{ previewPhotoModal.title }}</h4>
            <button @click="previewPhotoModal.isOpen = false" class="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
              <X class="w-4 h-4" />
            </button>
          </div>
          <div class="w-full aspect-4/3 rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-200 shadow-inner">
            <img :src="previewPhotoModal.url" alt="Preview Foto" class="w-full h-full object-cover" />
          </div>
          <div class="text-right">
            <button
              @click="previewPhotoModal.isOpen = false"
              class="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
            >
              Tutup Foto
            </button>
          </div>
        </div>
      </div>
    </Teleport>
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
  FileSpreadsheet,
  Camera,
  UserCheck,
  UserX,
  Search,
  Trash2,
  ShieldAlert,
  Check
} from 'lucide-vue-next'

const authStore = useAuthStore()

// Tab State: 'checkin' | 'history'
const activeTab = ref('checkin')
const selectedCategory = ref('ALL') // 'ALL' | 'MINGGU' | 'SERMON' | 'LAINNYA'

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

// GPS State & Church Config dari m_settings
const currentCoords = ref(null)
const gpsStatusText = ref('Mendeteksi lokasi GPS...')

const churchConfig = reactive({
  church_latitude: null,
  church_longitude: null,
  max_radius_meters: 150,
  require_gps: true,
  require_photo: true,
  church_name: 'Gereja HKBP'
})

// Camera & Modal State
const isModalOpen = ref(false)
const selectedEvent = ref(null)
const isCameraActive = ref(false)
const cameraError = ref('')
const capturedPhoto = ref('')
const videoRef = ref(null)
const canvasRef = ref(null)
let mediaStream = null

// Preview Photo Modal State
const previewPhotoModal = reactive({
  isOpen: false,
  url: '',
  title: ''
})

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
  }, 4500)
}

// User Initials
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

// Haversine Distance Calculation (Meter)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null
  const R = 6371e3 // meter
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

// Distance & Geofencing Computed
const currentDistance = computed(() => {
  if (!currentCoords.value || !churchConfig.church_latitude || !churchConfig.church_longitude) {
    return null
  }
  return calculateDistance(
    currentCoords.value.latitude,
    currentCoords.value.longitude,
    churchConfig.church_latitude,
    churchConfig.church_longitude
  )
})

const isWithinRadius = computed(() => {
  if (!churchConfig.require_gps) return true
  if (currentDistance.value === null) return false
  return currentDistance.value <= (churchConfig.max_radius_meters || 150)
})

// Tab Kategori Acara (ALL, MINGGU, SERMON, LAINNYA)
const categoryTabs = computed(() => {
  const allCount = events.value.length
  const mingguCount = events.value.filter(e => (e.event_type || '').toUpperCase() === 'MINGGU').length
  const sermonCount = events.value.filter(e => (e.event_type || '').toUpperCase() === 'SERMON').length
  const lainnyaCount = events.value.filter(e => (e.event_type || '').toUpperCase() === 'LAINNYA').length

  return [
    { key: 'ALL', label: 'Semua Acara', count: allCount },
    { key: 'MINGGU', label: 'Minggu', count: mingguCount },
    { key: 'SERMON', label: 'Sermon', count: sermonCount },
    { key: 'LAINNYA', label: 'Lainnya', count: lainnyaCount }
  ]
})

const selectedCategoryLabel = computed(() => {
  const tab = categoryTabs.value.find(t => t.key === selectedCategory.value)
  return tab ? tab.label : ''
})

const filteredEvents = computed(() => {
  if (selectedCategory.value === 'ALL') {
    return events.value
  }
  return events.value.filter(e => (e.event_type || '').toUpperCase() === selectedCategory.value)
})

// Request GPS Location
const requestGPS = () => {
  if (!navigator.geolocation) {
    gpsStatusText.value = 'GPS tidak didukung oleh browser Anda'
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
      gpsStatusText.value = 'Izin GPS Ditolak / Belum Diaktifkan'
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  )
}

// Fetch Events for Check-In
const fetchEvents = async () => {
  loadingEvents.value = true
  try {
    const res = await axios.get('/attendances/today-events')
    if (res.success && res.data) {
      events.value = res.data.events || []

      // Isi konfigurasi absensi gereja
      if (res.data.config) {
        churchConfig.church_latitude = res.data.config.church_latitude
        churchConfig.church_longitude = res.data.config.church_longitude
        churchConfig.max_radius_meters = res.data.config.max_radius_meters
        churchConfig.require_gps = res.data.config.require_gps
        churchConfig.require_photo = res.data.config.require_photo
        churchConfig.church_name = res.data.config.church_name || 'Gereja HKBP'
      }
    }
  } catch (err) {
    console.error('Error fetchEvents:', err)
    showToast('Gagal memuat jadwal acara aktif', 'error')
  } finally {
    loadingEvents.value = false
  }
}

// Fetch Personal Attendance History
const fetchHistory = async () => {
  loadingHistory.value = true
  try {
    const res = await axios.get('/attendances/my-history')
    if (res.success && res.data) {
      historyList.value = res.data || []
    }
  } catch (err) {
    console.error('Error fetchHistory:', err)
  } finally {
    loadingHistory.value = false
  }
}

// ==========================================
// CAMERA & PHOTO HANDLING
// ==========================================
const openCheckInModal = async (evt) => {
  selectedEvent.value = evt
  capturedPhoto.value = ''
  cameraError.value = ''
  isModalOpen.value = true

  // Minta refresh GPS terbaru
  requestGPS()

  // Mulai streaming kamera selfie
  await startCamera()
}

const startCamera = async () => {
  cameraError.value = ''
  isCameraActive.value = false

  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Fitur kamera tidak didukung pada browser ini.')
    }

    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 640 },
        height: { ideal: 480 }
      },
      audio: false
    })

    if (videoRef.value) {
      videoRef.value.srcObject = mediaStream
      isCameraActive.value = true
    }
  } catch (err) {
    console.warn('Gagal mengakses kamera:', err.message)
    cameraError.value = 'Tidak dapat mengakses kamera selfie. Pastikan izin kamera telah diizinkan.'
    isCameraActive.value = false
  }
}

const stopCamera = () => {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
    mediaStream = null
  }
  isCameraActive.value = false
}

const captureSnapshot = () => {
  if (!videoRef.value || !canvasRef.value) return

  const video = videoRef.value
  const canvas = canvasRef.value
  canvas.width = video.videoWidth || 640
  canvas.height = video.videoHeight || 480

  const ctx = canvas.getContext('2d')
  // Flip canvas secara horizontal agar natural sesuai cermin selfie
  ctx.translate(canvas.width, 0)
  ctx.scale(-1, 1)
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

  capturedPhoto.value = canvas.toDataURL('image/jpeg', 0.85)
  stopCamera()
}

const retakePhoto = async () => {
  capturedPhoto.value = ''
  await startCamera()
}

const handleFileUpload = (e) => {
  const file = e.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (event) => {
    capturedPhoto.value = event.target?.result || ''
    stopCamera()
  }
  reader.readAsDataURL(file)
}

const closeModal = () => {
  stopCamera()
  isModalOpen.value = false
  selectedEvent.value = null
  capturedPhoto.value = ''
}

// Submit Check-In Final
const submitCheckIn = async () => {
  if (!selectedEvent.value) return

  // Validasi GPS di frontend sebelum kirim
  if (churchConfig.require_gps && !isWithinRadius.value) {
    showToast(
      `Lokasi Anda berada di luar radius gereja (${currentDistance.value}m). Absensi hanya dapat dilakukan di dalam batas ${churchConfig.max_radius_meters}m.`,
      'error'
    )
    return
  }

  // Validasi Foto
  if (churchConfig.require_photo && !capturedPhoto.value) {
    showToast('Foto selfie wajib diambil sebelum mengirim absensi.', 'error')
    return
  }

  submittingEventId.value = selectedEvent.value.id
  try {
    const payload = {
      event_id: selectedEvent.value.id,
      latitude: currentCoords.value?.latitude || null,
      longitude: currentCoords.value?.longitude || null,
      photo_proof: capturedPhoto.value || null
    }

    const res = await axios.post('/attendances/check-in', payload)

    if (res.success) {
      showToast(`Check-in berhasil untuk acara '${selectedEvent.value.title}'!`, 'success')
      closeModal()
      await fetchEvents()
      await fetchHistory()
    } else {
      showToast(res.message || 'Gagal melakukan check-in', 'error')
    }
  } catch (err) {
    console.error('Error checkIn:', err)
    showToast(err.message || 'Gagal melakukan check-in', 'error')
  } finally {
    submittingEventId.value = null
  }
}

// Helper getPhotoUrl
const getPhotoUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  const apiUrl = import.meta.env.VITE_API_URL || ''
  if (apiUrl.startsWith('http')) {
    const origin = new URL(apiUrl).origin
    return `${origin}${path.startsWith('/') ? '' : '/'}${path}`
  }
  return path.startsWith('/') ? path : `/${path}`
}

// Cek apakah absensi dilakukan secara manual oleh Admin (bukan foto selfie mandiri)
const isManualAttendance = (photoProof) => {
  if (!photoProof) return false
  const str = String(photoProof).trim()
  if (str.startsWith('MANUAL') || str === 'MANUAL_BY_ADMIN') return true
  if (!str.includes('/') && !str.startsWith('data:image')) return true
  return false
}

// Ambil catatan alasan manual jika ada
const getManualNote = (photoProof) => {
  if (!photoProof) return ''
  const str = String(photoProof).trim()
  if (str.startsWith('MANUAL:')) {
    const note = str.replace('MANUAL:', '').trim()
    return note && note !== 'MANUAL_BY_ADMIN' ? ` (${note})` : ''
  }
  return ''
}

// Preview Photo Modal
const previewPhoto = (photoUrl, eventTitle) => {
  previewPhotoModal.url = getPhotoUrl(photoUrl)
  previewPhotoModal.title = `Bukti Selfie: ${eventTitle}`
  previewPhotoModal.isOpen = true
}

// ==========================================
// ADMIN: KELOLA & REVISI ABSENSI GSM
// ==========================================
const adminManageModal = reactive({
  isOpen: false,
  event: null,
  loading: false,
  gsmList: [],
  searchQuery: '',
  filterStatus: 'all', // 'all' | 'unattended' | 'attended'
  selectedGsmForCheckIn: null,
  manualNotes: '',
  submitting: false
})

const filteredAdminGsmList = computed(() => {
  let list = adminManageModal.gsmList || []

  // Filter status
  if (adminManageModal.filterStatus === 'unattended') {
    list = list.filter(g => !g.is_attended)
  } else if (adminManageModal.filterStatus === 'attended') {
    list = list.filter(g => g.is_attended)
  }

  // Filter search
  if (adminManageModal.searchQuery.trim()) {
    const q = adminManageModal.searchQuery.toLowerCase().trim()
    list = list.filter(g =>
      (g.user_name || '').toLowerCase().includes(q) ||
      (g.user_email || '').toLowerCase().includes(q)
    )
  }

  return list
})

const openAdminManageModal = async (evt) => {
  adminManageModal.event = evt
  adminManageModal.isOpen = true
  adminManageModal.searchQuery = ''
  adminManageModal.filterStatus = 'all'
  adminManageModal.selectedGsmForCheckIn = null
  adminManageModal.manualNotes = ''
  await fetchAdminMonitoring(evt.id)
}

const closeAdminManageModal = () => {
  adminManageModal.isOpen = false
  adminManageModal.event = null
  adminManageModal.selectedGsmForCheckIn = null
  adminManageModal.manualNotes = ''
}

const fetchAdminMonitoring = async (eventId) => {
  adminManageModal.loading = true
  try {
    const res = await axios.get(`/attendances/events/${eventId}/monitoring`)
    if (res.success && res.data) {
      adminManageModal.gsmList = res.data.gsm_attendance_list || []
    }
  } catch (err) {
    console.error('Error fetchAdminMonitoring:', err)
    showToast('Gagal memuat data monitoring absensi GSM', 'error')
  } finally {
    adminManageModal.loading = false
  }
}

const selectGsmForCheckIn = (gsm) => {
  adminManageModal.selectedGsmForCheckIn = gsm
  adminManageModal.manualNotes = 'Hadir dikonfirmasi Admin (lupa absen)'
}

const handleAdminManualCheckIn = async (gsm) => {
  if (!adminManageModal.event) return
  adminManageModal.submitting = true
  try {
    const payload = {
      event_id: adminManageModal.event.id,
      user_id: gsm.user_id,
      notes: adminManageModal.manualNotes.trim() || 'Hadir dikonfirmasi Admin (lupa absen)'
    }
    const res = await axios.post('/attendances/manual-checkin', payload)
    if (res.success) {
      showToast(`Kehadiran ${gsm.user_name} berhasil dicatat!`, 'success')
      adminManageModal.selectedGsmForCheckIn = null
      adminManageModal.manualNotes = ''
      await fetchAdminMonitoring(adminManageModal.event.id)
      await fetchEvents()
    } else {
      showToast(res.message || 'Gagal mencatat kehadiran manual', 'error')
    }
  } catch (err) {
    console.error('Error handleAdminManualCheckIn:', err)
    showToast(err.message || 'Gagal mencatat kehadiran manual', 'error')
  } finally {
    adminManageModal.submitting = false
  }
}

const handleAdminDeleteAttendance = async (gsm) => {
  if (!confirm(`Batalkan / hapus catatan kehadiran untuk ${gsm.user_name}?`)) {
    return
  }
  adminManageModal.submitting = true
  try {
    const res = await axios.delete(`/attendances/${gsm.attendance_id}`)
    if (res.success) {
      showToast(`Kehadiran ${gsm.user_name} berhasil dibatalkan`, 'success')
      await fetchAdminMonitoring(adminManageModal.event.id)
      await fetchEvents()
    } else {
      showToast(res.message || 'Gagal membatalkan kehadiran', 'error')
    }
  } catch (err) {
    console.error('Error handleAdminDeleteAttendance:', err)
    showToast(err.message || 'Gagal membatalkan kehadiran', 'error')
  } finally {
    adminManageModal.submitting = false
  }
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
  stopCamera()
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
  background: #cbd5e1;
  border-radius: 9999px;
}
</style>
