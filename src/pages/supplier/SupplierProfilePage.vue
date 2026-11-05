<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'
import { userService } from '@/services/userService'
import FormInput from '@/components/base/FormInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import UserAvatar from '@/components/base/UserAvatar.vue'

const auth = useAuthStore()
const notify = useNotificationStore()
const MAX_IMAGE_MB = 2

const fromUser = () => ({
  name: auth.user?.name || '',
  outlet: auth.user?.outlet || '',
  phone: auth.user?.phone || '',
  address: auth.user?.address || '',
  description: auth.user?.description || '',
})

const form = ref(fromUser())
const errors = ref({})
const isSaving = ref(false)

const avatarUrl = ref(auth.user?.avatar || '')
const avatarFile = ref(null)
const avatarPreview = ref('')
const shownAvatar = computed(() => avatarPreview.value || avatarUrl.value)

function onAvatarChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    notify.error('Format foto harus JPG, PNG atau WebP')
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
  const user = fromUser()
  return (
    Object.keys(user).some((key) => form.value[key] !== user[key]) ||
    !!avatarFile.value ||
    avatarUrl.value !== (auth.user?.avatar || '')
  )
})

function validate() {
  const validationErrors = {}
  if (!form.value.name.trim()) validationErrors.name = 'Nama pemilik wajib diisi'
  if (!form.value.outlet.trim()) validationErrors.outlet = 'Nama toko wajib diisi'

  const phone = form.value.phone.replace(/[\s-]/g, '')
  if (phone && !/^(\+62|62|0)8[0-9]{8,12}$/.test(phone)) {
    validationErrors.phone = 'Nomor HP tidak valid. Contoh: 081234567890'
  }

  errors.value = validationErrors
  return Object.keys(validationErrors).length === 0
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

    await auth.updateProfile({
      name: form.value.name.trim(),
      outlet: form.value.outlet.trim(),
      phone: form.value.phone.trim(),
      address: form.value.address.trim(),
      description: form.value.description.trim(),
      avatar,
    })

    reset()
    notify.success('Profil toko berhasil disimpan')
  } catch (error) {
    notify.error(error.message || 'Gagal menyimpan profil toko')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="section-container py-6 md:py-10 max-w-2xl">
    <h1 class="font-poppins font-bold text-2xl text-primary-dark mb-1">Edit Profil Toko</h1>
    <p class="text-sm text-text-secondary mb-6">
      Perbarui informasi toko yang akan tampil di katalog makanan milikmu.
    </p>

    <form @submit.prevent="save" class="bg-surface rounded-lg border border-border shadow-card p-6 md:p-8 space-y-5">
      <div class="flex items-center gap-4">
        <UserAvatar
          :avatar="shownAvatar"
          :role="auth.role"
          :name="form.name"
          size="w-20 h-20"
        />
        <div class="min-w-0 space-y-1.5">
          <p class="font-semibold text-text-primary truncate">{{ form.outlet || 'Nama toko' }}</p>
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

      <FormInput
        v-model="form.name"
        label="Nama Pemilik"
        placeholder="Nama lengkap pemilik"
        required
        :error="errors.name"
      />

      <FormInput
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

      <FormInput
        v-model="form.address"
        label="Alamat Toko"
        type="textarea"
        placeholder="Jalan, nomor, kelurahan, kota"
      />

      <FormInput
        v-model="form.description"
        label="Deskripsi Toko"
        type="textarea"
        placeholder="Ceritakan singkat tentang tokomu"
      />

      <div class="flex flex-col-reverse sm:flex-row gap-3 pt-2">
        <BaseButton type="button" variant="outline" full-width :disabled="!isDirty || isSaving" @click="reset">
          Batal
        </BaseButton>
        <BaseButton type="submit" variant="primary" full-width :loading="isSaving" :disabled="!isDirty">
          Simpan Perubahan
        </BaseButton>
      </div>
    </form>
  </div>
</template>