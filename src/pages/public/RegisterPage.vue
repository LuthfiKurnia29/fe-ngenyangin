<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getRoleDashboard } from '@/router/index.js'
import BaseButton from '@/components/base/BaseButton.vue'
import FormInput from '@/components/base/FormInput.vue'

const router = useRouter()
const auth = useAuthStore()

const name = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const selectedRole = ref('')
const gender = ref('')
const formError = ref('')

const roles = [
  { value: 'consumer', label: 'Konsumen', desc: 'Beli makanan surplus dengan harga diskon', emoji: '🛒' },
  { value: 'supplier', label: 'Supplier', desc: 'Jual surplus makanan dari usaha kuliner Anda', emoji: '🏪' },
]

async function handleRegister() {
  formError.value = ''
  if (!name.value || !email.value || !password.value || !selectedRole.value) {
    formError.value = 'Semua field wajib diisi dan peran harus dipilih'
    return
  }
  try {
    const user = await auth.register({
      name: name.value,
      email: email.value,
      phone: phone.value,
      gender: selectedRole.value === 'consumer' ? gender.value : undefined,
      password: password.value,
      role: selectedRole.value
    })
    router.push(getRoleDashboard(user.role))
  } catch (err) {
    formError.value = err.message
  }
}
</script>

<template>
  <div class="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
    <div class="w-full max-w-lg">
      <div class="bg-surface rounded-lg border border-border shadow-card p-8">
        <div class="text-center mb-6">
          <img src="@/assets/ngenyangin.svg" alt="NGENYANGIN" class="h-10 mx-auto mb-4" />
          <h1 class="font-poppins font-bold text-xl text-primary-dark">Buat Akun Baru</h1>
          <p class="text-sm text-text-secondary mt-1">Pilih peranmu dan bergabung dengan NGENYANGIN</p>
        </div>

        <!-- Role selection -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-text-primary mb-2">Pilih Peran <span class="text-error">*</span></label>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              v-for="role in roles"
              :key="role.value"
              @click="selectedRole = role.value"
              :class="[
                'p-4 rounded-md border-2 text-left transition-all',
                selectedRole === role.value
                  ? 'border-primary bg-primary-soft'
                  : 'border-border hover:border-primary/40'
              ]"
            >
              <span class="text-2xl block mb-1">{{ role.emoji }}</span>
              <p :class="['text-sm font-semibold', selectedRole === role.value ? 'text-primary' : 'text-text-primary']">{{ role.label }}</p>
              <p class="text-xs text-text-secondary mt-0.5 leading-snug">{{ role.desc }}</p>
            </button>
          </div>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-4">
          <FormInput v-model="name" label="Nama Lengkap" placeholder="Masukkan nama lengkap" required />
          <FormInput v-model="email" label="Email" type="email" placeholder="contoh@email.com" required />
          <FormInput v-model="phone" label="Nomor Telepon" placeholder="0812-3456-7890" />
          <div v-if="selectedRole === 'consumer'">
            <label class="block text-sm font-medium text-text-primary mb-1.5">Jenis Kelamin</label>
            <select v-model="gender" class="form-input-base">
              <option value="">Pilih (opsional)</option>
              <option value="male">Laki-laki</option>
              <option value="female">Perempuan</option>
            </select>
            <p class="text-xs text-text-secondary mt-1">Dipakai untuk ikon profil bila belum ada foto.</p>
          </div>
          <FormInput v-model="password" label="Password" type="password" placeholder="Minimal 6 karakter" required />

          <div v-if="formError" class="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-error">
            {{ formError }}
          </div>

          <BaseButton type="submit" variant="primary" full-width :loading="auth.isLoading">
            Daftar Sekarang
          </BaseButton>
        </form>

        <p class="text-center text-sm text-text-secondary mt-6">
          Sudah punya akun?
          <RouterLink to="/masuk" class="text-primary font-medium hover:underline">Masuk</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
