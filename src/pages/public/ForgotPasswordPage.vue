<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/base/BaseButton.vue'
import FormInput from '@/components/base/FormInput.vue'
import Logo from '@/components/base/Logo.vue'

const route = useRoute()
const auth = useAuthStore()

const email = ref(route.query.email || '')
const formError = ref('')
const successMsg = ref('')
const isSubmitted = ref(false)
const demoToken = ref('')

async function handleSubmit() {
  formError.value = ''
  successMsg.value = ''

  if (!email.value) {
    formError.value = 'Email wajib diisi'
    return
  }

  try {
    const res = await auth.forgotPassword(email.value)
    isSubmitted.value = true
    successMsg.value = `Link reset password telah dikirim ke ${email.value}. Periksa inbox atau folder spam kamu.`
    if (res?.token) demoToken.value = res.token
    else if (res?.reset_token) demoToken.value = res.reset_token
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
          <h1 class="font-poppins font-bold text-xl text-primary-dark">Lupa Password</h1>
          <p class="text-sm text-text-secondary mt-1">
            Masukkan email kamu dan kami akan kirimkan link untuk reset password.
          </p>
        </div>

        <!-- Success State -->
        <div v-if="isSubmitted" class="text-center">
          <div class="flex justify-center mb-4">
            <div class="w-16 h-16 rounded-full bg-primary-soft flex items-center justify-center text-primary">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p class="text-sm text-text-secondary mb-6">{{ successMsg }}</p>

          <div v-if="demoToken" class="mb-6 p-3 bg-primary-soft/50 border border-primary/20 rounded-md text-xs text-left">
            <p class="font-medium text-primary-dark mb-1">Token Reset Ditemukan (Testing):</p>
            <RouterLink
              :to="{ path: '/reset-password', query: { token: demoToken } }"
              class="text-primary font-semibold underline break-all"
            >
              Klik di sini untuk langsung atur password baru &rarr;
            </RouterLink>
          </div>

          <BaseButton variant="outline" full-width @click="isSubmitted = false; email = ''; demoToken = ''">
            Kirim Ulang Email
          </BaseButton>

          <p class="text-center text-sm text-text-secondary mt-4">
            <RouterLink to="/masuk" class="text-primary font-medium hover:underline">
              ← Kembali ke Masuk
            </RouterLink>
          </p>
        </div>

        <!-- Form -->
        <form v-else @submit.prevent="handleSubmit" class="space-y-4">
          <FormInput
            v-model="email"
            label="Email"
            type="email"
            placeholder="contoh@email.com"
            required
          />

          <!-- Error -->
          <div v-if="formError" class="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-error flex items-center gap-2">
            <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
            <span>{{ formError }}</span>
          </div>

          <BaseButton type="submit" variant="primary" full-width :loading="auth.isLoading">
            Kirim Link Reset Password
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

