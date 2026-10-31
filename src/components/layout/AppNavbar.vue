<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { getRoleDashboard } from '@/router/index.js'

const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()

const mobileMenuOpen = ref(false)
const profileOpen = ref(false)

function logout() {
  auth.logout()
  profileOpen.value = false
  router.push('/')
}

function goHome() {
  if (auth.isLoggedIn) {
    router.push(getRoleDashboard(auth.role))
  } else {
    router.push('/')
  }
}
</script>

<template>
  <header class="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-border shadow-sm">
    <div class="section-container h-16 flex items-center justify-between gap-4">
      <!-- Logo -->
      <button @click="goHome" class="flex-shrink-0" aria-label="Beranda NGENYANGIN">
        <img src="@/assets/ngenyangin.svg" alt="NGENYANGIN" class="h-8 w-auto min-w-[120px]" />
      </button>

      <!-- Nav links (desktop, consumer only) -->
      <nav v-if="auth.role === 'consumer'" class="hidden md:flex items-center gap-1">
        <RouterLink
          to="/jelajah"
          class="px-3 py-2 rounded-md text-sm font-medium text-text-secondary hover:text-primary hover:bg-primary-soft transition-colors"
          active-class="text-primary bg-primary-soft font-semibold"
        >Jelajah</RouterLink>
        <RouterLink
          to="/pesanan"
          class="px-3 py-2 rounded-md text-sm font-medium text-text-secondary hover:text-primary hover:bg-primary-soft transition-colors"
          active-class="text-primary bg-primary-soft font-semibold"
        >Pesanan Saya</RouterLink>
      </nav>

      <!-- Right section -->
      <div class="flex items-center gap-2">
        <!-- Cart (consumer only) -->
        <RouterLink
          v-if="auth.role === 'consumer'"
          to="/keranjang"
          class="relative p-2.5 rounded-full hover:bg-primary-soft transition-colors"
          aria-label="Keranjang belanja"
        >
          <svg class="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
          <span
            v-if="cart.itemCount > 0"
            class="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center font-bold"
          >{{ cart.itemCount > 9 ? '9+' : cart.itemCount }}</span>
        </RouterLink>

        <!-- Guest buttons -->
        <template v-if="!auth.isLoggedIn">
          <RouterLink to="/masuk" class="hidden sm:inline-flex items-center px-4 h-9 rounded-full border border-primary text-primary text-sm font-medium hover:bg-primary-soft transition-colors">
            Masuk
          </RouterLink>
          <RouterLink to="/daftar" class="inline-flex items-center px-4 h-9 rounded-full bg-accent text-white text-sm font-medium hover:bg-accent-dark transition-colors">
            Daftar
          </RouterLink>
        </template>

        <!-- User Profile -->
        <div v-else class="relative">
          <button
            @click="profileOpen = !profileOpen"
            class="flex items-center gap-2 p-1.5 rounded-full hover:bg-primary-soft transition-colors"
            aria-label="Menu profil"
            :aria-expanded="profileOpen"
          >
            <img
              :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${auth.userName}`"
              :alt="auth.userName"
              class="w-8 h-8 rounded-full bg-primary-soft"
            />
            <svg class="w-4 h-4 text-text-secondary hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          <!-- Dropdown -->
          <div
            v-if="profileOpen"
            class="absolute right-0 top-full mt-2 w-52 bg-surface rounded-md shadow-modal border border-border animate-fade-in py-1"
            @click.outside="profileOpen = false"
          >
            <div class="px-4 py-2.5 border-b border-border">
              <p class="text-sm font-semibold text-text-primary">{{ auth.userName }}</p>
              <p class="text-xs text-text-secondary capitalize">{{ auth.role }}</p>
            </div>
            <button
              @click="logout"
              class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-error hover:bg-red-50 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              Keluar
            </button>
          </div>
        </div>

        <!-- Mobile menu toggle -->
        <button
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="md:hidden p-2 rounded-md hover:bg-primary-soft transition-colors"
          aria-label="Toggle menu"
        >
          <svg class="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile menu -->
    <div v-if="mobileMenuOpen" class="md:hidden border-t border-border bg-surface animate-fade-in">
      <div class="section-container py-3 flex flex-col gap-1">
        <template v-if="auth.role === 'consumer'">
          <RouterLink to="/jelajah" class="sidebar-link" @click="mobileMenuOpen = false">Jelajah Makanan</RouterLink>
          <RouterLink to="/pesanan" class="sidebar-link" @click="mobileMenuOpen = false">Pesanan Saya</RouterLink>
        </template>
        <template v-if="!auth.isLoggedIn">
          <RouterLink to="/masuk" class="sidebar-link" @click="mobileMenuOpen = false">Masuk</RouterLink>
          <RouterLink to="/daftar" class="sidebar-link" @click="mobileMenuOpen = false">Daftar</RouterLink>
        </template>
      </div>
    </div>
  </header>
</template>
