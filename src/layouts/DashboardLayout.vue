<script setup>
import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col bg-background">
    <AppNavbar />
    <main class="flex-1">
      <div class="section-container py-6 md:py-10">
        <RouterView />
      </div>
    </main>
    <AppFooter />
  </div>
</template>
