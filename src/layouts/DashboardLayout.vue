<script setup>
import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <div class="min-h-screen flex bg-background">
    <AppSidebar :role="auth.role" />
    <div class="flex-1 flex flex-col">
      <AppNavbar />
      <main class="flex-1 overflow-y-auto p-6 md:p-8">
        <RouterView />
      </main>
      <AppFooter />
    </div>
  </div>
</template>
