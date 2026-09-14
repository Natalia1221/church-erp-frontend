<template>
  <div class="space-y-6">
    <!-- 1. Header Banner -->
    <div class="rounded-2xl bg-gradient-to-r from-[#0b1426] via-[#101f3c] to-[#152a52] p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10 border border-slate-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
      <!-- Ambient Background Glow -->
      <div class="absolute -right-16 -top-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -left-16 -bottom-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10 space-y-1.5">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wide">
          <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          Pusat Manajemen & Evaluasi Kehadiran
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          <FileSpreadsheet class="w-7 h-7 text-cyan-400" />
          <span>Rekapitulasi & Laporan Absensi</span>
        </h1>
        <p class="text-slate-300 text-xs sm:text-sm max-w-2xl font-normal leading-relaxed">
          Pantau keterisian absensi acara secara langsung (live monitoring), evaluasi persentase keaktifan Guru Sekolah Minggu (GSM), dan unduh laporan resmi untuk arsip gereja.
        </p>
      </div>

      <!-- Quick Action Buttons -->
      <div class="relative z-10 flex items-center gap-3">
        <router-link
          to="/absensi/check-in-acara"
          class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold backdrop-blur-sm transition-all flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <ClipboardCheck class="w-4 h-4 text-cyan-400" />
          <span>Ke Halaman Check-In</span>
        </router-link>
      </div>
    </div>

    <!-- 2. Submenu Tab Navigasi -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
      <div class="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200 shrink-0">
        <!-- Tab 1: Rekapitulasi & Laporan (Utama) -->
        <button
          @click="activeTab = 'recap'"
          :class="[
            'px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer',
            activeTab === 'recap'
              ? 'bg-white text-cyan-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          ]"
        >
          <FileSpreadsheet class="w-4 h-4 text-cyan-600" />
          <span>Rekap Kehadiran GSM</span>
        </button>

        <!-- Tab 2: Monitoring Live Acara -->
        <button
          @click="activeTab = 'monitoring'"
          :class="[
            'px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer',
            activeTab === 'monitoring'
              ? 'bg-white text-cyan-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          ]"
        >
          <Activity class="w-4 h-4 text-cyan-600" />
          <span>Monitoring Live Acara</span>
          <span class="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
            Live
          </span>
        </button>
      </div>

      <div class="text-xs text-slate-500 flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
        <span>Akses Khusus: <strong>Admin & Pendeta</strong></span>
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
    <!-- 4. TAB 1: REKAPITULASI & LAPORAN EVALUASI (UTAMA)                                         -->
    <!-- ========================================================================================= -->
    <div v-if="activeTab === 'recap'" class="space-y-6">
      <!-- 4.1. KARTU METRIK UTAMA (EXECUTIVE KPIS) -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Rata-rata Kehadiran Keseluruhan -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-500">Tingkat Kehadiran Roster</span>
            <div class="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <TrendingUp class="w-4 h-4" />
            </div>
          </div>
          <div class="mt-2">
            <h3 class="text-2xl font-black text-emerald-700">
              {{ recapData?.overall_attendance_rate || 0 }}%
            </h3>
            <p class="text-[11px] text-slate-400 mt-0.5">Persentase kehadiran tugas resmi</p>
          </div>
          <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mt-3">
            <div
              class="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
              :style="{ width: `${recapData?.overall_attendance_rate || 0}%` }"
            ></div>
          </div>
        </div>

        <!-- Total GSM Aktif Melayani -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-600 flex items-center justify-center shrink-0">
            <Users class="w-6 h-6" />
          </div>
          <div>
            <p class="text-xs font-semibold text-slate-500">GSM Aktif Melayani</p>
            <h4 class="text-2xl font-black text-slate-800 mt-0.5">
              {{ recapData?.active_gsm_count || 0 }} <span class="text-xs font-medium text-slate-400">/ {{ recapData?.total_gsm || 0 }} GSM</span>
            </h4>
            <p class="text-[11px] text-slate-400">Pernah hadir pada periode ini</p>
          </div>
        </div>

        <!-- Total Sesi Acara Terlaksana -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
            <Award class="w-6 h-6" />
          </div>
          <div>
            <p class="text-xs font-semibold text-slate-500">Total Sesi Acara</p>
            <h4 class="text-2xl font-black text-slate-800 mt-0.5">
              {{ recapData?.total_events || 0 }}
            </h4>
            <p class="text-[11px] text-slate-400">Ibadah & kegiatan absensi aktif</p>
          </div>
        </div>

        <!-- Rasio Absensi Mandiri vs Dicatat Admin -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-500">Metode Check-In</span>
            <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
              {{ recapData?.total_attendances_all || 0 }} Absensi
            </span>
          </div>
          <div class="mt-2 space-y-1 text-xs">
            <div class="flex items-center justify-between">
              <span class="text-emerald-700 font-medium flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Mandiri (Selfie)
              </span>
              <strong class="text-emerald-800">{{ recapData?.self_check_in_count || 0 }}</strong>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-amber-700 font-medium flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-amber-500"></span> Dicatat Admin
              </span>
              <strong class="text-amber-800">{{ recapData?.manual_admin_count || 0 }}</strong>
            </div>
          </div>
          <p class="text-[10px] text-slate-400 mt-1">Evaluasi kedisiplinan mandiri GSM</p>
        </div>
      </div>

      <!-- 4.2. ALERT PERINGATAN DINI (GSM DENGAN KEHADIRAN RENDAH / PERLU PERHATIAN) -->
      <div
        v-if="attentionGsmList.length > 0"
        class="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
      >
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
            <AlertTriangle class="w-5 h-5 text-amber-800" />
          </div>
          <div>
            <h4 class="text-xs font-extrabold text-amber-950">
              Perhatian Khusus / Pembinaan Pelayan ({{ attentionGsmList.length }} GSM)
            </h4>
            <p class="text-[11px] text-amber-800 mt-0.5">
              Terdapat Guru Sekolah Minggu dengan tingkat kehadiran di bawah 70% atau memiliki ketidakhadiran (alpa) saat dijadwalkan bertugas.
            </p>
          </div>
        </div>
        <button
          @click="statusFilter = statusFilter === 'perlu_perhatian' ? 'ALL' : 'perlu_perhatian'"
          class="px-3 py-1.5 rounded-lg bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
        >
          {{ statusFilter === 'perlu_perhatian' ? 'Tampilkan Semua' : 'Tinjau GSM Ini' }}
        </button>
      </div>

      <!-- 4.3. FILTER BAR & QUICK ACTION BUTTONS -->
      <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <!-- Quick Period Selector Tabs -->
        <div class="flex items-center justify-between gap-2 flex-wrap border-b border-slate-100 pb-3">
          <span class="text-xs font-bold text-slate-600">Pilihan Cepat Periode:</span>
          <div class="flex items-center gap-1.5 flex-wrap">
            <button
              @click="setQuickPeriod('this_month')"
              class="px-3 py-1 rounded-lg text-xs font-semibold border hover:bg-slate-50 transition-colors cursor-pointer text-slate-700 border-slate-200"
            >
              Bulan Ini
            </button>
            <button
              @click="setQuickPeriod('last_month')"
              class="px-3 py-1 rounded-lg text-xs font-semibold border hover:bg-slate-50 transition-colors cursor-pointer text-slate-700 border-slate-200"
            >
              Bulan Lalu
            </button>
            <button
              @click="setQuickPeriod('quarter')"
              class="px-3 py-1 rounded-lg text-xs font-semibold border hover:bg-slate-50 transition-colors cursor-pointer text-slate-700 border-slate-200"
            >
              Triwulan (3 Bulan)
            </button>
            <button
              @click="setQuickPeriod('this_year')"
              class="px-3 py-1 rounded-lg text-xs font-semibold border hover:bg-slate-50 transition-colors cursor-pointer text-slate-700 border-slate-200"
            >
              Tahun Ini
            </button>
          </div>
        </div>

        <!-- Filter Form Controls -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <!-- Tipe Acara -->
          <div>
            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tipe Acara</label>
            <select
              v-model="recapFilter.event_type"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-cyan-600 transition-all cursor-pointer"
            >
              <option value="ALL">Semua Acara Ibadah</option>
              <option value="MINGGU">Ibadah Minggu</option>
              <option value="SERMON">Sermon Guru Sekolah Minggu</option>
              <option value="LAINNYA">Acara Lainnya</option>
            </select>
          </div>

          <!-- Dari Tanggal -->
          <div>
            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Dari Tanggal</label>
            <input
              v-model="recapFilter.startDate"
              type="date"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-cyan-600 transition-all cursor-pointer"
            />
          </div>

          <!-- Sampai Tanggal -->
          <div>
            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Sampai Tanggal</label>
            <input
              v-model="recapFilter.endDate"
              type="date"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-cyan-600 transition-all cursor-pointer"
            />
          </div>

          <!-- Cari Nama GSM -->
          <div>
            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Cari Nama GSM</label>
            <div class="relative">
              <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Ketik nama atau akun..."
                class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-cyan-600"
              />
            </div>
          </div>
        </div>

        <!-- Tombol Aksi Filter, Cetak, dan Unduh Excel -->
        <div class="flex items-center justify-between gap-3 flex-wrap pt-2 border-t border-slate-100">
          <!-- Status Filter Tabs -->
          <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
            <button
              @click="statusFilter = 'ALL'"
              :class="['px-2.5 py-1 rounded-lg transition-colors cursor-pointer', statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:bg-slate-200/60']"
            >
              Semua ({{ recapData?.recap?.length || 0 }})
            </button>
            <button
              @click="statusFilter = 'sangat_aktif'"
              :class="['px-2.5 py-1 rounded-lg transition-colors cursor-pointer', statusFilter === 'sangat_aktif' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-200/60']"
            >
              Sangat Aktif (≥85%)
            </button>
            <button
              @click="statusFilter = 'cukup'"
              :class="['px-2.5 py-1 rounded-lg transition-colors cursor-pointer', statusFilter === 'cukup' ? 'bg-amber-600 text-white' : 'hover:bg-slate-200/60']"
            >
              Cukup (70-84%)
            </button>
            <button
              @click="statusFilter = 'perlu_perhatian'"
              :class="['px-2.5 py-1 rounded-lg transition-colors cursor-pointer', statusFilter === 'perlu_perhatian' ? 'bg-rose-600 text-white' : 'hover:bg-slate-200/60']"
            >
              Perlu Perhatian (&lt;70%)
            </button>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-2">
            <button
              @click="fetchRecapData"
              class="px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Filter class="w-3.5 h-3.5" />
              <span>Terapkan Filter</span>
            </button>
            <button
              @click="resetRecapFilter"
              class="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 rounded-xl transition-colors cursor-pointer"
            >
              Reset
            </button>
            <button
              v-if="canPrint"
              @click="exportToExcel"
              class="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Unduh Data Excel (.csv)"
            >
              <Download class="w-3.5 h-3.5" />
              <span>Unduh Excel</span>
            </button>
            <button
              v-if="canPrint"
              @click="printRecapReport"
              class="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Cetak Laporan Resmi"
            >
              <Printer class="w-3.5 h-3.5" />
              <span>Cetak Laporan</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 4.4. AREA TABEL & CETAK LAPORAN RESMI -->
      <div id="printable-recap" class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <!-- KOP SURAT CETAK RESMI (HANYA TAMPIL SAAT PRINT) -->
        <div class="hidden print:block p-6 text-center border-b-2 border-slate-900 mb-4">
          <div class="flex items-center justify-center gap-4">
            <img src="/logo-hkbp.svg" alt="HKBP" class="w-16 h-16 object-contain" />
            <div class="text-slate-900">
              <h2 class="text-base font-black tracking-widest uppercase">HURIA KRISTEN BATAK PROTESTAN (HKBP)</h2>
              <p class="text-xs font-bold uppercase">Seksi Sekolah Minggu - Bidang Koinonia</p>
              <p class="text-[11px] text-slate-600">Laporan Resmi Rekapitulasi Kehadiran & Evaluasi Guru Sekolah Minggu (GSM)</p>
            </div>
          </div>
          <div class="mt-3 pt-2 border-t border-slate-300 text-[11px] text-slate-600 flex justify-between font-mono">
            <span>Periode: {{ recapFilter.startDate || 'Semua' }} s/d {{ recapFilter.endDate || 'Sekarang' }}</span>
            <span>Total Acara: {{ recapData?.total_events || 0 }} Sesi</span>
            <span>Tanggal Cetak: {{ currentPrintDate }}</span>
          </div>
        </div>

        <!-- Header Tabel (Di Layar) -->
        <div class="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 print:hidden">
          <div>
            <h3 class="text-base font-extrabold text-slate-800">Tabel Rekapitulasi Per Guru Sekolah Minggu</h3>
            <p class="text-xs text-slate-500">Evaluasi keaktifan kehadiran berdasarkan tugas resmi (roster) dan kehadiran mandiri</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
              {{ filteredRecapList.length }} GSM Terdata
            </span>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loadingRecap" class="p-12 text-center">
          <div class="w-7 h-7 border-3 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p class="text-xs font-semibold text-slate-500">Menghitung rekapitulasi kehadiran...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredRecapList.length === 0" class="p-12 text-center text-slate-400">
          <UserX class="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p class="text-xs font-bold">Tidak ada data rekapitulasi yang cocok dengan filter / pencarian.</p>
        </div>

        <!-- Tabel Data -->
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <th class="py-3.5 px-4">Nama Guru Sekolah Minggu</th>
                <th class="py-3.5 px-4 text-center">Ditugaskan</th>
                <th class="py-3.5 px-4 text-center">Hadir Tugas</th>
                <th class="py-3.5 px-4 text-center">Hadir Tambahan</th>
                <th class="py-3.5 px-4 text-center">Alpa (Tdk Hadir)</th>
                <th class="py-3.5 px-4 text-center">Total Hadir</th>
                <th class="py-3.5 px-4 text-center">Keaktifan (%)</th>
                <th class="py-3.5 px-4 text-center">Status Evaluasi</th>
                <th class="py-3.5 px-4 text-center print:hidden">Metode Absen</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              <tr
                v-for="r in filteredRecapList"
                :key="r.user_id"
                class="hover:bg-slate-50/80 transition-colors"
                :class="r.status_badge === 'perlu_perhatian' ? 'bg-rose-50/20' : ''"
              >
                <!-- Nama & Akun -->
                <td class="py-3 px-4 whitespace-nowrap">
                  <div class="flex items-center gap-2.5">
                    <div
                      class="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0"
                      :class="r.status_badge === 'sangat_aktif' ? 'bg-emerald-100 text-emerald-800' : (r.status_badge === 'cukup' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800')"
                    >
                      {{ r.user_name?.substring(0, 2).toUpperCase() }}
                    </div>
                    <div>
                      <h4 class="font-bold text-slate-800 leading-snug">{{ r.user_name }}</h4>
                      <p class="text-[11px] text-slate-400 font-mono">{{ r.user_username || r.user_email }}</p>
                    </div>
                  </div>
                </td>

                <!-- Total Ditugaskan -->
                <td class="py-3 px-4 text-center font-semibold text-slate-700 whitespace-nowrap">
                  {{ r.total_assignments }}x
                </td>

                <!-- Hadir Terjadwal -->
                <td class="py-3 px-4 text-center font-bold text-emerald-700 whitespace-nowrap">
                  {{ r.attended_scheduled }}x
                </td>

                <!-- Hadir Tambahan -->
                <td class="py-3 px-4 text-center text-slate-600 whitespace-nowrap">
                  <span v-if="r.attended_additional > 0" class="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[11px]">
                    +{{ r.attended_additional }}x
                  </span>
                  <span v-else class="text-slate-400">-</span>
                </td>

                <!-- Alpa / Tidak Hadir Roster -->
                <td class="py-3 px-4 text-center whitespace-nowrap">
                  <span v-if="r.unattended_scheduled > 0" class="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold text-[11px]">
                    {{ r.unattended_scheduled }}x Alpa
                  </span>
                  <span v-else class="text-emerald-700 font-bold text-xs">✓ 0</span>
                </td>

                <!-- Total Kehadiran Keseluruhan -->
                <td class="py-3 px-4 text-center whitespace-nowrap">
                  <span class="inline-flex px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-black text-xs">
                    {{ r.total_attendances }}x
                  </span>
                </td>

                <!-- Persentase Keaktifan -->
                <td class="py-3 px-4 text-center whitespace-nowrap">
                  <div class="flex items-center justify-center gap-2">
                    <span
                      class="font-black min-w-[36px]"
                      :class="r.status_badge === 'sangat_aktif' ? 'text-emerald-700' : (r.status_badge === 'cukup' ? 'text-amber-700' : 'text-rose-700')"
                    >
                      {{ r.attendance_rate }}%
                    </span>
                    <div class="w-14 bg-slate-200 rounded-full h-1.5 overflow-hidden print:hidden">
                      <div
                        class="h-1.5 rounded-full"
                        :class="r.status_badge === 'sangat_aktif' ? 'bg-emerald-600' : (r.status_badge === 'cukup' ? 'bg-amber-500' : 'bg-rose-500')"
                        :style="{ width: `${r.attendance_rate}%` }"
                      ></div>
                    </div>
                  </div>
                </td>

                <!-- Status Evaluasi Badge -->
                <td class="py-3 px-4 text-center whitespace-nowrap">
                  <span
                    v-if="r.status_badge === 'sangat_aktif'"
                    class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px]"
                  >
                    Sangat Aktif
                  </span>
                  <span
                    v-else-if="r.status_badge === 'cukup'"
                    class="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-extrabold text-[10px]"
                  >
                    Cukup
                  </span>
                  <span
                    v-else
                    class="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-extrabold text-[10px]"
                  >
                    Perlu Perhatian
                  </span>
                </td>

                <!-- Rincian Metode Absen (Mandiri vs Admin) -->
                <td class="py-3 px-4 text-center whitespace-nowrap print:hidden">
                  <div class="inline-flex items-center gap-1.5 text-[11px]">
                    <span class="text-emerald-700" title="Absen Mandiri">📱 {{ r.attended_self }}</span>
                    <span class="text-slate-300">|</span>
                    <span class="text-amber-700" title="Dicatat Admin">✍️ {{ r.attended_manual }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- TANDA TANGAN PENGESAHAN DOKUMEN RESMI (HANYA TAMPIL SAAT PRINT) -->
        <div class="hidden print:grid grid-cols-2 gap-12 pt-16 pb-8 px-12 text-center text-xs text-slate-900">
          <div>
            <p>Mengetahui,</p>
            <p class="font-extrabold mt-1">Ketua Seksi Sekolah Minggu</p>
            <div class="h-20"></div>
            <p class="font-bold underline">( ............................................ )</p>
            <p class="text-[10px] text-slate-500 mt-0.5">Seksi Sekolah Minggu HKBP</p>
          </div>
          <div>
            <p>Menyetujui,</p>
            <p class="font-extrabold mt-1">Pendeta Ressort HKBP</p>
            <div class="h-20"></div>
            <p class="font-bold underline">( ............................................ )</p>
            <p class="text-[10px] text-slate-500 mt-0.5">Pimpinan Jemaat</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================================= -->
    <!-- 5. TAB 2: MONITORING LIVE ACARA                                                           -->
    <!-- ========================================================================================= -->
    <div v-if="activeTab === 'monitoring'" class="space-y-5">
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
              <option v-if="events.length === 0" value="" disabled>-- Belum ada acara terdaftar --</option>
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

      <!-- Kartu Metrik Kehadiran Live (Statistik) -->
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
            <p class="text-xs font-medium text-slate-500">Kehadiran Terjadwal</p>
            <span class="text-xs font-bold text-cyan-700">{{ monitoringData.stats.attendance_percentage }}%</span>
          </div>
          <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden my-2">
            <div
              class="bg-gradient-to-r from-cyan-600 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
              :style="{ width: `${monitoringData.stats.attendance_percentage}%` }"
            ></div>
          </div>
          <p class="text-[11px] text-slate-400">
            +{{ monitoringData.stats.attended_additional }} Pelayan Tambahan
          </p>
        </div>
      </div>

      <!-- Loading Monitoring -->
      <div v-if="loadingMonitoring" class="p-12 text-center bg-white rounded-2xl border border-slate-200/80">
        <div class="w-8 h-8 border-3 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p class="text-xs font-semibold text-slate-600">Memuat status kehadiran pelayan...</p>
      </div>

      <!-- Tabel Petugas Terjadwal -->
      <div v-else-if="monitoringData?.scheduled_roster" class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div class="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 class="text-sm font-bold text-slate-800">Daftar Petugas Terjadwal (Roster)</h3>
            <p class="text-xs text-slate-500">Pelayan yang memiliki tugas pelayanan resmi pada acara ini</p>
          </div>
          <span class="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
            {{ monitoringData.scheduled_roster.length }} Petugas
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <th class="py-3 px-4">Nama Pelayan</th>
                <th class="py-3 px-4">Peran Pelayanan</th>
                <th class="py-3 px-4">Status Kehadiran</th>
                <th class="py-3 px-4">Waktu Check-In</th>
                <th class="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              <tr v-if="monitoringData.scheduled_roster.length === 0">
                <td colspan="5" class="py-8 text-center text-slate-400">
                  Belum ada petugas terjadwal pada acara ini.
                </td>
              </tr>
              <tr v-for="r in monitoringData.scheduled_roster" :key="r.user_id" class="hover:bg-slate-50 transition-colors">
                <td class="py-3 px-4 font-bold text-slate-800 whitespace-nowrap">
                  {{ r.user_name }}
                </td>
                <td class="py-3 px-4 whitespace-nowrap">
                  <span class="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200">
                    {{ r.category_name }}
                  </span>
                </td>
                <td class="py-3 px-4 whitespace-nowrap">
                  <span
                    v-if="r.is_attended"
                    class="inline-flex items-center gap-1 text-emerald-700 font-bold"
                  >
                    <CheckCircle2 class="w-4 h-4 text-emerald-600" />
                    <span>Hadir</span>
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center gap-1 text-amber-600 font-semibold"
                  >
                    <Clock class="w-4 h-4" />
                    <span>Belum Check-In</span>
                  </span>
                </td>
                <td class="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                  {{ formatTime(r.check_in_time) }}
                </td>
                <td class="py-3 px-4 text-center whitespace-nowrap">
                  <button
                    v-if="!r.is_attended"
                    @click="quickCheckIn(r.user_id, r.user_name)"
                    class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    Tandai Hadir
                  </button>
                  <button
                    v-else
                    @click="cancelAttendance(r.attendance_id, r.user_name)"
                    class="px-2.5 py-1 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-700 text-[11px] font-bold transition-colors cursor-pointer"
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
    <!-- 6. MODAL: TANDAI HADIR MANUAL (TELEPORT KE BODY DENGAN Z-[60])                             -->
    <!-- ========================================================================================= -->
    <Teleport to="body">
      <div
        v-if="isManualModalOpen"
        class="fixed inset-0 z-[60] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
        @click="isManualModalOpen = false"
      >
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4" @click.stop>
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700">
                <UserCheck class="w-4 h-4" />
              </div>
              <h3 class="font-extrabold text-slate-800 text-sm">Tandai Hadir Manual (Admin)</h3>
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
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usePermissions } from '@/composables/usePermissions'
import axios from '@/api/axios'

