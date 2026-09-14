import { defineStore } from 'pinia'
import apiClient from '@/api/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null,
    myMenus: [],
    permissionsMap: JSON.parse(localStorage.getItem('user_permissions') || '{}'),
    loading: false,
    loadingMenus: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRoles: (state) => state.user?.roles || [],
    getPermissionsByPath: (state) => (path) => {
      // Default: semua izin aktif jika belum login atau belum ada path
      if (!path) {
        return { can_read: true, can_create: true, can_show: true, can_update: true, can_delete: true, can_print: true }
      }

      const cleanPath = path.split('?')[0].split('#')[0].trim().toLowerCase().replace(/\/+$/, '') || '/'

      // Jika belum ada permissionsMap (misal sebelum initial load selesai)
      if (!state.permissionsMap || Object.keys(state.permissionsMap).length === 0) {
        return { can_read: true, can_create: true, can_show: true, can_update: true, can_delete: true, can_print: true }
      }

      // 1. Pencocokan langsung (exact path match)
      if (state.permissionsMap[cleanPath]) {
        return state.permissionsMap[cleanPath]
      }

      // 2. Pencocokan prefix / parent path
      for (const [key, perms] of Object.entries(state.permissionsMap)) {
        if (cleanPath === key || cleanPath.startsWith(key + '/')) {
          return perms
        }
      }

      // Jika menu tidak terdaftar pada hak akses user yang login
      return {
        can_read: false,
        can_create: false,
        can_show: false,
        can_update: false,
        can_delete: false,
        can_print: false
      }
    }
  },

  actions: {
    setPermissions(permissionsArray) {
      const map = {}
      if (Array.isArray(permissionsArray)) {
        for (const item of permissionsArray) {
          if (item.path) {
            const cleanPath = item.path.trim().toLowerCase().replace(/\/+$/, '') || '/'
            map[cleanPath] = {
              can_read: Boolean(item.can_read),
              can_create: Boolean(item.can_create),
              can_show: Boolean(item.can_show),
              can_update: Boolean(item.can_update),
              can_delete: Boolean(item.can_delete),
              can_print: Boolean(item.can_print)
            }
          }
        }
      }
      this.permissionsMap = map
      localStorage.setItem('user_permissions', JSON.stringify(map))
    },

    setPermissionsFromTree(treeNodes) {
      const map = {}
      const traverse = (nodes) => {
        if (!Array.isArray(nodes)) return
        for (const node of nodes) {
          if (node.path) {
            const cleanPath = node.path.trim().toLowerCase().replace(/\/+$/, '') || '/'
            map[cleanPath] = {
              can_read: Boolean(node.can_read),
              can_create: Boolean(node.can_create),
              can_show: Boolean(node.can_show),
              can_update: Boolean(node.can_update),
              can_delete: Boolean(node.can_delete),
              can_print: Boolean(node.can_print)
            }
          }
          if (node.children && node.children.length > 0) {
            traverse(node.children)
          }
        }
      }
      traverse(treeNodes)
      this.permissionsMap = map
      localStorage.setItem('user_permissions', JSON.stringify(map))
    },

    async login(email, password) {
      this.loading = true
      try {
        const response = await apiClient.post('/auth/login', { email, password })
        if (response.success && response.data) {
          const { user, token } = response.data
          this.user = user
          this.token = token
          localStorage.setItem('token', token)
          localStorage.setItem('user', JSON.stringify(user))

          // Ambil menu dinamis & detail permissions role setelah login
          await this.fetchMyMenus()
          return { success: true }
        }
        return { success: false, message: response.message }
      } catch (error) {
        return { success: false, message: error.message || 'Login gagal, periksa email & password Anda' }
      } finally {
        this.loading = false
      }
    },

    async fetchMe() {
      if (!this.token) return
      try {
        const response = await apiClient.get('/auth/me')
        if (response.success) {
          this.user = response.data
          localStorage.setItem('user', JSON.stringify(response.data))
        }
      } catch (error) {
        console.error('Gagal mengambil data user:', error)
      }
    },

    async fetchMyMenus() {
      if (!this.token) return
      this.loadingMenus = true
      try {
        const response = await apiClient.get('/menus/my-menus')
        if (response.success && response.data) {
          if (Array.isArray(response.data)) {
            this.myMenus = response.data
            this.setPermissionsFromTree(response.data)
          } else {
            this.myMenus = response.data.menus || response.data.tree || []
            if (response.data.permissions) {
              this.setPermissions(response.data.permissions)
            } else {
              this.setPermissionsFromTree(this.myMenus)
            }
          }
        }
      } catch (error) {
        console.error('Gagal mengambil menu user:', error)
        this.myMenus = []
      } finally {
        this.loadingMenus = false
      }
    },

    logout() {
      this.user = null
      this.token = null
      this.myMenus = []
      this.permissionsMap = {}
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('user_permissions')
    }
  }
})
