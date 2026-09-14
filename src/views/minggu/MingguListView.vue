<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Jadwal Ibadah Minggu</h1>
        <p class="text-sm text-slate-500 mt-0.5">Kelola agenda ibadah hari Minggu, penugasan pelayanan, dan absensi Guru Sekolah Minggu (GSM)</p>
      </div>

      <button
        v-if="canCreate"
        @click="openAddModal"
        class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>➕</span>
        <span>Tambah Acara Minggu</span>
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
        @click="fetchMinggu"
        :disabled="loading"
        class="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        title="Muat ulang data"
      >
        <span :class="['inline-block', loading ? 'animate-spin' : '']">🔄</span>
        <span>Refresh</span>
      </button>
    </div>

    <!-- Table Minggu -->
    <div class="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-600 whitespace-nowrap">
          <thead class="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
            <tr>
              <th class="py-3 px-4 w-12 text-center">No</th>
              <th class="py-3 px-4 min-w-[200px]">Acara</th>
              <th class="py-3 px-4 min-w-[140px]">Tanggal</th>
              <th class="py-3 px-4 min-w-[260px]">Pelayanan</th>
              <th class="py-3 px-4 text-center min-w-[150px]">Jumlah Kehadiran</th>
              <th class="py-3 px-4 text-center w-48">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-normal">
            <!-- Loading -->
            <tr v-if="loading">
              <td colspan="6" class="py-12 text-center text-slate-400">
                <span class="inline-block w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-2"></span>
                Memuat data acara Minggu...
              </td>
            </tr>

            <!-- Empty -->
            <tr v-else-if="filteredMinggu.length === 0">
              <td colspan="6" class="py-12 text-center text-slate-400">
                <p class="text-sm font-medium text-slate-600">Belum ada jadwal acara Minggu.</p>
                <p class="text-xs text-slate-400 mt-1">Klik tombol "Tambah Acara Minggu" untuk membuat jadwal baru.</p>
              </td>
            </tr>

            <!-- Rows -->
            <tr
              v-for="(item, index) in filteredMinggu"
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
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span class="font-mono text-indigo-700">{{ item.title }}</span>
                </div>
              </td>

              <!-- Tanggal -->
              <td class="py-3.5 px-4 text-slate-700 font-medium">
                {{ formatTanggal(item.event_date) }}
              </td>

              <!-- Kolom Pelayanan (Nama GSM berdasarkan Kategori dari t_assignments) -->
              <td class="py-3.5 px-4">
                <div v-if="!item.assignments || item.assignments.length === 0" class="text-slate-400 text-[11px] italic">
                  Belum ada kategori pelayanan
                </div>
                <div v-else class="space-y-1 max-w-[280px]">
                  <div
                    v-for="assign in item.assignments"
                    :key="assign.assignment_id"
                    class="text-[11px] flex items-center justify-between gap-2 py-0.5 px-2 rounded-md bg-slate-50 border border-slate-100"
                  >
                    <span class="font-semibold text-slate-700 truncate">{{ assign.category_name }}:</span>
                    <span
                      v-if="assign.user_name"
                      class="font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded text-[10px] truncate max-w-[140px]"
                      :title="assign.user_name"
                    >
                      {{ assign.user_name }}
                    </span>
                    <span v-else class="text-slate-400 italic text-[10px]">
                      Belum di-assign
                    </span>
                  </div>
                </div>
              </td>

              <!-- Jumlah Kehadiran (Dihitung dari t_attendances dengan id_event yang sesuai) -->
              <td class="py-3.5 px-4 text-center">
                <div
                  v-if="item.is_attendance"
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-semibold text-xs"
                  title="Jumlah GSM yang sudah absen / Total GSM terdaftar"
                >
                  <span>👥</span>
                  <span>{{ item.attended_count }} / {{ item.total_attendance }} Kehadiran</span>
                </div>
                <div
                  v-else
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-500 font-medium text-xs"
                  title="Acara ini tidak melakukan absensi"
                >
                  <span class="text-slate-400">🚫</span>
                  <span>Tidak Melakukan Absensi</span>
                </div>
              </td>

              <!-- Aksi (Atur Pelayanan, Detail, & Hapus) -->
              <td class="py-3.5 px-4 text-center">
                <div class="flex items-center justify-center gap-1.5">
                  <button
                    v-if="canUpdate"
                    @click="openAssignmentModal(item)"
                    class="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                    title="Atur Penugasan Pelayanan GSM"
                  >
                    <span>📋</span>
                    <span>Pelayanan</span>
                  </button>
                  <button
                    v-if="canUpdate"
                    @click="openEditModal(item)"
                    class="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                    title="Edit Acara Minggu"
                  >
                    <span>✏️</span>
                    <span>Edit</span>
                  </button>
                  <button
                    v-if="canShow"
                    @click="openDetailModal(item)"
                    class="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                    title="Lihat Daftar GSM yang Berhadir"
                  >
                    <span>👁️</span>
                    <span>Detail</span>
                  </button>
                  <button
                    v-if="canDelete"
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

    <!-- ==================== MODAL TAMBAH MINGGU ==================== -->
    <Teleport to="body">
      <div
        v-if="isAddModalOpen"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto"
      >
        <div class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 w-full max-w-md shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] space-y-5 my-auto">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 class="text-base font-bold text-slate-900">Tambah Acara Minggu Baru</h3>
            <p class="text-xs text-slate-500 mt-0.5">Tentukan tanggal ibadah Minggu dan pengaturan absensi GSM</p>
          </div>
          <button @click="isAddModalOpen = false" class="text-slate-400 hover:text-slate-600 cursor-pointer text-lg">✕</button>
        </div>

        <form @submit.prevent="submitCreateMinggu" class="space-y-4">
          <!-- 1. Input Tanggal (Diisi terlebih dahulu) & Validasi Hari Minggu -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Tanggal Acara <span class="text-rose-500">*</span>
              </label>
              <span class="text-[10px] text-emerald-600 font-medium font-semibold">Harus Hari Minggu</span>
            </div>
            <input
              v-model="form.event_date"
              @change="onDateChange"
              @input="onDateChange"
              type="date"
              required
              :class="[
                'w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border text-slate-900 text-sm focus:bg-white focus:outline-none transition-colors cursor-pointer',
                form.event_date && !isSundayDate
                  ? 'border-rose-400 focus:border-rose-500 bg-rose-50/30'
                  : 'border-slate-300 focus:border-indigo-600'
              ]"
            />

            <!-- Indikator Validasi Hari Minggu -->
            <div v-if="form.event_date" class="mt-1.5">
              <p v-if="!isSundayDate" class="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                <span>⚠️</span>
                <span>Tanggal yang dipilih bukan hari Minggu! Harap pilih tanggal yang jatuh pada hari Minggu.</span>
              </p>
              <p v-else class="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <span>✓</span>
                <span>Tanggal valid: Hari Minggu</span>
              </p>
            </div>
          </div>

          <!-- 2. Acara / Title (Terbentuk Otomatis & Read Only) -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Acara / Title <span class="text-slate-400 font-normal lowercase">(read-only)</span>
              </label>
              <span class="text-[10px] text-indigo-600 font-medium">Format: MINGGU_TANGGAL</span>
            </div>
            <input
              v-model="form.title"
              type="text"
              readonly
              placeholder="Pilih tanggal terlebih dahulu..."
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-mono text-sm focus:outline-none cursor-not-allowed font-bold"
            />
          </div>

          <!-- Info Otomatisasi Penugasan Kategori -->
          <div class="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-800 leading-relaxed flex items-start gap-2">
            <span class="text-sm">ℹ️</span>
            <span>Sistem akan otomatis membuat penugasan pada seluruh kategori pelayanan aktif (user_id awal kosong) yang nantinya dapat Anda atur pada tombol <strong>Pelayanan</strong>.</span>
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
              Jika dicentang, sistem otomatis mendaftarkan seluruh user dengan role <strong>GSM</strong> ke daftar absensi acara Minggu ini.
            </p>
          </div>

          <!-- 4. Checkbox ADA PERSEMBAHAN (Default Tercentang) -->
          <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <label class="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                v-model="form.is_persembahan"
                type="checkbox"
                class="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
              />
              <span class="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <span>💰</span>
                <span>Ada Persembahan</span>
              </span>
            </label>
            <p class="text-[11px] text-slate-500 leading-relaxed pl-6">
              Jika dicentang, acara ini akan masuk ke halaman <strong>Persembahan</strong> untuk pencatatan dan rekapitulasi kas keuangan.
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
              :disabled="submitting || !form.event_date || !isSundayDate"
              class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {{ submitting ? 'Menyimpan...' : 'Simpan Acara' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>

    <!-- ==================== MODAL EDIT ACARA MINGGU ==================== -->
    <Teleport to="body">
      <div
        v-if="isEditModalOpen"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto"
      >
        <div class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 w-full max-w-md shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] space-y-5 my-auto">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 class="text-base font-bold text-slate-900">Edit Acara Minggu</h3>
            <p class="text-xs text-slate-500 mt-0.5">Ubah tanggal acara, status absensi, dan opsi persembahan</p>
          </div>
          <button @click="isEditModalOpen = false" class="text-slate-400 hover:text-slate-600 cursor-pointer text-lg">✕</button>
        </div>

        <form @submit.prevent="submitUpdateMinggu" class="space-y-4">
          <!-- 1. Input Tanggal (Harus Hari Minggu) -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Tanggal Acara <span class="text-rose-500">*</span>
              </label>
              <span class="text-[10px] text-emerald-600 font-medium font-semibold">Harus Hari Minggu</span>
            </div>
            <input
              v-model="editForm.event_date"
              @change="onEditDateChange"
              @input="onEditDateChange"
              type="date"
              required
              :class="[
                'w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border text-slate-900 text-sm focus:bg-white focus:outline-none transition-colors cursor-pointer',
                editForm.event_date && !isEditSundayDate
                  ? 'border-rose-400 focus:border-rose-500 bg-rose-50/30'
                  : 'border-slate-300 focus:border-indigo-600'
              ]"
            />

            <!-- Indikator Validasi Hari Minggu -->
            <div v-if="editForm.event_date" class="mt-1.5">
              <p v-if="!isEditSundayDate" class="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                <span>⚠️</span>
                <span>Tanggal yang dipilih bukan hari Minggu!</span>
              </p>
              <p v-else class="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <span>✓</span>
                <span>Tanggal valid: Hari Minggu</span>
              </p>
            </div>
          </div>

          <!-- 2. Acara / Title (Terbentuk Otomatis) -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Acara / Title <span class="text-slate-400 font-normal lowercase">(read-only)</span>
              </label>
              <span class="text-[10px] text-indigo-600 font-medium">Format: MINGGU_TANGGAL</span>
            </div>
            <input
              v-model="editForm.title"
              type="text"
              readonly
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-mono text-sm focus:outline-none cursor-not-allowed font-bold"
            />
          </div>

          <!-- 3. Checkbox MELAKUKAN ABSENSI -->
          <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <label class="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                v-model="editForm.is_attendance"
                type="checkbox"
                class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4"
              />
              <span class="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Melakukan Absensi
              </span>
            </label>
            <p class="text-[11px] text-slate-500 leading-relaxed pl-6">
              Status absensi untuk seluruh user GSM pada acara Minggu ini.
            </p>
          </div>

          <!-- 4. Checkbox ADA PERSEMBAHAN -->
          <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <label class="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                v-model="editForm.is_persembahan"
                type="checkbox"
                class="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
              />
              <span class="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <span>💰</span>
                <span>Ada Persembahan</span>
              </span>
            </label>
            <p class="text-[11px] text-slate-500 leading-relaxed pl-6">
              Jika dicentang, acara ini akan tampil di halaman <strong>Persembahan</strong> untuk pencatatan kas keuangan.
            </p>
          </div>

          <!-- Actions -->
          <div class="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              @click="isEditModalOpen = false"
              class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="submitting || !editForm.event_date || !isEditSundayDate"
              class="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {{ submitting ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>

    <!-- ==================== MODAL ATUR PENUGASAN PELAYANAN ==================== -->
    <Teleport to="body">
      <div
        v-if="isAssignmentModalOpen"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto"
      >
        <div class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 w-full max-w-lg shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] space-y-5 my-auto max-h-[90vh] flex flex-col">
        <!-- Header -->
        <div class="flex items-start justify-between pb-3 border-b border-slate-100 shrink-0">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono text-[11px] font-bold border border-indigo-100">
                PENUGASAN
              </span>
              <h3 class="text-base font-bold text-slate-900">{{ currentMinggu?.title }}</h3>
            </div>
            <p class="text-xs text-slate-500 mt-1">
              Atur Guru Sekolah Minggu (GSM) yang bertugas untuk setiap kategori pelayanan
            </p>
          </div>
          <button @click="isAssignmentModalOpen = false" class="text-slate-400 hover:text-slate-600 cursor-pointer text-lg">✕</button>
        </div>

        <!-- Form Assignments List -->
        <div class="overflow-y-auto flex-1 space-y-3.5 pr-1">
          <div
            v-if="assignmentForm.list.length === 0"
            class="py-8 text-center text-slate-400 text-xs"
          >
            Tidak ada kategori penugasan pada acara ini.
          </div>

          <div
            v-for="item in assignmentForm.list"
            :key="item.assignment_id"
            class="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5"
          >
            <div class="flex items-center justify-between">
              <label class="text-xs font-bold text-slate-800 uppercase tracking-wide">
                {{ item.category_name }}
              </label>
              <span v-if="item.user_name" class="text-[10px] text-emerald-600 font-medium">
                Ditugaskan
              </span>
              <span v-else class="text-[10px] text-slate-400 italic">
                Belum di-assign
              </span>
            </div>

            <!-- Dropdown Pilihan GSM -->
            <select
              v-model="item.user_id"
              class="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-indigo-600 cursor-pointer"
            >
              <option value="">-- Belum Ditugaskan / Kosongkan --</option>
              <option
                v-for="gsm in availableGsmUsers"
                :key="gsm.id"
                :value="gsm.id"
              >
                {{ gsm.name }} {{ gsm.email ? `(${gsm.email})` : '' }}
              </option>
            </select>
          </div>
        </div>

        <!-- Actions -->
        <div class="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 shrink-0">
          <button
            type="button"
            @click="isAssignmentModalOpen = false"
            class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            @click="submitUpdateAssignments"
            :disabled="savingAssignments"
            class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {{ savingAssignments ? 'Menyimpan...' : 'Simpan Penugasan' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>

    <!-- ==================== MODAL DETAIL KEHADIRAN GSM ==================== -->
    <Teleport to="body">
      <div
        v-if="isDetailModalOpen"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto"
      >
        <div class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 w-full max-w-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] space-y-5 my-auto max-h-[90vh] flex flex-col">
        <!-- Header -->
        <div class="flex items-start justify-between pb-3 border-b border-slate-100 shrink-0">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-mono text-[11px] font-bold border border-emerald-100">
                MINGGU
              </span>
              <h3 class="text-base font-bold text-slate-900">{{ currentMinggu?.title }}</h3>
            </div>
            <p class="text-xs text-slate-500 mt-1">
              Tanggal: <strong>{{ formatTanggal(currentMinggu?.event_date) }}</strong> &bull;
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
  </Teleport>

    <!-- ==================== POP-UP PESAN ACARA SUDAH ADA ==================== -->
    <Teleport to="body">
      <div
        v-if="duplicatePopup.isOpen"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto"
      >
        <div class="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] space-y-4 text-center my-auto">
        <div class="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto text-2xl shadow-sm">
          ⚠️
        </div>
        <div>
          <h3 class="text-base font-extrabold text-slate-900">
            Acara Ibadah Minggu Sudah Ada!
          </h3>
          <p class="text-xs text-slate-600 mt-1 leading-relaxed">
            {{ duplicatePopup.message }}
          </p>
        </div>

        <div v-if="duplicatePopup.existingTitle" class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-1">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Acara Terdaftar:</span>
          <p class="text-xs font-mono font-bold text-emerald-700">{{ duplicatePopup.existingTitle }}</p>
          <p class="text-[11px] text-slate-500">Tanggal: {{ formatTanggal(duplicatePopup.date) }}</p>
        </div>

        <button
          @click="duplicatePopup.isOpen = false"
          class="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
        >
          Mengerti & Ganti Tanggal
        </button>
      </div>
    </div>
  </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import apiClient from '@/api/axios'
import { usePermissions } from '@/composables/usePermissions'

const { canRead, canCreate, canShow, canUpdate, canDelete, canPrint } = usePermissions()

const mingguEvents = ref([])
const loading = ref(false)
const submitting = ref(false)
const savingAssignments = ref(false)
const searchQuery = ref('')

const isAddModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isDetailModalOpen = ref(false)
const isAssignmentModalOpen = ref(false)

const currentMinggu = ref(null)
const availableGsmUsers = ref([])

const assignmentForm = reactive({
  list: []
})

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
  is_attendance: true, // Default mencentang checkbox MELAKUKAN ABSENSI
  is_persembahan: true // Default mencentang checkbox ADA PERSEMBAHAN
})

