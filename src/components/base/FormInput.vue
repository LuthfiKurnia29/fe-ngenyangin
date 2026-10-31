<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
  disabled: Boolean,
  required: Boolean,
  id: { type: String, default: () => 'input-' + Math.random().toString(36).slice(2) }
})

const emit = defineEmits(['update:modelValue'])

const hasError = computed(() => !!props.error)
</script>

<template>
  <div class="w-full">
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium text-text-primary mb-1.5"
    >
      {{ label }}
      <span v-if="required" class="text-error ml-0.5">*</span>
    </label>

    <textarea
      v-if="type === 'textarea'"
      :id="id"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      rows="4"
      @input="emit('update:modelValue', $event.target.value)"
      :class="[
        'form-input-base resize-none py-3',
        hasError && 'border-error focus:border-error focus:ring-error/10',
        disabled && 'opacity-50 cursor-not-allowed bg-background'
      ]"
    />

    <input
      v-else
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      @input="emit('update:modelValue', $event.target.value)"
      :class="[
        'form-input-base',
        hasError && 'border-error focus:border-error focus:ring-error/10',
        disabled && 'opacity-50 cursor-not-allowed bg-background'
      ]"
    />

    <p v-if="error" class="mt-1 text-xs text-error flex items-center gap-1">
      <svg class="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
      </svg>
      {{ error }}
    </p>
    <p v-else-if="hint" class="mt-1 text-xs text-text-secondary">{{ hint }}</p>
  </div>
</template>
