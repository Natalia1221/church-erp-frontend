<template>
  <div class="space-y-6">
    <!-- 1. Header Page Title & Top Action Buttons -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            Modul Keuangan
          </span>
          <span class="text-slate-400 text-xs">•</span>
          <span class="text-slate-500 text-xs font-medium">Laporan & Neraca Kas</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Layers class="w-5 h-5" />
          </div>
          <span>Laporan Keuangan Gereja</span>
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          Rekapitulasi komprehensif pemasukan (Income), pengeluaran (Expense), dan kalkulasi hasil akhir kas gereja.
        </p>
      </div>

      <div class="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
        <button
          @click="fetchReport"
          :disabled="loading"
          class="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
          title="Segarkan Data"
        >
          <RefreshCw class="w-4 h-4 text-slate-500" :class="{ 'animate-spin': loading }" />
          <span class="hidden sm:inline">Refresh</span>
        </button>

        <button
          v-if="canPrint"
          @click="exportCsv"
          :disabled="loading || transactions.length === 0"
          class="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
          title="Unduh Berkas Excel / CSV"
        >
          <FileSpreadsheet class="w-4 h-4 text-emerald-600" />
          <span>Unduh Excel</span>
        </button>

        <button
          v-if="canPrint"
          @click="printReport"
          :disabled="loading"
          class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white font-bold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
          title="Cetak Dokumen Laporan Resmi"
        >
          <Printer class="w-4 h-4 text-cyan-300" />
          <span>Cetak Laporan</span>
        </button>
      </div>
    </div>

    <!-- 2. Printable Official Church Header (Hanya Muncul Saat Print) -->
    <div class="hidden print:block mb-6 border-b-2 border-slate-900 pb-4">
      <div class="text-center space-y-1">
        <h2 class="text-2xl font-black text-slate-900 tracking-tight uppercase">Gereja Kristen Protestan Indonesia</h2>
        <h3 class="text-lg font-bold text-slate-800 uppercase tracking-wide">Laporan Penerimaan & Pengeluaran Kas (Hasil Akhir)</h3>
        <p class="text-xs text-slate-600">
          Periode: <span class="font-semibold">{{ periodLabel }}</span>
        </p>
        <p class="text-[11px] text-slate-500">Dicetak pada: {{ formatDateTime(new Date()) }}</p>
      </div>
    </div>

    <!-- 3. Filter Controls & Period Selector Bar -->
    <div class="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4 print:hidden">
      <!-- Preset Periode Cepat -->
      <div class="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <Calendar class="w-4 h-4 text-slate-400" />
          <span class="text-xs font-bold text-slate-700 uppercase tracking-wider">Periode Laporan:</span>
        </div>
        <div class="flex items-center gap-1.5 flex-wrap">
          <button
            v-for="preset in periodPresets"
            :key="preset.key"
            @click="selectPreset(preset.key)"
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              selectedPreset === preset.key
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            ]"
          >
            {{ preset.label }}
          </button>
        </div>
      </div>

      <!-- Detail Input Filter -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <!-- Dari Tanggal -->
        <div>
          <label class="block text-[11px] font-bold text-slate-500 uppercase mb-1">Dari Tanggal</label>
          <input
            v-model="filters.start_date"
            type="date"
            @change="onCustomDateChange"
            class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>

        <!-- Sampai Tanggal -->
        <div>
          <label class="block text-[11px] font-bold text-slate-500 uppercase mb-1">Sampai Tanggal</label>
          <input
            v-model="filters.end_date"
            type="date"
            @change="onCustomDateChange"
            class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>

        <!-- Filter Sumber Dana -->
        <div>
          <label class="block text-[11px] font-bold text-slate-500 uppercase mb-1">Sumber Transaksi</label>
          <select
            v-model="filters.source"
            @change="fetchReport"
            class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          >
            <option value="ALL">Semua Sumber Kas</option>
            <option value="PERSEMBAHAN">Persembahan Ibadah Minggu</option>
            <option value="OPERASIONAL">Kas Umum / Operasional</option>
          </select>
        </div>

        <!-- Filter Kategori Khusus -->
        <div>
          <label class="block text-[11px] font-bold text-slate-500 uppercase mb-1">Kategori Spesifik</label>
          <select
            v-model="filters.category_id"
            @change="fetchReport"
            class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          >
            <option value="">Semua Kategori</option>
            <option v-for="cat in availableCategories" :key="cat.id" :value="cat.id">
              [{{ cat.type }}] {{ cat.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- 4. Hero Summary KPI Cards (Kalkulasi Income, Expense, dan Hasil Akhir) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Card 1: Total Pemasukan (Income) -->
      <div class="bg-white border border-emerald-200/80 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] relative overflow-hidden flex flex-col justify-between">
        <div class="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 rounded-bl-full pointer-events-none"></div>
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            Total Pemasukan (Income)
          </span>
          <div class="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
            <ArrowDownLeft class="w-4 h-4" />
          </div>
        </div>
        <div class="mt-4">
          <p class="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
            {{ formatRupiah(summary.total_income) }}
          </p>
          <div class="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>{{ summary.income_count }} transaksi pemasukan</span>
            <span class="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              100% Inflow
            </span>
          </div>
        </div>
      </div>

      <!-- Card 2: Total Pengeluaran (Expense) -->
      <div class="bg-white border border-rose-200/80 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] relative overflow-hidden flex flex-col justify-between">
        <div class="absolute top-0 right-0 w-28 h-28 bg-rose-500/5 rounded-bl-full pointer-events-none"></div>
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-rose-500"></span>
            Total Pengeluaran (Expense)
          </span>
          <div class="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-xs">
            <ArrowUpRight class="w-4 h-4" />
          </div>
        </div>
        <div class="mt-4">
          <p class="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">
            {{ formatRupiah(summary.total_expense) }}
          </p>
          <div class="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>{{ summary.expense_count }} transaksi pengeluaran</span>
            <span class="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
              {{ summary.expense_ratio }}% dari Income
            </span>
          </div>
        </div>
      </div>

      <!-- Card 3: HASIL AKHIR (Net Balance / Saldo Kas Bersih) -->
      <div
        :class="[
          'rounded-2xl p-5 shadow-sm border relative overflow-hidden flex flex-col justify-between transition-all',
          summary.net_balance >= 0
            ? 'bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-cyan-50/70 border-emerald-300'
            : 'bg-gradient-to-br from-rose-50/70 via-orange-50/40 to-amber-50/70 border-rose-300'
        ]"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="text-xs font-extrabold uppercase tracking-wider text-slate-800">
              HASIL AKHIR (NET BALANCE)
            </span>
            <span
              :class="[
                'text-[10px] font-black uppercase px-2 py-0.5 rounded-full border',
                summary.net_balance >= 0
                  ? 'bg-emerald-500 text-white border-emerald-600'
                  : 'bg-rose-500 text-white border-rose-600'
              ]"
            >
              {{ summary.net_status }}
            </span>
          </div>
          <div
            :class="[
              'w-8 h-8 rounded-xl flex items-center justify-center shadow-xs border',
              summary.net_balance >= 0
                ? 'bg-emerald-500 text-white border-emerald-600'
                : 'bg-rose-500 text-white border-rose-600'
            ]"
          >
            <Wallet class="w-4 h-4" />
          </div>
        </div>

        <div class="mt-4">
          <p
            :class="[
              'text-2xl sm:text-3xl font-black tracking-tight',
              summary.net_balance >= 0 ? 'text-emerald-700' : 'text-rose-700'
            ]"
          >
            {{ summary.net_balance >= 0 ? '+' : '' }}{{ formatRupiah(summary.net_balance) }}
          </p>
          <div class="mt-2 text-xs text-slate-600 space-y-1">
            <div class="flex items-center justify-between text-[11px] font-medium">
              <span>Formula: Income - Expense</span>
              <span class="font-bold">
                {{ summary.net_balance >= 0 ? 'Surplus ' + summary.surplus_ratio + '%' : 'Defisit Kas' }}
              </span>
            </div>
            <!-- Progress Bar Rasio Cadangan -->
            <div class="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="summary.net_balance >= 0 ? 'bg-emerald-500' : 'bg-rose-500'"
                :style="{ width: Math.min(100, Math.max(0, summary.surplus_ratio)) + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 5. Navigation Tab (Ringkasan Kategori vs Buku Mutasi Kas vs Tren Bulanan) -->
    <div class="bg-white border border-slate-200/90 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
      <div class="flex items-center border-b border-slate-200 px-4 pt-3 gap-2 overflow-x-auto print:hidden">
        <button
          @click="activeTab = 'summary'"
          :class="[
            'px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer',
            activeTab === 'summary'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          ]"
        >
          <BarChart3 class="w-4 h-4" />
          <span>Rekapitulasi Kategori & Komparasi</span>
        </button>

        <button
          @click="activeTab = 'ledger'"
          :class="[
            'px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer',
            activeTab === 'ledger'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          ]"
        >
          <Receipt class="w-4 h-4" />
          <span>Buku Mutasi Kas (Daftar Transaksi)</span>
          <span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
            {{ transactions.length }}
          </span>
        </button>

        <button
          @click="activeTab = 'monthly'"
          :class="[
            'px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer',
            activeTab === 'monthly'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          ]"
        >
          <TrendingUp class="w-4 h-4" />
          <span>Analisis Tren Bulanan</span>
        </button>
      </div>

      <!-- TAB 1: REKAPITULASI KATEGORI (INCOME VS EXPENSE) -->
      <div v-show="activeTab === 'summary' || isPrinting" class="p-5 sm:p-6 space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Kolom 1: Rekap Pemasukan (Income Categories) -->
          <div class="bg-slate-50/60 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-200">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  <ArrowDownLeft class="w-4 h-4" />
                </div>
                <h3 class="text-sm font-black text-slate-800 tracking-tight">Rincian Pos Pemasukan (Income)</h3>
              </div>
              <span class="text-xs font-extrabold text-emerald-600">
                Total: {{ formatRupiah(summary.total_income) }}
              </span>
            </div>

            <div v-if="categoriesBreakdown.income_categories.length === 0" class="py-8 text-center text-slate-400 text-xs">
              Tidak ada data pemasukan pada periode ini.
            </div>

            <div v-else class="space-y-3.5">
              <div
                v-for="cat in categoriesBreakdown.income_categories"
                :key="cat.category_id"
                class="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs space-y-2"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-xs font-bold text-slate-800">{{ cat.category_name }}</p>
                    <p class="text-[10px] text-slate-400 font-medium">
                      {{ formatGroupLabel(cat.category_group) }} • {{ cat.transaction_count }} kali transaksi
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="text-xs font-black text-emerald-600">{{ formatRupiah(cat.total_amount) }}</p>
                    <p class="text-[10px] font-bold text-slate-500">{{ cat.percentage }}% kontribusi</p>
                  </div>
                </div>

                <!-- Percentage Bar -->
                <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    class="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    :style="{ width: cat.percentage + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Kolom 2: Rekap Pengeluaran (Expense Categories) -->
          <div class="bg-slate-50/60 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-200">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                  <ArrowUpRight class="w-4 h-4" />
                </div>
                <h3 class="text-sm font-black text-slate-800 tracking-tight">Rincian Pos Pengeluaran (Expense)</h3>
              </div>
              <span class="text-xs font-extrabold text-rose-600">
                Total: {{ formatRupiah(summary.total_expense) }}
              </span>
            </div>

            <div v-if="categoriesBreakdown.expense_categories.length === 0" class="py-8 text-center text-slate-400 text-xs">
              Tidak ada data pengeluaran pada periode ini.
            </div>

            <div v-else class="space-y-3.5">
              <div
                v-for="cat in categoriesBreakdown.expense_categories"
                :key="cat.category_id"
                class="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs space-y-2"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-xs font-bold text-slate-800">{{ cat.category_name }}</p>
                    <p class="text-[10px] text-slate-400 font-medium">
                      {{ formatGroupLabel(cat.category_group) }} • {{ cat.transaction_count }} kali transaksi
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="text-xs font-black text-rose-600">{{ formatRupiah(cat.total_amount) }}</p>
                    <p class="text-[10px] font-bold text-slate-500">{{ cat.percentage }}% kontribusi</p>
                  </div>
                </div>

                <!-- Percentage Bar -->
                <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    class="bg-rose-500 h-full rounded-full transition-all duration-300"
                    :style="{ width: cat.percentage + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Kolom Khusus: Kategori Bukan Keduanya (Non-Income / Non-Expense seperti Kas Gereja) -->
        <div v-if="categoriesBreakdown.other_categories.length > 0" class="bg-slate-50/60 border border-slate-200 rounded-2xl p-5 space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-200">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                <Layers class="w-4 h-4" />
              </div>
              <div>
                <h3 class="text-sm font-black text-slate-800 tracking-tight">Kategori Khusus (Bukan Keduanya)</h3>
                <p class="text-[11px] text-slate-500">Kategori dengan jenis 'Bukan Keduanya' (seperti Kas Gereja) tidak dihitung sebagai Income maupun Expense.</p>
              </div>
            </div>
            <span class="text-xs font-extrabold text-slate-700">
              Total: {{ formatRupiah(summary.total_other) }}
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <div
              v-for="cat in categoriesBreakdown.other_categories"
              :key="cat.category_id"
              class="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between"
            >
              <div>
                <p class="text-xs font-bold text-slate-800">{{ cat.category_name }}</p>
                <p class="text-[10px] text-slate-400 font-medium">
                  {{ formatGroupLabel(cat.category_group) }} • {{ cat.transaction_count }} kali transaksi
                </p>
              </div>
              <div class="text-right">
                <p class="text-xs font-black text-slate-800">{{ formatRupiah(cat.total_amount) }}</p>
                <span class="inline-block px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600">
                  Bukan Keduanya
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabel Rekonsiliasi Hasil Akhir Kas -->
        <div class="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div class="bg-slate-800 text-white px-5 py-3.5 flex items-center justify-between">
            <h4 class="text-xs font-black tracking-wide uppercase flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 text-emerald-400" />
              <span>Rekonsiliasi Laba-Rugi / Saldo Kas Bersih (Hasil Akhir)</span>
            </h4>
            <span class="text-xs text-slate-300 font-medium">Periode: {{ periodLabel }}</span>
          </div>
          <table class="w-full text-xs text-left">
            <tbody class="divide-y divide-slate-200">
              <tr class="bg-white hover:bg-slate-50/50">
                <td class="px-5 py-3.5 font-bold text-slate-700">1. Total Penerimaan / Pemasukan (Income)</td>
                <td class="px-5 py-3.5 text-slate-500">{{ summary.income_count }} Transaksi</td>
                <td class="px-5 py-3.5 text-right font-black text-emerald-600">{{ formatRupiah(summary.total_income) }}</td>
              </tr>
              <tr class="bg-white hover:bg-slate-50/50">
                <td class="px-5 py-3.5 font-bold text-slate-700">2. Total Pengeluaran Kas (Expense)</td>
                <td class="px-5 py-3.5 text-slate-500">{{ summary.expense_count }} Transaksi</td>
                <td class="px-5 py-3.5 text-right font-black text-rose-600">({{ formatRupiah(summary.total_expense) }})</td>
              </tr>
              <tr :class="summary.net_balance >= 0 ? 'bg-emerald-50/50' : 'bg-rose-50/50'">
                <td class="px-5 py-4 font-black text-slate-900 text-sm">
                  HASIL AKHIR / SALDO BERSIH KAS (Income - Expense)
                </td>
                <td class="px-5 py-4 font-bold text-slate-700">
                  <span
                    :class="[
                      'px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider',
                      summary.net_balance >= 0 ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'
                    ]"
                  >
                    {{ summary.net_status }} KAS
                  </span>
                </td>
                <td
                  :class="[
                    'px-5 py-4 text-right font-black text-base tracking-tight',
                    summary.net_balance >= 0 ? 'text-emerald-700' : 'text-rose-700'
                  ]"
                >
                  {{ summary.net_balance >= 0 ? '+' : '' }}{{ formatRupiah(summary.net_balance) }}
                </td>
              </tr>
              <tr v-if="summary.total_other > 0" class="bg-slate-50/80">
                <td class="px-5 py-3 font-semibold text-slate-600 italic">
                  * Dana Kategori Khusus (Bukan Keduanya / Non-Income)
                </td>
                <td class="px-5 py-3 text-slate-400 italic">{{ summary.other_count }} Transaksi</td>
                <td class="px-5 py-3 text-right font-bold text-slate-600 italic">{{ formatRupiah(summary.total_other) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB 2: BUKU MUTASI KAS (DAFTAR TRANSAKSI LENGKAP) -->
      <div v-show="activeTab === 'ledger' && !isPrinting" class="p-5 sm:p-6 space-y-4">
        <!-- Sub-filter bar pada tab ledger -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div class="flex flex-col sm:flex-row sm:items-center gap-2.5 w-full lg:w-auto">
            <div class="relative w-full sm:w-72">
              <Search class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                v-model="ledgerSearch"
                type="text"
                placeholder="Cari transaksi / keterangan..."
                class="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>

            <!-- Dropdown Filter Tipe -->
            <select
              v-model="ledgerTypeFilter"
              class="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white font-semibold text-slate-700"
            >
              <option value="ALL">Semua Tipe Transaksi</option>
              <option value="INCOME_EXPENSE">Kombinasi (Income & Expense Saja)</option>
              <option value="INCOME">Hanya Income (Pemasukan)</option>
              <option value="EXPENSE">Hanya Expense (Pengeluaran)</option>
              <option value="BUKAN KEDUANYA">Hanya Bukan Keduanya</option>
            </select>
          </div>

          <!-- Quick Toggle Pills untuk kemudahan navigasi langsung -->
          <div class="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              @click="ledgerTypeFilter = 'INCOME_EXPENSE'"
              :class="[
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
                ledgerTypeFilter === 'INCOME_EXPENSE'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
              ]"
              title="Tampilkan hanya transaksi Income & Expense (mengecualikan Bukan Keduanya)"
            >
              <span>Income & Expense Saja</span>
              <span
                class="text-[10px] px-1.5 py-0.2 rounded-full font-black"
                :class="ledgerTypeFilter === 'INCOME_EXPENSE' ? 'bg-white/25 text-white' : 'bg-blue-200 text-blue-800'"
              >
                {{ summary.income_count + summary.expense_count }}
              </span>
            </button>

            <button
              type="button"
              @click="ledgerTypeFilter = 'ALL'"
              :class="[
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                ledgerTypeFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              ]"
            >
              Semua ({{ summary.total_count }})
            </button>

            <button
              type="button"
              @click="ledgerTypeFilter = 'INCOME'"
              :class="[
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                ledgerTypeFilter === 'INCOME'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              ]"
            >
              Income ({{ summary.income_count }})
            </button>

            <button
              type="button"
              @click="ledgerTypeFilter = 'EXPENSE'"
              :class="[
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                ledgerTypeFilter === 'EXPENSE'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              ]"
            >
              Expense ({{ summary.expense_count }})
            </button>

            <button
              v-if="summary.other_count > 0"
              type="button"
              @click="ledgerTypeFilter = 'BUKAN KEDUANYA'"
              :class="[
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                ledgerTypeFilter === 'BUKAN KEDUANYA'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
              ]"
            >
              Bukan Keduanya ({{ summary.other_count }})
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between text-xs text-slate-500 pt-1 font-medium">
          <span>
            Filter aktif: <strong class="text-slate-800">
              {{
                ledgerTypeFilter === 'INCOME_EXPENSE'
                  ? 'Kombinasi Income & Expense Saja'
                  : ledgerTypeFilter === 'INCOME'
                  ? 'Hanya Pemasukan (Income)'
                  : ledgerTypeFilter === 'EXPENSE'
                  ? 'Hanya Pengeluaran (Expense)'
                  : ledgerTypeFilter === 'BUKAN KEDUANYA'
                  ? 'Hanya Bukan Keduanya'
                  : 'Semua Tipe Transaksi'
              }}
            </strong>
          </span>
          <span>
            Menampilkan <strong>{{ filteredTransactions.length }}</strong> transaksi
          </span>
        </div>

        <!-- Tabel Transaksi -->
        <div class="border border-slate-200 rounded-2xl overflow-x-auto shadow-xs">
          <table class="w-full text-xs text-left">
            <thead class="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th class="px-4 py-3 text-center w-12">No</th>
                <th class="px-4 py-3">Tanggal</th>
                <th class="px-4 py-3">Kategori</th>
                <th class="px-4 py-3">Sumber Kas</th>
                <th class="px-4 py-3">Keterangan</th>
                <th class="px-4 py-3 text-center">Tipe</th>
                <th class="px-4 py-3 text-right">Nominal</th>
                <th class="px-4 py-3">Dicatat Oleh</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="filteredTransactions.length === 0">
                <td colspan="8" class="px-4 py-8 text-center text-slate-400">
                  Tidak ada data transaksi yang sesuai dengan filter.
                </td>
              </tr>
              <tr
                v-for="(tx, idx) in paginatedTransactions"
                :key="tx.id"
                class="hover:bg-slate-50/60 transition-colors"
              >
                <td class="px-4 py-3.5 text-center text-slate-400 font-medium">
                  {{ (currentPage - 1) * pageSize + idx + 1 }}
                </td>
                <td class="px-4 py-3.5 text-slate-800 font-bold whitespace-nowrap">
                  {{ formatDate(tx.transaction_date) }}
                </td>
                <td class="px-4 py-3.5">
                  <div class="font-bold text-slate-800">{{ tx.category_name }}</div>
                  <div class="text-[10px] text-slate-400">{{ formatGroupLabel(tx.category_group) }}</div>
                </td>
                <td class="px-4 py-3.5 whitespace-nowrap">
                  <span
                    :class="[
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border',
                      tx.source_type === 'PERSEMBAHAN'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    ]"
                  >
                    <component :is="tx.source_type === 'PERSEMBAHAN' ? Calendar : Wallet" class="w-3 h-3 shrink-0" />
                    <span>{{ tx.source_label }}</span>
                  </span>
                </td>
                <td class="px-4 py-3.5 text-slate-600 max-w-xs truncate" :title="tx.description">
                  {{ tx.description }}
                </td>
                <td class="px-4 py-3.5 text-center">
                  <span
                    :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide border',
                      tx.type === 'INCOME'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : tx.type === 'EXPENSE'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    ]"
                  >
                    {{ tx.type === 'BUKAN KEDUANYA' ? 'Bukan Keduanya' : tx.type }}
                  </span>
                </td>
                <td
                  :class="[
                    'px-4 py-3.5 text-right font-black whitespace-nowrap',
                    tx.type === 'INCOME'
                      ? 'text-emerald-600'
                      : tx.type === 'EXPENSE'
                      ? 'text-rose-600'
                      : 'text-slate-800'
                  ]"
                >
                  {{ tx.type === 'INCOME' ? '+' : tx.type === 'EXPENSE' ? '-' : '' }}{{ formatRupiah(tx.amount) }}
                </td>
                <td class="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                  {{ tx.recorded_by_name }}
                </td>
              </tr>
            </tbody>
            <!-- Footer Total Mutasi Kas -->
            <tfoot class="bg-slate-50 text-xs font-bold border-t border-slate-200">
              <tr>
                <td colspan="6" class="px-4 py-3 text-right text-slate-700">Subtotal Halaman Ini:</td>
                <td class="px-4 py-3 text-right font-black text-slate-900">
                  {{ formatRupiah(pageSubtotal) }}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Pagination Bar -->
        <div v-if="totalPages > 1" class="flex items-center justify-between pt-2">
          <span class="text-xs text-slate-400">
            Halaman {{ currentPage }} dari {{ totalPages }}
          </span>
          <div class="flex items-center gap-1.5">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Sebelumnya
            </button>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>

      <!-- TAB 3: ANALISIS TREN BULANAN -->
      <div v-show="activeTab === 'monthly' && !isPrinting" class="p-5 sm:p-6 space-y-6">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h3 class="text-sm font-black text-slate-800">Tren Pemasukan vs Pengeluaran Tahun {{ currentYear }}</h3>
            <p class="text-xs text-slate-400">Perbandingan arus kas bulanan sepanjang tahun kalender berjalan.</p>
          </div>
          <span class="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
            Tahun {{ currentYear }}
          </span>
        </div>

        <div class="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <table class="w-full text-xs text-left">
            <thead class="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th class="px-4 py-3">Bulan</th>
                <th class="px-4 py-3 text-right">Pemasukan (Income)</th>
                <th class="px-4 py-3 text-right">Pengeluaran (Expense)</th>
                <th class="px-4 py-3 text-right">Hasil Akhir (Saldo)</th>
                <th class="px-4 py-3 text-center">Status Kas</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="monthlyTrends.length === 0">
                <td colspan="5" class="px-4 py-8 text-center text-slate-400">
                  Belum ada catatan mutasi kas pada tahun ini.
                </td>
              </tr>
              <tr
                v-for="trend in monthlyTrends"
                :key="trend.period_month"
                class="hover:bg-slate-50/50"
              >
                <td class="px-4 py-3.5 font-bold text-slate-800">
                  {{ formatMonthLabel(trend.period_month) }}
                </td>
                <td class="px-4 py-3.5 text-right font-bold text-emerald-600">
                  {{ formatRupiah(trend.income) }}
                </td>
                <td class="px-4 py-3.5 text-right font-bold text-rose-600">
                  {{ formatRupiah(trend.expense) }}
                </td>
                <td
                  :class="[
                    'px-4 py-3.5 text-right font-black',
                    trend.net_balance >= 0 ? 'text-emerald-700' : 'text-rose-700'
                  ]"
                >
                  {{ trend.net_balance >= 0 ? '+' : '' }}{{ formatRupiah(trend.net_balance) }}
                </td>
                <td class="px-4 py-3.5 text-center">
                  <span
                    :class="[
                      'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border',
                      trend.net_balance > 0
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : trend.net_balance < 0
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    ]"
                  >
                    {{ trend.net_balance > 0 ? 'SURPLUS' : trend.net_balance < 0 ? 'DEFISIT' : 'SEIMBANG' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 6. Print Official Signature Block (Hanya Muncul Saat Print Dokumen) -->
    <div class="hidden print:block mt-12 pt-6">
      <div class="grid grid-cols-2 gap-8 text-center text-xs">
        <div>
          <p class="text-slate-500 mb-16">Mengetahui,<br><strong class="text-slate-800">Pendeta / Gembala Sidang</strong></p>
          <p class="font-bold text-slate-900 underline">( ........................................ )</p>
        </div>
        <div>
          <p class="text-slate-500 mb-16">Dibuat Oleh,<br><strong class="text-slate-800">Bendahara Gereja</strong></p>
          <p class="font-bold text-slate-900 underline">( {{ authStore.user?.name || 'Bendahara' }} )</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usePermissions } from '@/composables/usePermissions'
import axios from '@/api/axios'
import {
  Layers,
  RefreshCw,
  Printer,
  FileSpreadsheet,
  Calendar,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  Receipt,
  TrendingUp,
  Search,
  CheckCircle2
} from 'lucide-vue-next'

const authStore = useAuthStore()
const { canPrint } = usePermissions()

// State
const loading = ref(false)
const activeTab = ref('summary') // 'summary' | 'ledger' | 'monthly'
const isPrinting = ref(false)

const currentYear = new Date().getFullYear()

// KPI Summary State
const summary = reactive({
  total_income: 0,
  total_expense: 0,
  total_other: 0,
  net_balance: 0,
  net_status: 'SEIMBANG',
  income_count: 0,
  expense_count: 0,
  other_count: 0,
  total_count: 0,
  expense_ratio: 0,
  surplus_ratio: 0
})

const categoriesBreakdown = reactive({
  income_categories: [],
  expense_categories: [],
  other_categories: []
})

const monthlyTrends = ref([])
const transactions = ref([])
const availableCategories = ref([])

// Filter Presets
const periodPresets = [
  { key: 'THIS_MONTH', label: 'Bulan Ini' },
  { key: 'LAST_MONTH', label: 'Bulan Lalu' },
  { key: 'THIS_YEAR', label: 'Tahun Ini' },
  { key: 'ALL', label: 'Semua Waktu' },
  { key: 'CUSTOM', label: 'Kustom' }
]
const selectedPreset = ref('THIS_MONTH')

// Filters Reactive Object
const filters = reactive({
  start_date: '',
  end_date: '',
  source: 'ALL',
  category_id: ''
})

// Ledger Local Filter & Pagination
const ledgerSearch = ref('')
const ledgerTypeFilter = ref('ALL')
const currentPage = ref(1)
const pageSize = 15

// Helpers for dates
const setPresetDates = (presetKey) => {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth() // 0-indexed

  if (presetKey === 'THIS_MONTH') {
    const start = new Date(y, m, 1)
    const end = new Date(y, m + 1, 0)
    filters.start_date = formatDateForInput(start)
    filters.end_date = formatDateForInput(end)
  } else if (presetKey === 'LAST_MONTH') {
    const start = new Date(y, m - 1, 1)
    const end = new Date(y, m, 0)
    filters.start_date = formatDateForInput(start)
    filters.end_date = formatDateForInput(end)
  } else if (presetKey === 'THIS_YEAR') {
    filters.start_date = `${y}-01-01`
    filters.end_date = `${y}-12-31`
  } else if (presetKey === 'ALL') {
    filters.start_date = ''
    filters.end_date = ''
  }
}

const formatDateForInput = (d) => {
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

const selectPreset = (key) => {
  selectedPreset.value = key
  if (key !== 'CUSTOM') {
    setPresetDates(key)
    fetchReport()
  }
}

const onCustomDateChange = () => {
  selectedPreset.value = 'CUSTOM'
  fetchReport()
}

// Period Label Computed
const periodLabel = computed(() => {
  if (selectedPreset.value === 'THIS_MONTH') {
    const d = new Date()
    return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
  }
  if (selectedPreset.value === 'THIS_YEAR') {
    return `Tahun ${currentYear}`
  }
  if (!filters.start_date && !filters.end_date) {
    return 'Seluruh Periode Akumulasi'
  }
  return `${formatDate(filters.start_date)} s/d ${formatDate(filters.end_date)}`
})

// Fetch Main Report Data
const fetchReport = async () => {
  loading.value = true
  try {
    const params = {}
    if (filters.start_date) params.start_date = filters.start_date
    if (filters.end_date) params.end_date = filters.end_date
    if (filters.source && filters.source !== 'ALL') params.source = filters.source
    if (filters.category_id) params.category_id = filters.category_id

    const res = await axios.get('/laporan-keuangan', { params })
    if (res.success && res.data) {
      // Summary
      Object.assign(summary, res.data.summary)

      // Categories Breakdown
      categoriesBreakdown.income_categories = res.data.categories_breakdown?.income_categories || []
      categoriesBreakdown.expense_categories = res.data.categories_breakdown?.expense_categories || []
      categoriesBreakdown.other_categories = res.data.categories_breakdown?.other_categories || []

      // Monthly Trends
      monthlyTrends.value = res.data.monthly_trends || []

      // Transactions
      transactions.value = res.data.transactions || []

      // Available Categories
      if (res.data.filter_options?.categories) {
        availableCategories.value = res.data.filter_options.categories
      }

      currentPage.value = 1
    }
  } catch (error) {
    console.error('Error fetchReport:', error)
  } finally {
    loading.value = false
  }
}

// Filtered Transactions for Ledger Tab
const filteredTransactions = computed(() => {
  let list = transactions.value

  if (ledgerTypeFilter.value === 'INCOME_EXPENSE') {
    list = list.filter(t => t.type === 'INCOME' || t.type === 'EXPENSE')
  } else if (ledgerTypeFilter.value !== 'ALL') {
    list = list.filter(t => t.type === ledgerTypeFilter.value)
  }

  if (ledgerSearch.value.trim()) {
    const term = ledgerSearch.value.toLowerCase().trim()
    list = list.filter(t =>
      (t.category_name && t.category_name.toLowerCase().includes(term)) ||
      (t.description && t.description.toLowerCase().includes(term)) ||
      (t.source_label && t.source_label.toLowerCase().includes(term)) ||
      (t.recorded_by_name && t.recorded_by_name.toLowerCase().includes(term))
    )
  }

  return list
})

const totalPages = computed(() => {
  return Math.ceil(filteredTransactions.value.length / pageSize) || 1
})

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredTransactions.value.slice(start, start + pageSize)
})

