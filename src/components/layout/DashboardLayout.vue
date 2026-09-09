<template>
  <div class="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
    <!-- Sidebar Komponen -->
    <Sidebar
      :is-collapsed="isCollapsed"
      :is-mobile-open="isMobileOpen"
      @close-mobile="isMobileOpen = false"
    />

    <!-- Main Content Wrapper -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
      <!-- Header Komponen -->
      <Header
        :is-collapsed="isCollapsed"
        @toggle-collapse="isCollapsed = !isCollapsed"
        @toggle-mobile="isMobileOpen = !isMobileOpen"
      />

      <!-- Router View / Konten Halaman Utama -->
      <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
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
