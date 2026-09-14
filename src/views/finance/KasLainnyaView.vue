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
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <Receipt class="w-5 h-5" />
          </div>
          <span>Transaksi Kas Lainnya</span>
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

        <button
          v-if="canCreate"
          @click="openAddModal(currentTypeFilter === 'ALL' ? 'INCOME' : currentTypeFilter)"
          class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          title="Tambah Transaksi Kas Baru"
        >
          <Plus class="w-4 h-4" />
          <span>Tambah Transaksi</span>
        </button>
      </div>
    </div>

    <!-- 2. Top Summary KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Card 1: Total Pemasukan (Income) -->
      <div class="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Total Pemasukan</span>
          <div class="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <ArrowDownLeft class="w-4 h-4" />
          </div>
        </div>
        <div class="mt-4">
          <p class="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
            {{ formatRupiah(summary.total_income) }}
          </p>
          <p class="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5">
            <span>{{ summary.income_count }} transaksi pemasukan tercatat</span>
          </p>
        </div>
      </div>

      <!-- Card 2: Total Pengeluaran (Expense) -->
      <div class="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Total Pengeluaran</span>
          <div class="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <ArrowUpRight class="w-4 h-4" />
          </div>
        </div>
        <div class="mt-4">
          <p class="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">
            {{ formatRupiah(summary.total_expense) }}
          </p>
          <p class="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5">
            <span>{{ summary.expense_count }} transaksi pengeluaran tercatat</span>
          </p>
        </div>
      </div>

      <!-- Card 3: Saldo Kas Bersih (Net Cash) -->
      <div
        :class="[
          'rounded-2xl p-5 shadow-lg flex flex-col justify-between relative overflow-hidden text-white',
          summary.net_balance >= 0
            ? 'bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 shadow-blue-500/15'
            : 'bg-gradient-to-br from-rose-600 via-rose-700 to-red-800 shadow-rose-500/15'
        ]"
      >
        <div class="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-blue-100">Saldo Kas Bersih</span>
          <div class="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
            <Wallet class="w-4 h-4 text-white" />
          </div>
        </div>
        <div class="mt-4">
          <p class="text-2xl sm:text-3xl font-black tracking-tight">
            {{ formatRupiah(summary.net_balance) }}
          </p>
          <p class="text-xs text-blue-100/90 mt-1.5 font-medium flex items-center gap-1.5">
            <span v-if="summary.net_balance >= 0">Surplus Kas Operasional</span>
            <span v-else>Defisit Kas Operasional</span>
          </p>
        </div>
      </div>

      <!-- Card 4: Total Transaksi -->
      <div class="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Total Transaksi</span>
          <div class="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
            <FileText class="w-4 h-4" />
          </div>
        </div>
        <div class="mt-4">
          <div class="flex items-baseline gap-2">
            <p class="text-2xl sm:text-3xl font-black text-slate-900">{{ summary.total_count }}</p>
            <span class="text-xs font-bold text-slate-500">Transaksi</span>
          </div>
          <p class="text-xs text-slate-400 mt-1.5">
            Di luar persembahan ibadah mingguan
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

    <!-- 3. Toolbar & Filters (Tab Tipe: INCOME, EXPENSE, dan GABUNGAN) -->
    <div class="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
      <!-- Row 1: Primary Tab Selection (Gabungan / Pemasukan / Pengeluaran) -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1.5">
            <Filter class="w-3.5 h-3.5" />
            <span>Tipe Transaksi:</span>
          </span>

          <!-- Tab Gabungan (Semua Transaksi) -->
          <button
            @click="setTypeFilter('ALL')"
            :class="[
              'px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
              currentTypeFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            ]"
          >
            <span>Semua (Gabungan)</span>
            <span
              class="text-[10px] px-1.5 py-0.5 rounded-full"
              :class="currentTypeFilter === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'"
            >
              {{ summary.total_count }}
            </span>
          </button>

          <!-- Tab Pemasukan (INCOME) -->
          <button
            @click="setTypeFilter('INCOME')"
            :class="[
              'px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
              currentTypeFilter === 'INCOME'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60'
            ]"
          >
            <ArrowDownLeft class="w-3.5 h-3.5" />
            <span>Pemasukan (INCOME)</span>
            <span
              class="text-[10px] px-1.5 py-0.5 rounded-full"
              :class="currentTypeFilter === 'INCOME' ? 'bg-white/20 text-white' : 'bg-emerald-200 text-emerald-800'"
            >
              {{ summary.income_count }}
            </span>
          </button>

          <!-- Tab Pengeluaran (EXPENSE) -->
          <button
            @click="setTypeFilter('EXPENSE')"
            :class="[
              'px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
              currentTypeFilter === 'EXPENSE'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60'
            ]"
          >
            <ArrowUpRight class="w-3.5 h-3.5" />
            <span>Pengeluaran (EXPENSE)</span>
            <span
              class="text-[10px] px-1.5 py-0.5 rounded-full"
              :class="currentTypeFilter === 'EXPENSE' ? 'bg-white/20 text-white' : 'bg-rose-200 text-rose-800'"
            >
              {{ summary.expense_count }}
            </span>
          </button>
        </div>

        <!-- Quick Add with Active Type Context -->
        <button
          @click="openAddModal(currentTypeFilter === 'ALL' ? 'INCOME' : currentTypeFilter)"
          class="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all flex items-center gap-1.5 self-start lg:self-auto cursor-pointer"
        >
          <Plus class="w-3.5 h-3.5 text-blue-600" />
          <span>Tambah {{ currentTypeFilter === 'EXPENSE' ? 'Pengeluaran' : (currentTypeFilter === 'INCOME' ? 'Pemasukan' : 'Transaksi') }}</span>
        </button>
      </div>

      <!-- Row 2: Secondary Filters (Kategori, Bulan, Tahun, Pencarian) -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2.5">
          <!-- Kategori Filter -->
          <select
            v-model="filterCategory"
            @change="fetchData"
            class="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
          >
            <option value="">Semua Kategori</option>
            <option
              v-for="cat in availableCategoriesForFilter"
              :key="cat.id"
              :value="cat.id"
            >
              [{{ cat.type }}] {{ cat.name }}
            </option>
          </select>

          <!-- Bulan Filter -->
          <select
            v-model="filterMonth"
            @change="fetchData"
            class="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
          >
            <option value="">Semua Bulan</option>
            <option v-for="m in 12" :key="m" :value="m">Bulan {{ getMonthName(m) }}</option>
          </select>

          <!-- Tahun Filter -->
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
        <div class="relative w-full md:w-64">
          <Search class="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Cari deskripsi, kategori, pencatat..."
            class="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>
    </div>

    <!-- 4. Main Table: Transaksi Kas (Tanpa Kolom event_id) -->
    <div class="bg-white border border-slate-200/90 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse min-w-[750px]">
          <thead>
            <tr class="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th class="py-3.5 px-4 w-12 text-center">No</th>
              <th class="py-3.5 px-4">Tanggal</th>
              <th class="py-3.5 px-4 text-center">Tipe</th>
              <th class="py-3.5 px-4">Kategori Transaksi</th>
              <th class="py-3.5 px-4">Deskripsi / Keterangan</th>
              <th class="py-3.5 px-4 text-right">Jumlah Uang (Nominal)</th>
              <th class="py-3.5 px-4 text-center">Dicatat Oleh</th>
              <th class="py-3.5 px-4 text-center w-28">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-xs text-slate-700">
            <!-- Loading State -->
            <tr v-if="loading">
              <td colspan="8" class="py-14 text-center text-slate-400">
                <div class="flex flex-col items-center justify-center gap-2.5">
                  <RefreshCw class="w-7 h-7 animate-spin text-blue-600" />
                  <span class="text-xs font-semibold text-slate-600">Memuat transaksi kas...</span>
                </div>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-else-if="filteredTransactions.length === 0">
              <td colspan="8" class="py-14 text-center text-slate-400">
                <div class="flex flex-col items-center justify-center gap-2">
                  <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                    <Receipt class="w-6 h-6" />
                  </div>
                  <p class="font-bold text-slate-800 text-sm">Tidak Ada Transaksi</p>
                  <p class="text-xs text-slate-400 max-w-sm">
                    Belum ada transaksi kas yang sesuai dengan filter tipe atau pencarian yang dipilih.
                  </p>
                  <button
                    v-if="canCreate"
                    @click="openAddModal(currentTypeFilter === 'ALL' ? 'INCOME' : currentTypeFilter)"
                    class="mt-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs cursor-pointer transition-colors"
                  >
                    Tambah Transaksi Sekarang
                  </button>
                </div>
              </td>
            </tr>

            <!-- Data Rows -->
            <tr
              v-else
              v-for="(tr, idx) in filteredTransactions"
              :key="tr.id"
              class="hover:bg-slate-50/70 transition-colors"
            >
              <!-- No -->
              <td class="py-3.5 px-4 text-center font-medium text-slate-400">{{ idx + 1 }}</td>

              <!-- Tanggal Transaksi -->
              <td class="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <Calendar class="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{{ formatDateIndo(tr.transaction_date) }}</span>
                </div>
              </td>

              <!-- Tipe Transaksi (INCOME / EXPENSE) -->
              <td class="py-3.5 px-4 text-center whitespace-nowrap">
                <span
                  v-if="tr.type === 'INCOME'"
                  class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
                >
                  <ArrowDownLeft class="w-3 h-3" />
                  <span>INCOME</span>
                </span>
                <span
                  v-else-if="tr.type === 'EXPENSE'"
                  class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200"
                >
                  <ArrowUpRight class="w-3 h-3" />
                  <span>EXPENSE</span>
                </span>
                <span
                  v-else
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200"
                >
                  {{ tr.type }}
                </span>
              </td>

              <!-- Kategori Transaksi -->
              <td class="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                {{ tr.category_name }}
              </td>

              <!-- Deskripsi / Keterangan -->
              <td class="py-3.5 px-4 text-slate-600 max-w-xs truncate" :title="tr.description || '-'">
                {{ tr.description || '-' }}
              </td>

              <!-- Jumlah Uang (Nominal) -->
              <td class="py-3.5 px-4 text-right whitespace-nowrap font-black">
                <span
                  :class="[
                    tr.type === 'INCOME' ? 'text-emerald-600' : (tr.type === 'EXPENSE' ? 'text-rose-600' : 'text-slate-800')
                  ]"
                >
                  {{ tr.type === 'INCOME' ? '+' : (tr.type === 'EXPENSE' ? '-' : '') }} {{ formatRupiah(tr.amount) }}
                </span>
              </td>

              <!-- Dicatat Oleh -->
              <td class="py-3.5 px-4 text-center whitespace-nowrap text-slate-500 font-medium">
                {{ tr.recorded_by_name || 'Admin' }}
              </td>

              <!-- Aksi (Edit & Hapus) -->
              <td class="py-3.5 px-4 text-center whitespace-nowrap">
                <div class="flex items-center justify-center gap-1.5">
                  <button
                    v-if="canUpdate"
                    @click="openEditModal(tr)"
                    class="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 transition-colors cursor-pointer"
                    title="Edit Transaksi"
                  >
                    <Edit3 class="w-3.5 h-3.5" />
                  </button>
                  <button
                    v-if="canDelete"
                    @click="confirmDelete(tr)"
                    class="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 transition-colors cursor-pointer"
                    title="Hapus Transaksi"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>

          <!-- Table Footer: Rangkuman Akumulasi -->
          <tfoot v-if="filteredTransactions.length > 0 && !loading" class="bg-slate-100/90 border-t-2 border-slate-300 font-bold text-xs text-slate-800">
            <tr>
              <td colspan="5" class="py-3.5 px-4 text-left uppercase tracking-wider text-slate-600">
                <div class="flex items-center gap-1.5">
                  <TrendingUp class="w-4 h-4 text-blue-600" />
                  <span>Total ({{ filteredTransactions.length }} Transaksi Ditampilkan):</span>
                </div>
              </td>
              <td class="py-3.5 px-4 text-right font-black text-sm whitespace-nowrap" :class="calculatedFilteredNet >= 0 ? 'text-blue-700' : 'text-rose-700'">
                {{ formatRupiah(calculatedFilteredNet) }}
              </td>
              <td colspan="2" class="py-3.5 px-4 text-center text-slate-400 text-[11px]">
                Kas Bersih
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- ==================== MODAL TAMBAH TRANSAKSI ==================== -->
    <Teleport to="body">
      <div
        v-if="isAddModalOpen"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto"
      >
        <div class="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col max-h-[90vh] my-auto">
        <!-- Modal Header -->
        <div class="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div>
            <h3 class="text-base sm:text-lg font-black text-slate-900">
              Tambah Transaksi Kas
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">Pilih tipe, kategori, dan masukkan nominal kas</p>
          </div>
          <button
            @click="isAddModalOpen = false"
            class="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <!-- Form Body -->
        <form @submit.prevent="submitCreateTransaction" class="p-6 overflow-y-auto space-y-4">
          <!-- 1. Pilihan Tipe Transaksi (INCOME / EXPENSE) -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Tipe Transaksi <span class="text-rose-500">*</span>
            </label>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                @click="onFormTypeChange('INCOME')"
                :class="[
                  'py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer',
                  form.type === 'INCOME'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-emerald-50/60 hover:bg-emerald-50 text-emerald-700 border-emerald-200'
                ]"
              >
                <ArrowDownLeft class="w-4 h-4" />
                <span>Pemasukan (INCOME)</span>
              </button>

              <button
                type="button"
                @click="onFormTypeChange('EXPENSE')"
                :class="[
                  'py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer',
                  form.type === 'EXPENSE'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-rose-50/60 hover:bg-rose-50 text-rose-700 border-rose-200'
                ]"
              >
                <ArrowUpRight class="w-4 h-4" />
                <span>Pengeluaran (EXPENSE)</span>
              </button>
            </div>
          </div>

          <!-- 2. Tanggal Transaksi -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Tanggal Transaksi <span class="text-rose-500">*</span>
            </label>
            <input
              type="date"
              v-model="form.transaction_date"
              required
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <!-- 3. Kategori (Dropdown sesuai tipe INCOME/EXPENSE saat itu) -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Kategori Transaksi ({{ form.type }}) <span class="text-rose-500">*</span>
            </label>
            <select
              v-model="form.category_id"
              required
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="" disabled>Pilih Kategori {{ form.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran' }}</option>
              <option
                v-for="cat in categoriesForCurrentFormType"
                :key="cat.id"
                :value="cat.id"
              >
                {{ cat.name }}
              </option>
            </select>
          </div>

          <!-- 4. Jumlah Uang (Nominal) -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Jumlah Uang (Nominal) <span class="text-rose-500">*</span>
            </label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">Rp</span>
              <input
                type="text"
                :value="formatInputDisplay(form.amount)"
                @input="handleAmountInput($event)"
                placeholder="0"
                required
                class="w-full pl-11 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-base font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <!-- Quick Add Amounts -->
            <div class="flex items-center gap-1.5 flex-wrap pt-2">
              <span class="text-[10px] font-semibold text-slate-400 mr-1">+ Cepat:</span>
              <button
                type="button"
                @click="addQuickAmount(50000)"
                class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                +50rb
              </button>
              <button
                type="button"
                @click="addQuickAmount(100000)"
                class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                +100rb
              </button>
              <button
                type="button"
                @click="addQuickAmount(500000)"
                class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                +500rb
              </button>
              <button
                type="button"
                @click="addQuickAmount(1000000)"
                class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                +1jt
              </button>
              <button
                type="button"
                @click="form.amount = 0"
                class="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold cursor-pointer ml-auto"
              >
                Reset
              </button>
            </div>
          </div>

          <!-- 5. Deskripsi / Keterangan -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Deskripsi / Keterangan Transaksi
            </label>
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="Contoh: Pembelian alat peraga sekolah minggu kelas balita"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            ></textarea>
          </div>

          <!-- Modal Actions -->
          <div class="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              @click="isAddModalOpen = false"
              class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="submitting || !form.category_id || form.amount <= 0"
              class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-sm cursor-pointer transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw v-if="submitting" class="w-3.5 h-3.5 animate-spin" />
              <span>{{ submitting ? 'Menyimpan...' : 'Simpan Transaksi' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>

    <!-- ==================== MODAL EDIT TRANSAKSI ==================== -->
    <Teleport to="body">
      <div
        v-if="isEditModalOpen"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto"
      >
        <div class="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col max-h-[90vh] my-auto">
        <!-- Modal Header -->
        <div class="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div>
            <h3 class="text-base sm:text-lg font-black text-slate-900">
              Edit Transaksi Kas
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">Perbarui tanggal, kategori, atau nominal transaksi</p>
          </div>
          <button
            @click="isEditModalOpen = false"
            class="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <!-- Form Body -->
        <form @submit.prevent="submitUpdateTransaction" class="p-6 overflow-y-auto space-y-4">
          <!-- 1. Pilihan Tipe Transaksi (INCOME / EXPENSE) -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Tipe Transaksi <span class="text-rose-500">*</span>
            </label>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                @click="onEditTypeChange('INCOME')"
                :class="[
                  'py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer',
                  editForm.type === 'INCOME'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-emerald-50/60 hover:bg-emerald-50 text-emerald-700 border-emerald-200'
                ]"
              >
                <ArrowDownLeft class="w-4 h-4" />
                <span>Pemasukan (INCOME)</span>
              </button>

              <button
                type="button"
                @click="onEditTypeChange('EXPENSE')"
                :class="[
                  'py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer',
                  editForm.type === 'EXPENSE'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-rose-50/60 hover:bg-rose-50 text-rose-700 border-rose-200'
                ]"
              >
                <ArrowUpRight class="w-4 h-4" />
                <span>Pengeluaran (EXPENSE)</span>
              </button>
            </div>
          </div>

          <!-- 2. Tanggal Transaksi -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Tanggal Transaksi <span class="text-rose-500">*</span>
            </label>
            <input
              type="date"
              v-model="editForm.transaction_date"
              required
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <!-- 3. Kategori -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Kategori Transaksi ({{ editForm.type }}) <span class="text-rose-500">*</span>
            </label>
            <select
              v-model="editForm.category_id"
              required
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="" disabled>Pilih Kategori</option>
              <option
                v-for="cat in categoriesForEditFormType"
                :key="cat.id"
                :value="cat.id"
              >
                {{ cat.name }}
              </option>
            </select>
          </div>

          <!-- 4. Jumlah Uang (Nominal) -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Jumlah Uang (Nominal) <span class="text-rose-500">*</span>
            </label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">Rp</span>
              <input
                type="text"
                :value="formatInputDisplay(editForm.amount)"
                @input="handleEditAmountInput($event)"
                placeholder="0"
                required
                class="w-full pl-11 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-base font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <!-- 5. Deskripsi -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Deskripsi / Keterangan Transaksi
            </label>
            <textarea
              v-model="editForm.description"
              rows="3"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            ></textarea>
          </div>

          <!-- Modal Actions -->
          <div class="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              @click="isEditModalOpen = false"
              class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="submitting || !editForm.category_id || editForm.amount <= 0"
              class="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm cursor-pointer transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw v-if="submitting" class="w-3.5 h-3.5 animate-spin" />
              <span>{{ submitting ? 'Menyimpan...' : 'Perbarui Transaksi' }}</span>
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
import apiClient from '@/api/axios'
import {
  Receipt,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Plus,
  Filter,
  Search,
  Calendar,
  Trash2,
  Edit3,
  FileText,
  TrendingUp
} from 'lucide-vue-next'
import { usePermissions } from '@/composables/usePermissions'

const { canRead, canCreate, canShow, canUpdate, canDelete, canPrint } = usePermissions()

const transactions = ref([])
const categories = ref([])
const loading = ref(false)
const submitting = ref(false)

// Filters State
const currentTypeFilter = ref('ALL') // 'ALL', 'INCOME', 'EXPENSE'
const filterCategory = ref('')
const filterMonth = ref('')
const filterYear = ref(new Date().getFullYear())
const searchQuery = ref('')

const alert = reactive({
  type: 'success',
  message: ''
})

const summary = reactive({
  total_income: 0,
  total_expense: 0,
  net_balance: 0,
  total_count: 0,
  income_count: 0,
  expense_count: 0
})

// Modal states
const isAddModalOpen = ref(false)
const isEditModalOpen = ref(false)

const form = reactive({
  transaction_date: '',
  category_id: '',
  type: 'INCOME',
  amount: 0,
  description: ''
})

const editForm = reactive({
  id: null,
  transaction_date: '',
  category_id: '',
  type: 'INCOME',
  amount: 0,
  description: ''
})

// Available Years for filter
const availableYears = computed(() => {
  const cur = new Date().getFullYear()
  return [cur + 1, cur, cur - 1, cur - 2, cur - 3]
})

// Month name helper
const getMonthName = (m) => {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]
  return months[m - 1] || ''
}

// Categories list according to current type filter in toolbar
const availableCategoriesForFilter = computed(() => {
  if (currentTypeFilter.value === 'INCOME') {
    return categories.value.filter(c => c.group === 'm_income')
  }
  if (currentTypeFilter.value === 'EXPENSE') {
    return categories.value.filter(c => c.group === 'm_expense')
  }
  return categories.value.filter(c => ['m_income', 'm_expense'].includes(c.group))
})

// Categories dropdown for Add Form (group m_income untuk INCOME, group m_expense untuk EXPENSE)
const categoriesForCurrentFormType = computed(() => {
  const targetGroup = form.type === 'INCOME' ? 'm_income' : 'm_expense'
  return categories.value.filter(c => c.group === targetGroup)
})

// Categories dropdown for Edit Form (group m_income untuk INCOME, group m_expense untuk EXPENSE)
const categoriesForEditFormType = computed(() => {
  const targetGroup = editForm.type === 'INCOME' ? 'm_income' : 'm_expense'
  return categories.value.filter(c => c.group === targetGroup)
})

// Filtered transactions for Table
const filteredTransactions = computed(() => {
  let result = transactions.value

  // Type filter
  if (currentTypeFilter.value !== 'ALL') {
    result = result.filter(tr => tr.type === currentTypeFilter.value)
  }

  // Search filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    result = result.filter(tr => {
      const matchDesc = tr.description && tr.description.toLowerCase().includes(q)
      const matchCat = tr.category_name && tr.category_name.toLowerCase().includes(q)
      const matchRecorder = tr.recorded_by_name && tr.recorded_by_name.toLowerCase().includes(q)
      return matchDesc || matchCat || matchRecorder
    })
  }

  return result
})

