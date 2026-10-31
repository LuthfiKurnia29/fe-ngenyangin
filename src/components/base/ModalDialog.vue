<script setup>
import { watch } from 'vue'

const props = defineProps({
  open: Boolean,
  title: { type: String, default: '' },
  size: { type: String, default: 'md', validator: v => ['sm', 'md', 'lg', 'xl'].includes(v) }
})

const emit = defineEmits(['close'])

// Prevent body scroll when modal open
watch(() => props.open, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
})

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl'
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        :aria-modal="open"
        :aria-label="title"
      >
        <!-- Scrim -->
        <div
          class="absolute inset-0 bg-primary-dark/40 backdrop-blur-sm"
          @click="emit('close')"
        />

        <!-- Dialog -->
        <div
          :class="['relative w-full bg-surface rounded-lg shadow-modal animate-slide-up', sizeClasses[size]]"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
            <h2 class="text-title text-text-primary font-semibold">{{ title }}</h2>
            <button
              @click="emit('close')"
              class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-background text-text-secondary transition-colors"
              aria-label="Tutup dialog"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="px-6 py-5">
            <slot />
          </div>

          <!-- Footer slot (optional) -->
          <div v-if="$slots.footer" class="px-6 pb-5">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
</style>