const pageSubtotal = computed(() => {
  return paginatedTransactions.value.reduce((acc, curr) => {
    if (curr.type === 'INCOME') return acc + curr.amount
    if (curr.type === 'EXPENSE') return acc - curr.amount
    return acc // BUKAN KEDUANYA tidak dihitung ke hasil akhir/subtotal
  }, 0)
})

// Format Helpers
const formatRupiah = (val) => {
  const num = Number(val) || 0
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(num)
}

const formatDate = (val) => {
  if (!val) return '-'
  const d = new Date(val)
  if (isNaN(d)) return val
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const formatDateTime = (val) => {
  if (!val) return '-'
  const d = new Date(val)
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatMonthLabel = (val) => {
  if (!val) return '-'
  const [y, m] = val.split('-')
  const d = new Date(Number(y), Number(m) - 1, 1)
  return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

const formatGroupLabel = (group) => {
  if (group === 'm_persembahan') return 'Persembahan Ibadah'
  if (group === 'm_income') return 'Pemasukan Kas'
  if (group === 'm_expense') return 'Pengeluaran Kas'
  return group || 'Kas Umum'
}

// Print Handler
const printReport = () => {
  isPrinting.value = true
  setTimeout(() => {
    window.print()
    isPrinting.value = false
  }, 150)
}

// Export CSV Handler
const exportCsv = () => {
  if (transactions.value.length === 0) return

  const headers = ['No', 'Tanggal', 'Kategori', 'Grup Kategori', 'Sumber Kas', 'Keterangan', 'Tipe', 'Nominal (IDR)', 'Dicatat Oleh']
  const rows = transactions.value.map((t, idx) => [
    idx + 1,
    t.transaction_date,
    `"${(t.category_name || '').replace(/"/g, '""')}"`,
    `"${(t.category_group || '').replace(/"/g, '""')}"`,
    `"${(t.source_label || '').replace(/"/g, '""')}"`,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    t.type,
    t.amount,
    `"${(t.recorded_by_name || '').replace(/"/g, '""')}"`
  ])

  // Tambahkan ringkasan di bawah
  rows.push([])
  rows.push(['--- RINGKASAN LAPORAN KEUANGAN ---'])
  rows.push(['Total Pemasukan (Income)', summary.total_income])
  rows.push(['Total Pengeluaran (Expense)', summary.total_expense])
  rows.push(['Hasil Akhir (Saldo Bersih)', summary.net_balance])
  rows.push(['Status', summary.net_status])

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `Laporan_Keuangan_Gereja_${filters.start_date || 'Awal'}_sd_${filters.end_date || 'Akhir'}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Lifecycle
onMounted(() => {
  setPresetDates('THIS_MONTH')
  fetchReport()
})
</script>

<style scoped>
@media print {
  body {
    background: white !important;
    color: black !important;
  }
}
</style>
