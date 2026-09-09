<template>
  <div class="min-h-screen flex items-center justify-center bg-[#070d19] p-6 relative overflow-hidden font-sans">
    <!-- Ambient glowing backgrounds -->
    <div class="absolute -top-40 -left-40 w-96 h-96 bg-cyan-900/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl pointer-events-none"></div>

    <div class="w-full max-w-md relative z-10">
      <!-- Card Container -->
      <div class="bg-[#0b1426]/95 border border-[#15233e] rounded-2xl p-8 shadow-2xl shadow-black/80">
        <!-- Logo and Header -->
        <div class="text-center mb-8">
          <div class="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-black/40 mx-auto mb-4 text-[#0b1426]">
            <svg class="w-8 h-8 text-[#0b1426]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <h1 class="text-xl font-extrabold text-white tracking-wide">
            CHURCH <span class="text-cyan-400">ERP</span>
          </h1>
          <p class="text-[#7e95b7] text-xs mt-1">
            Enterprise System v1.0 • Portal Administrasi
          </p>
        </div>

        <!-- Alert Error -->
        <div
          v-if="errorMessage"
          class="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5"
        >
          <span class="text-sm">⚠️</span>
          <div class="flex-1">{{ errorMessage }}</div>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-[#cbd5e1] uppercase tracking-wider mb-1.5">
              Alamat Email
            </label>
            <input
              v-model="email"
              type="email"
              required
              placeholder="admin@gereja.com"
              class="w-full px-4 py-2.5 rounded-lg bg-[#101c34] border border-[#1c2e50] text-white placeholder-[#7e95b7] focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm transition-colors"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-[#cbd5e1] uppercase tracking-wider mb-1.5">
              Kata Sandi
            </label>
            <input
              v-model="password"
              type="password"
              required
              placeholder="••••••••"
              class="w-full px-4 py-2.5 rounded-lg bg-[#101c34] border border-[#1c2e50] text-white placeholder-[#7e95b7] focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm transition-colors"
            />
          </div>

          <div class="flex items-center justify-between text-xs pt-1">
            <label class="flex items-center text-[#7e95b7] cursor-pointer">
              <input type="checkbox" class="rounded border-[#1c2e50] bg-[#101c34] text-cyan-500 focus:ring-cyan-500/30 mr-2" />
              Ingat saya
            </label>
            <span class="text-cyan-400 text-[11px]">Bantuan Akses</span>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full mt-2 py-3 px-4 rounded-lg bg-[#162a52] hover:bg-[#1c3668] border border-[#23427f] text-white font-semibold shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
          >
            <span v-if="loading" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>{{ loading ? 'Memverifikasi...' : 'Masuk ke Sistem' }}</span>
          </button>
        </form>

        <div class="mt-6 pt-5 border-t border-[#15233e] text-center">
          <p class="text-[11px] text-[#7e95b7]">
            Gunakan <code class="text-cyan-300 font-mono">admin@gereja.com</code> / <code class="text-cyan-300 font-mono">password123</code>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('admin@gereja.com')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)

const handleLogin = async () => {
  errorMessage.value = ''
  loading.value = true

  const result = await authStore.login(email.value, password.value)

  if (result.success) {
    router.push('/dashboard')
  } else {
    errorMessage.value = result.message || 'Login gagal. Periksa kembali email dan kata sandi.'
  }

  loading.value = false
}
</script>
