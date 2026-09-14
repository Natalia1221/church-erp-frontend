<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Manajemen Pengguna</h1>
        <p class="text-sm text-slate-500 mt-0.5">Kelola akun jemaat, pengurus, dan staf gereja</p>
      </div>

      <button
        v-if="canCreate"
        @click="openAddModal"
        class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2"
      >
        <span>➕</span>
        <span>Tambah Pengguna</span>
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

    <!-- Users Table Card -->
    <div class="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-600">
          <thead class="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th class="py-3.5 px-6 font-semibold">Nama Lengkap</th>
              <th class="py-3.5 px-6 font-semibold">Email / Username</th>
              <th class="py-3.5 px-6 font-semibold">Peran (Role)</th>
              <th class="py-3.5 px-6 font-semibold">Status</th>
              <th class="py-3.5 px-6 font-semibold">Terdaftar</th>
              <th class="py-3.5 px-6 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="loading">
              <td colspan="6" class="py-10 text-center text-slate-400">
                <span class="inline-block w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-2"></span>
                Memuat data pengguna...
              </td>
            </tr>

            <tr v-else-if="users.length === 0">
              <td colspan="6" class="py-10 text-center text-slate-400">
                Belum ada data pengguna yang terdaftar.
              </td>
            </tr>

            <tr v-for="user in users" :key="user.id" class="hover:bg-slate-50/60 transition-colors">
              <td class="py-4 px-6 font-semibold text-slate-900">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                    {{ user.name?.charAt(0)?.toUpperCase() }}
                  </div>
                  <span>{{ user.name }}</span>
                </div>
              </td>
              <td class="py-4 px-6 text-slate-600">{{ user.email }}</td>
              <td class="py-4 px-6">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="r in user.roles"
                    :key="r.id"
                    class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100"
                  >
                    {{ r.name }}
                  </span>
                  <span v-if="!user.roles || user.roles.length === 0" class="text-xs text-slate-400 italic">
                    Belum ada role
                  </span>
                </div>
              </td>
              <td class="py-4 px-6">
                <span
                  :class="[
                    'px-2.5 py-0.5 rounded-full text-xs font-semibold',
                    user.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                  ]"
                >
                  {{ user.is_active ? 'Aktif' : 'Non-Aktif' }}
                </span>
              </td>
              <td class="py-4 px-6 text-xs text-slate-500">
                {{ new Date(user.created_at).toLocaleDateString('id-ID') }}
              </td>
              <td class="py-4 px-6 text-right space-x-2">
                <button
                  v-if="canUpdate"
                  @click="openEditModal(user)"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  Edit
                </button>
                <button
                  v-if="canDelete"
                  @click="handleDelete(user)"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                >
                  Hapus
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form (Create / Edit) -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
    >
      <div class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-xl space-y-5">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 class="text-base font-bold text-slate-900">
            {{ isEditMode ? 'Edit Pengguna' : 'Tambah Pengguna Baru' }}
          </h3>
          <button @click="isModalOpen = false" class="text-slate-400 hover:text-slate-700">✕</button>
        </div>

        <form @submit.prevent="saveUser" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Nama Lengkap</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Email / Username <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="form.email"
              type="text"
              required
              placeholder="Contoh: gsm3 atau nama@gereja.com"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
            <p class="text-[11px] text-slate-400 mt-1">Dapat diisi alamat email atau username (tanpa spasi).</p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Kata Sandi {{ isEditMode ? '(Kosongkan jika tidak diubah)' : '' }}
            </label>
            <input
              v-model="form.password"
              type="password"
              :required="!isEditMode"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Peran (Role)</label>
            <select
              v-model="form.role_id"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            >
              <option value="">-- Pilih Role --</option>
              <option v-for="r in rolesList" :key="r.id" :value="r.id">
                {{ r.name }} ({{ r.code }})
              </option>
            </select>
          </div>

          <div class="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_active"
              v-model="form.is_active"
              class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label for="is_active" class="text-sm font-medium text-slate-700">Akun Aktif</label>
          </div>

          <div class="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              @click="isModalOpen = false"
              class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all disabled:opacity-50"
            >
              {{ submitting ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import apiClient from '@/api/axios'
import { usePermissions } from '@/composables/usePermissions'

const { canRead, canCreate, canShow, canUpdate, canDelete, canPrint } = usePermissions()

const users = ref([])
const rolesList = ref([])
const loading = ref(false)
const submitting = ref(false)
const isModalOpen = ref(false)
const isEditMode = ref(false)
const currentUserId = ref(null)

const alert = reactive({
  type: 'success',
  message: ''
})

const form = reactive({
  name: '',
  email: '',
  password: '',
  role_id: '',
  is_active: true
})

const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await apiClient.get('/users')
    if (res.success) {
      users.value = res.data || []
    }
  } catch (error) {
    console.error('Error fetching users:', error)
  } finally {
    loading.value = false
  }
}

const fetchRoles = async () => {
  try {
    const res = await apiClient.get('/roles')
    if (res.success) {
      rolesList.value = res.data || []
    }
  } catch (error) {
    console.error('Error fetching roles:', error)
  }
}

const openAddModal = () => {
  isEditMode.value = false
  currentUserId.value = null
  form.name = ''
  form.email = ''
  form.password = ''
  form.role_id = rolesList.value[0]?.id || ''
  form.is_active = true
  isModalOpen.value = true
}

const openEditModal = (user) => {
  isEditMode.value = true
  currentUserId.value = user.id
  form.name = user.name
  form.email = user.email
  form.password = ''
  form.role_id = user.roles && user.roles.length > 0 ? user.roles[0].id : ''
  form.is_active = Boolean(user.is_active)
  isModalOpen.value = true
}

const saveUser = async () => {
  submitting.value = true
  alert.message = ''
  try {
    if (isEditMode.value) {
      const payload = {
        name: form.name,
        email: form.email,
        role_id: form.role_id,
        is_active: form.is_active
      }
      if (form.password) payload.password = form.password

      const res = await apiClient.put(`/users/${currentUserId.value}`, payload)
      if (res.success) {
        alert.type = 'success'
        alert.message = 'Pengguna berhasil diperbarui'
        isModalOpen.value = false
        await fetchUsers()
      }
    } else {
      const res = await apiClient.post('/users', form)
      if (res.success) {
        alert.type = 'success'
        alert.message = 'Pengguna baru berhasil ditambahkan'
        isModalOpen.value = false
        await fetchUsers()
      }
    }
  } catch (error) {
    alert.type = 'error'
    alert.message = error.message || 'Gagal menyimpan data pengguna'
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (user) => {
  if (confirm(`Apakah Anda yakin ingin menonaktifkan pengguna "${user.name}"?`)) {
    try {
      const res = await apiClient.delete(`/users/${user.id}`)
      if (res.success) {
        alert.type = 'success'
        alert.message = res.message || 'Pengguna berhasil dinonaktifkan'
        await fetchUsers()
      }
    } catch (error) {
      alert.type = 'error'
      alert.message = error.message || 'Gagal menghapus pengguna'
    }
  }
}

onMounted(() => {
  fetchUsers()
  fetchRoles()
})
</script>
