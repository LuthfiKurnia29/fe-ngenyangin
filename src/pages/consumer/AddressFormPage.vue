<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAddressStore } from '@/stores/address'
import { useNotificationStore } from '@/stores/notifications'
import FormInput from '@/components/base/FormInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const route = useRoute()
const router = useRouter()
const addressStore = useAddressStore()
const notify = useNotificationStore()

const isEdit = computed(() => !!route.params.id)
const pageTitle = computed(() => isEdit.value ? 'Ubah Alamat' : 'Tambah Alamat Baru')

const form = ref({
  province: '',
  city: '',
  district: '',
  postalCode: '',
  streetDetail: '',
  otherDetail: '',
  recipientName: '',
  phone: '',
  isDefault: false,
  label: 'Rumah',
})

const errors = ref({})
const isSaving = ref(false)

onMounted(() => {
  if (isEdit.value) {
    const existing = addressStore.getById(route.params.id)
    if (existing) {
      form.value = { ...existing }
    } else {
      notify.error('Alamat tidak ditemukan')
      router.push('/alamat')
    }
  }
})

const isFormValid = computed(() => {
  return (
    form.value.province.trim() &&
    form.value.city.trim() &&
    form.value.district.trim() &&
    form.value.streetDetail.trim() &&
    form.value.recipientName.trim() &&
    form.value.phone.trim()
  )
})

function validate() {
  const e = {}
  if (!form.value.recipientName.trim()) e.recipientName = 'Nama penerima wajib diisi'
  if (!form.value.phone.trim()) e.phone = 'Nomor telepon wajib diisi'
  const phone = form.value.phone.replace(/[\s-]/g, '')
  if (form.value.phone && !/^(\+62|62|0)8[0-9]{8,12}$/.test(phone)) {
    e.phone = 'Nomor HP tidak valid. Contoh: 081234567890'
  }
  if (!form.value.province.trim()) e.province = 'Provinsi wajib diisi'
  if (!form.value.city.trim()) e.city = 'Kota wajib diisi'
  if (!form.value.district.trim()) e.district = 'Kecamatan wajib diisi'
  if (!form.value.streetDetail.trim()) e.streetDetail = 'Nama jalan/detail wajib diisi'
  errors.value = e
  return Object.keys(e).length === 0
}

async function save() {
  if (!validate()) return
  isSaving.value = true
  try {
    const data = { ...form.value }
    if (isEdit.value) {
      addressStore.updateAddress(route.params.id, data)
      notify.success('Alamat berhasil diperbarui')
    } else {
      addressStore.addAddress(data)
      notify.success('Alamat berhasil ditambahkan')
    }
    router.push('/alamat')
  } catch (err) {
    notify.error(err.message || 'Gagal menyimpan alamat')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="py-6 md:py-10">
    <div class="section-container max-w-2xl">
      <!-- Header -->
      <button @click="router.back()" class="flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-4">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Kembali
      </button>
      <h1 class="font-poppins font-bold text-xl text-primary-dark mb-6">{{ pageTitle }}</h1>

      <form @submit.prevent="save" class="bg-surface rounded-lg border border-border shadow-card p-6 md:p-8 space-y-5">
        <!-- Label rumah/kantor -->
        <div>
          <label class="block text-sm font-medium text-text-primary mb-2">Label Alamat</label>
          <div class="flex gap-2">
            <button
              v-for="opt in ['Rumah', 'Kantor']"
              :key="opt"
              type="button"
              @click="form.label = opt"
              :class="[
                'px-4 py-2 rounded-full border text-sm font-medium transition-all',
                form.label === opt
                  ? 'border-primary bg-primary text-white'
                  : 'border-border text-text-secondary hover:border-primary/40'
              ]"
            >{{ opt }}</button>
          </div>
        </div>

        <!-- Wilayah -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput v-model="form.province" label="Provinsi" placeholder="Contoh: DKI Jakarta" required :error="errors.province" />
          <FormInput v-model="form.city" label="Kota/Kabupaten" placeholder="Contoh: Jakarta Selatan" required :error="errors.city" />
          <FormInput v-model="form.district" label="Kecamatan" placeholder="Contoh: Tebet" required :error="errors.district" />
          <FormInput v-model="form.postalCode" label="Kode Pos" placeholder="Contoh: 12810" :error="errors.postalCode" />
        </div>

        <!-- Jalan -->
        <FormInput
          v-model="form.streetDetail"
          label="Nama Jalan / Gedung / No. Rumah"
          type="textarea"
          placeholder="Contoh: Jl. Tebet Raya No. 42, RT 01/RW 03"
          required
          :error="errors.streetDetail"
        />

        <FormInput
          v-model="form.otherDetail"
          label="Detail Lainnya (opsional)"
          type="textarea"
          placeholder="Blok, unit, lantai, patokan, dll."
        />

        <!-- Penerima -->
        <div class="border-t border-border pt-4 space-y-4">
          <h3 class="font-semibold text-sm text-text-primary">Informasi Penerima</h3>
          <FormInput v-model="form.recipientName" label="Nama Lengkap Penerima" placeholder="Nama lengkap" required :error="errors.recipientName" />
          <FormInput v-model="form.phone" label="Nomor Telepon" type="tel" placeholder="081234567890" required :error="errors.phone" />
        </div>

        <!-- Toggle utama -->
        <div class="flex items-center gap-3 p-3 bg-primary-soft rounded-md">
          <button
            type="button"
            @click="form.isDefault = !form.isDefault"
            :class="[
              'relative w-10 h-6 rounded-full transition-colors',
              form.isDefault ? 'bg-primary' : 'bg-border'
            ]"
            :aria-pressed="form.isDefault"
          >
            <span :class="['absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm', form.isDefault ? 'translate-x-4' : '']"></span>
          </button>
          <label class="text-sm font-medium text-text-primary cursor-pointer" @click="form.isDefault = !form.isDefault">
            Atur sebagai Alamat Utama
          </label>
        </div>

        <!-- Submit -->
        <BaseButton type="submit" variant="primary" full-width size="lg" :loading="isSaving" :disabled="!isFormValid">
          Simpan Alamat
        </BaseButton>
      </form>
    </div>
  </div>
</template>
