<template>
  <div class="space-y-6">
    <!-- ==================== TAMPILAN 1: LIST ROLES ==================== -->
    <div v-if="viewMode === 'list'" class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Peran & Hak Akses (RBAC)</h1>
          <p class="text-sm text-slate-500 mt-0.5">Kelola role dan matriks perizinan menu di sistem</p>
        </div>

        <button
          @click="openAddForm"
          class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2"
        >
          <span>➕</span>
          <span>Tambah Role</span>
        </button>
      </div>

      <!-- Alert Message -->
      <div
        v-if="alert.message"
        :class="[
          'p-4 rounded-xl text-sm border flex items-center justify-between',
          alert.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'
        ]"
      >
        <span>{{ alert.message }}</span>
        <button @click="alert.message = ''" class="text-xs hover:opacity-75">✕</button>
      </div>

      <!-- Table Roles List -->
      <div class="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-600">
            <thead class="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th class="py-3 px-4 w-12 text-center">No</th>
                <th class="py-3 px-4">Kode Role</th>
                <th class="py-3 px-4">Nama Role</th>
                <th class="py-3 px-4">Deskripsi / Catatan</th>
                <th class="py-3 px-4 text-center">Status</th>
                <th class="py-3 px-4 text-center w-32">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="loading">
                <td colspan="6" class="py-12 text-center text-slate-400">
                  Memuat data peran...
                </td>
              </tr>
              <tr v-else-if="roles.length === 0">
                <td colspan="6" class="py-12 text-center text-slate-400">
                  Belum ada data role. Klik tombol "Tambah Role" untuk membuat baru.
                </td>
              </tr>
              <tr
                v-for="(role, index) in roles"
                :key="role.id"
                class="hover:bg-slate-50/70 transition-colors"
              >
                <td class="py-3 px-4 text-center text-slate-500 font-mono">
                  {{ index + 1 }}
                </td>
                <td class="py-3 px-4 font-bold text-indigo-600">
                  <span class="px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-100 uppercase tracking-wider text-[11px]">
                    {{ role.code }}
                  </span>
                </td>
                <td class="py-3 px-4 font-semibold text-slate-900">
                  {{ role.name }}
                </td>
                <td class="py-3 px-4 text-slate-500">
                  {{ role.description || '-' }}
                </td>
                <td class="py-3 px-4 text-center">
                  <span
                    :class="[
                      'px-2.5 py-0.5 rounded-full text-[11px] font-semibold border',
                      role.status
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    ]"
                  >
                    {{ role.status ? 'Aktif' : 'Tidak Aktif' }}
                  </span>
                </td>
                <td class="py-3 px-4 text-center">
                  <div class="flex items-center justify-center gap-1.5">
                    <button
                      @click="openShowForm(role)"
                      class="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="Lihat Detail Role"
                    >
                      👁️
                    </button>
                    <button
                      @click="openEditForm(role)"
                      class="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                      title="Edit Role & Details"
                    >
                      ✏️
                    </button>
                    <button
                      @click="handleDeleteRole(role)"
                      class="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Hapus Role"
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
    </div>

    <!-- ==================== TAMPILAN 2: FORM CREATE / EDIT / SHOW (ROLE & ROLE DETAILS) ==================== -->
    <div v-else class="space-y-4 max-w-7xl mx-auto">
      <!-- Breadcrumb / Header Tab -->
      <div class="flex items-center justify-between">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-t-lg bg-white border-t border-x border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
          <button @click="backToList" class="text-slate-400 hover:text-slate-700 cursor-pointer">✕</button>
          <span>Setup Role</span>
        </div>
      </div>

      <!-- Main Form Card -->
      <div class="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6 shadow-xs">
        <!-- Form Header -->
        <div class="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 class="text-xl font-bold text-slate-900 tracking-tight">
              {{ formMode === 'add' ? 'Add New Role' : formMode === 'edit' ? 'Edit Role' : 'Role Details' }}
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">
              {{ formMode === 'add' ? 'Create a new role' : formMode === 'edit' ? 'Edit existing role' : 'View role details and permissions' }}
            </p>
          </div>
          <button
            @click="backToList"
            class="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Tutup Form"
          >
            ✕
          </button>
        </div>

        <!-- Master Role Fields (Grid 2 Kolom Sesuai Screenshot) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
          <!-- Kiri Atas: Kode Role -->
          <div class="space-y-1">
            <label class="block text-xs font-semibold text-slate-700">Kode Role</label>
            <input
              v-model="roleForm.code"
              type="text"
              :disabled="formMode === 'show'"
              placeholder="ROLE0016"
              class="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase disabled:bg-slate-100 disabled:text-slate-500"
            />
          </div>

          <!-- Kanan Atas: Status -->
          <div class="space-y-1">
            <label class="block text-xs font-semibold text-slate-700">
              Status <span class="text-red-500">*</span>
            </label>
            <select
              v-model="roleForm.status"
              :disabled="formMode === 'show'"
              class="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
            >
              <option :value="true">Aktif</option>
              <option :value="false">Tidak Aktif</option>
            </select>
          </div>

          <!-- Kiri Bawah: Nama Role -->
          <div class="space-y-1">
            <label class="block text-xs font-semibold text-slate-700">
              Nama Role <span class="text-red-500">*</span>
            </label>
            <input
              v-model="roleForm.name"
              type="text"
              required
              :disabled="formMode === 'show'"
              placeholder="Masukkan nama role"
              class="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
            />
          </div>

          <!-- Kanan Bawah: Catatan -->
          <div class="space-y-1">
            <label class="block text-xs font-semibold text-slate-700">Catatan</label>
            <textarea
              v-model="roleForm.description"
              rows="3"
              :disabled="formMode === 'show'"
              placeholder="Masukkan catatan"
              class="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500 resize-y"
            ></textarea>
          </div>
        </div>

        <!-- Section Role Details -->
        <div class="space-y-3 pt-4 border-t border-slate-100">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold text-slate-900 tracking-tight">Role Details</h3>
          </div>

          <!-- Button + Add to List & Debug Info -->
          <div class="space-y-1.5">
            <button
              v-if="formMode !== 'show'"
              type="button"
              @click="openAddMenuModal"
              class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>+</span>
              <span>Add to List</span>
            </button>
            <div class="text-[11px] text-slate-400 font-mono">
              Debug: {{ permissionsList.length }} items in details array
            </div>
          </div>

          <!-- Table Container Role Details -->
          <div class="overflow-x-auto border border-slate-200 rounded-lg">
            <table class="w-full text-left text-xs text-slate-600 whitespace-nowrap">
              <thead class="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th class="py-2.5 px-3 text-center w-12">No</th>
                  <th class="py-2.5 px-3">Module</th>
                  <th class="py-2.5 px-3">Sub Module</th>
                  <th class="py-2.5 px-4">Menu</th>
                  <th class="py-2.5 px-3">URL</th>
                  <th class="py-2.5 px-3 text-center">Read</th>
                  <th class="py-2.5 px-3 text-center">Create</th>
                  <th class="py-2.5 px-3 text-center">Show</th>
                  <th class="py-2.5 px-3 text-center">Update</th>
                  <th class="py-2.5 px-3 text-center">Delete</th>
                  <th class="py-2.5 px-3 text-center">Print</th>
                  <th class="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-if="permissionsList.length === 0">
                  <td colspan="12" class="py-12 text-center text-slate-400 font-medium">
                    No data found.
                  </td>
                </tr>
                <tr
                  v-for="(item, index) in paginatedPermissions"
                  :key="item.menu_id"
                  class="hover:bg-slate-50/70 transition-colors"
                >
                  <td class="py-2.5 px-3 text-center text-slate-500 font-mono">
                    {{ (currentPage - 1) * pageSize + index + 1 }}
                  </td>
                  <td class="py-2.5 px-3 font-medium text-slate-800">
                    {{ item.modul }}
                  </td>
                  <td class="py-2.5 px-3 text-slate-600">
                    {{ item.submodul || '-' }}
                  </td>
                  <td class="py-2.5 px-4 font-semibold text-slate-900">
                    {{ item.menu_name }}
                  </td>
                  <td class="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                    {{ item.path || '-' }}
                  </td>
                  <td class="py-2.5 px-3 text-center">
                    <input
                      type="checkbox"
                      v-model="item.can_read"
                      :disabled="formMode === 'show'"
                      class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </td>
                  <td class="py-2.5 px-3 text-center">
                    <input
                      type="checkbox"
                      v-model="item.can_create"
                      :disabled="formMode === 'show'"
                      class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </td>
                  <td class="py-2.5 px-3 text-center">
                    <input
                      type="checkbox"
                      v-model="item.can_show"
                      :disabled="formMode === 'show'"
                      class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </td>
                  <td class="py-2.5 px-3 text-center">
                    <input
                      type="checkbox"
                      v-model="item.can_update"
                      :disabled="formMode === 'show'"
                      class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </td>
                  <td class="py-2.5 px-3 text-center">
                    <input
                      type="checkbox"
                      v-model="item.can_delete"
                      :disabled="formMode === 'show'"
                      class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </td>
                  <td class="py-2.5 px-3 text-center">
                    <input
                      type="checkbox"
                      v-model="item.can_print"
                      :disabled="formMode === 'show'"
                      class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </td>
                  <td class="py-2.5 px-3 text-center">
                    <button
                      v-if="formMode !== 'show'"
                      type="button"
                      @click="removeItem(item.menu_id)"
                      class="px-2 py-1 rounded text-red-600 hover:text-red-700 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
                      title="Hapus dari daftar"
                    >
                      Hapus
                    </button>
                    <span v-else class="text-slate-300">-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination Footer -->
          <div class="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 pt-1">
            <div class="flex items-center gap-4">
              <span>{{ paginationInfo }}</span>
              <div class="flex items-center gap-1.5">
                <span>Show</span>
                <select
                  v-model.number="pageSize"
                  @change="onPageSizeChange"
                  class="px-2 py-1 rounded border border-slate-300 bg-white text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option :value="5">5</option>
                  <option :value="10">10</option>
                  <option :value="25">25</option>
                  <option :value="50">50</option>
                </select>
              </div>
            </div>

            <div class="flex items-center gap-1" v-if="totalPages > 1">
              <button
                type="button"
                @click="prevPage"
                :disabled="currentPage === 1"
                class="px-2.5 py-1 rounded border border-slate-200 text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
              >
                &larr; Prev
              </button>
              <span class="px-2 text-xs font-medium text-slate-700">
                Hal {{ currentPage }} dari {{ totalPages }}
              </span>
              <button
                type="button"
                @click="nextPage"
                :disabled="currentPage === totalPages"
                class="px-2.5 py-1 rounded border border-slate-200 text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        </div>

        <!-- Footer Actions (Cancel & Create / Save) -->
        <div class="pt-6 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            @click="backToList"
            class="px-5 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all cursor-pointer"
          >
            {{ formMode === 'show' ? 'Kembali' : 'Cancel' }}
          </button>

          <button
            v-if="formMode !== 'show'"
            type="button"
            @click="handleSubmitRole"
            :disabled="submitting"
            class="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <span>💾</span>
            <span>{{ submitting ? 'Menyimpan...' : formMode === 'add' ? 'Create Role' : 'Save Changes' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ==================== SUB-MODAL: ADD MENU TO LIST ==================== -->
    <div
      v-if="isAddMenuModalOpen"
      class="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
    >
      <div class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 w-full max-w-lg shadow-2xl space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h4 class="text-base font-bold text-slate-900">Tambah Menu ke Daftar</h4>
            <p class="text-xs text-slate-500 mt-0.5">Pilih menu dan tentukan hak akses awal</p>
          </div>
          <button @click="isAddMenuModalOpen = false" class="text-slate-400 hover:text-slate-700 cursor-pointer">✕</button>
        </div>

        <div v-if="unassignedMenus.length === 0" class="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
          Semua menu aktif di sistem sudah dimasukkan ke dalam daftar hak akses peran ini.
        </div>

        <form v-else @submit.prevent="addMenuToList" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Pilih Menu <span class="text-red-500">*</span>
            </label>
            <select
              v-model="selectedMenuId"
              required
              class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 bg-white"
            >
              <option value="" disabled>-- Pilih salah satu menu --</option>
              <option v-for="menu in unassignedMenus" :key="menu.id" :value="menu.id">
                [{{ menu.modul || 'Umum' }}] {{ menu.name }}{{ menu.submodul ? ' (' + menu.submodul + ')' : '' }}
              </option>
            </select>
          </div>

          <!-- Quick Permissions Checklist -->
          <div class="space-y-2 pt-1">
            <div class="flex items-center justify-between">
              <label class="block text-xs font-semibold text-slate-700 uppercase">Hak Akses Awal</label>
              <div class="space-x-2 text-[11px]">
                <button type="button" @click="toggleSelectAllNewPerms(true)" class="text-indigo-600 hover:underline cursor-pointer">
                  Pilih Semua
                </button>
                <span class="text-slate-300">|</span>
                <button type="button" @click="toggleSelectAllNewPerms(false)" class="text-slate-500 hover:underline cursor-pointer">
                  Kosongkan
                </button>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <label class="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input type="checkbox" v-model="newMenuPerms.can_read" class="rounded text-indigo-600 focus:ring-indigo-500" />
                <span>Read</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input type="checkbox" v-model="newMenuPerms.can_create" class="rounded text-indigo-600 focus:ring-indigo-500" />
                <span>Create</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input type="checkbox" v-model="newMenuPerms.can_show" class="rounded text-indigo-600 focus:ring-indigo-500" />
                <span>Show</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input type="checkbox" v-model="newMenuPerms.can_update" class="rounded text-indigo-600 focus:ring-indigo-500" />
                <span>Update</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input type="checkbox" v-model="newMenuPerms.can_delete" class="rounded text-indigo-600 focus:ring-indigo-500" />
                <span>Delete</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input type="checkbox" v-model="newMenuPerms.can_print" class="rounded text-indigo-600 focus:ring-indigo-500" />
                <span>Print</span>
              </label>
            </div>
          </div>

          <div class="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              @click="isAddMenuModalOpen = false"
              class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="!selectedMenuId"
              class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              + Tambahkan ke List
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '@/api/axios'

const route = useRoute()
const router = useRouter()

// View Mode: 'list' | 'form'
const viewMode = ref('list')
// Form Mode: 'add' | 'edit' | 'show'
const formMode = ref('add')

const roles = ref([])
const availableMenus = ref([])
const loading = ref(false)
const submitting = ref(false)

const currentRoleId = ref(null)
const permissionsList = ref([])
const isAddMenuModalOpen = ref(false)
const selectedMenuId = ref('')

const pageSize = ref(5)
const currentPage = ref(1)

const newMenuPerms = reactive({
  can_read: true,
  can_create: false,
  can_show: true,
  can_update: false,
  can_delete: false,
  can_print: false
})

const alert = reactive({
  type: 'success',
  message: ''
})

const roleForm = reactive({
  code: '',
  name: '',
  description: '',
  status: true
})

// Pagination Role Details
const totalPages = computed(() => Math.ceil(permissionsList.value.length / pageSize.value) || 1)

const paginatedPermissions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return permissionsList.value.slice(start, start + pageSize.value)
})

