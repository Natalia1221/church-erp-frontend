<template>
  <div class="space-y-4">
    <!-- 1. Top Bar: Status Tabs (All / Active / Inactive) & Create New Button -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <!-- Status Tabs -->
      <div class="inline-flex p-1 rounded-xl bg-white border border-slate-200 shadow-xs">
        <button
          @click="statusTab = 'all'"
          :class="[
            'px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
            statusTab === 'all'
              ? 'bg-slate-100 text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          ]"
        >
          All
        </button>
        <button
          @click="statusTab = 'active'"
          :class="[
            'px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
            statusTab === 'active'
              ? 'bg-slate-100 text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          ]"
        >
          Active
        </button>
        <button
          @click="statusTab = 'inactive'"
          :class="[
            'px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
            statusTab === 'inactive'
              ? 'bg-slate-100 text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          ]"
        >
          Inactive
        </button>
      </div>

      <!-- Create New Button -->
      <button
        @click="openAddMenuModal"
        class="px-5 py-2 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
      >
        <span>Create New</span>
      </button>
    </div>

    <!-- Alert Notification -->
    <div
      v-if="alert.message"
      :class="[
        'p-3.5 rounded-xl text-xs border flex items-center justify-between',
        alert.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
      ]"
    >
      <span>{{ alert.message }}</span>
      <button @click="alert.message = ''" class="text-xs hover:opacity-75 cursor-pointer">✕</button>
    </div>

    <!-- 2. Action Toolbar: Global Search + Action Buttons Group + Refresh -->
    <div class="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
        <!-- Global Search Input -->
        <div class="relative w-64 max-w-full">
          <input
            v-model="globalSearch"
            type="text"
            placeholder="Cari menu..."
            class="w-full pl-9 pr-7 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
          <button
            v-if="globalSearch"
            @click="globalSearch = ''"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        <!-- Action Buttons Group (Red, Green, Blue, Slate) -->
        <div class="flex items-center gap-1.5">
          <!-- Delete (Red) -->
          <button
            @click="handleDeleteSelected"
            :disabled="!selectedMenu"
            :class="[
              'w-8 h-8 rounded-lg flex items-center justify-center text-white transition-all cursor-pointer shadow-xs',
              selectedMenu
                ? 'bg-rose-500 hover:bg-rose-600 active:scale-95'
                : 'bg-rose-300 opacity-50 cursor-not-allowed'
            ]"
            title="Hapus Menu Terpilih"
          >
            <span class="text-sm">🗑️</span>
          </button>

          <!-- View Detail (Green) -->
          <button
            @click="handleViewSelected"
            :disabled="!selectedMenu"
            :class="[
              'w-8 h-8 rounded-lg flex items-center justify-center text-white transition-all cursor-pointer shadow-xs',
              selectedMenu
                ? 'bg-emerald-500 hover:bg-emerald-600 active:scale-95'
                : 'bg-emerald-300 opacity-50 cursor-not-allowed'
            ]"
            title="Lihat Detail Menu"
          >
            <span class="text-sm">👁️</span>
          </button>

          <!-- Edit (Blue) -->
          <button
            @click="handleEditSelected"
            :disabled="!selectedMenu"
            :class="[
              'w-8 h-8 rounded-lg flex items-center justify-center text-white transition-all cursor-pointer shadow-xs',
              selectedMenu
                ? 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                : 'bg-blue-300 opacity-50 cursor-not-allowed'
            ]"
            title="Edit Menu Terpilih"
          >
            <span class="text-sm">✏️</span>
          </button>

          <!-- Duplicate / Copy (Dark Gray) -->
          <button
            @click="handleDuplicateSelected"
            :disabled="!selectedMenu"
            :class="[
              'w-8 h-8 rounded-lg flex items-center justify-center text-white transition-all cursor-pointer shadow-xs',
              selectedMenu
                ? 'bg-slate-700 hover:bg-slate-800 active:scale-95'
                : 'bg-slate-400 opacity-50 cursor-not-allowed'
            ]"
            title="Duplikat Menu Terpilih"
          >
            <span class="text-sm">📋</span>
          </button>
        </div>
      </div>

      <!-- Refresh Button -->
      <button
        @click="fetchMenus"
        :disabled="loading"
        class="w-8 h-8 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center text-sm transition-all cursor-pointer shadow-xs"
        title="Refresh Data"
      >
        <span :class="loading ? 'animate-spin' : ''">🔄</span>
      </button>
    </div>

    <!-- 3. Table Container Card -->
    <div class="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-700 border-collapse">
          <!-- Table Header: Column Titles -->
          <thead class="bg-slate-50/90 text-[11px] font-semibold text-slate-700 border-b border-slate-200 select-none">
            <tr>
              <th class="py-3 px-4 w-12 text-center">No</th>
              <th class="py-3 px-4 min-w-[180px]">Menu Name</th>
              <th class="py-3 px-4 min-w-[140px]">Module</th>
              <th class="py-3 px-4 min-w-[140px]">Sub Module</th>
              <th class="py-3 px-4 min-w-[200px]">Path</th>
              <th class="py-3 px-3 w-20 text-center">Sequence</th>
              <th class="py-3 px-4 w-28 text-center">Need Approval</th>
              <th class="py-3 px-4 w-24 text-center">Status</th>
            </tr>

            <!-- Column Filter Row with Search Inputs -->
            <tr class="bg-white border-b border-slate-200/80">
              <!-- No Filter -->
              <th class="py-2 px-2 text-center"></th>

              <!-- Search Menu Name -->
              <th class="py-2 px-3">
                <div class="relative">
                  <span class="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">▼</span>
                  <input
                    v-model="filters.name"
                    type="text"
                    placeholder="Search Menu Name"
                    class="w-full pl-6 pr-2 py-1 bg-slate-50/70 border border-slate-200 rounded-md text-[11px] placeholder-slate-400 font-normal focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </th>

              <!-- Search Module -->
              <th class="py-2 px-3">
                <div class="relative">
                  <span class="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">▼</span>
                  <input
                    v-model="filters.module"
                    type="text"
                    placeholder="Search Module"
                    class="w-full pl-6 pr-2 py-1 bg-slate-50/70 border border-slate-200 rounded-md text-[11px] placeholder-slate-400 font-normal focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </th>

              <!-- Search Sub Module -->
              <th class="py-2 px-3">
                <div class="relative">
                  <span class="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">▼</span>
                  <input
                    v-model="filters.sub_module"
                    type="text"
                    placeholder="Search Sub Module"
                    class="w-full pl-6 pr-2 py-1 bg-slate-50/70 border border-slate-200 rounded-md text-[11px] placeholder-slate-400 font-normal focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </th>

              <!-- Search Path -->
              <th class="py-2 px-3">
                <div class="relative">
                  <span class="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">▼</span>
                  <input
                    v-model="filters.path"
                    type="text"
                    placeholder="Search Path"
                    class="w-full pl-6 pr-2 py-1 bg-slate-50/70 border border-slate-200 rounded-md text-[11px] placeholder-slate-400 font-normal focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </th>

              <!-- Sequence Filter -->
              <th class="py-2 px-2 text-center"></th>

              <!-- Need Approval Filter -->
              <th class="py-2 px-2 text-center"></th>

              <!-- Status Filter -->
              <th class="py-2 px-2 text-center"></th>
            </tr>
          </thead>

          <!-- Table Body -->
          <tbody class="divide-y divide-slate-100 font-normal">
            <!-- Loading -->
            <tr v-if="loading">
              <td colspan="8" class="py-12 text-center text-slate-400">
                <span class="inline-block w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></span>
                Memuat data menu...
              </td>
            </tr>

            <!-- Empty -->
            <tr v-else-if="paginatedMenus.length === 0">
              <td colspan="8" class="py-12 text-center text-slate-400">
                <p class="text-sm font-medium text-slate-600">Tidak ada data menu yang cocok.</p>
                <p class="text-xs text-slate-400 mt-1">Coba sesuaikan filter pencarian atau buat menu baru.</p>
              </td>
            </tr>

            <!-- Data Rows -->
            <tr
              v-for="(item, index) in paginatedMenus"
              :key="item.id"
              @click="selectRow(item)"
              @dblclick="openEditMenuModal(item)"
              :class="[
                'transition-colors cursor-pointer select-none',
                selectedMenu?.id === item.id
                  ? 'bg-blue-50/80 text-blue-950 font-medium'
                  : 'hover:bg-slate-50/60'
              ]"
            >
              <!-- No -->
              <td class="py-3 px-4 text-center text-slate-500 text-[11px]">
                <span :class="selectedMenu?.id === item.id ? 'font-bold text-blue-600' : ''">
                  {{ (currentPage - 1) * pageSize + index + 1 }}
                </span>
              </td>

              <!-- Menu Name -->
              <td class="py-3 px-4 font-semibold text-slate-900 text-xs">
                {{ item.name }}
              </td>

              <!-- Module -->
              <td class="py-3 px-4 text-slate-600 text-xs">
                {{ item.module || '-' }}
              </td>

              <!-- Sub Module -->
              <td class="py-3 px-4 text-slate-600 text-xs">
                {{ item.sub_module || '-' }}
              </td>

              <!-- Path -->
              <td class="py-3 px-4 font-mono text-[11px] text-slate-500 max-w-[220px] truncate" :title="item.path">
                {{ item.path || '-' }}
              </td>

              <!-- Sequence -->
              <td class="py-3 px-3 text-center text-slate-700 text-xs font-semibold">
                {{ item.sequence ?? 0 }}
              </td>

              <!-- Need Approval -->
              <td class="py-3 px-4 text-center">
                <span
                  :class="[
                    'text-[11px] font-medium',
                    item.need_approval ? 'text-blue-600 font-bold' : 'text-slate-500'
                  ]"
                >
                  {{ item.need_approval ? 'Ya' : 'Tidak' }}
                </span>
              </td>

              <!-- Status -->
              <td class="py-3 px-4 text-center">
                <span
                  :class="[
                    'inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold',
                    item.is_active
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  ]"
                >
                  {{ item.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 4. Table Footer: Pagination & Page Size -->
      <div class="px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <!-- Results count & Page size dropdown -->
        <div class="flex items-center gap-3">
          <span>
            {{ totalResults === 0 ? 0 : (currentPage - 1) * pageSize + 1 }} to
            {{ Math.min(currentPage * pageSize, totalResults) }} of {{ totalResults }} results
          </span>

          <div class="flex items-center gap-1.5">
            <span class="text-slate-400">Show</span>
            <select
              v-model="pageSize"
              class="px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </div>
        </div>

        <!-- Pagination Controls -->
        <div class="flex items-center gap-1">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage <= 1"
            class="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            ‹
          </button>

          <template v-for="p in visiblePageNumbers" :key="p">
            <span v-if="p === '...'" class="px-2 text-slate-400">...</span>
            <button
              v-else
              @click="goToPage(p)"
              :class="[
                'w-7 h-7 rounded-md text-xs font-semibold transition-colors cursor-pointer',
                currentPage === p
                  ? 'bg-blue-600 text-white'
                  : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
              ]"
            >
              {{ p }}
            </button>
          </template>

          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage >= totalPages"
            class="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            ›
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Form (Tambah / Edit Menu) -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <div class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 w-full max-w-lg shadow-2xl space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 class="text-base font-bold text-slate-900">
            {{ isEditing ? 'Edit Menu Sistem' : 'Tambah Menu Baru' }}
          </h3>
          <button @click="isModalOpen = false" class="text-slate-400 hover:text-slate-600 cursor-pointer text-lg">✕</button>
        </div>

        <form @submit.prevent="saveMenu" class="space-y-4">
          <!-- Menu Name -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Menu Name <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="Contoh: Jadwal Ibadah, Menu, Role"
              class="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-blue-600"
            />
          </div>

          <!-- Parent Menu / Module -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Parent Menu / Module
            </label>
            <select
              v-model="form.parent_id"
              class="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-blue-600"
            >
              <option :value="null">-- Tidak ada parent (Top Level Module) --</option>
              <option
                v-for="p in parentOptions"
                :key="p.id"
                :value="p.id"
                :disabled="isEditing && p.id === currentId"
              >
                {{ p.parent_id ? '└─ ' : '' }}{{ p.name }}
              </option>
            </select>
          </div>

          <!-- URL Path -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Path URL
            </label>
            <input
              v-model="form.path"
              type="text"
              placeholder="Contoh: /menus, /penjadwalan/jadwal"
              class="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-mono focus:bg-white focus:outline-none focus:border-blue-600"
            />
          </div>

          <!-- Icon & Sequence in 2 Columns -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Icon (Lucide)
              </label>
              <input
                v-model="form.icon"
                type="text"
                placeholder="Contoh: Settings, Users"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Sequence
              </label>
              <input
                v-model.number="form.sequence"
                type="number"
                placeholder="1, 2, 3..."
                class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <!-- Checkboxes: Need Approval & Active Status -->
          <div class="grid grid-cols-2 gap-3 pt-1">
            <div class="flex items-center gap-2">
              <input
                v-model="form.need_approval"
                type="checkbox"
                id="needApprovalCheck"
                class="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
              />
              <label for="needApprovalCheck" class="text-xs font-semibold text-slate-700 cursor-pointer">
                Need Approval
              </label>
            </div>

            <div class="flex items-center gap-2">
              <input
                v-model="form.is_active"
                type="checkbox"
                id="activeStatusCheck"
                class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
              />
              <label for="activeStatusCheck" class="text-xs font-semibold text-slate-700 cursor-pointer">
                Status Active
              </label>
            </div>
          </div>

          <!-- Form Buttons -->
          <div class="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              @click="isModalOpen = false"
              class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="modalLoading"
              class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span v-if="modalLoading" class="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>{{ isEditing ? 'Simpan Perubahan' : 'Tambah Menu' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal View Detail -->
    <div
      v-if="isViewModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <div class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 w-full max-w-md shadow-2xl space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>👁️</span>
            <span>Detail Menu</span>
          </h3>
          <button @click="isViewModalOpen = false" class="text-slate-400 hover:text-slate-600 cursor-pointer text-lg">✕</button>
        </div>

        <div class="space-y-2.5 text-xs text-slate-700">
          <div class="flex justify-between py-1.5 border-b border-slate-100">
            <span class="text-slate-400">Menu Name:</span>
            <span class="font-bold text-slate-900">{{ viewingMenu?.name }}</span>
          </div>
          <div class="flex justify-between py-1.5 border-b border-slate-100">
            <span class="text-slate-400">Module:</span>
            <span class="font-semibold text-slate-800">{{ viewingMenu?.module || '-' }}</span>
          </div>
          <div class="flex justify-between py-1.5 border-b border-slate-100">
            <span class="text-slate-400">Sub Module:</span>
            <span class="font-semibold text-slate-800">{{ viewingMenu?.sub_module || '-' }}</span>
          </div>
          <div class="flex justify-between py-1.5 border-b border-slate-100">
            <span class="text-slate-400">Path URL:</span>
            <span class="font-mono text-blue-600">{{ viewingMenu?.path || '-' }}</span>
          </div>
          <div class="flex justify-between py-1.5 border-b border-slate-100">
            <span class="text-slate-400">Icon:</span>
            <span class="font-mono text-slate-700">{{ viewingMenu?.icon || '-' }}</span>
          </div>
          <div class="flex justify-between py-1.5 border-b border-slate-100">
            <span class="text-slate-400">Sequence:</span>
            <span class="font-bold text-slate-800">{{ viewingMenu?.sequence }}</span>
          </div>
          <div class="flex justify-between py-1.5 border-b border-slate-100">
            <span class="text-slate-400">Need Approval:</span>
            <span class="font-semibold" :class="viewingMenu?.need_approval ? 'text-blue-600' : 'text-slate-600'">
              {{ viewingMenu?.need_approval ? 'Ya' : 'Tidak' }}
            </span>
          </div>
          <div class="flex justify-between py-1.5 border-b border-slate-100">
            <span class="text-slate-400">Status:</span>
            <span
              :class="[
                'px-2 py-0.5 rounded-md font-semibold text-[11px]',
                viewingMenu?.is_active
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
              ]"
            >
              {{ viewingMenu?.is_active ? 'Active' : 'Inactive' }}
            </span>
          </div>
        </div>

        <div class="flex justify-end pt-3">
          <button
            @click="isViewModalOpen = false"
            class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Konfirmasi Hapus -->
    <div
      v-if="isDeleteModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <div class="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
        <div class="text-center space-y-2">
          <span class="text-3xl">⚠️</span>
          <h3 class="text-base font-bold text-slate-900">Hapus Menu</h3>
          <p class="text-xs text-slate-500">
            Apakah Anda yakin ingin menghapus menu
            <strong class="text-slate-800">{{ deletingMenu?.name }}</strong>?
            Submenu di bawahnya juga akan terhapus.
          </p>
        </div>

        <div class="flex justify-center gap-3 pt-2">
          <button
            @click="isDeleteModalOpen = false"
            class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
          >
            Batal
          </button>
          <button
            @click="executeDelete"
            :disabled="deleteLoading"
            class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
          >
            {{ deleteLoading ? 'Menghapus...' : 'Ya, Hapus' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const menus = ref([])
const loading = ref(false)
const modalLoading = ref(false)
const deleteLoading = ref(false)

// State Tab (all | active | inactive)
const statusTab = ref('all')

// Global & Column Filters
const globalSearch = ref('')
const filters = reactive({
  name: '',
  module: '',
  sub_module: '',
  path: ''
})

// Selected row for toolbar actions
const selectedMenu = ref(null)

// Modals
const isModalOpen = ref(false)
const isEditing = ref(false)
const currentId = ref(null)
const isViewModalOpen = ref(false)
const viewingMenu = ref(null)
const isDeleteModalOpen = ref(false)
const deletingMenu = ref(null)

// Form
const form = reactive({
  name: '',
  parent_id: null,
  path: '',
  icon: 'Layers',
  sequence: 1,
  need_approval: false,
  is_active: true
})

// Alert
const alert = reactive({
  message: '',
  type: 'success'
})

// Pagination
const currentPage = ref(1)
const pageSize = ref(10)

// Ambil semua menu dari backend
const fetchMenus = async () => {
  loading.value = true
  try {
    const response = await api.get('/menus')
    if (response.success) {
      menus.value = response.data || []
    }
  } catch (error) {
    console.error('Gagal mengambil data menus:', error)
    showAlert('Gagal memuat data menu', 'error')
  } finally {
    loading.value = false
  }
}

// Opsi parent untuk dropdown modal
const parentOptions = computed(() => {
  return menus.value
})

// Filter data menu
const filteredMenus = computed(() => {
  return menus.value.filter(item => {
    // 1. Filter Tab Status
    if (statusTab.value === 'active' && !item.is_active) return false
    if (statusTab.value === 'inactive' && item.is_active) return false

    // 2. Global Search
    if (globalSearch.value.trim()) {
      const q = globalSearch.value.toLowerCase()
      const matchName = item.name?.toLowerCase().includes(q)
      const matchModule = item.module?.toLowerCase().includes(q)
      const matchSub = item.sub_module?.toLowerCase().includes(q)
      const matchPath = item.path?.toLowerCase().includes(q)
      if (!matchName && !matchModule && !matchSub && !matchPath) return false
    }

    // 3. Column Filters
    if (filters.name.trim() && !item.name?.toLowerCase().includes(filters.name.toLowerCase().trim())) {
      return false
    }
    if (filters.module.trim() && !item.module?.toLowerCase().includes(filters.module.toLowerCase().trim())) {
      return false
    }
    if (filters.sub_module.trim() && !item.sub_module?.toLowerCase().includes(filters.sub_module.toLowerCase().trim())) {
      return false
    }
    if (filters.path.trim() && !item.path?.toLowerCase().includes(filters.path.toLowerCase().trim())) {
      return false
    }

    return true
  })
})

const totalResults = computed(() => filteredMenus.value.length)
const totalPages = computed(() => Math.ceil(totalResults.value / pageSize.value) || 1)

const paginatedMenus = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredMenus.value.slice(start, start + pageSize.value)
})

