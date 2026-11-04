<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { foodService } from '@/services/foodService'
import { categoryService } from '@/services/categoryService'
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
const categoriesLoading = ref(true)
const categories = ref([])
const safetyChecked = ref(false)

const form = ref({
  name: '', categoryId: '', originalPrice: '',
  discountPrice: '', stock: '', pickupDeadline: '20:00',
  description: '', image: ''
})

// --- Gambar produk ---
const imageFile = ref(null)
const imagePreview = ref('')
const MAX_IMAGE_MB = 2

function onImageChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    notify.error('Format gambar harus JPG, PNG, atau WebP')
    e.target.value = ''
    return
  }
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
    notify.error(`Ukuran gambar maksimal ${MAX_IMAGE_MB} MB`)
    e.target.value = ''
    return
  }
  imageFile.value = file
  imagePreview.value = URL.createObjectURL(file)
}

function removeImage() {
  imageFile.value = null
  imagePreview.value = ''
  form.value.image = ''
}

// Mode edit: isi form dari data yang ada
onMounted(async () => {
  try {
    categories.value = await categoryService.getAll()
  } catch {
    notify.error('Gagal memuat kategori')
  } finally {
    categoriesLoading.value = false
  }

  if (!isEdit) return
  try {
    const f = await foodService.getById(route.params.id)
    const matchingCategory = categories.value.find(
      (category) => category.name?.toLowerCase() === f.category?.toLowerCase()
    )
    form.value = {
      name: f.name,
      categoryId: f.categoryId ?? matchingCategory?.id ?? '',
      originalPrice: f.originalPrice,
      discountPrice: f.discountPrice,
      stock: f.stock,
      pickupDeadline: f.pickupDeadline === '-' ? '' : f.pickupDeadline,
      description: f.description || '',
      image: f.image || '',
    }
    imagePreview.value = f.image || ''
    safetyChecked.value = !!f.safetyApproved
  } catch {
    notify.error('Makanan tidak ditemukan')
    router.push('/supplier')
  }
})

async function submit() {
  if (!form.value.name || !form.value.categoryId || !form.value.discountPrice || !form.value.stock) {
    notify.error('Nama, kategori, harga diskon, dan stok wajib diisi')
    return
  }
  if (Number(form.value.originalPrice || form.value.discountPrice) < Number(form.value.discountPrice)) {
    notify.error('Harga asli tidak boleh lebih kecil dari harga diskon')
    return
  }
  if (!safetyChecked.value) {
    notify.error('Centang kebijakan keamanan pangan untuk melanjutkan')
    return
  }
  isSubmitting.value = true
  try {
    // 1. Upload gambar baru (jika ada) -> dapat URL publik
    let imageUrl = form.value.image
    if (imageFile.value) imageUrl = await foodService.uploadImage(imageFile.value)

    const original = Number(form.value.originalPrice) || Number(form.value.discountPrice)
    const payload = {
      name: form.value.name,
      category_id: Number(form.value.categoryId),
      description: form.value.description,
      originalPrice: original,
      discountPrice: Number(form.value.discountPrice),
      stock: Number(form.value.stock),
      pickupDeadline: form.value.pickupDeadline,
      image: imageUrl,
      safetyApproved: true,
    }

    if (isEdit) {
      await foodService.update(route.params.id, payload)
      notify.success('Makanan berhasil diperbarui')
    } else {
      await foodService.create({
        ...payload,
        // nama toko & alamat diisi BE dari profil supplier
        tags: [],
      })
      notify.success('Makanan berhasil ditambahkan! 🎉')
    }
    router.push('/supplier')
  } catch (e) {
    notify.error(e.response?.data?.message || 'Gagal menyimpan makanan')
  } finally { isSubmitting.value = false }
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
        <select v-model="form.categoryId" class="form-input-base" :disabled="categoriesLoading || !categories.length" required>
          <option value="" disabled>{{ categoriesLoading ? 'Memuat kategori...' : 'Pilih kategori' }}</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
        </select>
        <p v-if="!categoriesLoading && !categories.length" class="text-xs text-error mt-1">Kategori belum tersedia.</p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <FormInput v-model="form.originalPrice" label="Harga Asli (Rp)" type="number" placeholder="35000" required />
        <FormInput v-model="form.discountPrice" label="Harga Diskon (Rp)" type="number" placeholder="18000" required />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <FormInput v-model="form.stock" label="Stok (porsi)" type="number" placeholder="5" required />
        <FormInput v-model="form.pickupDeadline" label="Batas Ambil" type="time" />
      </div>

      <!-- Gambar -->
      <div>
        <label class="block text-sm font-medium text-text-primary mb-1.5">Gambar Makanan</label>
        <div class="flex items-start gap-4">
          <div class="w-32 h-24 rounded-md border border-dashed border-border bg-border/20 overflow-hidden flex items-center justify-center flex-shrink-0">
            <img v-if="imagePreview" :src="imagePreview" alt="Pratinjau" class="w-full h-full object-cover" />
            <span v-else class="text-xs text-text-secondary text-center px-2">Belum ada gambar</span>
          </div>
          <div class="space-y-2">
            <input type="file" accept="image/jpeg,image/png,image/webp" @change="onImageChange"
              class="block text-sm text-text-secondary file:mr-3 file:rounded file:border-0 file:bg-primary-soft file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20" />
            <p class="text-xs text-text-secondary">JPG, PNG, atau WebP. Maksimal {{ MAX_IMAGE_MB }} MB.</p>
            <button v-if="imagePreview" type="button" @click="removeImage" class="text-xs text-error hover:underline">Hapus gambar</button>
          </div>
        </div>
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
