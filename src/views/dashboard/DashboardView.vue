<template>
  <div class="space-y-6">
    <!-- 1. Welcome Header Banner (Enterprise Clean White Card) -->
    <div class="relative overflow-hidden rounded-2xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600"></div>

      <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div class="flex flex-wrap items-center gap-2 mb-3">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-semibold">
              <span class="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
              HKBP Church ERP
            </span>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              ⚡ TiDB Cloud Online
            </span>
            <span class="text-xs text-slate-400 font-medium">
              {{ currentDateFormatted }}
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Selamat Datang, {{ authStore.user?.name || 'Administrator' }}! 👋
          </h1>
          <p class="text-slate-500 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Ringkasan data operasional gereja mencakup statistik pengguna, keaktifan Guru Sekolah Minggu (GSM), status pelaksanaan ibadah, dan tren kehadiran.
          </p>
        </div>

        <!-- Quick Action Buttons -->
        <div class="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            @click="fetchDashboardStats"
            :disabled="loading"
            class="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            title="Muat Ulang Data"
          >
            <RefreshCw class="w-3.5 h-3.5 text-slate-600" :class="{ 'animate-spin': loading }" />
            <span class="hidden sm:inline">Refresh</span>
          </button>

          <router-link
            to="/absensi/check-in-acara"
            class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-2"
          >
            <ClipboardCheck class="w-4 h-4" />
            <span>Check-In Acara</span>
          </router-link>

          <router-link
            to="/absensi/rekap-laporan"
            class="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-2"
          >
            <BarChart2 class="w-4 h-4" />
            <span>Rekap Absensi</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- 2. Top 4 KPI Metrics Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      <!-- KPI 1: Akun & Role -->
      <div class="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between">
            <p class="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Akun Pengguna</p>
            <div class="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <Users class="w-5 h-5" />
            </div>
          </div>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-3xl font-black text-slate-900">{{ stats.users.total }}</span>
            <span class="text-xs text-slate-500 font-medium">Akun Terdaftar</span>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
          <span
            v-for="role in stats.users.by_role"
            :key="role.role_id"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border"
            :class="getRoleBadgeClass(role.role_code)"
          >
            {{ role.role_code }}: {{ role.total_users }}
          </span>
        </div>
      </div>

      <!-- KPI 2: Acara Terlaksana -->
      <div class="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between">
            <p class="text-[11px] font-bold uppercase tracking-wider text-slate-500">Acara Terlaksana</p>
            <div class="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
              <CalendarCheck class="w-5 h-5" />
            </div>
          </div>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-3xl font-black text-slate-900">{{ stats.events.completed }}</span>
            <span class="text-xs text-slate-500 font-medium">/ {{ stats.events.total }} Total Acara</span>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
          <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              class="bg-emerald-500 h-2 rounded-full transition-all duration-500"
              :style="{ width: `${stats.events.completion_rate}%` }"
            ></div>
          </div>
          <div class="flex justify-between text-[11px] text-slate-500 font-medium">
            <span>Tingkat Pelaksanaan</span>
            <span class="font-bold text-emerald-600">{{ stats.events.completion_rate }}%</span>
          </div>
        </div>
      </div>

      <!-- KPI 3: Keaktifan GSM -->
      <div class="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between">
            <p class="text-[11px] font-bold uppercase tracking-wider text-slate-500">Keaktifan GSM</p>
            <div class="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-600 flex items-center justify-center">
              <Activity class="w-5 h-5" />
            </div>
          </div>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-3xl font-black text-cyan-600">{{ stats.gsm.activity_rate }}%</span>
            <span class="text-xs text-slate-500 font-medium">Tingkat Partisipasi</span>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
          <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              class="bg-cyan-500 h-2 rounded-full transition-all duration-500"
              :style="{ width: `${stats.gsm.activity_rate}%` }"
            ></div>
          </div>
          <div class="flex justify-between text-[11px] text-slate-500 font-medium">
            <span>{{ stats.gsm.active_gsm }} dari {{ stats.gsm.total_gsm }} GSM Aktif Absen</span>
          </div>
        </div>
      </div>

      <!-- KPI 4: Total Absensi -->
      <div class="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between">
            <p class="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Absensi Tercatat</p>
            <div class="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
              <Award class="w-5 h-5" />
            </div>
          </div>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-3xl font-black text-slate-900">{{ stats.gsm.total_attendances }}</span>
            <span class="text-xs text-slate-500 font-medium">Check-In GSM</span>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span class="text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle class="w-3 h-3 text-emerald-500" />
            GPS: {{ stats.gsm.methods.verified_gps }}
          </span>
          <span class="text-amber-700 font-semibold flex items-center gap-1">
            <Clock class="w-3 h-3 text-amber-500" />
            Manual: {{ stats.gsm.methods.manual }}
          </span>
        </div>
      </div>
    </div>

    <!-- 3. Interactive Charts Grid (2 Columns) -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Chart 1: Tren Kehadiran per Acara (2 Cols) -->
      <div class="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart2 class="w-4 h-4 text-cyan-600" />
              <span>Tren Kehadiran Pelayanan / Acara</span>
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">Jumlah kehadiran pelayan/GSM pada setiap acara ibadah yang telah terselenggara</p>
          </div>
          <div class="flex items-center gap-4 text-xs">
            <div class="flex items-center gap-1.5">
              <span class="w-3 h-3 rounded-xs bg-cyan-500"></span>
              <span class="text-slate-600 font-medium">Hadir Check-In</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-3 h-3 rounded-xs bg-slate-300"></span>
              <span class="text-slate-600 font-medium">Ditugaskan</span>
            </div>
          </div>
        </div>

        <!-- Visual Bar Chart (Responsive SVG) -->
        <div v-if="stats.trends.length > 0" class="pt-4">
          <div class="relative h-64 w-full flex items-end gap-3 sm:gap-6 px-4 pb-8 pt-6 border-b border-slate-200">
            <!-- Background Grid Lines -->
            <div class="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
              <div class="border-b border-dashed border-slate-100 w-full text-[10px] text-slate-400">
                <span class="bg-white px-1">Max</span>
              </div>
              <div class="border-b border-dashed border-slate-100 w-full text-[10px] text-slate-400">
                <span class="bg-white px-1">Med</span>
              </div>
              <div class="border-b border-slate-200 w-full text-[10px] text-slate-400">
                <span class="bg-white px-1">0</span>
              </div>
            </div>

            <!-- Bars per Event -->
            <div
              v-for="item in stats.trends"
              :key="item.id"
              class="flex-1 flex flex-col items-center justify-end h-full z-10 group relative"
            >
              <!-- Tooltip on Hover -->
              <div class="absolute -top-14 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-900 text-white text-[11px] rounded-lg py-1 px-2.5 whitespace-nowrap shadow-xl z-30">
                <p class="font-bold">{{ item.title }}</p>
                <p class="text-cyan-300 font-semibold">Hadir: {{ item.attendances }} | Tugas: {{ item.assigned }}</p>
                <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
              </div>

              <!-- Bar Container (Double Bar: Hadir & Assigned) -->
              <div class="w-full flex items-end justify-center gap-1.5 h-full pb-1">
                <!-- Hadir Bar (Cyan) -->
                <div
                  class="w-full max-w-[28px] bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-md transition-all duration-500 hover:brightness-110 shadow-xs flex items-center justify-center text-[10px] font-bold text-white"
                  :style="{ height: getBarHeight(item.attendances) }"
                >
                  <span v-if="item.attendances > 0" class="text-[10px]">{{ item.attendances }}</span>
                </div>

                <!-- Assigned Bar (Slate) -->
                <div
                  class="w-full max-w-[28px] bg-slate-200 rounded-t-md transition-all duration-500 hover:bg-slate-300 flex items-center justify-center text-[10px] font-semibold text-slate-600"
                  :style="{ height: getBarHeight(item.assigned) }"
                >
                  <span v-if="item.assigned > 0" class="text-[10px]">{{ item.assigned }}</span>
                </div>
              </div>

              <!-- Label Bawah (Nama Acara & Tanggal) -->
              <div class="absolute -bottom-6 w-full text-center truncate">
                <p class="text-[10px] font-bold text-slate-700 truncate" :title="item.title">
                  {{ item.title }}
                </p>
                <p class="text-[9px] text-slate-400 truncate">
                  {{ item.event_date }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="py-12 text-center text-slate-400 text-xs">
          Belum ada data riwayat acara yang tercatat.
        </div>
      </div>

      <!-- Chart 2: Komposisi Akun & Role (1 Col) -->
      <div class="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4 flex flex-col justify-between">
        <div class="border-b border-slate-100 pb-4">
          <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <PieChart class="w-4 h-4 text-indigo-600" />
            <span>Komposisi Akun per Role</span>
          </h2>
          <p class="text-xs text-slate-500 mt-0.5">Proporsi akun aktif berdasarkan peran RBAC</p>
        </div>

        <!-- Donut Visual & Breakdown -->
        <div class="flex flex-col items-center justify-center py-3">
          <!-- Donut SVG Graphic -->
          <div class="relative w-40 h-40 flex items-center justify-center">
            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <!-- Background Circle -->
              <path
                class="text-slate-100"
                stroke-width="4.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <!-- Donut Segments -->
              <path
                v-for="(seg, idx) in donutSegments"
                :key="idx"
                :stroke="seg.color"
                :stroke-dasharray="`${seg.dashArray} 100`"
                :stroke-dashoffset="seg.dashOffset"
                stroke-width="4.5"
                fill="none"
                class="transition-all duration-700 ease-out"
              />
            </svg>

            <!-- Center Label inside Donut -->
            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span class="text-2xl font-black text-slate-900 leading-none">{{ stats.users.total }}</span>
              <span class="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-0.5">Total User</span>
            </div>
          </div>
        </div>

        <!-- Role Legend List -->
        <div class="space-y-2 pt-2 border-t border-slate-100">
          <div
            v-for="role in stats.users.by_role"
            :key="role.role_id"
            class="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors text-xs"
          >
            <div class="flex items-center gap-2 min-w-0">
              <span class="w-3 h-3 rounded-full shrink-0" :style="{ backgroundColor: getRoleColor(role.role_code) }"></span>
              <div class="truncate">
                <p class="font-bold text-slate-800 truncate">{{ role.role_name }}</p>
                <p class="text-[10px] text-slate-400 font-mono">{{ role.role_code }}</p>
              </div>
            </div>
            <div class="text-right shrink-0">
              <span class="font-bold text-slate-900">{{ role.total_users }} akun</span>
              <span class="text-slate-400 text-[10px] ml-1">({{ role.percentage }}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. GSM Activity Leaderboard & Status Acara Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Kolom Kiri: Papan Keaktifan GSM (Leaderboard) (2 Cols) -->
      <div class="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award class="w-4 h-4 text-amber-500" />
              <span>Papan Keaktifan Guru Sekolah Minggu (GSM)</span>
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">Peringkat kehadiran GSM berdasarkan data absensi riil di sistem</p>
          </div>
          <span class="px-2.5 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-semibold">
            {{ stats.gsm.active_gsm }} / {{ stats.gsm.total_gsm }} Aktif
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th class="py-2.5 px-3 text-center w-12">Rank</th>
                <th class="py-2.5 px-3">Nama GSM</th>
                <th class="py-2.5 px-3 text-center">Kehadiran</th>
                <th class="py-2.5 px-3 text-center">Sesuai Jadwal</th>
                <th class="py-2.5 px-3">Terakhir Hadir</th>
                <th class="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="stats.gsm.leaderboard.length === 0">
                <td colspan="6" class="py-8 text-center text-slate-400">
                  Belum ada data guru sekolah minggu yang terdaftar.
                </td>
              </tr>
              <tr
                v-for="gsm in stats.gsm.leaderboard"
                :key="gsm.id"
                class="hover:bg-slate-50/70 transition-colors"
              >
                <!-- Rank Badge -->
                <td class="py-3 px-3 text-center">
                  <span
                    v-if="gsm.rank === 1"
                    class="w-6 h-6 rounded-full bg-amber-100 text-amber-700 font-bold inline-flex items-center justify-center text-xs shadow-xs"
                    title="Peringkat 1"
                  >
                    🥇
                  </span>
                  <span
                    v-else-if="gsm.rank === 2"
                    class="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold inline-flex items-center justify-center text-xs shadow-xs"
                    title="Peringkat 2"
                  >
                    🥈
                  </span>
                  <span
                    v-else-if="gsm.rank === 3"
                    class="w-6 h-6 rounded-full bg-amber-700/10 text-amber-800 font-bold inline-flex items-center justify-center text-xs shadow-xs"
                    title="Peringkat 3"
                  >
                    🥉
                  </span>
                  <span v-else class="text-slate-400 font-mono font-semibold">
                    #{{ gsm.rank }}
                  </span>
                </td>

                <!-- Nama & Email -->
                <td class="py-3 px-3">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                      {{ getInitials(gsm.name) }}
                    </div>
                    <div class="min-w-0">
                      <p class="font-bold text-slate-900 truncate">{{ gsm.name }}</p>
                      <p class="text-[11px] text-slate-400 truncate">{{ gsm.email }}</p>
                    </div>
                  </div>
                </td>

                <!-- Total Kehadiran -->
                <td class="py-3 px-3 text-center">
                  <span class="font-black text-slate-900 text-sm">{{ gsm.total_attendances }}</span>
                  <span class="text-[10px] text-slate-400 ml-0.5">x</span>
                </td>

                <!-- Sesuai Jadwal -->
                <td class="py-3 px-3 text-center">
                  <span class="font-bold text-indigo-600">{{ gsm.scheduled_attendances }}</span>
                  <span class="text-[10px] text-slate-400 ml-0.5">tugas</span>
                </td>

                <!-- Terakhir Hadir -->
                <td class="py-3 px-3 text-slate-600 font-mono text-[11px]">
                  {{ gsm.last_attendance || '-' }}
                </td>

                <!-- Status Badge -->
                <td class="py-3 px-3 text-center">
                  <span
                    :class="[
                      'px-2 py-0.5 rounded-full text-[10px] font-bold border',
                      gsm.total_attendances > 0
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    ]"
                  >
                    {{ gsm.status_label }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Kolom Kanan: Status Acara Terkini & Mendatang (1 Col) -->
      <div class="space-y-6">
        <!-- Acara Terakhir yang Terlaksana -->
        <div class="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 class="w-3.5 h-3.5 text-emerald-500" />
              <span>Acara Terakhir Selesai</span>
            </h3>
            <span v-if="stats.events.latest_completed" class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Selesai
            </span>
          </div>

          <div v-if="stats.events.latest_completed" class="space-y-2.5">
            <h4 class="text-sm font-extrabold text-slate-900 leading-snug">
              {{ stats.events.latest_completed.title }}
            </h4>
            <div class="space-y-1.5 text-xs text-slate-600">
              <div class="flex justify-between py-1 border-b border-slate-100">
                <span class="text-slate-400">Jenis Ibadah</span>
                <span class="font-bold text-slate-800">{{ stats.events.latest_completed.event_type }}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-100">
                <span class="text-slate-400">Tanggal Pelaksanaan</span>
                <span class="font-mono text-slate-800">{{ stats.events.latest_completed.event_date }}</span>
              </div>
              <div class="flex justify-between py-1">
                <span class="text-slate-400">Total Kehadiran</span>
                <span class="font-bold text-emerald-600">{{ stats.events.latest_completed.total_attendances }} Orang Hadir</span>
              </div>
            </div>
          </div>
          <div v-else class="py-4 text-center text-slate-400 text-xs italic">
            Belum ada data acara terlaksana.
          </div>
        </div>

        <!-- Acara Terdekat Mendatang -->
        <div class="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Clock class="w-3.5 h-3.5 text-cyan-600" />
              <span>Jadwal Acara Terdekat</span>
            </h3>
            <span v-if="stats.events.next_upcoming" class="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
              Mendatang
            </span>
          </div>

          <div v-if="stats.events.next_upcoming" class="space-y-2.5">
            <h4 class="text-sm font-extrabold text-slate-900 leading-snug">
              {{ stats.events.next_upcoming.title }}
            </h4>
            <div class="space-y-1.5 text-xs text-slate-600">
              <div class="flex justify-between py-1 border-b border-slate-100">
                <span class="text-slate-400">Jenis Acara</span>
                <span class="font-bold text-slate-800">{{ stats.events.next_upcoming.event_type }}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-100">
                <span class="text-slate-400">Tanggal Acara</span>
                <span class="font-mono text-cyan-700 font-bold">{{ stats.events.next_upcoming.event_date }}</span>
              </div>
              <div class="flex justify-between py-1">
                <span class="text-slate-400">Petugas Terjadwal</span>
                <span class="font-bold text-slate-800">{{ stats.events.next_upcoming.total_assigned }} GSM</span>
              </div>
            </div>
          </div>
          <div v-else class="py-4 text-center text-slate-400 text-xs italic">
            Tidak ada jadwal acara mendatang saat ini.
          </div>
        </div>

        <!-- Ringkasan Metode Verifikasi Absensi -->
        <div class="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">
            Metode Verifikasi Check-In
          </h3>
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="flex items-center gap-1.5 text-slate-700 font-medium">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                GPS & Foto Selfie
              </span>
              <span class="font-bold text-slate-900">{{ stats.gsm.methods.verified_gps }} ({{ getMethodPercent('gps') }}%)</span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div class="bg-emerald-500 h-1.5 rounded-full" :style="{ width: `${getMethodPercent('gps')}%` }"></div>
            </div>

            <div class="flex items-center justify-between text-xs pt-1">
              <span class="flex items-center gap-1.5 text-slate-700 font-medium">
                <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                Input Manual Admin
              </span>
              <span class="font-bold text-slate-900">{{ stats.gsm.methods.manual }} ({{ getMethodPercent('manual') }}%)</span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div class="bg-amber-500 h-1.5 rounded-full" :style="{ width: `${getMethodPercent('manual')}%` }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/api/axios'
import {
  Users,
  CalendarCheck,
  Activity,
  Award,
  BarChart2,
  PieChart,
  ClipboardCheck,
  CheckCircle,
  CheckCircle2,
  Clock,
  RefreshCw
} from 'lucide-vue-next'

const authStore = useAuthStore()
const loading = ref(false)

// State Statistik Lengkap
const stats = reactive({
  users: {
    total: 0,
    by_role: []
  },
  events: {
    total: 0,
    completed: 0,
    upcoming: 0,
    completion_rate: 0,
    by_type: [],
    latest_completed: null,
    next_upcoming: null
  },
  gsm: {
    total_gsm: 0,
    active_gsm: 0,
    activity_rate: 0,
    total_attendances: 0,
    methods: {
      verified_gps: 0,
      manual: 0
    },
    leaderboard: []
  },
  trends: []
})

// Format Tanggal Hari Ini
const currentDateFormatted = computed(() => {
  const now = new Date()
  return now.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

// Warna per Role
const getRoleColor = (code) => {
  const upper = (code || '').toUpperCase()
  if (upper === 'ADMIN') return '#4f46e5' // Indigo
  if (upper === 'GSM') return '#06b6d4' // Cyan
  if (upper === 'PENDETA') return '#8b5cf6' // Purple
  return '#94a3b8'
}

const getRoleBadgeClass = (code) => {
  const upper = (code || '').toUpperCase()
  if (upper === 'ADMIN') return 'bg-indigo-50 border-indigo-200 text-indigo-700'
  if (upper === 'GSM') return 'bg-cyan-50 border-cyan-200 text-cyan-700'
  if (upper === 'PENDETA') return 'bg-purple-50 border-purple-200 text-purple-700'
  return 'bg-slate-100 border-slate-200 text-slate-600'
}

// Donut Chart Segment Calculations
const donutSegments = computed(() => {
  const total = stats.users.total || 1
  let accumulatedPercent = 0

  return stats.users.by_role.map(role => {
    const percent = (role.total_users / total) * 100
    const dashOffset = -accumulatedPercent
    accumulatedPercent += percent

    return {
      name: role.role_name,
      color: getRoleColor(role.role_code),
      dashArray: percent,
      dashOffset
    }
  })
})

// Kalkulasi Tinggi Bar Chart (Maksimal 90%)
const getBarHeight = (value) => {
  if (!value || value <= 0) return '4px'
  const maxVal = Math.max(...stats.trends.map(t => Math.max(t.attendances, t.assigned)), 1)
  const percent = Math.min(Math.round((value / maxVal) * 85), 90)
  return `${Math.max(percent, 10)}%`
}

// Inisial Pengguna untuk Avatar
const getInitials = (name) => {
  if (!name) return 'GSM'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

// Persentase Metode Absensi
const getMethodPercent = (type) => {
  const total = stats.gsm.total_attendances
  if (!total || total === 0) return 0
  if (type === 'gps') {
    return Math.round((stats.gsm.methods.verified_gps / total) * 100)
  }
  return Math.round((stats.gsm.methods.manual / total) * 100)
}

// Fetch Aggregated Dashboard Stats dari Backend
const fetchDashboardStats = async () => {
  loading.value = true
  try {
    const res = await api.get('/dashboard/stats')
    if (res.success && res.data) {
      const data = res.data
      stats.users = data.users || stats.users
      stats.events = data.events || stats.events
      stats.gsm = data.gsm || stats.gsm
      stats.trends = data.trends || []
    }
  } catch (err) {
    console.error('Gagal mengambil data statistik dashboard:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboardStats()
})
</script>

<style scoped>
/* Responsive clean chart animations */
svg path {
  transition: stroke-dasharray 0.8s ease, stroke-dashoffset 0.8s ease;
}
</style>
