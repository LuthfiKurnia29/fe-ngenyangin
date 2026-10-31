import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notifications', () => {
  const toasts = ref([])

  function add(message, type = 'success', duration = 4000) {
    const id = Date.now()
    toasts.value.push({ id, message, type })
    setTimeout(() => remove(id), duration)
  }

  function remove(id) {
    const idx = toasts.value.findIndex(t => t.id === id)
    if (idx !== -1) toasts.value.splice(idx, 1)
  }

  function success(message) { add(message, 'success') }
  function error(message) { add(message, 'error') }
  function info(message) { add(message, 'info') }
  function warning(message) { add(message, 'warning') }

  return { toasts, add, remove, success, error, info, warning }
})
