<template>
  <div class="space-y-6">
    <!-- 1. Header Page Title & Top Actions -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            Modul Keuangan
          </span>
          <span class="text-slate-400 text-xs">•</span>
          <span class="text-slate-500 text-xs font-medium">Kas Keuangan</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Coins class="w-5 h-5" />
          </div>
          <span>Pencatatan Persembahan</span>
        </h1>
      </div>

      <div class="flex items-center gap-2.5 self-start sm:self-auto">
        <button
          @click="fetchData"
          :disabled="loading"
          class="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
          title="Segarkan Data"
        >
          <RefreshCw class="w-4 h-4 text-slate-500" :class="{ 'animate-spin': loading }" />
          <span>Refresh</span>
        </button>

        <router-link
          to="/keuangan/kategori"
          class="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all flex items-center gap-1.5"
          title="Kelola Pos Persembahan di Master Kategori"
        >
          <Layers class="w-4 h-4 text-slate-500" />
          <span>Atur Pos Persembahan</span>
        </router-link>
      </div>
    </div>

    <!-- 2. Top Summary KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Card 1: Total Persembahan Terkumpul -->
      <div class="bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/15 flex flex-col justify-between relative overflow-hidden">
        <div class="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-blue-100">Total Persembahan</span>
          <div class="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
            <Wallet class="w-4 h-4 text-white" />
          </div>
        </div>
        <div class="mt-4">
          <p class="text-2xl sm:text-3xl font-black tracking-tight">{{ formatRupiah(summary.grand_total) }}</p>
          <p class="text-xs text-blue-100/90 mt-1.5 flex items-center gap-1.5 font-medium">
            <CheckCircle2 class="w-3.5 h-3.5 text-emerald-300 shrink-0" />
            <span>{{ summary.recorded_events }} dari {{ summary.total_events }} Acara Terisi ({{ completionPercentage }}%)</span>
          </p>
        </div>
      </div>

      <!-- Card 2: Total Acara Ibadah -->
      <div class="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Total Acara</span>
          <div class="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
            <Church class="w-4 h-4" />
          </div>
        </div>
        <div class="mt-4">
          <div class="flex items-baseline gap-2">
            <p class="text-2xl sm:text-3xl font-black text-slate-900">{{ summary.total_events }}</p>
            <span class="text-xs font-bold text-slate-500">Acara Ibadah</span>
          </div>
          <p class="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5">
            <span>Acara dengan persembahan aktif</span>
          </p>
        </div>
      </div>

      <!-- Card 3: Sudah Dicatat -->
      <div class="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Sudah Dicatat</span>
          <div class="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 class="w-4 h-4" />
          </div>
        </div>
        <div class="mt-4">
          <div class="flex items-baseline gap-2">
            <p class="text-2xl sm:text-3xl font-black text-emerald-600">{{ summary.recorded_events }}</p>
            <span class="text-xs font-bold text-slate-500">Acara Terisi</span>
          </div>
          <p class="text-xs text-slate-400 mt-1.5">
            Nominal persembahan telah tersimpan
          </p>
        </div>
      </div>

      <!-- Card 4: Belum Dicatat -->
      <div class="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Belum Dicatat</span>
          <div class="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Clock class="w-4 h-4" />
          </div>
        </div>
        <div class="mt-4">
          <div class="flex items-baseline gap-2">
            <p class="text-2xl sm:text-3xl font-black text-amber-600">
              {{ Math.max(0, summary.total_events - summary.recorded_events) }}
            </p>
            <span class="text-xs font-bold text-slate-500">Acara Tertunda</span>
          </div>
          <p class="text-xs text-slate-400 mt-1.5">
            {{ (summary.total_events - summary.recorded_events) === 0 ? 'Semua acara persembahan telah dicatat' : 'Menunggu penginputan nominal' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Alert Notification -->
    <div
      v-if="alert.message"
      :class="[
        'p-4 rounded-xl text-xs border flex items-center justify-between transition-all shadow-xs',
        alert.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
      ]"
    >
      <div class="flex items-center gap-2.5">
        <span v-if="alert.type === 'success'" class="text-base">✅</span>
        <span v-else class="text-base">⚠️</span>
        <span class="font-medium">{{ alert.message }}</span>
      </div>
      <button @click="alert.message = ''" class="text-xs hover:opacity-75 cursor-pointer font-bold px-2 py-1">✕</button>
    </div>

    <!-- 3. Rincian Akumulasi Pos Persembahan -->
    <div v-if="categories.length > 0" class="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3.5 mb-4">
        <div class="flex items-center gap-2">
          <Coins class="w-4 h-4 text-blue-600" />
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700">Rincian Akumulasi Pos Persembahan</h3>
        </div>
        <span class="text-xs text-slate-400">
          {{ categories.length }} Pos Persembahan Terdaftar
        </span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        <div
          v-for="cat in categories"
          :key="cat.id"
          class="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-blue-200 transition-all shadow-xs flex flex-col justify-between gap-3"
        >
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-bold text-slate-800">{{ cat.name }}</p>
              <p class="text-[11px] text-slate-400 mt-0.5">
                {{ summary.category_totals?.[cat.id]?.event_count || 0 }} Acara Terisi
              </p>
            </div>
            <div class="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
              💰
            </div>
          </div>

          <div>
            <p class="text-lg font-black text-slate-900 tracking-tight">
              {{ formatRupiah(summary.category_totals?.[cat.id]?.total_amount || 0) }}
            </p>
            <!-- Progress Bar Porsi -->
            <div class="mt-2 flex items-center gap-2">
              <div class="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  class="h-full bg-blue-600 rounded-full transition-all duration-500"
                  :style="{
                    width: (summary.grand_total > 0
                      ? Math.min(100, Math.round(((summary.category_totals?.[cat.id]?.total_amount || 0) / summary.grand_total) * 100))
                      : 0) + '%'
                  }"
                ></div>
              </div>
              <span class="text-[10px] font-bold text-slate-400 shrink-0">
                {{ summary.grand_total > 0 ? Math.round(((summary.category_totals?.[cat.id]?.total_amount || 0) / summary.grand_total) * 100) : 0 }}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. Toolbar & Filter Controls -->
    <div class="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
      <!-- Filter Row 1: Tipe Acara (t_events) -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Filter class="w-3.5 h-3.5" />
            <span>Tipe Acara:</span>
          </span>

          <button
            @click="filterEventType = 'ALL'"
            :class="[
              'px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
              filterEventType === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            ]"
          >
            Semua Acara ({{ events.length }})
          </button>

          <button
            @click="filterEventType = 'MINGGU'"
            :class="[
              'px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1',
              filterEventType === 'MINGGU'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
            ]"
          >
            <span>Ibadah Minggu</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded-full" :class="filterEventType === 'MINGGU' ? 'bg-white/20 text-white' : 'bg-indigo-200 text-indigo-800'">
              {{ countByType('MINGGU') }}
            </span>
          </button>

          <button
            @click="filterEventType = 'SERMON'"
            :class="[
              'px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1',
              filterEventType === 'SERMON'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-700'
            ]"
          >
            <span>Sermon GSM</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded-full" :class="filterEventType === 'SERMON' ? 'bg-white/20 text-white' : 'bg-purple-200 text-purple-800'">
              {{ countByType('SERMON') }}
            </span>
          </button>

          <button
            @click="filterEventType = 'LAINNYA'"
            :class="[
              'px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1',
              filterEventType === 'LAINNYA'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-teal-50 hover:bg-teal-100 text-teal-700'
            ]"
          >
            <span>Acara Lainnya</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded-full" :class="filterEventType === 'LAINNYA' ? 'bg-white/20 text-white' : 'bg-teal-200 text-teal-800'">
              {{ countByType('LAINNYA') }}
            </span>
          </button>
        </div>

        <!-- Status Filter Tabs -->
        <div class="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/70 self-start">
          <button
            @click="filterStatus = 'all'"
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              filterStatus === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            ]"
          >
            Semua Status
          </button>
          <button
            @click="filterStatus = 'recorded'"
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              filterStatus === 'recorded' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            ]"
          >
            Sudah Diisi ({{ countRecorded }})
          </button>
          <button
            @click="filterStatus = 'unrecorded'"
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              filterStatus === 'unrecorded' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            ]"
          >
            Belum Diisi ({{ events.length - countRecorded }})
          </button>
        </div>
      </div>

      <!-- Filter Row 2: Search, Month, Year -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2.5">
          <!-- Month Filter -->
          <select
            v-model="filterMonth"
            @change="fetchData"
            class="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
          >
            <option value="">Semua Bulan</option>
            <option v-for="m in 12" :key="m" :value="m">Bulan {{ getMonthName(m) }}</option>
          </select>

          <!-- Year Filter -->
          <select
            v-model="filterYear"
            @change="fetchData"
            class="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
          >
            <option value="">Semua Tahun</option>
            <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>

        <!-- Search Input -->
        <div class="relative w-full sm:w-64">
          <Search class="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Cari nama acara / tanggal..."
            class="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>
    </div>

    <!-- 5. Main Table: Seluruh Acara (t_events) & Rincian Nominal Matriks Pos (m_persembahan) -->
    <div class="bg-white border border-slate-200/90 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse min-w-[850px]">
          <thead>
            <tr class="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th class="py-3.5 px-4 w-12 text-center">No</th>
              <th class="py-3.5 px-4">Tanggal Acara</th>
              <th class="py-3.5 px-4">Tipe Acara</th>
              <th class="py-3.5 px-4">Nama / Judul Acara</th>
              
              <!-- Kolom Dinamis per Kategori Keuangan (group = 'm_persembahan') -->
              <th
                v-for="cat in categories"
                :key="cat.id"
                class="py-3.5 px-4 text-right bg-blue-50/40 border-l border-r border-slate-100 text-slate-700"
              >
                <div class="flex items-center justify-end gap-1">
                  <span>{{ cat.name }}</span>
                </div>
              </th>

              <th class="py-3.5 px-4 text-right bg-indigo-50/50 text-indigo-900 font-extrabold">Total Acara</th>
              <th class="py-3.5 px-4 text-center">Status</th>
              <th class="py-3.5 px-4 text-center w-40">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-xs text-slate-700">
            <!-- Loading State -->
            <tr v-if="loading">
              <td :colspan="7 + categories.length" class="py-14 text-center text-slate-400">
                <div class="flex flex-col items-center justify-center gap-2.5">
                  <RefreshCw class="w-7 h-7 animate-spin text-blue-600" />
                  <span class="text-xs font-semibold text-slate-600">Memuat daftar acara dan persembahan...</span>
                </div>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-else-if="filteredEvents.length === 0">
              <td :colspan="7 + categories.length" class="py-14 text-center text-slate-400">
                <div class="flex flex-col items-center justify-center gap-2">
                  <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                    <Church class="w-6 h-6" />
                  </div>
                  <p class="font-bold text-slate-800 text-sm">Tidak Ada Acara Ditemukan</p>
                  <p class="text-xs text-slate-400 max-w-sm">
                    Belum ada data acara ibadah yang sesuai dengan filter yang Anda pilih.
                  </p>
                </div>
              </td>
            </tr>

            <!-- Data Rows -->
            <tr
              v-else
              v-for="(ev, idx) in filteredEvents"
              :key="ev.id"
              class="hover:bg-slate-50/70 transition-colors"
            >
              <!-- No -->
              <td class="py-3.5 px-4 text-center font-medium text-slate-400">{{ idx + 1 }}</td>

              <!-- Tanggal Acara -->
              <td class="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <Calendar class="w-3.5 h-3.5 text-blue-600" />
                  <span>{{ formatDateIndo(ev.event_date) }}</span>
                </div>
              </td>

              <!-- Tipe Acara -->
              <td class="py-3.5 px-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide"
                  :class="getEventTypeBadgeClass(ev.event_type)"
                >
                  {{ ev.event_type }}
                </span>
              </td>

              <!-- Judul Acara -->
              <td class="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <span>{{ ev.title }}</span>
                  <span
                    v-if="ev.is_attendance"
                    class="px-1.5 py-0.5 rounded text-[9px] bg-sky-50 border border-sky-200 text-sky-700 font-semibold"
                    title="Absensi Diaktifkan"
                  >
                    Absen
                  </span>
                </div>
              </td>

              <!-- Kolom Dinamis per Kategori m_persembahan -->
              <td
                v-for="cat in categories"
                :key="cat.id"
                class="py-3.5 px-4 text-right border-l border-r border-slate-100 whitespace-nowrap font-semibold"
                :class="(ev.offerings?.[cat.id]?.amount || 0) > 0 ? 'text-slate-900 font-bold bg-blue-50/15' : 'text-slate-300'"
              >
                {{ (ev.offerings?.[cat.id]?.amount || 0) > 0 ? formatRupiah(ev.offerings[cat.id].amount) : '-' }}
              </td>

              <!-- Total Acara -->
              <td class="py-3.5 px-4 text-right whitespace-nowrap font-black bg-indigo-50/30" :class="ev.total_amount > 0 ? 'text-blue-700' : 'text-slate-400'">
                {{ ev.total_amount > 0 ? formatRupiah(ev.total_amount) : 'Rp 0' }}
              </td>

              <!-- Status -->
              <td class="py-3.5 px-4 text-center whitespace-nowrap">
                <span
                  v-if="ev.has_offerings"
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
                >
                  <CheckCircle2 class="w-3 h-3" />
                  <span>Sudah Diisi</span>
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200"
                >
                  <Clock class="w-3 h-3" />
                  <span>Belum Diisi</span>
                </span>
              </td>

              <!-- Aksi -->
              <td class="py-3.5 px-4 text-center whitespace-nowrap">
                <div class="flex items-center justify-center gap-1.5">
                  <!-- Tombol Input / Edit (Bendahara / User) -->
                  <button
                    v-if="(ev.has_offerings && canUpdate) || (!ev.has_offerings && canCreate)"
                    @click="openInputModal(ev)"
                    class="px-2.5 py-1.5 rounded-lg font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    :class="ev.has_offerings ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200' : 'bg-blue-600 hover:bg-blue-700 text-white font-bold'"
                    :title="ev.has_offerings ? 'Edit Nominal Persembahan' : 'Input Nominal Persembahan'"
                  >
                    <Edit3 class="w-3.5 h-3.5" />
                    <span>{{ ev.has_offerings ? 'Edit' : 'Input' }}</span>
                  </button>

                  <!-- Tombol Detail -->
                  <button
                    v-if="canShow"
                    @click="openDetailModal(ev)"
                    class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                    title="Lihat Rincian"
                  >
                    <Eye class="w-3.5 h-3.5" />
                  </button>

                  <!-- Tombol Hapus (jika ada persembahan tercatat) -->
                  <button
                    v-if="ev.has_offerings && canDelete"
                    @click="confirmDelete(ev)"
                    class="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                    title="Kosongkan Persembahan"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>

          <!-- Table Footer: Rangkuman Akumulasi Matriks & Grand Total -->
          <tfoot v-if="filteredEvents.length > 0 && !loading" class="bg-slate-100/90 border-t-2 border-slate-300 font-bold text-xs text-slate-800">
            <tr>
              <td colspan="4" class="py-3.5 px-4 text-left uppercase tracking-wider text-slate-600">
                <div class="flex items-center gap-1.5">
                  <TrendingUp class="w-4 h-4 text-blue-600" />
                  <span>Total Rangkuman ({{ filteredEvents.length }} Acara Ditampilkan):</span>
                </div>
              </td>

              <!-- Subtotal per Kategori Dinamis -->
              <td
                v-for="cat in categories"
                :key="cat.id"
                class="py-3.5 px-4 text-right border-l border-r border-slate-200 font-black text-slate-900 bg-blue-50/50"
              >
                {{ formatRupiah(calculateFilteredCategoryTotal(cat.id)) }}
              </td>

              <!-- Grand Total Terhitung -->
              <td class="py-3.5 px-4 text-right font-black text-sm text-blue-700 bg-indigo-50/60">
                {{ formatRupiah(calculateFilteredGrandTotal()) }}
              </td>

              <td colspan="2" class="py-3.5 px-4 text-center text-slate-400 text-[11px]">
                Rekapitulasi
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- ==================== MODAL INPUT / EDIT NOMINAL PERSEMBAHAN ==================== -->
    <Teleport to="body">
      <div
        v-if="isInputModalOpen && activeEvent"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto"
      >
        <div class="bg-white border border-slate-200 rounded-3xl w-full max-w-xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col max-h-[90vh] my-auto">
        <!-- Modal Header -->
        <div class="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div>
            <div class="flex items-center gap-2">
              <span
                class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
                :class="getEventTypeBadgeClass(activeEvent.event_type)"
              >
                {{ activeEvent.event_type }}
              </span>
              <span class="text-xs text-slate-400">•</span>
              <span class="text-xs font-semibold text-slate-600">{{ formatDateIndo(activeEvent.event_date) }}</span>
            </div>
            <h3 class="text-base sm:text-lg font-black text-slate-900 mt-1">
              {{ activeEvent.title }}
            </h3>
          </div>
          <button
            @click="isInputModalOpen = false"
            class="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        <!-- Modal Body: Dynamic Category List Inputs -->
        <div class="p-6 overflow-y-auto space-y-4">
          <div class="p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-2xl text-xs text-blue-900 flex items-start gap-2.5">
            <Coins class="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p class="font-bold">Form Input Kas Persembahan</p>
              <p class="text-[11px] text-blue-800/90 mt-0.5">
                Masukkan nominal uang persembahan pada masing-masing pos kategori. Data yang disimpan akan otomatis masuk ke pencatatan kas persembahan.
              </p>
            </div>
          </div>

          <form @submit.prevent="submitPersembahan" class="space-y-4">
            <div
              v-for="cat in categories"
              :key="cat.id"
              class="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all bg-white space-y-3 shadow-xs"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-blue-600"></span>
                  <label class="text-xs font-bold text-slate-900">{{ cat.name }}</label>
                  <span
                    class="text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase"
                    :class="cat.type === 'INCOME' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'"
                  >
                    {{ cat.type === 'INCOME' ? 'Penerimaan' : (cat.type === 'EXPENSE' ? 'Pengeluaran' : 'Pos Kas') }}
                  </span>
                </div>
                <span class="text-xs font-mono font-black text-blue-700">
                  {{ formatRupiah(inputForm[cat.id]?.amount || 0) }}
                </span>
              </div>

              <!-- Input Nominal -->
              <div>
                <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Nominal Uang (Rp)</label>
                <div class="relative">
                  <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="text"
                    :value="formatInputDisplay(inputForm[cat.id]?.amount)"
                    @input="handleAmountInput(cat.id, $event)"
                    placeholder="0"
                    class="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <!-- Quick Add Buttons for Bendahara Convenience -->
              <div class="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span class="text-[10px] font-semibold text-slate-400 mr-1">+ Cepat:</span>
                <button
                  type="button"
                  @click="addQuickAmount(cat.id, 50000)"
                  class="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold transition-colors cursor-pointer"
                >
                  +50rb
                </button>
                <button
                  type="button"
                  @click="addQuickAmount(cat.id, 100000)"
                  class="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold transition-colors cursor-pointer"
                >
                  +100rb
                </button>
                <button
                  type="button"
                  @click="addQuickAmount(cat.id, 500000)"
                  class="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold transition-colors cursor-pointer"
                >
                  +500rb
                </button>
                <button
                  type="button"
                  @click="addQuickAmount(cat.id, 1000000)"
                  class="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold transition-colors cursor-pointer"
                >
                  +1jt
                </button>
                <button
                  type="button"
                  @click="resetAmount(cat.id)"
                  class="px-2 py-0.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-semibold transition-colors cursor-pointer ml-auto"
                >
                  Reset (0)
                </button>
              </div>

              <!-- Input Keterangan -->
              <div>
                <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Keterangan / Catatan Pos</label>
                <input
                  type="text"
                  v-model="inputForm[cat.id].description"
                  :placeholder="`Persembahan ${cat.name} - ${activeEvent.title}`"
                  class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <!-- Live Total Preview Box -->
            <div class="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 flex items-center justify-between">
              <div>
                <p class="text-xs font-black text-blue-950">Total Persembahan Acara Ini</p>
                <p class="text-[11px] text-blue-700">Akumulasi seluruh nominal pos yang akan disubmit</p>
              </div>
              <p class="text-2xl font-black text-blue-700 tracking-tight">
                {{ formatRupiah(calculatedInputTotal) }}
              </p>
            </div>
          </form>
        </div>

        <!-- Modal Footer Actions -->
        <div class="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-slate-50/60">
          <button
            type="button"
            @click="isInputModalOpen = false"
            class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            @click="submitPersembahan"
            :disabled="submitting"
            class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-sm cursor-pointer transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw v-if="submitting" class="w-3.5 h-3.5 animate-spin" />
            <span>{{ submitting ? 'Menyimpan...' : 'Simpan Persembahan' }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>

    <!-- ==================== MODAL VIEW DETAIL RINCIAN ==================== -->
    <Teleport to="body">
      <div
        v-if="isDetailModalOpen && detailEvent"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto"
      >
        <div class="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] p-6 space-y-4 my-auto">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-blue-600">Detail Persembahan Acara</span>
            <h3 class="text-base font-black text-slate-900 mt-0.5">{{ detailEvent.title }}</h3>
          </div>
          <button @click="isDetailModalOpen = false" class="text-slate-400 hover:text-slate-700">✕</button>
        </div>

        <div class="space-y-2 text-xs">
          <div class="flex justify-between py-1.5 border-b border-slate-100">
            <span class="text-slate-400">Tanggal Acara</span>
            <span class="font-bold text-slate-800">{{ formatDateIndo(detailEvent.event_date) }}</span>
          </div>
          <div class="flex justify-between py-1.5 border-b border-slate-100">
            <span class="text-slate-400">Tipe Acara</span>
            <span class="font-bold px-2 py-0.5 rounded text-[10px]" :class="getEventTypeBadgeClass(detailEvent.event_type)">
              {{ detailEvent.event_type }}
            </span>
          </div>
          <div class="flex justify-between py-1.5 border-b border-slate-100">
            <span class="text-slate-400">Status Pengisian</span>
            <span class="font-bold" :class="detailEvent.has_offerings ? 'text-emerald-600' : 'text-amber-600'">
              {{ detailEvent.status_label }}
            </span>
          </div>
        </div>

        <!-- Rincian per Pos -->
        <div>
          <p class="text-xs font-bold text-slate-800 mb-2">Rincian Pos Persembahan:</p>
          <div class="space-y-2">
            <div
              v-for="cat in categories"
              :key="cat.id"
              class="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 flex items-center justify-between"
            >
              <div>
                <p class="text-xs font-bold text-slate-800">{{ cat.name }}</p>
                <p class="text-[10px] text-slate-400 mt-0.5">
                  {{ detailEvent.offerings?.[cat.id]?.description || 'Tidak ada catatan khusus' }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-xs font-black text-slate-900">
                  {{ formatRupiah(detailEvent.offerings?.[cat.id]?.amount || 0) }}
                </p>
                <span class="text-[10px] text-slate-400 font-semibold">
                  {{ detailEvent.total_amount > 0 ? Math.round(((detailEvent.offerings?.[cat.id]?.amount || 0) / detailEvent.total_amount) * 100) : 0 }}% porsi
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Total Box -->
        <div class="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-between">
          <span class="text-xs font-bold text-blue-900">Total Keseluruhan Acara</span>
          <span class="text-lg font-black text-blue-700">{{ formatRupiah(detailEvent.total_amount) }}</span>
        </div>

        <div class="pt-2 flex items-center justify-between border-t border-slate-100">
          <button
            @click="openInputModal(detailEvent); isDetailModalOpen = false;"
            class="px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold cursor-pointer"
          >
            Edit Persembahan Ini
          </button>
          <button
            @click="isDetailModalOpen = false"
            class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  </Teleport>

    <!-- ==================== MODAL KONFIRMASI HAPUS ==================== -->
    <Teleport to="body">
      <div
        v-if="isDeleteModalOpen && eventToDelete"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto"
      >
        <div class="bg-white border border-slate-200 rounded-3xl w-full max-w-sm shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] p-6 space-y-4 my-auto">
        <div class="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <Trash2 class="w-6 h-6" />
        </div>
        <div class="text-center space-y-1">
          <h3 class="text-base font-bold text-slate-900">Kosongkan Persembahan?</h3>
          <p class="text-xs text-slate-500">
            Apakah Anda yakin ingin menghapus seluruh nominal persembahan untuk acara <strong class="text-slate-800">{{ eventToDelete.title }}</strong> senilai <strong class="text-rose-600">{{ formatRupiah(eventToDelete.total_amount) }}</strong>?
          </p>
        </div>
        <div class="flex items-center gap-2 pt-2">
          <button
            @click="isDeleteModalOpen = false"
            class="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
          >
            Batal
          </button>
          <button
            @click="executeDelete"
            :disabled="submitting"
            class="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm cursor-pointer transition-colors disabled:opacity-50"
          >
            {{ submitting ? 'Menghapus...' : 'Ya, Kosongkan' }}
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
  Coins,
  Wallet,
  Church,
  Calendar,
  Layers,
  Search,
  RefreshCw,
  CheckCircle2,
  Clock,
  Edit3,
  Eye,
  Trash2,
  TrendingUp,
  Sparkles,
  Filter
} from 'lucide-vue-next'
import { usePermissions } from '@/composables/usePermissions'

const { canRead, canCreate, canShow, canUpdate, canDelete, canPrint } = usePermissions()

// State
const events = ref([])
const categories = ref([])
const summary = ref({
  grand_total: 0,
  total_events: 0,
  recorded_events: 0,
  category_totals: {}
})

const loading = ref(false)
const submitting = ref(false)

// Filters
const searchQuery = ref('')
const filterEventType = ref('ALL') // ALL | MINGGU | SERMON | LAINNYA
const filterStatus = ref('all') // all | recorded | unrecorded
const filterMonth = ref('')
const filterYear = ref('')

// Modals
const isInputModalOpen = ref(false)
const activeEvent = ref(null)
const inputForm = reactive({})

const isDetailModalOpen = ref(false)
const detailEvent = ref(null)

const isDeleteModalOpen = ref(false)
const eventToDelete = ref(null)

// Alerts
const alert = reactive({
  type: 'success',
  message: ''
})

// Available Years
const currentYear = new Date().getFullYear()
const availableYears = [currentYear - 1, currentYear, currentYear + 1]

// Count events by type
const countByType = (type) => {
  return events.value.filter(e => e.event_type === type).length
}

// Completion percentage
const completionPercentage = computed(() => {
  if (!summary.value.total_events) return 0
  return Math.round((summary.value.recorded_events / summary.value.total_events) * 100)
})

// Event Type Badge Style
const getEventTypeBadgeClass = (type) => {
  switch (type) {
    case 'MINGGU':
      return 'bg-indigo-50 text-indigo-700 border border-indigo-200'
    case 'SERMON':
      return 'bg-purple-50 text-purple-700 border border-purple-200'
    case 'LAINNYA':
      return 'bg-teal-50 text-teal-700 border border-teal-200'
    default:
      return 'bg-slate-100 text-slate-700 border border-slate-200'
  }
}

// Computed: Filtered Events
const filteredEvents = computed(() => {
  return events.value.filter(ev => {
    // Event Type Filter
    if (filterEventType.value !== 'ALL' && ev.event_type !== filterEventType.value) {
      return false
    }

    // Status Filter
    if (filterStatus.value === 'recorded' && !ev.has_offerings) return false
    if (filterStatus.value === 'unrecorded' && ev.has_offerings) return false

    // Search Query
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      const titleMatch = ev.title?.toLowerCase().includes(q)
      const dateMatch = ev.event_date?.toLowerCase().includes(q)
      const typeMatch = ev.event_type?.toLowerCase().includes(q)
      if (!titleMatch && !dateMatch && !typeMatch) return false
    }

    return true
  })
})