const visiblePageNumbers = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  if (current <= 3) {
    return [1, 2, 3, '...', total]
  }
  if (current >= total - 2) {
    return [1, '...', total - 2, total - 1, total]
  }
  return [1, '...', current, '...', total]
})

const goToPage = (p) => {
  if (p >= 1 && p <= totalPages.value) {
    currentPage.value = p
  }
}

const selectRow = (item) => {
  if (selectedMenu.value?.id === item.id) {
    selectedMenu.value = null
  } else {
    selectedMenu.value = item
  }
}

// Modal Handlers
const openAddMenuModal = () => {
  isEditing.value = false
  currentId.value = null
  form.name = ''
  form.parent_id = null
  form.path = ''
  form.icon = 'Layers'
  form.sequence = menus.value.length + 1
  form.need_approval = false
  form.is_active = true
  isModalOpen.value = true
}

const openEditMenuModal = (item) => {
  isEditing.value = true
  currentId.value = item.id
  form.name = item.name || ''
  form.parent_id = item.parent_id || null
  form.path = item.path || ''
  form.icon = item.icon || 'Layers'
  form.sequence = item.sequence ?? 1
  form.need_approval = Boolean(item.need_approval)
  form.is_active = Boolean(item.is_active)
  isModalOpen.value = true
}