const paginationInfo = computed(() => {
  const total = permissionsList.value.length
  if (total === 0) return '1 to 0 of 0 results'
  const start = (currentPage.value - 1) * pageSize.value + 1
  const end = Math.min(start + pageSize.value - 1, total)
  return `${start} to ${end} of ${total} results`
})

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const onPageSizeChange = () => {
  currentPage.value = 1
}

const unassignedMenus = computed(() => {
  const assignedIds = new Set(permissionsList.value.map(p => p.menu_id))
  return availableMenus.value.filter(m => !assignedIds.has(m.id))
})

// Mengambil daftar semua role
const fetchRoles = async () => {
  loading.value = true
  try {
    const res = await apiClient.get('/roles')
    if (res.success) {
      roles.value = res.data || []
    }
  } catch (error) {
    console.error('Error fetchRoles:', error)
  } finally {
    loading.value = false
  }
}

// Mengambil seluruh menu aktif sistem untuk keperluan pemilihan menu
const fetchAvailableMenus = async () => {
  try {
    const res = await apiClient.get('/menus?is_active=true')
    if (res.success) {
      availableMenus.value = res.data || []
    }
  } catch (error) {
    console.error('Error fetchAvailableMenus:', error)
  }
}

// Mengambil kode role berikutnya (format ROLE0016)
const fetchNextRoleCode = async () => {
  try {
    const res = await apiClient.get('/roles/utils/next-code')
    if (res.success && res.data?.nextCode) {
      roleForm.code = res.data.nextCode
    } else {
      roleForm.code = 'ROLE0001'
    }
  } catch (error) {
    roleForm.code = 'ROLE0001'
  }
}

