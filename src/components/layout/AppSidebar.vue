<script setup>
import { computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  role: { type: String, required: true },
  collapsed: { type: Boolean, default: false }
})

const emit = defineEmits(['logout'])

const router = useRouter()
const auth = useAuthStore()

const navItems = computed(() => {
  if (props.role === 'supplier') {
    return [
      { label: 'Dashboard', to: '/supplier', icon: 'grid', exact: true },
      { label: 'Tambah Makanan', to: '/supplier/tambah', icon: 'plus-circle' },
      { label: 'Pesanan Masuk', to: '/supplier/pesanan', icon: 'clipboard-list' },
    ]
  }
  if (props.role === 'courier') {
    return [
      { label: 'Dashboard & Tugas', to: '/kurir', icon: 'truck', exact: true },
    ]
  }
  if (props.role === 'admin') {
    return [
      { label: 'Dashboard', to: '/admin', icon: 'bar-chart', exact: true },
      { label: 'Pengaduan', to: '/admin/pengaduan', icon: 'alert-circle' },
      { label: 'Bantuan', to: '/admin/bantuan', icon: 'help-circle' },
      { label: 'Syarat & Ketentuan', to: '/admin/syarat', icon: 'file-text' },
      { label: 'Pengaturan', to: '/admin/pengaturan', icon: 'settings' },
    ]
  }
  return []
})

function logout() {
  auth.logout()
  router.push('/')
}

const roleLabel = computed(() => ({
  supplier: 'Portal Supplier',
  courier: 'Portal Kurir Rekanan',
  admin: 'Admin Panel'
})[props.role] || '')
</script>

<template>
  <aside class="flex flex-col h-full bg-surface border-r border-border shadow-sidebar">
    <!-- Logo header -->
    <div class="h-20 flex items-center px-6 border-b border-border gap-3">
      <div class="w-10 h-10 bg-primary rounded-md flex items-center justify-center text-white font-bold text-lg font-poppins flex-shrink-0">N</div>
      <div v-if="!collapsed">
        <p class="font-poppins font-bold text-primary-dark text-sm leading-tight">NGENYANGIN</p>
        <p class="text-xs text-text-secondary">{{ roleLabel }}</p>
      </div>
    </div>

    <!-- User info -->
    <div class="px-4 py-4 border-b border-border">
      <div class="flex items-center gap-3 p-3 bg-primary-soft rounded-md">
        <img
          :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${auth.userName}`"
          :alt="auth.userName"
          class="w-9 h-9 rounded-full bg-white flex-shrink-0"
        />
        <div v-if="!collapsed" class="min-w-0">
          <p class="text-sm font-semibold text-text-primary truncate">{{ auth.userName }}</p>
          <p class="text-xs text-text-secondary capitalize truncate">{{ role }}</p>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :class="['sidebar-link', $route.path === item.to ? 'active' : '']"
        :aria-label="item.label"
      >
        <!-- Icons -->
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path v-if="item.icon === 'grid'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
          <path v-if="item.icon === 'plus-circle'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
          <path v-if="item.icon === 'clipboard-list'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
          <path v-if="item.icon === 'truck'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/>
          <path v-if="item.icon === 'truck'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/>
          <path v-if="item.icon === 'bar-chart'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          <path v-if="item.icon === 'alert-circle'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          <path v-if="item.icon === 'help-circle'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          <path v-if="item.icon === 'file-text'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          <path v-if="item.icon === 'settings'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
          <path v-if="item.icon === 'settings'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
      </RouterLink>
    </nav>

    <!-- Logout -->
    <div class="px-3 py-4 border-t border-border">
      <button
        @click="logout"
        class="sidebar-link w-full text-error hover:bg-red-50 hover:text-error"
      >
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
        </svg>
        <span v-if="!collapsed">Keluar</span>
      </button>
    </div>
  </aside>
</template>