// Toolbar Handlers
const handleEditSelected = () => {
  if (selectedMenu.value) {
    openEditMenuModal(selectedMenu.value)
  }
}

const handleViewSelected = () => {
  if (selectedMenu.value) {
    viewingMenu.value = selectedMenu.value
    isViewModalOpen.value = true
  }
}

const handleDeleteSelected = () => {
  if (selectedMenu.value) {
    deletingMenu.value = selectedMenu.value
    isDeleteModalOpen.value = true
  }
}

const handleDuplicateSelected = async () => {
  if (!selectedMenu.value) return
  const item = selectedMenu.value
  try {
    const res = await api.post('/menus', {
      name: `${item.name} (Copy)`,
      parent_id: item.parent_id,
      path: item.path ? `${item.path}-copy` : null,
      icon: item.icon,
      sequence: (item.sequence || 0) + 1,
      need_approval: item.need_approval,
      is_active: item.is_active
    })
    if (res.success) {
      showAlert(`Menu '${item.name}' berhasil diduplikasi`, 'success')
      await fetchMenus()
      await authStore.fetchMyMenus()
    }
  } catch (err) {
    showAlert('Gagal menduplikasi menu', 'error')
  }
}

const saveMenu = async () => {
  modalLoading.value = true
  try {
    if (isEditing.value) {
      const res = await api.put(`/menus/${currentId.value}`, form)
      if (res.success) {
        showAlert('Menu berhasil diperbarui', 'success')
        isModalOpen.value = false
        selectedMenu.value = null
        await fetchMenus()
        await authStore.fetchMyMenus()
      } else {
        showAlert(res.message || 'Gagal memperbarui menu', 'error')
      }
    } else {
      const res = await api.post('/menus', form)
      if (res.success) {
        showAlert('Menu baru berhasil ditambahkan', 'success')
        isModalOpen.value = false
        await fetchMenus()
        await authStore.fetchMyMenus()
      } else {
        showAlert(res.message || 'Gagal menambahkan menu', 'error')
      }
    }
  } catch (error) {
    showAlert(error.message || 'Terjadi kesalahan sistem', 'error')
  } finally {
    modalLoading.value = false
  }
}

const executeDelete = async () => {
  if (!deletingMenu.value) return
  deleteLoading.value = true
  try {
    const res = await api.delete(`/menus/${deletingMenu.value.id}`)
    if (res.success) {
      showAlert('Menu berhasil dihapus', 'success')
      isDeleteModalOpen.value = false
      if (selectedMenu.value?.id === deletingMenu.value.id) {
        selectedMenu.value = null
      }
      await fetchMenus()
      await authStore.fetchMyMenus()
    } else {
      showAlert(res.message || 'Gagal menghapus menu', 'error')
    }
  } catch (error) {
    showAlert(error.message || 'Gagal menghapus menu', 'error')
  } finally {
    deleteLoading.value = false
  }
}

const showAlert = (message, type = 'success') => {
  alert.message = message
  alert.type = type
  setTimeout(() => {
    alert.message = ''
  }, 4000)
}

onMounted(() => {
  fetchMenus()
})
</script>
