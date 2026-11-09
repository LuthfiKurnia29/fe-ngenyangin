<script setup>
// Halaman profil untuk konsumen (/profil) dan supplier (/supplier/profil)
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'
import { useAddressStore } from '@/stores/address'
import { userService } from '@/services/userService'
import FormInput from '@/components/base/FormInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import UserAvatar from '@/components/base/UserAvatar.vue'

const auth = useAuthStore()
const notify = useNotificationStore()
const addressStore = useAddressStore()
const router = useRouter()

const isSupplier = computed(() => auth.role === 'supplier')
const MAX_IMAGE_MB = 2

const fromUser = () => ({
  name: auth.user?.name || '',
  phone: auth.user?.phone || '',
  address: auth.user?.address || '',
  gender: auth.user?.gender || '',
  outlet: auth.user?.outlet || '',
  description: auth.user?.description || '',
})

const form = ref(fromUser())
const errors = ref({})
const isSaving = ref(false)

// --- Foto profil ---
const avatarUrl = ref(auth.user?.avatar || '')
const avatarFile = ref(null)
const avatarPreview = ref('')
const shownAvatar = computed(() => avatarPreview.value || avatarUrl.value)

function onAvatarChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    notify.error('Format foto harus JPG, PNG, atau WebP')
    e.target.value = ''
    return
  }
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
    notify.error(`Ukuran foto maksimal ${MAX_IMAGE_MB} MB`)
    e.target.value = ''
    return
  }
  avatarFile.value = file
  avatarPreview.value = URL.createObjectURL(file)
}

function removeAvatar() {
  avatarFile.value = null
  avatarPreview.value = ''
  avatarUrl.value = ''
}

const isDirty = computed(() => {
  const u = fromUser()
  return (
    Object.keys(u).some(k => form.value[k] !== u[k]) ||
    !!avatarFile.value ||
    avatarUrl.value !== (auth.user?.avatar || '')
  )
})

function validate() {
  const e = {}
  if (!form.value.name.trim()) e.name = 'Nama wajib diisi'
  if (isSupplier.value && !form.value.outlet.trim()) e.outlet = 'Nama toko wajib diisi'
  // Konsumen wajib punya alamat default sebelum simpan profil
  if (!isSupplier.value && !addressStore.hasAddresses) {
    e.address = 'Tambahkan minimal satu alamat pengantaran sebelum menyimpan profil'
  }
  const phone = form.value.phone.replace(/[\s-]/g, '')
  if (phone && !/^(\+62|62|0)8[0-9]{8,12}$/.test(phone)) {
    e.phone = 'Nomor HP tidak valid. Contoh: 081234567890'
  }
  errors.value = e
  return Object.keys(e).length === 0
}

function reset() {
  form.value = fromUser()
  avatarUrl.value = auth.user?.avatar || ''
  avatarFile.value = null
  avatarPreview.value = ''
  errors.value = {}
}

onMounted(async () => {
  await auth.fetchMe()
  reset()
})