const countRecorded = computed(() => {
  return events.value.filter(e => e.has_offerings).length
})

// Calculated total of input modal
const calculatedInputTotal = computed(() => {
  let total = 0
  for (const cat of categories.value) {
    const amt = Number(inputForm[cat.id]?.amount) || 0
    total += amt
  }
  return total
})

// Helpers: Calculate filtered category subtotal
const calculateFilteredCategoryTotal = (catId) => {
  return filteredEvents.value.reduce((acc, ev) => {
    return acc + (Number(ev.offerings?.[catId]?.amount) || 0)
  }, 0)
}

// Helpers: Calculate filtered grand total
const calculateFilteredGrandTotal = () => {
  return filteredEvents.value.reduce((acc, ev) => {
    return acc + (Number(ev.total_amount) || 0)
  }, 0)
}

// Format Rupiah
const formatRupiah = (val) => {
  const num = Number(val) || 0
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(num)
}

// Format Input Display (e.g. 150.000)
const formatInputDisplay = (val) => {
  if (val === undefined || val === null || val === '') return ''
  const num = Number(val)
  if (isNaN(num)) return ''
  return num.toLocaleString('id-ID')
}

// Handle Amount Input (remove non-digits)
const handleAmountInput = (catId, event) => {
  const raw = event.target.value.replace(/\D/g, '')
  if (!inputForm[catId]) {
    inputForm[catId] = { amount: 0, description: '' }
  }
  inputForm[catId].amount = raw ? parseInt(raw, 10) : 0
}

