<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'
import FormInput from '@/components/base/FormInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const auth = useAuthStore()
const notify = useNotificationStore()

const form = ref({
  name: auth.user?.name || '',
  phone: auth.user?.phone || '',
  address: auth.user?.address || '',
})
const errors = ref({})

const avatar = computed(
  () => `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(form.value.name || auth.user?.email || 'user')}`
)

const isDirty = computed(
  () =>
    form.value.name !== (auth.user?.name || '') ||
    form.value.phone !== (auth.user?.phone || '') ||
    form.value.address !== (auth.user?.address || '')
)

function validate() {
  const e = {}
  if (!form.value.name.trim()) e.name = 'Nama wajib diisi'
  const phone = form.value.phone.replace(/[\s-]/g, '')
  if (phone && !/^(\+62|62|0)8[0-9]{8,12}$/.test(phone)) {
    e.phone = 'Nomor HP tidak valid. Contoh: 081234567890'
  }
  errors.value = e
  return Object.keys(e).length === 0
}

function reset() {
  form.value = {
    name: auth.user?.name || '',
    phone: auth.user?.phone || '',
    address: auth.user?.address || '',
  }
  errors.value = {}
}

async function save() {
  if (!validate()) return
  try {
    await auth.updateProfile({
      name: form.value.name.trim(),
      phone: form.value.phone.trim(),
      address: form.value.address.trim(),
    })
    notify.success('Profil berhasil diperbarui')
  } catch (err) {
    notify.error(err.message || 'Gagal menyimpan profil')
  }
}
</script>

<template>
  <div class="section-container py-6 md:py-10 max-w-2xl">
    <h1 class="font-poppins font-bold text-2xl text-primary-dark mb-1">Edit Profil</h1>
    <p class="text-sm text-text-secondary mb-6">Perbarui data dirimu. Alamat akan dipakai sebagai alamat pengantaran.</p>

    <form @submit.prevent="save" class="bg-surface rounded-lg border border-border shadow-card p-6 md:p-8 space-y-5">
      <div class="flex items-center gap-4">
        <img :src="avatar" :alt="form.name" class="w-16 h-16 rounded-full bg-primary-soft" />
        <div class="min-w-0">
          <p class="font-semibold text-text-primary truncate">{{ form.name || 'Nama kamu' }}</p>
          <p class="text-xs text-text-secondary truncate">{{ auth.user?.email }}</p>
        </div>
      </div>

      <FormInput v-model="form.name" label="Nama Lengkap" placeholder="Nama lengkap" required :error="errors.name" />

      <FormInput
        :model-value="auth.user?.email || ''"
        label="Email"
        type="email"
        disabled
        hint="Email tidak dapat diubah"
      />

      <FormInput
        v-model="form.phone"
        label="Nomor HP"
        type="tel"
        placeholder="081234567890"
        :error="errors.phone"
      />

      <FormInput
        v-model="form.address"
        label="Alamat"
        type="textarea"
        placeholder="Jalan, nomor rumah, kelurahan, kota"
      />

      <div class="flex flex-col-reverse sm:flex-row gap-3 pt-2">
        <BaseButton type="button" variant="outline" full-width :disabled="!isDirty || auth.isLoading" @click="reset">
          Batal
        </BaseButton>
        <BaseButton type="submit" variant="primary" full-width :loading="auth.isLoading" :disabled="!isDirty">
          Simpan Perubahan
        </BaseButton>
      </div>
    </form>
  </div>
</template>
