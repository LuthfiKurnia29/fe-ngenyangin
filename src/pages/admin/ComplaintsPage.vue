<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { complaintService } from '@/services/complaintService'
import { contentService } from '@/services/contentService'
import { useNotificationStore } from '@/stores/notifications'
import BaseButton from '@/components/base/BaseButton.vue'
import StatusBadge from '@/components/order/StatusBadge.vue'

const complaints = ref([])
const isLoading = ref(true)
const isSaving = ref(false)
const showEntryForm = ref(false)
const editingId = ref(null)
const loadError = ref('')
const contactError = ref('')
const contact = ref(null)
const notify = useNotificationStore()

const entryForm = reactive({
  reporterRole: 'consumer',
  reporterName: '',
  reporterPhone: '',
  title: '',
  category: '',
  priority: 'Sedang',
  orderNumber: '',
  description: '',
})

const responseForm = reactive({
  status: 'Sedang Ditangani',
  adminNotes: '',
  resolution: '',
})

const openComplaints = computed(() => complaints.value.filter(
  (item) => item.status !== 'Terselesaikan'
).length)

onMounted(loadPage)

async function loadPage() {
  isLoading.value = true
  loadError.value = ''
  contactError.value = ''
  try {
    complaints.value = await complaintService.getAll()
  } catch (error) {
    loadError.value = error.message
  } finally {
    isLoading.value = false
  }
  try {
    const contactRecord = await contentService.get('contact', 'all')
    contact.value = contactRecord.content
  } catch (error) {
    contactError.value = error.message
  }
}

function resetEntryForm() {
  Object.assign(entryForm, {
    reporterRole: 'consumer',
    reporterName: '',
    reporterPhone: '',
    title: '',
    category: '',
    priority: 'Sedang',
    orderNumber: '',
    description: '',
  })
}

async function createComplaint() {
  isSaving.value = true
  try {
    const complaint = await complaintService.create({ ...entryForm })
    complaints.value.unshift(complaint)
    resetEntryForm()
    showEntryForm.value = false
    notify.success('Pengaduan dari panggilan berhasil dicatat.')
  } catch (error) {
    notify.error(`Pengaduan belum tersimpan: ${error.message}`)
  } finally {
    isSaving.value = false
  }
}

function startResponse(complaint) {
  if (editingId.value === complaint.id) {
    editingId.value = null
    return
  }
  editingId.value = complaint.id
  Object.assign(responseForm, {
    status: complaint.status === 'Menunggu' ? 'Sedang Ditangani' : complaint.status,
    adminNotes: complaint.adminNotes || '',
    resolution: complaint.resolution || '',
  })
}

async function saveResponse(complaint) {
  isSaving.value = true
  try {
    const updated = await complaintService.update(complaint.id, { ...responseForm })
    const index = complaints.value.findIndex((item) => item.id === complaint.id)
    if (index !== -1) complaints.value[index] = updated
    editingId.value = null
    notify.success('Tindak lanjut pengaduan berhasil diperbarui.')
  } catch (error) {
    notify.error(`Perubahan belum tersimpan: ${error.message}`)
  } finally {
    isSaving.value = false
  }
}

async function deleteComplaint(complaint) {
  if (!window.confirm(`Hapus catatan pengaduan "${complaint.title}"?`)) return

  try {
    await complaintService.remove(complaint.id)
    complaints.value = complaints.value.filter((item) => item.id !== complaint.id)
    notify.success('Catatan pengaduan berhasil dihapus.')
  } catch (error) {
    notify.error(`Catatan pengaduan belum terhapus: ${error.message}`)
  }
}