// Quick Add Amount Buttons (+50rb, +100rb, etc)
const addQuickAmount = (catId, delta) => {
  if (!inputForm[catId]) {
    inputForm[catId] = { amount: 0, description: '' }
  }
  const current = Number(inputForm[catId].amount) || 0
  inputForm[catId].amount = current + delta
}

// Reset Amount to 0
const resetAmount = (catId) => {
  if (inputForm[catId]) {
    inputForm[catId].amount = 0
  }
}

// Format Date Indo
const formatDateIndo = (dateStr) => {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('id-ID', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (e) {
    return dateStr
  }
}

// Month name
const getMonthName = (m) => {
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]
  return monthNames[m - 1] || m
}

// Fetch Overview Data
const fetchData = async () => {
  loading.value = true
  try {
    const params = {}
    if (filterMonth.value) params.month = filterMonth.value
    if (filterYear.value) params.year = filterYear.value

    const res = await api.get('/persembahan', { params })
    const payload = res?.data || res
    if (res?.success || payload?.events) {
      events.value = payload.events || []
      categories.value = payload.categories || []
      summary.value = payload.summary || {
        grand_total: 0,
        total_events: 0,
        recorded_events: 0,
        category_totals: {}
      }
    }
  } catch (error) {
    console.error('Error fetchData persembahan:', error)
    alert.type = 'error'
    alert.message = error.message || error.response?.data?.message || 'Gagal memuat data persembahan'
  } finally {
    loading.value = false
  }
}

