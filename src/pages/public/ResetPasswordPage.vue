<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/base/BaseButton.vue'
import FormInput from '@/components/base/FormInput.vue'
import Logo from '@/components/base/Logo.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const password = ref('')
const confirmPassword = ref('')
const formError = ref('')
const isSuccess = ref(false)

// Token dari URL query param: /reset-password?token=xxx atau ?code=xxx
const token = ref(route.query.token || route.query.code || '')

onMounted(() => {
  if (!token.value) {
    formError.value = 'Token reset password tidak ditemukan atau tidak valid. Silakan minta link baru.'
  }
})

async function handleSubmit() {
  formError.value = ''

  if (!token.value) {
    formError.value = 'Token tidak valid. Silakan minta link reset password baru.'
    return
  }
  if (!password.value || !confirmPassword.value) {
    formError.value = 'Semua field wajib diisi'
    return
  }
  if (password.value.length < 6) {
    formError.value = 'Password minimal 6 karakter'
    return
  }
  if (password.value !== confirmPassword.value) {
    formError.value = 'Konfirmasi password tidak cocok'
    return
  }

  try {
    await auth.resetPassword(token.value, password.value)
    isSuccess.value = true
  } catch (err) {
    formError.value = err.message
  }
}
</script>

<template>
  <div class="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
    <div class="w-full max-w-md">
      <div class="bg-surface rounded-lg border border-border shadow-card p-8">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="flex justify-center mb-4">
            <Logo height="h-14" />
          </div>
          <h1 class="font-poppins font-bold text-xl text-primary-dark">Buat Password Baru</h1>
          <p class="text-sm text-text-secondary mt-1">Masukkan password baru untuk akunmu.</p>
        </div>

        <!-- Success State -->
        <div v-if="isSuccess" class="text-center">
          <div class="flex justify-center mb-4">
            <div class="w-16 h-16 rounded-full bg-primary-soft flex items-center justify-center text-primary">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <p class="text-sm text-text-secondary mb-6">
            Password berhasil diperbarui! Kamu bisa masuk sekarang dengan password baru.
          </p>
          <BaseButton variant="primary" full-width @click="router.push('/masuk')">
            Masuk Sekarang
          </BaseButton>
        </div>

        <!-- Form -->
        <form v-else @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Optional Token input if user navigates without query param -->
          <div v-if="!route.query.token && !route.query.code">
            <FormInput
              v-model="token"
              label="Token / Kode Reset"
              type="text"
              placeholder="Masukkan kode atau token dari email"
              required
            />
          </div>

          <FormInput
            v-model="password"
            label="Password Baru"
            type="password"
            placeholder="Minimal 6 karakter"
            required
          />
          <FormInput
            v-model="confirmPassword"
            label="Konfirmasi Password Baru"
            type="password"
            placeholder="Ulangi password baru"
            required
          />

          <!-- Error -->
          <div v-if="formError" class="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-error flex items-start gap-2">
            <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
            <div>
              <span>{{ formError }}</span>
              <div v-if="!token" class="mt-1">
                <RouterLink to="/lupa-password" class="underline font-medium hover:text-error-dark">
                  Minta link baru
                </RouterLink>
              </div>
            </div>
          </div>

          <BaseButton type="submit" variant="primary" full-width :loading="auth.isLoading" :disabled="!token">
            Simpan Password Baru
          </BaseButton>

          <p class="text-center text-sm text-text-secondary mt-2">
            <RouterLink to="/masuk" class="text-primary font-medium hover:underline">
              ← Kembali ke Masuk
            </RouterLink>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

