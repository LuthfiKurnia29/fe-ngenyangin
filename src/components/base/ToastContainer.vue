<script setup>
import { useNotificationStore } from '@/stores/notifications'
const notify = useNotificationStore()
</script>

<template>
    <Teleport to="body">
      <div class="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm">
        <TransitionGroup name="toast">
          <div
            v-for="toast in notify.toasts"
            :key="toast.id"
            :class="[
              'flex items-center gap-3 px-4 py-3 rounded-md shadow-modal text-sm font-medium animate-slide-up',
              toast.type === 'success' && 'bg-primary text-white',
              toast.type === 'error' && 'bg-error text-white',
              toast.type === 'info' && 'bg-info text-white',
              toast.type === 'warning' && 'bg-warning text-white',
            ]"
          >
            <span class="flex-1">{{ toast.message }}</span>
            <button @click="notify.remove(toast.id)" class="opacity-70 hover:opacity-100">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </TransitionGroup>
      </div>
    </Teleport>
</template>

<style scoped>
.toast-enter-active { transition: all 0.3s ease-out; }
.toast-leave-active { transition: all 0.2s ease-in; }
.toast-enter-from { opacity: 0; transform: translateY(16px) scale(0.95); }
.toast-leave-to { opacity: 0; transform: translateX(100px); }
</style>