// Open Input Modal
const openInputModal = (eventItem) => {
  activeEvent.value = eventItem

  // Inisialisasi inputForm untuk setiap kategori m_persembahan
  for (const cat of categories.value) {
    const existing = eventItem.offerings?.[cat.id]
    inputForm[cat.id] = {
      amount: existing?.amount || 0,
      description: existing?.description || ''
    }
  }

  isInputModalOpen.value = true
}

// Submit Persembahan
const submitPersembahan = async () => {
  if (!activeEvent.value) return

  submitting.value = true
  try {
    const items = categories.value.map(cat => ({
      category_id: cat.id,
      amount: inputForm[cat.id]?.amount || 0,
      description: inputForm[cat.id]?.description || ''
    }))

    const res = await api.post(`/persembahan/event/${activeEvent.value.id}`, { items })
    if (res?.success) {
      alert.type = 'success'
      alert.message = `Nominal persembahan untuk acara "${activeEvent.value.title}" berhasil disimpan ke kas transaksi!`
      isInputModalOpen.value = false
      await fetchData()
    }
  } catch (error) {
    console.error('Error submitPersembahan:', error)
    alert.type = 'error'
    alert.message = error.message || error.response?.data?.message || 'Gagal menyimpan persembahan'
  } finally {
    submitting.value = false
  }
}

// Open Detail Modal
const openDetailModal = (eventItem) => {
  detailEvent.value = eventItem
  isDetailModalOpen.value = true
}

// Confirm Delete
const confirmDelete = (eventItem) => {
  eventToDelete.value = eventItem
  isDeleteModalOpen.value = true
}

// Execute Delete
const executeDelete = async () => {
  if (!eventToDelete.value) return

  submitting.value = true
  try {
    const res = await api.delete(`/persembahan/event/${eventToDelete.value.id}`)
    if (res?.success) {
      alert.type = 'success'
      alert.message = `Data persembahan untuk acara "${eventToDelete.value.title}" berhasil dikosongkan dari tabel kas transaksi!`
      isDeleteModalOpen.value = false
      eventToDelete.value = null
      await fetchData()
    }
  } catch (error) {
    console.error('Error executeDelete persembahan:', error)
    alert.type = 'error'
    alert.message = error.message || error.response?.data?.message || 'Gagal menghapus persembahan'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>
