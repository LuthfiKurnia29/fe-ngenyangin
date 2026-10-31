<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { foodService } from '@/services/foodService'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'
import FormInput from '@/components/base/FormInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const notify = useNotificationStore()

const isEdit = route.name === 'EditFood'
const isSubmitting = ref(false)
const safetyChecked = ref(false)

const form = ref({
  name: '', category: 'Makanan Berat', originalPrice: '',
  discountPrice: '', stock: '', pickupDeadline: '20:00',
  description: '', image: 'https://picsum.photos/seed/' + Date.now() + '/400/300'
})

const categoriesList = ['Makanan Berat', 'Jajanan', 'Roti & Kue', 'Minuman', 'Sayur & Buah']

async function submit() {
  if (!form.value.name || !form.value.discountPrice || !form.value.stock) {
    notify.error('Nama, harga diskon, dan stok wajib diisi')
    return
  }
  if (!safetyChecked.value) {
    notify.error('Centang kebijakan keamanan pangan untuk melanjutkan')
    return
  }
  isSubmitting.value = true
  try {
    await foodService.create({
      ...form.value,
      originalPrice: Number(form.value.originalPrice),
      discountPrice: Number(form.value.discountPrice),
      stock: Number(form.value.stock),
      discount: Math.round((1 - Number(form.value.discountPrice) / Number(form.value.originalPrice)) * 100),
      supplierId: auth.user.id,
      supplierName: auth.user.outlet || auth.userName,
      outlet: auth.user.address || 'Jakarta',
      address: auth.user.address || '',
      tags: []
    })
    notify.success('Makanan berhasil ditambahkan! 🎉')
    router.push('/supplier')
  } catch { notify.error('Gagal menambahkan makanan') }
  finally { isSubmitting.value = false }
}
</script>

<template>
  <div class="max-w-2xl">
    <button @click="router.back()" class="flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-6">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
      Kembali
    </button>
    <h1 class="font-poppins font-bold text-headline text-primary-dark mb-6">{{ isEdit ? 'Edit' : 'Tambah' }} Makanan</h1>

    <form @submit.prevent="submit" class="space-y-5 bg-surface rounded-md border border-border p-6">
      <FormInput v-model="form.name" label="Nama Makanan" placeholder="Misal: Paket Nasi Bebek Madura" required />

      <div>
        <label class="block text-sm font-medium text-text-primary mb-1.5">Kategori <span class="text-error">*</span></label>
        <select v-model="form.category" class="form-input-base">
          <option v-for="c in categoriesList" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <FormInput v-model="form.originalPrice" label="Harga Asli (Rp)" type="number" placeholder="35000" required />
        <FormInput v-model="form.discountPrice" label="Harga Diskon (Rp)" type="number" placeholder="18000" required />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <FormInput v-model="form.stock" label="Stok (porsi)" type="number" placeholder="5" required />
        <FormInput v-model="form.pickupDeadline" label="Batas Ambil" type="time" />
      </div>

      <FormInput v-model="form.description" label="Deskripsi" type="textarea" placeholder="Deskripsi makanan, kondisi, dll..." />

      <!-- Safety checkbox -->
      <div class="p-4 bg-primary-soft rounded-md border border-primary/20">
        <label class="flex items-start gap-3 cursor-pointer">
          <input v-model="safetyChecked" type="checkbox" class="mt-1 w-4 h-4 accent-primary" />
          <div>
            <p class="text-sm font-medium text-primary">Kebijakan Keamanan Pangan</p>
            <p class="text-xs text-text-secondary mt-0.5 leading-relaxed">
              Saya menyatakan bahwa makanan ini masih dalam kondisi layak konsumsi, disiapkan dengan standar kebersihan, dan dikemas dengan benar.
            </p>
          </div>
        </label>
      </div>

      <BaseButton type="submit" variant="primary" full-width :loading="isSubmitting" :disabled="!safetyChecked">
        {{ isEdit ? 'Simpan Perubahan' : 'Publikasikan Makanan' }}
      </BaseButton>
    </form>
  </div>
</template>
