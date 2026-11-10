<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/base/BaseButton.vue'
import FormInput from '@/components/base/FormInput.vue'
import Logo from '@/components/base/Logo.vue'
import { contentService } from '@/services/contentService'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

// Consumer fields
const name = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const selectedRole = ref(route.query.role === 'supplier' ? 'supplier' : '')
const gender = ref('')

// Supplier-only fields
const outlet = ref('')
const storeAddress = ref('')
const storeDescription = ref('')
const storePhoto = ref(null)
const storePhotoName = ref('')
const acceptedTerms = ref(false)
const termsVersion = ref(null)
const termsLoading = ref(false)
const termsError = ref('')

const formError = ref('')

const roles = [
  { value: 'consumer', label: 'Konsumen', desc: 'Beli makanan surplus dengan harga diskon', emoji: '🛒' },
  { value: 'supplier', label: 'Supplier', desc: 'Jual surplus makanan dari usaha kuliner Anda', emoji: '🏪' },
]

const isSupplier = computed(() => selectedRole.value === 'supplier')

watch(selectedRole, async (role) => {
  acceptedTerms.value = false
  termsVersion.value = null
  termsError.value = ''
  if (!role) return

  termsLoading.value = true
  try {
    const record = await contentService.get('terms', role)
    if (selectedRole.value === role) termsVersion.value = record.version
  } catch (error) {
    if (selectedRole.value === role) termsError.value = error.message
  } finally {
    if (selectedRole.value === role) termsLoading.value = false
  }
}, { immediate: true })

const MAX_PHOTO_MB = 2
function onPhotoChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    formError.value = 'Format foto harus JPG, PNG, atau WebP'
    e.target.value = ''
    return
  }
  if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
    formError.value = `Ukuran foto maksimal ${MAX_PHOTO_MB} MB`
    e.target.value = ''
    return
  }
  storePhoto.value = file
  storePhotoName.value = file.name
  formError.value = ''
}

async function handleRegister() {
  formError.value = ''
  if (!name.value || !email.value || !password.value || !selectedRole.value) {
    formError.value = 'Semua field wajib diisi dan peran harus dipilih'
    return
  }
  if (isSupplier.value && !outlet.value) {
    formError.value = 'Nama Toko/Outlet wajib diisi untuk Supplier'
    return
  }
  if (!acceptedTerms.value || !termsVersion.value) {
    formError.value = 'Baca dan setujui Syarat & Ketentuan sebelum mendaftar.'
    return
  }
  try {
    const payload = {
      name: name.value,
      email: email.value,
      phone: phone.value,
      password: password.value,
      role: selectedRole.value,
      termsAccepted: acceptedTerms.value,
      termsVersion: termsVersion.value,
    }
    if (isSupplier.value) {
      payload.outlet = outlet.value
      payload.address = storeAddress.value
      payload.description = storeDescription.value
    } else {
      payload.gender = gender.value || undefined
    }
    await auth.register(payload)
    router.push({ name: 'Login', query: { registered: '1' } })
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
          <div class="flex justify-center mb-4">
            <Logo height="h-14" />
          </div>
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

          <!-- ======================= CONSUMER FIELDS ======================= -->
          <template v-if="!isSupplier || selectedRole === 'consumer'">
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
          </template>

          <!-- ======================= SUPPLIER FIELDS ======================= -->
          <template v-if="isSupplier">
            <FormInput v-model="name" label="Nama Pemilik" placeholder="Nama lengkap pemilik usaha" required />
            <FormInput
              v-model="outlet"
              label="Nama Toko / Outlet"
              placeholder="Misal: Bebek Madura Bu Siti"
              required
            />
            <FormInput v-model="email" label="Email" type="email" placeholder="contoh@email.com" required />
            <FormInput v-model="phone" label="Nomor HP" type="tel" placeholder="081234567890" />
            <FormInput
              v-model="storeAddress"
              label="Alamat Toko"
              type="textarea"
              placeholder="Jalan, nomor, kelurahan, kota"
            />
            <FormInput
              v-model="storeDescription"
              label="Deskripsi Toko"
              type="textarea"
              placeholder="Ceritakan singkat tentang tokomu — jenis masakan, keunggulan, dll."
            />

            <!-- Foto toko -->
            <div>
              <label class="block text-sm font-medium text-text-primary mb-1.5">
                Foto Toko
                <span class="text-text-secondary font-normal ml-1">(opsional)</span>
              </label>
              <label class="flex items-center gap-3 p-3 border border-border rounded-md cursor-pointer hover:border-primary/40 transition-colors">
                <svg class="w-5 h-5 text-text-secondary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <span class="text-sm text-text-secondary truncate">
                  {{ storePhotoName || 'Pilih foto toko...' }}
                </span>
                <input type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="onPhotoChange" />
              </label>
              <p class="text-xs text-text-secondary mt-1">JPG, PNG, atau WebP, maks 2 MB.</p>
            </div>

            <FormInput v-model="password" label="Password" type="password" placeholder="Minimal 6 karakter" required />
          </template>

          <div v-if="selectedRole" class="rounded-md border border-border p-4">
            <p v-if="termsLoading" class="text-sm text-text-secondary">Memuat Syarat & Ketentuan...</p>
            <p v-else-if="termsError" class="text-sm text-error">{{ termsError }}</p>
            <div v-else class="flex items-start gap-2 text-sm text-text-secondary">
              <input
                v-model="acceptedTerms"
                id="acceptedTerms"
                type="checkbox"
                class="mt-1 accent-primary"
                required
              />
              <label for="acceptedTerms">
                Saya telah membaca dan menyetujui
              </label>
              <RouterLink
                :to="{ name: 'PublicTerms', query: { audience: selectedRole } }"
                target="_blank"
                class="font-medium text-primary hover:underline"
              >
                Baca Syarat & Ketentuan {{ isSupplier ? 'Supplier' : 'Konsumen' }}
              </RouterLink>
            </div>
          </div>

          <!-- Error -->
          <div v-if="formError" class="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-error">
            {{ formError }}
          </div>

          <BaseButton
            type="submit"
            variant="primary"
            full-width
            :loading="auth.isLoading"
            :disabled="!selectedRole || termsLoading || !termsVersion || !acceptedTerms"
          >
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