const editForm = reactive({
  id: null,
  event_date: '',
  title: '',
  is_attendance: true,
  is_persembahan: true
})

const isEditSundayDate = computed(() => {
  if (!editForm.event_date) return false
  const d = new Date(`${editForm.event_date}T00:00:00`)
  return !isNaN(d.getTime()) && d.getDay() === 0
})

const onEditDateChange = () => {
  if (editForm.event_date) {
    editForm.title = `MINGGU_${editForm.event_date}`
    const existing = (mingguEvents.value || []).find(
      m => m.event_date === editForm.event_date && m.id !== editForm.id
    )
    if (existing) {
      showDuplicatePopup(editForm.event_date, existing.title)
    }
  } else {
    editForm.title = ''
  }
}

// Pop-up Peringatan Acara Sudah Ada
const duplicatePopup = reactive({
  isOpen: false,
  message: '',
  date: '',
  existingTitle: ''
})

const showDuplicatePopup = (date, existingTitle, customMsg = '') => {
  duplicatePopup.isOpen = true
  duplicatePopup.date = date
  duplicatePopup.existingTitle = existingTitle
  duplicatePopup.message = customMsg || `Acara Ibadah Minggu untuk tanggal ${formatTanggal(date)} sudah terdaftar di sistem. Anda tidak dapat membuat acara Minggu ganda pada tanggal yang sama.`
}