const authStore = useAuthStore()
const { canRead, canCreate, canShow, canUpdate, canDelete, canPrint } = usePermissions()
import {
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Award,
  Users,
  Clock,
  RefreshCw,
  Activity,
  FileSpreadsheet,
  ChevronDown,
  UserCheck,
  Filter,
  Printer,
  Download,
  Search,
  AlertTriangle,
  TrendingUp,
  UserX
} from 'lucide-vue-next'

// Tab state: 'recap' (default) | 'monitoring'
const activeTab = ref('recap')
const events = ref([])

const toastMessage = ref('')
const toastType = ref('success')

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

// Recap State & Filters
const recapFilter = reactive({
  event_type: 'ALL',
  startDate: '',
  endDate: ''
})
const searchQuery = ref('')
const statusFilter = ref('ALL') // 'ALL' | 'sangat_aktif' | 'cukup' | 'perlu_perhatian'
const recapData = ref(null)
const loadingRecap = ref(false)

const showToast = (msg, type = 'success') => {
  toastMessage.value = msg
  toastType.value = type
  setTimeout(() => {
    if (toastMessage.value === msg) {
      toastMessage.value = ''
    }
  }, 4000)
}

const formatTime = (timeStr) => {
  if (!timeStr) return '-'
  const d = new Date(timeStr)
  return d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const currentPrintDate = computed(() => {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

// Filtered Recap List
const filteredRecapList = computed(() => {
  let list = recapData.value?.recap || []

  // Filter Search
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(r =>
      r.user_name?.toLowerCase().includes(q) ||
      r.user_email?.toLowerCase().includes(q) ||
      r.user_username?.toLowerCase().includes(q)
    )
  }

  // Filter Status
  if (statusFilter.value !== 'ALL') {
    list = list.filter(r => r.status_badge === statusFilter.value)
  }

  return list
})

// GSM with Attendance < 70% or having unattended scheduled
const attentionGsmList = computed(() => {
  const list = recapData.value?.recap || []
  return list.filter(r => r.status_badge === 'perlu_perhatian' || r.unattended_scheduled > 0)
})

// Fetch Events for monitoring selector
const fetchEvents = async () => {
  try {
    const res = await axios.get('/attendances/today-events')
    const payload = res?.data || res
    events.value = payload?.events || (Array.isArray(payload) ? payload : [])
    if (events.value.length > 0 && !selectedEventId.value) {
      selectedEventId.value = events.value[0].id
    }
  } catch (err) {
    console.error('Error fetchEvents:', err)
  }
}

// ==========================================
// MONITORING FUNCTIONS
// ==========================================
const fetchMonitoringData = async () => {
  if (!selectedEventId.value) return
  loadingMonitoring.value = true
  try {
    const res = await axios.get(`/attendances/events/${selectedEventId.value}/monitoring`)
    monitoringData.value = res?.data || res
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
    if (res?.success || res?.status === 200 || res?.data?.success) {
      showToast(`Kehadiran ${userName} berhasil dicatat!`, 'success')
      await fetchMonitoringData()
    }
  } catch (err) {
    console.error('Error quickCheckIn:', err)
    showToast(err.response?.data?.message || err.message || 'Gagal mencatat kehadiran', 'error')
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
    if (res?.success || res?.status === 200 || res?.data?.success) {
      showToast('Kehadiran berhasil dicatat secara manual!', 'success')
      isManualModalOpen.value = false
      await fetchMonitoringData()
    }
  } catch (err) {
    console.error('Error submitManualCheckIn:', err)
    showToast(err.response?.data?.message || err.message || 'Gagal menyimpan kehadiran manual', 'error')
  } finally {
    submittingManual.value = false
  }
}

const cancelAttendance = async (attendanceId, userName) => {
  if (!confirm(`Batalkan kehadiran untuk ${userName || 'pelayan ini'}?`)) return
  try {
    const res = await axios.delete(`/attendances/${attendanceId}`)
    if (res?.success || res?.status === 200 || res?.data?.success) {
      showToast('Catatan kehadiran berhasil dibatalkan', 'success')
      await fetchMonitoringData()
    }
  } catch (err) {
    console.error('Error cancelAttendance:', err)
    showToast(err.response?.data?.message || err.message || 'Gagal membatalkan kehadiran', 'error')
  }
}

// ==========================================
// RECAP FUNCTIONS
// ==========================================
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
    const payload = res?.data !== undefined ? res.data : res
    if (payload && (payload.recap || payload.total_events !== undefined)) {
      recapData.value = payload
    } else if (res?.success && res?.data) {
      recapData.value = res.data
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
  searchQuery.value = ''
  statusFilter.value = 'ALL'
  fetchRecapData()
}

const setQuickPeriod = (type) => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  if (type === 'this_month') {
    const first = new Date(year, month, 1)
    const last = new Date(year, month + 1, 0)
    recapFilter.startDate = formatDateInput(first)
    recapFilter.endDate = formatDateInput(last)
  } else if (type === 'last_month') {
    const first = new Date(year, month - 1, 1)
    const last = new Date(year, month, 0)
    recapFilter.startDate = formatDateInput(first)
    recapFilter.endDate = formatDateInput(last)
  } else if (type === 'quarter') {
    const first = new Date(year, month - 2, 1)
    const last = new Date(year, month + 1, 0)
    recapFilter.startDate = formatDateInput(first)
    recapFilter.endDate = formatDateInput(last)
  } else if (type === 'this_year') {
    const first = new Date(year, 0, 1)
    const last = new Date(year, 11, 31)
    recapFilter.startDate = formatDateInput(first)
    recapFilter.endDate = formatDateInput(last)
  }
  fetchRecapData()
}

const formatDateInput = (d) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Export to Excel / CSV
const exportToExcel = () => {
  if (!filteredRecapList.value || filteredRecapList.value.length === 0) {
    showToast('Tidak ada data rekapitulasi untuk diunduh', 'error')
    return
  }

  const headers = [
    'No',
    'Nama Guru Sekolah Minggu',
    'Email / Akun',
    'Total Ditugaskan',
    'Hadir Terjadwal',
    'Hadir Tambahan',
    'Alpa (Tidak Hadir)',
    'Total Kehadiran',
    'Keaktifan (%)',
    'Status Evaluasi',
    'Absen Mandiri (Selfie)',
    'Dicatat Admin (Manual)'
  ]

  const rows = filteredRecapList.value.map((r, index) => [
    index + 1,
    `"${(r.user_name || '').replace(/"/g, '""')}"`,
    `"${(r.user_email || r.user_username || '').replace(/"/g, '""')}"`,
    r.total_assignments,
    r.attended_scheduled,
    r.attended_additional,
    r.unattended_scheduled,
    r.total_attendances,
    `${r.attendance_rate}%`,
    r.status_badge === 'sangat_aktif' ? 'Sangat Aktif' : (r.status_badge === 'cukup' ? 'Cukup' : 'Perlu Perhatian'),
    r.attended_self,
    r.attended_manual
  ])

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF'
    + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  const filename = `Laporan_Rekap_Absensi_GSM_${recapFilter.startDate || 'all'}_sd_${recapFilter.endDate || 'all'}.csv`
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  showToast('Laporan absensi berhasil diunduh dalam format Excel (.csv)!', 'success')
}

const printRecapReport = () => {
  window.print()
}

onMounted(async () => {
  await Promise.all([
    fetchEvents(),
    fetchRecapData()
  ])
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
    padding: 0 !important;
  }
}
</style>
