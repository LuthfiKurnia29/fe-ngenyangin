<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAddressStore } from '@/stores/address'
import { useNotificationStore } from '@/stores/notifications'
import BaseButton from '@/components/base/BaseButton.vue'

const router = useRouter()
const addressStore = useAddressStore()
const notify = useNotificationStore()

const props = defineProps({
  // mode: 'list' (dari profil/tombol) atau 'select' (dari checkout)
  mode: { type: String, default: 'list' },
})

const emit = defineEmits(['selected'])

function selectAddress(addr) {
  addressStore.setDefault(addr.id)
  if (props.mode === 'select') {
    emit('selected', addr)
    router.back()
  } else {
    notify.success('Alamat utama diperbarui')
  }
}

function tryRemove(addr) {
  try {
    addressStore.removeAddress(addr.id)
    notify.success('Alamat dihapus')
  } catch (err) {
    notify.error(err.message)
  }
}
</script>

<template>
  <div class="py-6 md:py-10">
    <div class="section-container max-w-2xl">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <button @click="router.back()" class="flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            Kembali
          </button>
          <h1 class="font-poppins font-bold text-xl text-primary-dark">Daftar Alamat</h1>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="addressStore.addresses.length === 0" class="text-center py-16 bg-surface rounded-lg border border-border">
        <p class="text-4xl mb-3">📍</p>
        <p class="font-semibold text-lg">Belum ada alamat tersimpan</p>
        <p class="text-sm text-text-secondary mt-1">Tambahkan alamat pengantaran untuk melanjutkan</p>
        <BaseButton variant="primary" class="mt-4" @click="router.push('/alamat/baru')">+ Tambah Alamat</BaseButton>
      </div>

      <!-- Address list -->
      <div v-else class="space-y-3">
        <div
          v-for="addr in addressStore.addresses"
          :key="addr.id"
          :class="[
            'bg-surface rounded-lg border p-4 transition-all',
            addr.isDefault ? 'border-primary shadow-sm' : 'border-border hover:border-primary/40'
          ]"
        >
          <div class="flex items-start gap-3">
            <!-- Radio -->
            <button
              @click="selectAddress(addr)"
              :class="[
                'mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors',
                addr.isDefault ? 'border-primary bg-primary' : 'border-border hover:border-primary'
              ]"
              :aria-label="`Pilih ${addr.recipientName}`"
            >
              <span v-if="addr.isDefault" class="w-2 h-2 rounded-full bg-white"></span>
            </button>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <p class="font-semibold text-sm text-text-primary">{{ addr.recipientName }}</p>
                <span v-if="addr.label" :class="[
                  'text-xs px-2 py-0.5 rounded-full font-medium',
                  addr.label === 'Rumah' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                ]">{{ addr.label }}</span>
                <span v-if="addr.isDefault" class="chip bg-primary-soft text-primary text-xs font-semibold">Utama</span>
              </div>
              <p class="text-xs text-text-secondary mt-0.5">{{ addr.phone }}</p>
              <p class="text-sm text-text-secondary mt-1 leading-relaxed">
                {{ addr.streetDetail }}, {{ addr.district }}, {{ addr.city }}, {{ addr.province }} {{ addr.postalCode }}
              </p>
              <p v-if="addr.otherDetail" class="text-xs text-text-secondary mt-0.5 italic">{{ addr.otherDetail }}</p>
            </div>

            <!-- Actions -->
            <div class="flex gap-1 flex-shrink-0">
              <button
                @click="router.push(`/alamat/${addr.id}/ubah`)"
                class="text-xs text-primary font-medium hover:underline px-2 py-1 rounded hover:bg-primary-soft transition-colors"
              >Ubah</button>
              <button
                v-if="!addr.isDefault"
                @click="tryRemove(addr)"
                class="text-xs text-error font-medium hover:underline px-2 py-1 rounded hover:bg-red-50 transition-colors"
              >Hapus</button>
            </div>
          </div>
        </div>

        <!-- Add new -->
        <button
          @click="router.push('/alamat/baru')"
          class="w-full py-4 border-2 border-dashed border-border rounded-lg text-sm text-text-secondary hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          + Tambah Alamat Baru
        </button>
      </div>
    </div>
  </div>
</template>