// Pengecekan apakah tanggal yang dipilih jatuh pada hari Minggu (0 = Sunday)
const isSundayDate = computed(() => {
  if (!form.event_date) return false
  const d = new Date(`${form.event_date}T00:00:00`)
  return !isNaN(d.getTime()) && d.getDay() === 0
})

// Format tanggal lokal (Contoh: 13 September 2026)
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

// Saat tanggal diinput, otomatis bentuk title MINGGU_TANGGAL dan cek duplikasi
const onDateChange = () => {
  if (form.event_date) {
    form.title = `MINGGU_${form.event_date}`
    const existing = (mingguEvents.value || []).find(m => m.event_date === form.event_date)
    if (existing) {
      showDuplicatePopup(form.event_date, existing.title)
    }
  } else {
    form.title = ''
  }
}

// Fetch seluruh acara Minggu
const fetchMinggu = async () => {
  loading.value = true
  try {
    const res = await apiClient.get('/minggu')
    if (res.success) {
      mingguEvents.value = res.data || []
    }
  } catch (error) {
    console.error('Error fetchMinggu:', error)
    alert.type = 'error'
    alert.message = error.message || 'Gagal memuat daftar acara Minggu'
  } finally {
    loading.value = false
  }
}

// Filtered Events
const filteredMinggu = computed(() => {
  if (!searchQuery.value.trim()) return mingguEvents.value
  const q = searchQuery.value.toLowerCase().trim()
  return mingguEvents.value.filter(s => {
    const matchTitle = s.title && s.title.toLowerCase().includes(q)
    const matchDate = s.event_date && s.event_date.toLowerCase().includes(q)
    return matchTitle || matchDate
  })
})