// Buka Form Add New Role
const openAddForm = async () => {
  viewMode.value = 'form'
  formMode.value = 'add'
  currentRoleId.value = null
  roleForm.name = ''
  roleForm.description = ''
  roleForm.status = true
  permissionsList.value = []
  currentPage.value = 1

  await Promise.all([fetchNextRoleCode(), fetchAvailableMenus()])
  router.push({ query: { action: 'add' } })
}

// Buka Form Edit Role
const openEditForm = async (role) => {
  viewMode.value = 'form'
  formMode.value = 'edit'
  currentRoleId.value = role.id
  roleForm.code = role.code
  roleForm.name = role.name
  roleForm.description = role.description || ''
  roleForm.status = role.status !== undefined ? Boolean(role.status) : true
  permissionsList.value = []
  currentPage.value = 1

  submitting.value = true
  try {
    const [roleDetailRes, menuRes] = await Promise.all([
      apiClient.get(`/roles/${role.id}`),
      fetchAvailableMenus()
    ])

    if (roleDetailRes.success && roleDetailRes.data) {
      const data = roleDetailRes.data
      roleForm.code = data.code
      roleForm.name = data.name
      roleForm.description = data.description || ''
      roleForm.status = Boolean(data.status)
      permissionsList.value = data.permissions || []
    }
  } catch (error) {
    alert.type = 'error'
    alert.message = error.message || 'Gagal memuat detail peran'
  } finally {
    submitting.value = false
  }

  router.push({ query: { action: 'edit', id: role.id } })
}

