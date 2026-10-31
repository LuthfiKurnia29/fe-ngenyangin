<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: v => ['primary', 'secondary', 'ghost', 'danger', 'outline'].includes(v)
  },
  size: {
    type: String,
    default: 'md',
    validator: s => ['sm', 'md', 'lg'].includes(s)
  },
  disabled: Boolean,
  loading: Boolean,
  type: { type: String, default: 'button' },
  fullWidth: Boolean
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center gap-2 font-medium rounded-full transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 select-none',
      // Sizes
      size === 'sm' && 'px-4 h-9 text-sm focus:ring-primary/30',
      size === 'md' && 'px-6 h-12 text-base focus:ring-primary/30',
      size === 'lg' && 'px-8 h-14 text-lg focus:ring-primary/30',
      // Variants
      variant === 'primary' && !disabled && !loading && 'bg-accent text-white hover:bg-accent-dark active:scale-95 focus:ring-accent/30',
      variant === 'secondary' && !disabled && !loading && 'bg-primary text-white hover:bg-primary-dark active:scale-95',
      variant === 'outline' && !disabled && !loading && 'border-2 border-primary text-primary hover:bg-primary-soft active:scale-95',
      variant === 'ghost' && !disabled && !loading && 'text-primary hover:bg-primary-soft active:scale-95',
      variant === 'danger' && !disabled && !loading && 'bg-error text-white hover:opacity-90 active:scale-95',
      // Disabled
      (disabled || loading) && 'opacity-50 cursor-not-allowed',
      // Full width
      fullWidth && 'w-full'
    ]"
  >
    <!-- Loading spinner -->
    <svg v-if="loading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
    <slot />
  </button>
</template>