// Filtered Net Calculation
const calculatedFilteredNet = computed(() => {
  return filteredTransactions.value.reduce((acc, tr) => {
    const amt = parseFloat(tr.amount) || 0
    return tr.type === 'INCOME' ? acc + amt : acc - amt
  }, 0)
})

// Currency Formatter
const formatRupiah = (value) => {
  const num = Number(value) || 0
  return 'Rp ' + num.toLocaleString('id-ID')
}

// Format input display with thousands separator
const formatInputDisplay = (val) => {
  if (val === undefined || val === null || val === 0 || val === '') return ''
  const num = parseInt(String(val).replace(/\D/g, ''), 10)
  return isNaN(num) ? '' : num.toLocaleString('id-ID')
}

// Handle Amount Input in Add Form
const handleAmountInput = (e) => {
  const raw = e.target.value.replace(/\D/g, '')
  form.amount = raw ? parseInt(raw, 10) : 0
}

// Quick Add Amount
const addQuickAmount = (nominal) => {
  form.amount = (form.amount || 0) + nominal
}

// Handle Amount Input in Edit Form
const handleEditAmountInput = (e) => {
  const raw = e.target.value.replace(/\D/g, '')
  editForm.amount = raw ? parseInt(raw, 10) : 0
}

// Date Formatter (DD MMMM YYYY)
const formatDateIndo = (dateStr) => {
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

// Set Type Filter (ALL, INCOME, EXPENSE)
const setTypeFilter = (type) => {
  currentTypeFilter.value = type
  filterCategory.value = ''
  fetchData()
}

// Fetch all transactions and overview
const fetchData = async () => {
  loading.value = true
  try {
    const params = {}
    if (currentTypeFilter.value !== 'ALL') {
      params.type = currentTypeFilter.value
    }
    if (filterCategory.value) {
      params.category_id = filterCategory.value
    }
    if (filterMonth.value) {
      params.month = filterMonth.value
    }
    if (filterYear.value) {
      params.year = filterYear.value
    }

    const res = await apiClient.get('/kas-lainnya', { params })
    if (res.success && res.data) {
      transactions.value = res.data.transactions || []
      categories.value = res.data.categories || []
      Object.assign(summary, res.data.summary || {})
    }
  } catch (error) {
    console.error('Error fetchData KasLainnya:', error)
    alert.type = 'error'
    alert.message = error.message || 'Gagal memuat data transaksi kas'
  } finally {
    loading.value = false
  }
}

// Open Add Modal
const openAddModal = (initialType = 'INCOME') => {
  const today = new Date().toISOString().split('T')[0]
  form.transaction_date = today
  form.type = initialType === 'EXPENSE' ? 'EXPENSE' : 'INCOME'
  form.amount = 0
  form.description = ''

  // Auto-select first category of this group if available
  const targetGroup = form.type === 'INCOME' ? 'm_income' : 'm_expense'
  const matchingCats = categories.value.filter(c => c.group === targetGroup)
  form.category_id = matchingCats.length > 0 ? matchingCats[0].id : ''

  isAddModalOpen.value = true
}

// Change type in add form
const onFormTypeChange = (newType) => {
  form.type = newType
  const targetGroup = newType === 'INCOME' ? 'm_income' : 'm_expense'
  const matchingCats = categories.value.filter(c => c.group === targetGroup)
  form.category_id = matchingCats.length > 0 ? matchingCats[0].id : ''
}

// Submit Create Transaction
const submitCreateTransaction = async () => {
  if (!form.transaction_date) {
    alert.type = 'error'
    alert.message = 'Tanggal transaksi wajib diisi'
    return
  }
  if (!form.category_id) {
    alert.type = 'error'
    alert.message = 'Kategori transaksi wajib dipilih'
    return
  }
  if (form.amount <= 0) {
    alert.type = 'error'
    alert.message = 'Jumlah uang harus lebih besar dari 0'
    return
  }

  submitting.value = true
  alert.message = ''
  try {
    const payload = {
      transaction_date: form.transaction_date,
      category_id: form.category_id,
      type: form.type,
      amount: form.amount,
      description: form.description ? form.description.trim() : null
    }

    const res = await apiClient.post('/kas-lainnya', payload)
    if (res.success) {
      alert.type = 'success'
      alert.message = `Transaksi kas ${form.type} sebesar ${formatRupiah(form.amount)} berhasil disimpan!`
      isAddModalOpen.value = false
      await fetchData()
    }
  } catch (error) {
    alert.type = 'error'
    alert.message = error.message || 'Gagal menyimpan transaksi kas'
  } finally {
    submitting.value = false
  }
}

// Open Edit Modal
const openEditModal = (tr) => {
  editForm.id = tr.id
  editForm.transaction_date = tr.transaction_date ? tr.transaction_date.substring(0, 10) : ''
  editForm.type = tr.type
  editForm.category_id = tr.category_id
  editForm.amount = parseFloat(tr.amount) || 0
  editForm.description = tr.description || ''
  isEditModalOpen.value = true
}

// Change type in edit form
const onEditTypeChange = (newType) => {
  editForm.type = newType
  const targetGroup = newType === 'INCOME' ? 'm_income' : 'm_expense'
  const matchingCats = categories.value.filter(c => c.group === targetGroup)
  if (!matchingCats.some(c => c.id === editForm.category_id)) {
    editForm.category_id = matchingCats.length > 0 ? matchingCats[0].id : ''
  }
}

// Submit Update Transaction
const submitUpdateTransaction = async () => {
  if (!editForm.transaction_date) {
    alert.type = 'error'
    alert.message = 'Tanggal transaksi wajib diisi'
    return
  }
  if (!editForm.category_id) {
    alert.type = 'error'
    alert.message = 'Kategori transaksi wajib dipilih'
    return
  }
  if (editForm.amount <= 0) {
    alert.type = 'error'
    alert.message = 'Jumlah uang harus lebih besar dari 0'
    return
  }

  submitting.value = true
  alert.message = ''
  try {
    const payload = {
      transaction_date: editForm.transaction_date,
      category_id: editForm.category_id,
      type: editForm.type,
      amount: editForm.amount,
      description: editForm.description ? editForm.description.trim() : null
    }

    const res = await apiClient.put(`/kas-lainnya/${editForm.id}`, payload)
    if (res.success) {
      alert.type = 'success'
      alert.message = `Transaksi kas berhasil diperbarui!`
      isEditModalOpen.value = false
      await fetchData()
    }
  } catch (error) {
    alert.type = 'error'
    alert.message = error.message || 'Gagal memperbarui transaksi kas'
  } finally {
    submitting.value = false
  }
}

// Delete Transaction
const confirmDelete = async (tr) => {
  const label = `${tr.type} (${tr.category_name}) senilai ${formatRupiah(tr.amount)}`
  if (confirm(`Apakah Anda yakin ingin menghapus transaksi ${label}?`)) {
    try {
      const res = await apiClient.delete(`/kas-lainnya/${tr.id}`)
      if (res.success) {
        alert.type = 'success'
        alert.message = `Transaksi kas berhasil dihapus`
        await fetchData()
      }
    } catch (error) {
      alert.type = 'error'
      alert.message = error.message || 'Gagal menghapus transaksi'
    }
  }
}

onMounted(() => {
  fetchData()
})
</script>
