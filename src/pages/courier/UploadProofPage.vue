<template>
  <div class="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md mt-8">
    <h1 class="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Unggah Bukti Pengantaran</h1>
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" for="proof">Pilih foto bukti (JPG/PNG)</label>
        <input
          id="proof"
          type="file"
          accept="image/*"
          @change="onFileChange"
          class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
          required
        />
      </div>
      <div class="flex justify-end">
        <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          Unggah
        </button>
      </div>
    </form>
    <div v-if="previewUrl" class="mt-6">
      <p class="text-gray-700 dark:text-gray-300 mb-2">Pratinjau:</p>
      <img :src="previewUrl" alt="Preview" class="max-w-full h-auto rounded" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const file = ref(null)
const previewUrl = ref('')

function onFileChange(event) {
  const selected = event.target.files[0]
  if (selected) {
    file.value = selected
    previewUrl.value = URL.createObjectURL(selected)
  } else {
    file.value = null
    previewUrl.value = ''
  }
}

function handleSubmit() {
  if (!file.value) {
    alert('Silakan pilih file terlebih dahulu.')
    return
  }
  // In real aplikasi, kita akan mengirim file ke backend.
  // Untuk demo front‑end, cukup tampilkan alert.
  alert('Bukti berhasil diunggah!')
  // Reset form
  file.value = null
  previewUrl.value = ''
}
</script>

<style scoped>
/* Tailwind sudah menyediakan sebagian besar styling, jadi tidak ada CSS khusus di sini. */
</style>