function formatDate(value) {
  return new Date(value).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="section-container py-6 md:py-10">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
      <div>
        <h1 class="font-poppins font-bold text-headline text-primary-dark">Pengaduan</h1>
        <p class="text-text-secondary mt-1">
          Pengaduan diterima melalui telepon. Admin mencatat dan mengelola tindak lanjutnya di sini.
        </p>
      </div>
      <BaseButton
        variant="primary"
        :disabled="isLoading"
        @click="showEntryForm = !showEntryForm"
      >
        {{ showEntryForm ? 'Tutup Form' : 'Catat Pengaduan' }}
      </BaseButton>
    </div>

    <div v-if="contact" class="bg-primary-soft border border-primary/10 rounded-md p-4 mb-6">
      <p class="text-sm font-medium text-text-primary">Konsumen dan supplier menghubungi admin melalui nomor pada footer.</p>
      <p class="text-sm text-text-secondary mt-1">
        Nomor admin:
        <a :href="`tel:${contact.phone}`" class="font-semibold text-primary hover:underline">{{ contact.phone }}</a>
        <span v-if="contact.hours"> · {{ contact.hours }}</span>
      </p>
    </div>
    <p v-else-if="contactError" class="bg-amber-50 border border-amber-200 rounded-md p-4 text-sm text-amber-800 mb-6">
      Informasi nomor admin belum dapat dimuat: {{ contactError }}. Pastikan nomor kontak telah diatur pada menu Bantuan.
    </p>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
      <div class="bg-surface rounded-md border border-border p-4">
        <p class="text-xs text-text-secondary uppercase tracking-wide">Total Catatan</p>
        <p class="font-poppins font-bold text-2xl text-primary-dark mt-1">{{ complaints.length }}</p>
      </div>
      <div class="bg-surface rounded-md border border-border p-4">
        <p class="text-xs text-text-secondary uppercase tracking-wide">Belum Selesai</p>
        <p class="font-poppins font-bold text-2xl text-accent mt-1">{{ openComplaints }}</p>
      </div>
    </div>

    <form
      v-if="showEntryForm"
      class="bg-surface rounded-md border border-border p-5 md:p-6 mb-6 space-y-4"
      @submit.prevent="createComplaint"
    >
      <div>
        <h2 class="font-poppins font-semibold text-lg text-primary-dark">Catat Pengaduan dari Panggilan</h2>
        <p class="text-sm text-text-secondary mt-1">Isi berdasarkan informasi yang disampaikan pelapor melalui nomor admin.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label class="block text-sm font-medium text-text-primary">
          Pelapor
          <select v-model="entryForm.reporterRole" class="form-input-base mt-1">
            <option value="consumer">Konsumen</option>
            <option value="supplier">Supplier</option>
          </select>
        </label>
        <label class="block text-sm font-medium text-text-primary">
          Nama pelapor
          <input v-model.trim="entryForm.reporterName" class="form-input-base mt-1" required maxlength="160" />
        </label>
        <label class="block text-sm font-medium text-text-primary">
          Nomor telepon pelapor
          <input v-model.trim="entryForm.reporterPhone" type="tel" class="form-input-base mt-1" required maxlength="40" />
        </label>
        <label class="block text-sm font-medium text-text-primary">
          Nomor pesanan <span class="font-normal text-text-secondary">(opsional)</span>
          <input v-model.trim="entryForm.orderNumber" class="form-input-base mt-1" maxlength="80" />
        </label>
        <label class="block text-sm font-medium text-text-primary">
          Judul pengaduan
          <input v-model.trim="entryForm.title" class="form-input-base mt-1" required maxlength="200" />
        </label>
        <label class="block text-sm font-medium text-text-primary">
          Kategori
          <input v-model.trim="entryForm.category" class="form-input-base mt-1" required maxlength="100" placeholder="Contoh: mutu makanan" />
        </label>
        <label class="block text-sm font-medium text-text-primary">
          Prioritas
          <select v-model="entryForm.priority" class="form-input-base mt-1">
            <option>Rendah</option>
            <option>Sedang</option>
            <option>Tinggi</option>
          </select>
        </label>
        <label class="block text-sm font-medium text-text-primary sm:col-span-2">
          Kronologi pengaduan
          <textarea v-model.trim="entryForm.description" rows="4" class="form-input-base mt-1 h-auto py-3" required maxlength="5000" />
        </label>
      </div>

      <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-1">
        <BaseButton type="button" variant="outline" class="w-full sm:w-auto" @click="showEntryForm = false">
          Batal
        </BaseButton>
        <BaseButton type="submit" variant="primary" class="w-full sm:w-auto" :loading="isSaving">
          Simpan Catatan
        </BaseButton>
      </div>
    </form>

    <p v-if="loadError" class="bg-red-50 border border-red-200 rounded-md p-4 text-sm text-error mb-4">
      Daftar pengaduan belum dapat dimuat: {{ loadError }}
      <button type="button" class="font-semibold underline ml-1" @click="loadPage">Coba lagi</button>
    </p>

    <div v-if="isLoading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="h-28 bg-border/20 rounded animate-pulse" />
    </div>
    <div v-else-if="complaints.length === 0" class="text-center py-12 bg-surface rounded-md border border-border">
      <p class="text-4xl mb-2">📭</p>
      <p class="text-text-primary font-medium">Belum ada catatan pengaduan.</p>
      <p class="text-sm text-text-secondary mt-1">Setelah menerima panggilan, pilih “Catat Pengaduan”.</p>
    </div>

    <div v-else class="space-y-4">
      <article
        v-for="complaint in complaints"
        :key="complaint.id"
        class="bg-surface rounded-md border border-border p-5"
      >
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="font-semibold text-text-primary">{{ complaint.title }}</h2>
              <StatusBadge :status="complaint.status" size="sm" />
              <span class="chip bg-background text-text-secondary">{{ complaint.priority }}</span>
            </div>
            <p class="text-sm text-text-secondary mt-2">
              {{ complaint.reporterName }} · {{ complaint.reporterRole === 'supplier' ? 'Supplier' : 'Konsumen' }}
              · <a :href="`tel:${complaint.reporterPhone}`" class="text-primary hover:underline">{{ complaint.reporterPhone }}</a>
            </p>
            <p class="text-xs text-text-secondary mt-1">
              Diterima {{ formatDate(complaint.receivedAt) }} · {{ complaint.category }}
              <span v-if="complaint.orderNumber"> · Pesanan {{ complaint.orderNumber }}</span>
            </p>
          </div>
          <div class="flex flex-wrap gap-2 flex-shrink-0">
            <BaseButton size="sm" variant="outline" @click="startResponse(complaint)">
              {{ editingId === complaint.id ? 'Tutup' : 'Tindak Lanjut' }}
            </BaseButton>
            <BaseButton size="sm" variant="danger" @click="deleteComplaint(complaint)">
              Hapus
            </BaseButton>
          </div>
        </div>

        <p class="mt-4 text-sm text-text-primary whitespace-pre-line">{{ complaint.description }}</p>
        <p v-if="complaint.adminNotes" class="mt-3 text-sm text-text-secondary whitespace-pre-line">
          <span class="font-semibold text-text-primary">Catatan admin:</span> {{ complaint.adminNotes }}
        </p>
        <p v-if="complaint.resolution" class="mt-3 text-sm text-success whitespace-pre-line">
          <span class="font-semibold">Penyelesaian:</span> {{ complaint.resolution }}
        </p>

        <form
          v-if="editingId === complaint.id"
          class="mt-5 pt-5 border-t border-border space-y-4"
          @submit.prevent="saveResponse(complaint)"
        >
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label class="block text-sm font-medium text-text-primary">
              Status
              <select v-model="responseForm.status" class="form-input-base mt-1">
                <option>Menunggu</option>
                <option>Sedang Ditangani</option>
                <option>Terselesaikan</option>
              </select>
            </label>
            <label class="block text-sm font-medium text-text-primary sm:col-span-2">
              Catatan tindak lanjut
              <textarea v-model.trim="responseForm.adminNotes" rows="3" class="form-input-base mt-1 h-auto py-3" maxlength="5000" />
            </label>
            <label v-if="responseForm.status === 'Terselesaikan'" class="block text-sm font-medium text-text-primary sm:col-span-2">
              Hasil penyelesaian
              <textarea v-model.trim="responseForm.resolution" rows="3" class="form-input-base mt-1 h-auto py-3" required maxlength="5000" />
            </label>
          </div>
          <div class="flex flex-col-reverse sm:flex-row justify-end gap-3">
            <BaseButton type="button" variant="outline" class="w-full sm:w-auto" @click="editingId = null">
              Batal
            </BaseButton>
            <BaseButton type="submit" variant="primary" class="w-full sm:w-auto" :loading="isSaving">
              Simpan Tindak Lanjut
            </BaseButton>
          </div>
        </form>
      </article>
    </div>
  </div>
</template>
