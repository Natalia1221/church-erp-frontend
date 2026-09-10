<template>
  <div class="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 sm:p-6 relative overflow-hidden font-sans">
    <!-- Subtle soft ambient background accents -->
    <div class="absolute -top-40 -left-40 w-96 h-96 bg-cyan-100/60 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-slate-200/60 rounded-full blur-3xl pointer-events-none"></div>

    <div class="w-full max-w-md relative z-10">
      <!-- Card Container (Dominasi Putih Bersih) -->
      <div class="bg-white border border-slate-200 rounded-2xl p-7 sm:p-9 shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
        <!-- Logo and Header -->
        <div class="text-center mb-7">
          <!-- Logo Box: Container Putih Bersih dengan Shadow Halus -->
          <div class="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-lg shadow-slate-900/10 mx-auto mb-3.5 p-2">
            <img src="/logo-hkbp.svg" alt="HKBP Logo" class="w-12 h-12 object-contain" />
          </div>
          <h1 class="text-xl font-extrabold text-slate-900 tracking-wide">
            HKBP <span class="text-cyan-600">ERP</span>
          </h1>
          <p class="text-slate-500 text-xs mt-1">
            Enterprise Church System • Portal Administrasi
          </p>
        </div>

        <!-- Alert Error -->
        <div
          v-if="errorMessage"
          class="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5"
        >
          <span class="text-sm shrink-0">⚠️</span>
          <div class="flex-1">{{ errorMessage }}</div>
        </div>

        <!-- Form (Dominan Terang / Putih) -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Alamat Email
            </label>
            <input
              v-model="email"
              type="email"
              required
              placeholder="admin@gereja.com"
              class="w-full px-4 py-2.5 rounded-xl bg-slate-50/70 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20 text-sm transition-all"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Kata Sandi
            </label>
            <input
              v-model="password"
              type="password"
              required
              placeholder="••••••••"
              class="w-full px-4 py-2.5 rounded-xl bg-slate-50/70 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20 text-sm transition-all"
            />
          </div>

          <div class="flex items-center justify-between text-xs pt-1">
            <label class="flex items-center text-slate-600 cursor-pointer">
              <input type="checkbox" class="rounded border-slate-300 bg-white text-cyan-600 focus:ring-cyan-500/30 mr-2" />
              Ingat saya
            </label>
            <span class="text-cyan-600 hover:text-cyan-700 font-medium text-[11px] cursor-pointer">
              Bantuan Akses
            </span>
          </div>

          <!-- Tombol Masuk: Elemen gelap (#0b1426) yang senada dengan Sidebar -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full mt-2 py-3 px-4 rounded-xl bg-[#0b1426] hover:bg-[#15233e] text-white font-semibold shadow-md shadow-slate-900/15 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm cursor-pointer"
          >
            <span v-if="loading" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>{{ loading ? 'Memverifikasi...' : 'Masuk ke Sistem' }}</span>
          </button>
        </form>

        <!-- Keterangan Login Bantuan -->
        <div class="mt-6 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
          <p class="text-[11.5px] text-slate-600">
            Kredensial Default: <code class="text-cyan-700 bg-cyan-50 border border-cyan-200/60 px-1.5 py-0.5 rounded font-mono font-medium">admin@gereja.com</code> / <code class="text-cyan-700 bg-cyan-50 border border-cyan-200/60 px-1.5 py-0.5 rounded font-mono font-medium">password123</code>
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