// Buka Form Show Role (Detail Readonly)
const openShowForm = async (role) => {
  viewMode.value = 'form'
  formMode.value = 'show'
  currentRoleId.value = role.id
  roleForm.code = role.code
  roleForm.name = role.name
  roleForm.description = role.description || ''
  roleForm.status = role.status !== undefined ? Boolean(role.status) : true
  permissionsList.value = []
  currentPage.value = 1

  submitting.value = true
  try {
    const res = await apiClient.get(`/roles/${role.id}`)
    if (res.success && res.data) {
      const data = res.data
      roleForm.code = data.code
      roleForm.name = data.name
      roleForm.description = data.description || ''
      roleForm.status = Boolean(data.status)
      permissionsList.value = data.permissions || []
    }
  } catch (error) {
    alert.type = 'error'
    alert.message = error.message || 'Gagal memuat detail peran'
  } finally {
    submitting.value = false
  }

  router.push({ query: { action: 'show', id: role.id } })
}

// Kembali ke daftar roles
const backToList = () => {
  viewMode.value = 'list'
  router.push({ query: {} })
}

// Sub-modal Add to List
const openAddMenuModal = () => {
  if (unassignedMenus.value.length > 0) {
    selectedMenuId.value = unassignedMenus.value[0].id
  } else {
    selectedMenuId.value = ''
  }
  newMenuPerms.can_read = true
  newMenuPerms.can_create = false
  newMenuPerms.can_show = true
  newMenuPerms.can_update = false
  newMenuPerms.can_delete = false
  newMenuPerms.can_print = false
  isAddMenuModalOpen.value = true
}