// Menghitung tanggal hari Minggu terdekat/berikutnya dari hari ini
const getNextSunday = () => {
  const today = new Date()
  const day = today.getDay()
  const diff = (7 - day) % 7 // Jika hari ini Minggu (0), diff = 0; jika hari lain, menuju Minggu berikutnya
  const nextSunday = new Date(today)
  nextSunday.setDate(today.getDate() + diff)
  
  const yyyy = nextSunday.getFullYear()
  const mm = String(nextSunday.getMonth() + 1).padStart(2, '0')
  const dd = String(nextSunday.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

// Buka Modal Tambah
const openAddModal = () => {
  const defaultSunday = getNextSunday()
  form.event_date = defaultSunday
  form.title = `MINGGU_${defaultSunday}`
  form.is_attendance = true // Default tercentang
  form.is_persembahan = true // Default tercentang
  isAddModalOpen.value = true
}

// Submit Acara Minggu Baru
const submitCreateMinggu = async () => {
  if (!form.event_date) {
    alert.type = 'error'
    alert.message = 'Tanggal acara wajib dipilih'
    return
  }

  if (!isSundayDate.value) {
    alert.type = 'error'
    alert.message = 'Tanggal yang dipilih haruslah hari Minggu!'
    return
  }

  // Validasi: Tidak boleh ada acara Minggu dengan tanggal yang sama
  const existing = (mingguEvents.value || []).find(m => m.event_date === form.event_date)
  if (existing) {
    showDuplicatePopup(form.event_date, existing.title)
    return
  }

  submitting.value = true
  alert.message = ''
  try {
    const payload = {
      event_date: form.event_date,
      is_attendance: Boolean(form.is_attendance),
      is_persembahan: Boolean(form.is_persembahan)
    }

    const res = await apiClient.post('/minggu', payload)
    if (res.success) {
      alert.type = 'success'
      alert.message = `Acara "${res.data?.title || form.title}" berhasil dibuat dengan ${res.data?.assignments_created || 0} kategori penugasan dan ${res.data?.total_attendance || 0} GSM terdaftar!`
      isAddModalOpen.value = false
      await fetchMinggu()
    }
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Gagal membuat acara Minggu'
    if (errorMsg.toLowerCase().includes('sudah ada') || errorMsg.toLowerCase().includes('duplikat')) {
      showDuplicatePopup(form.event_date, form.title, errorMsg)
    } else {
      alert.type = 'error'
      alert.message = errorMsg
    }
  } finally {
    submitting.value = false
  }
}

// Buka Modal Edit
const openEditModal = (item) => {
  editForm.id = item.id
  editForm.event_date = item.event_date
  editForm.title = item.title
  editForm.is_attendance = Boolean(item.is_attendance)
  editForm.is_persembahan = item.is_persembahan !== undefined ? Boolean(item.is_persembahan) : true
  isEditModalOpen.value = true
}

// Submit Update Acara Minggu
const submitUpdateMinggu = async () => {
  if (!editForm.event_date) {
    alert.type = 'error'
    alert.message = 'Tanggal acara wajib dipilih'
    return
  }

  if (!isEditSundayDate.value) {
    alert.type = 'error'
    alert.message = 'Tanggal yang dipilih haruslah hari Minggu!'
    return
  }

  const existing = (mingguEvents.value || []).find(
    m => m.event_date === editForm.event_date && m.id !== editForm.id
  )
  if (existing) {
    showDuplicatePopup(editForm.event_date, existing.title)
    return
  }

  submitting.value = true
  alert.message = ''
  try {
    const payload = {
      event_date: editForm.event_date,
      is_attendance: Boolean(editForm.is_attendance),
      is_persembahan: Boolean(editForm.is_persembahan)
    }

    const res = await apiClient.put(`/minggu/${editForm.id}`, payload)
    if (res.success) {
      alert.type = 'success'
      alert.message = `Acara "${res.data?.title || editForm.title}" berhasil diperbarui!`
      isEditModalOpen.value = false
      await fetchMinggu()
    }
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Gagal memperbarui acara Minggu'
    alert.type = 'error'
    alert.message = errorMsg
  } finally {
    submitting.value = false
  }
}

// Buka Modal Atur Penugasan Pelayanan
const openAssignmentModal = async (minggu) => {
  currentMinggu.value = minggu
  assignmentForm.list = []
  isAssignmentModalOpen.value = true

  try {
    const res = await apiClient.get(`/minggu/${minggu.id}`)
    if (res.success && res.data) {
      availableGsmUsers.value = res.data.gsm_users || []
      assignmentForm.list = (res.data.assignments || []).map(a => ({
        assignment_id: a.assignment_id,
        category_id: a.category_id,
        category_name: a.category_name,
        user_id: a.user_id || '',
        user_name: a.user_name || ''
      }))
    }
  } catch (error) {
    console.error('Error openAssignmentModal:', error)
  }
}

// Submit Update Penugasan Pelayanan
const submitUpdateAssignments = async () => {
  if (!currentMinggu.value) return
  savingAssignments.value = true
  try {
    const payload = {
      assignments: assignmentForm.list.map(item => ({
        assignment_id: item.assignment_id,
        user_id: item.user_id || null
      }))
    }

    const res = await apiClient.put(`/minggu/${currentMinggu.value.id}/assignments`, payload)
    if (res.success) {
      alert.type = 'success'
      alert.message = `Penugasan pelayanan untuk acara "${currentMinggu.value.title}" berhasil disimpan!`
      isAssignmentModalOpen.value = false
      await fetchMinggu()
    }
  } catch (error) {
    alert.type = 'error'
    alert.message = error.message || 'Gagal memperbarui penugasan pelayanan'
  } finally {
    savingAssignments.value = false
  }
}

// Buka Modal Detail Kehadiran GSM
const openDetailModal = async (minggu) => {
  currentMinggu.value = minggu
  detailData.attendances = []
  detailData.attended_count = 0
  isDetailModalOpen.value = true

  try {
    const res = await apiClient.get(`/minggu/${minggu.id}`)
    if (res.success && res.data) {
      detailData.attendances = res.data.attendances || []
      detailData.attended_count = res.data.attended_count || 0
    }
  } catch (error) {
    console.error('Error openDetailModal:', error)
  }
}

// Hapus Acara
const handleDelete = async (minggu) => {
  if (confirm(`Hapus acara "${minggu.title}"? Data penugasan dan absensi terkait pada acara ini juga akan dihapus.`)) {
    try {
      const res = await apiClient.delete(`/minggu/${minggu.id}`)
      if (res.success) {
        alert.type = 'success'
        alert.message = `Acara "${minggu.title}" berhasil dihapus`
        await fetchMinggu()
      }
    } catch (error) {
      alert.type = 'error'
      alert.message = error.message || 'Gagal menghapus acara'
    }
  }
}

onMounted(() => {
  fetchMinggu()
})
</script>
