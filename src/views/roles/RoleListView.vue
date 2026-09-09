<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Peran & Hak Akses (RBAC)</h1>
        <p class="text-sm text-slate-500 mt-0.5">Kelola role dan matriks perizinan menu di sistem</p>
      </div>

      <button
        @click="openAddRoleModal"
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

    <!-- Roles Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="role in roles"
        :key="role.id"
        class="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-slate-300 transition-all"
      >
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
              {{ role.code }}
            </span>
            <div class="space-x-1">
              <button
                @click="openEditRoleModal(role)"
                class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-xs"
                title="Edit Role"
              >
                ✏️
              </button>
              <button
                @click="handleDeleteRole(role)"
                class="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 text-xs"
                title="Hapus Role"
              >
                🗑️
              </button>
            </div>
          </div>
          <h3 class="text-base font-bold text-slate-900">{{ role.name }}</h3>
          <p class="text-xs text-slate-500 leading-relaxed">
            {{ role.description || 'Tidak ada deskripsi' }}
          </p>
        </div>

        <div class="pt-4 border-t border-slate-100">
          <button
            @click="openPermissionsModal(role)"
            class="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <span>🔐</span>
            <span>Atur Hak Akses Menu</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Form (Tambah / Edit Role) -->
    <div
      v-if="isRoleModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
    >
      <div class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-xl space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 class="text-base font-bold text-slate-900">
            {{ isEditRole ? 'Edit Peran (Role)' : 'Tambah Peran Baru' }}
          </h3>
          <button @click="isRoleModalOpen = false" class="text-slate-400 hover:text-slate-700">✕</button>
        </div>

        <form @submit.prevent="saveRole" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Kode Role</label>
            <input
              v-model="roleForm.code"
              type="text"
              required
              placeholder="Contoh: BENDAHARA"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 uppercase"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Nama Role</label>
            <input
              v-model="roleForm.name"
              type="text"
              required
              placeholder="Contoh: Bendahara Gereja"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Deskripsi</label>
            <textarea
              v-model="roleForm.description"
              rows="3"
              placeholder="Deskripsi wewenang..."
              class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            ></textarea>
          </div>

          <div class="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              @click="isRoleModalOpen = false"
              class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Matrix Permissions (role_menus) -->
    <div
      v-if="isPermissionModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
    >
      <div class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 w-full max-w-3xl shadow-xl space-y-4 max-h-[90vh] flex flex-col">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div>
            <h3 class="text-base font-bold text-slate-900">
              Hak Akses Menu: <span class="text-indigo-600">{{ currentRole?.name }}</span>
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">Tentukan hak akses baca, buat, ubah, hapus, dan cetak per menu</p>
          </div>
          <button @click="isPermissionModalOpen = false" class="text-slate-400 hover:text-slate-700">✕</button>
        </div>

        <div class="overflow-y-auto flex-1 pr-1">
          <table class="w-full text-left text-xs text-slate-600">
            <thead class="bg-slate-50 uppercase text-slate-500 border-b border-slate-200 sticky top-0">
              <tr>
                <th class="py-3 px-4 font-semibold">Nama Menu</th>
                <th class="py-3 px-3 text-center font-semibold">Baca</th>
                <th class="py-3 px-3 text-center font-semibold">Tambah</th>
                <th class="py-3 px-3 text-center font-semibold">Ubah</th>
                <th class="py-3 px-3 text-center font-semibold">Hapus</th>
                <th class="py-3 px-3 text-center font-semibold">Cetak</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="permissionsList.length === 0">
                <td colspan="6" class="py-8 text-center text-slate-400">
                  Belum ada menu di sistem.
                </td>
              </tr>
              <tr v-for="item in permissionsList" :key="item.menu_id" class="hover:bg-slate-50/60">
                <td class="py-3 px-4 font-semibold text-slate-900">
                  {{ item.menu_name }}
                </td>
                <td class="py-3 px-3 text-center">
                  <input type="checkbox" v-model="item.can_read" class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                </td>
                <td class="py-3 px-3 text-center">
                  <input type="checkbox" v-model="item.can_create" class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                </td>
                <td class="py-3 px-3 text-center">
                  <input type="checkbox" v-model="item.can_update" class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                </td>
                <td class="py-3 px-3 text-center">
                  <input type="checkbox" v-model="item.can_delete" class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                </td>
                <td class="py-3 px-3 text-center">
                  <input type="checkbox" v-model="item.can_print" class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pt-4 flex items-center justify-between border-t border-slate-100 shrink-0">
          <div class="text-xs text-slate-400">
            Total {{ permissionsList.length }} menu terdaftar
          </div>
          <div class="flex items-center gap-3">
            <button
              type="button"
              @click="isPermissionModalOpen = false"
              class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="button"
              @click="savePermissions"
              :disabled="submitting"
              class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all disabled:opacity-50"
            >
              {{ submitting ? 'Menyimpan...' : 'Simpan Hak Akses' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import apiClient from '@/api/axios'

const roles = ref([])
const loading = ref(false)
const submitting = ref(false)

const isRoleModalOpen = ref(false)
const isEditRole = ref(false)
const currentRoleId = ref(null)

const isPermissionModalOpen = ref(false)
const currentRole = ref(null)
const permissionsList = ref([])

const alert = reactive({
  type: 'success',
  message: ''
})

const roleForm = reactive({
  code: '',
  name: '',
  description: ''
})

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

const openAddRoleModal = () => {
  isEditRole.value = false
  currentRoleId.value = null
  roleForm.code = ''
  roleForm.name = ''
  roleForm.description = ''
  isRoleModalOpen.value = true
}

const openEditRoleModal = (role) => {
  isEditRole.value = true
  currentRoleId.value = role.id
  roleForm.code = role.code
  roleForm.name = role.name
  roleForm.description = role.description
  isRoleModalOpen.value = true
}

const saveRole = async () => {
  submitting.value = true
  alert.message = ''
  try {
    if (isEditRole.value) {
      const res = await apiClient.put(`/roles/${currentRoleId.value}`, roleForm)
      if (res.success) {
        alert.type = 'success'
        alert.message = 'Role berhasil diperbarui'
        isRoleModalOpen.value = false
        await fetchRoles()
      }
    } else {
      const res = await apiClient.post('/roles', roleForm)
      if (res.success) {
        alert.type = 'success'
        alert.message = 'Role baru berhasil ditambahkan'
        isRoleModalOpen.value = false
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

const openPermissionsModal = async (role) => {
  currentRole.value = role
  submitting.value = true
  try {
    const res = await apiClient.get(`/roles/${role.id}/permissions`)
    if (res.success && res.data) {
      permissionsList.value = res.data.permissions || []
      isPermissionModalOpen.value = true
    }
  } catch (error) {
    alert.type = 'error'
    alert.message = error.message || 'Gagal mengambil hak akses role'
  } finally {
    submitting.value = false
  }
}

const savePermissions = async () => {
  submitting.value = true
  try {
    const payload = {
      permissions: permissionsList.value.map(p => ({
        menu_id: p.menu_id,
        can_read: Boolean(p.can_read),
        can_create: Boolean(p.can_create),
        can_update: Boolean(p.can_update),
        can_delete: Boolean(p.can_delete),
        can_print: Boolean(p.can_print)
      }))
    }
    const res = await apiClient.put(`/roles/${currentRole.value.id}/permissions`, payload)
    if (res.success) {
      alert.type = 'success'
      alert.message = `Hak akses untuk role "${currentRole.value.name}" berhasil disimpan!`
      isPermissionModalOpen.value = false
    }
  } catch (error) {
    alert.type = 'error'
    alert.message = error.message || 'Gagal menyimpan hak akses'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchRoles()
})
</script>
