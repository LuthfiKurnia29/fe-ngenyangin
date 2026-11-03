<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getRoleDashboard } from '@/router/index.js'
import BaseButton from '@/components/base/BaseButton.vue'
import FormInput from '@/components/base/FormInput.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const formError = ref('')

async function handleLogin() {
  formError.value = ''
  if (!email.value || !password.value) {
    formError.value = 'Email dan password wajib diisi'
    return
  }
  try {
    const user = await auth.login(email.value, password.value)
    const redirect = route.query.redirect || getRoleDashboard(user.role)
    router.push(redirect)
  } catch (err) {
    formError.value = err.message
  }
}

const demoAccounts = [
  { label: 'Konsumen', email: 'konsumen@demo.id' },
  { label: 'Supplier', email: 'supplier@demo.id' },
  { label: 'Admin', email: 'admin@demo.id' },
]

function fillDemo(acc) {
  email.value = acc.email
  password.value = 'demo123'
}
</script>

<template>
  <div class="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
    <div class="w-full max-w-md">
      <!-- Card -->
      <div class="bg-surface rounded-lg border border-border shadow-card p-8">
        <!-- Logo -->
        <div class="text-center mb-8">
          <img src="@/assets/ngenyangin.svg" alt="NGENYANGIN" class="h-10 mx-auto mb-4" />
          <h1 class="font-poppins font-bold text-xl text-primary-dark">Masuk ke Akun</h1>
          <p class="text-sm text-text-secondary mt-1">Selamat datang kembali! Pilih peran dan masuk.</p>
        </div>

        <!-- Demo accounts quick-fill -->
        <div class="mb-6">
          <p class="text-xs text-text-secondary mb-2 font-medium">Akun Demo (klik untuk mengisi):</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="acc in demoAccounts"
              :key="acc.email"
              @click="fillDemo(acc)"
              :class="[
                'chip text-xs cursor-pointer transition-all hover:scale-105',
                email === acc.email ? 'bg-primary text-white' : 'bg-primary-soft text-primary hover:bg-primary/20'
              ]"
            >
              {{ acc.label }}
            </button>
          </div>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <FormInput
            v-model="email"
            label="Email"
            type="email"
            placeholder="contoh@email.com"
            required
          />

          <FormInput
            v-model="password"
            label="Password"
            type="password"
            placeholder="Masukkan password"
            required
          />

          <!-- Error -->
          <div v-if="formError" class="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-error flex items-center gap-2">
            <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
            {{ formError }}
          </div>

          <BaseButton type="submit" variant="primary" full-width :loading="auth.isLoading">
            Masuk
          </BaseButton>
        </form>

        <!-- Register link -->
        <p class="text-center text-sm text-text-secondary mt-6">
          Belum punya akun?
          <RouterLink to="/daftar" class="text-primary font-medium hover:underline">Daftar sekarang</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