async function save() {
  if (!validate()) return
  isSaving.value = true
  try {
    let avatar = avatarUrl.value || null
    if (avatarFile.value) avatar = await userService.uploadAvatar(avatarFile.value)

    const payload = {
      name: form.value.name.trim(),
      phone: form.value.phone.trim(),
      address: form.value.address.trim(),
      avatar,
    }
    if (isSupplier.value) {
      payload.outlet = form.value.outlet.trim()
      payload.description = form.value.description.trim()
    } else {
      payload.gender = form.value.gender || null
    }
    await auth.updateProfile(payload)
    reset()
    notify.success('Profil berhasil disimpan')
  } catch (err) {
    notify.error(err.message || 'Gagal menyimpan profil')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="section-container py-6 md:py-10 max-w-2xl">
    <h1 class="font-poppins font-bold text-2xl text-primary-dark mb-1">
      {{ isSupplier ? 'Profil Toko' : 'Edit Profil' }}
    </h1>
    <p class="text-sm text-text-secondary mb-6">
      {{ isSupplier
        ? 'Nama toko dan alamat akan tampil di katalog makanan milikmu.'
        : 'Perbarui data dirimu.' }}
    </p>

    <form @submit.prevent="save" class="bg-surface rounded-lg border border-border shadow-card p-6 md:p-8 space-y-5">
      <!-- Foto profil -->
      <div class="flex items-center gap-4">
        <UserAvatar
          :avatar="shownAvatar"
          :role="auth.role"
          :gender="form.gender"
          :name="form.name"
          size="w-20 h-20"
        />
        <div class="min-w-0 space-y-1.5">
          <p class="font-semibold text-text-primary truncate">
            {{ (isSupplier ? form.outlet : form.name) || (isSupplier ? 'Nama toko' : 'Nama kamu') }}
          </p>
          <p class="text-xs text-text-secondary truncate">{{ auth.user?.email }}</p>
          <div class="flex flex-wrap items-center gap-3">
            <label class="text-xs font-medium text-primary cursor-pointer hover:underline">
              Ganti foto
              <input type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="onAvatarChange" />
            </label>
            <button v-if="shownAvatar" type="button" class="text-xs text-error hover:underline" @click="removeAvatar">
              Hapus foto
            </button>
          </div>
          <p class="text-xs text-text-secondary">JPG, PNG, atau WebP, maks {{ MAX_IMAGE_MB }} MB.</p>
        </div>
      </div>

      <FormInput v-model="form.name" :label="isSupplier ? 'Nama Pemilik' : 'Nama Lengkap'" placeholder="Nama lengkap" required :error="errors.name" />

      <FormInput
        v-if="isSupplier"
        v-model="form.outlet"
        label="Nama Toko / Outlet"
        placeholder="Misal: Bebek Madura Bu Siti"
        required
        :error="errors.outlet"
      />

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

      <div v-if="!isSupplier">
        <label class="block text-sm font-medium text-text-primary mb-1.5">Jenis Kelamin</label>
        <select v-model="form.gender" class="form-input-base">
          <option value="">Belum dipilih</option>
          <option value="male">Laki-laki</option>
          <option value="female">Perempuan</option>
        </select>
        <p class="text-xs text-text-secondary mt-1">Menentukan ikon profil bila kamu belum memasang foto.</p>
      </div>

      <!-- Alamat Supplier (teks biasa) -->
      <FormInput
        v-if="isSupplier"
        v-model="form.address"
        label="Alamat Toko"
        type="textarea"
        placeholder="Jalan, nomor, kelurahan, kota"
      />

      <!-- Alamat Konsumen (sistem terintegrasi) -->
      <div v-if="!isSupplier">
        <label class="block text-sm font-medium text-text-primary mb-2">Alamat Pengantaran</label>

        <!-- Belum punya alamat -->
        <div v-if="!addressStore.hasAddresses">
          <button
            type="button"
            @click="router.push('/alamat/baru')"
            class="w-full py-4 border-2 border-dashed border-border rounded-lg text-sm text-text-secondary hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            + Tambahkan Alamat
          </button>
          <p v-if="errors.address" class="text-xs text-error mt-1">{{ errors.address }}</p>
          <p class="text-xs text-text-secondary mt-1">Minimal satu alamat wajib ditambahkan sebelum menyimpan profil dan checkout.</p>
        </div>

        <!-- Sudah punya alamat → tampilkan kartu alamat default -->
        <button
          v-else
          type="button"
          @click="router.push('/alamat')"
          class="w-full text-left p-4 rounded-lg border border-primary bg-primary-soft hover:bg-primary/10 transition-colors group"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <p class="font-semibold text-sm text-primary">{{ addressStore.defaultAddress?.recipientName }}</p>
                <span v-if="addressStore.defaultAddress?.label" class="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  {{ addressStore.defaultAddress.label }}
                </span>
                <span class="chip bg-primary text-white text-xs font-semibold">Utama</span>
              </div>
              <p class="text-xs text-text-secondary">{{ addressStore.defaultAddress?.phone }}</p>
              <p class="text-sm text-text-secondary mt-1 leading-relaxed">
                {{ addressStore.defaultAddress?.streetDetail }},
                {{ addressStore.defaultAddress?.district }},
                {{ addressStore.defaultAddress?.city }},
                {{ addressStore.defaultAddress?.province }}
                {{ addressStore.defaultAddress?.postalCode }}
              </p>
            </div>
            <svg class="w-4 h-4 text-primary flex-shrink-0 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </div>
        </button>
      </div>

      <FormInput
        v-if="isSupplier"
        v-model="form.description"
        label="Deskripsi Toko"
        type="textarea"
        placeholder="Ceritakan singkat tentang tokomu"
      />

      <div class="flex flex-col-reverse sm:flex-row gap-3 pt-2">
        <BaseButton type="button" variant="outline" class="w-full sm:flex-1" :disabled="!isDirty || isSaving" @click="reset">
          Batal
        </BaseButton>
        <BaseButton type="submit" variant="primary" class="w-full sm:flex-1" :loading="isSaving" :disabled="!isDirty">
          Simpan Perubahan
        </BaseButton>
      </div>
    </form>
  </div>
</template>
