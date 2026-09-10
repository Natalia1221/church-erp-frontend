import { defineStore } from 'pinia'
import apiClient from '@/api/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null,
    myMenus: [],
    loading: false,
    loadingMenus: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRoles: (state) => state.user?.roles || []
  },

  actions: {
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

          // Ambil menu dinamis setelah login
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
        if (response.success) {
          this.myMenus = response.data || []
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
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
})
