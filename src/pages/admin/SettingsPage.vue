<script setup>
import { ref } from 'vue'
import { useNotificationStore } from '@/stores/notifications'

const settings = ref({
  theme: 'dark',
  notifications: true,
  language: 'id'
})

function save() {
  // mock persistence to localStorage
  localStorage.setItem('adminSettings', JSON.stringify(settings.value))
  // trigger toast via notification store
  const notify = useNotificationStore()
  notify.success('Pengaturan tersimpan')
}
</script>

<template>
  <div class="section-container py-6 md:py-10">
    <h1 class="font-poppins font-bold text-headline text-primary-dark mb-4">Pengaturan Admin</h1>
    <div class="space-y-6 max-w-md">
      <div>
        <label class="block text-text-primary mb-1">Tema</label>
        <select v-model="settings.theme" class="form-select-base w-full">
          <option value="light">Terang</option>
          <option value="dark">Gelap</option>
        </select>
      </div>
      <div class="flex items-center gap-2">
        <input type="checkbox" v-model="settings.notifications" id="notif" class="form-checkbox-base" />
        <label for="notif" class="text-text-primary">Aktifkan notifikasi</label>
      </div>
      <div>
        <label class="block text-text-primary mb-1">Bahasa</label>
        <select v-model="settings.language" class="form-select-base w-full">
          <option value="id">Bahasa Indonesia</option>
          <option value="en">English</option>
        </select>
      </div>
      <BaseButton variant="primary" @click="save">Simpan Pengaturan</BaseButton>
    </div>
  </div>
</template>