const toggleSelectAllNewPerms = (val) => {
  newMenuPerms.can_read = val
  newMenuPerms.can_create = val
  newMenuPerms.can_show = val
  newMenuPerms.can_update = val
  newMenuPerms.can_delete = val
  newMenuPerms.can_print = val
}

const addMenuToList = () => {
  if (!selectedMenuId.value) return
  const menuObj = availableMenus.value.find(m => m.id === selectedMenuId.value)
  if (!menuObj) return

  permissionsList.value.push({
    menu_id: menuObj.id,
    modul: menuObj.modul || '-',
    submodul: menuObj.submodul || '-',
    menu_name: menuObj.name,
    path: menuObj.path || '-',
    can_read: Boolean(newMenuPerms.can_read),
    can_create: Boolean(newMenuPerms.can_create),
    can_show: Boolean(newMenuPerms.can_show),
    can_update: Boolean(newMenuPerms.can_update),
    can_delete: Boolean(newMenuPerms.can_delete),
    can_print: Boolean(newMenuPerms.can_print)
  })

  isAddMenuModalOpen.value = false
}

const removeItem = (menuId) => {
  permissionsList.value = permissionsList.value.filter(p => p.menu_id !== menuId)
  if (currentPage.value > totalPages.value) {
    currentPage.value = Math.max(1, totalPages.value)
  }
}

