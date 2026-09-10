<template>
  <div class="flex h-screen bg-[#070d19] overflow-hidden font-sans text-slate-100">
    <!-- Sidebar Komponen -->
    <Sidebar
      :is-collapsed="isCollapsed"
      :is-mobile-open="isMobileOpen"
      @close-mobile="isMobileOpen = false"
    />

    <!-- Main Content Wrapper -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#070d19]">
      <!-- Header Komponen -->
      <Header
        :is-collapsed="isCollapsed"
        @toggle-collapse="isCollapsed = !isCollapsed"
        @toggle-mobile="isMobileOpen = !isMobileOpen"
      />

      <!-- Router View / Konten Halaman Utama -->
      <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#070d19] custom-scroll">
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
  background: #070d19;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #1b2c4f;
  border-radius: 9999px;
}
.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: #253e70;
}
</style>
