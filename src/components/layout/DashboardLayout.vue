<template>
  <div class="flex h-screen bg-[#f8fafc] overflow-hidden font-sans text-slate-800">
    <!-- Sidebar Komponen (Tetap Gelap / Enterprise Dark Navy) -->
    <Sidebar
      :is-collapsed="isCollapsed"
      :is-mobile-open="isMobileOpen"
      @close-mobile="isMobileOpen = false"
    />

    <!-- Main Content Wrapper (Putih / Terang) -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f8fafc]">
      <!-- Header Komponen (Putih / Bersih) -->
      <Header
        :is-collapsed="isCollapsed"
        @toggle-collapse="isCollapsed = !isCollapsed"
        @toggle-mobile="isMobileOpen = !isMobileOpen"
      />

      <!-- Router View / Konten Halaman Utama (Putih / Terang) -->
      <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#f8fafc] custom-scroll">
        <div class="max-w-7xl mx-auto">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import Header from '@/components/layout/Header.vue'

// Reaktivitas ref untuk toggle Sidebar
const isCollapsed = ref(false)
const isMobileOpen = ref(false)
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: #f1f5f9;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 9999px;
}
.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