// Simpan Form (Create / Edit beserta Role Details sekaligus)
const handleSubmitRole = async () => {
  if (!roleForm.name || !roleForm.name.trim()) {
    alert.type = 'error'
    alert.message = 'Nama role wajib diisi!'
    return
  }

  submitting.value = true
  alert.message = ''
  try {
    const payload = {
      code: roleForm.code,
      name: roleForm.name,
      description: roleForm.description,
      status: Boolean(roleForm.status),
      permissions: permissionsList.value.map(p => ({
        menu_id: p.menu_id,
        can_read: Boolean(p.can_read),
        can_create: Boolean(p.can_create),
        can_show: Boolean(p.can_show),
        can_update: Boolean(p.can_update),
        can_delete: Boolean(p.can_delete),
        can_print: Boolean(p.can_print)
      }))
    }

    if (formMode.value === 'edit') {
      const res = await apiClient.put(`/roles/${currentRoleId.value}`, payload)
      if (res.success) {
        alert.type = 'success'
        alert.message = `Role "${roleForm.name}" dan hak aksesnya berhasil diperbarui!`
        backToList()
        await fetchRoles()
      }
    } else {
      const res = await apiClient.post('/roles', payload)
      if (res.success) {
        alert.type = 'success'
        alert.message = `Role baru "${roleForm.name}" berhasil dibuat!`
        backToList()
        await fetchRoles()
      }
    }
  } catch (error) {
    alert.type = 'error'
    alert.message = error.message || 'Gagal menyimpan data role'
  } finally {
    submitting.value = false
  }
}

// Hapus Role
const handleDeleteRole = async (role) => {
  if (confirm(`Hapus peran "${role.name}"? Ini akan mencabut peran dari seluruh user terkait.`)) {
    try {
      const res = await apiClient.delete(`/roles/${role.id}`)
      if (res.success) {
        alert.type = 'success'
        alert.message = 'Role berhasil dihapus'
        await fetchRoles()
      }
    } catch (error) {
      alert.type = 'error'
      alert.message = error.message || 'Gagal menghapus role'
    }
  }
}

// Inisialisasi berdasarkan route query jika ada
const checkRouteAction = async () => {
  const action = route.query.action
  const id = route.query.id

  if (action === 'add') {
    await openAddForm()
  } else if (action === 'edit' && id) {
    await openEditForm({ id })
  } else if (action === 'show' && id) {
    await openShowForm({ id })
  } else {
    viewMode.value = 'list'
  }
}

onMounted(async () => {
  await fetchRoles()
  await checkRouteAction()
})

watch(() => route.query, async () => {
  await checkRouteAction()
})
</script>
