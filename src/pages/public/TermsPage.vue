<script setup>
import { termsService } from '@/services/termsService'

const sections = termsService.getSections()
</script>

<template>
  <div class="min-h-full bg-white py-8 md:py-12">
    <div class="max-w-3xl mx-auto bg-white rounded-lg border border-slate-200 shadow-sm p-6 md:p-10">
      <h1 class="font-poppins font-bold text-headline text-primary-dark">Syarat & Ketentuan NGENYANGIN</h1>
      <p class="text-text-secondary mt-2 mb-8">Mohon baca ketentuan berikut sebelum menggunakan layanan kami.</p>
      <div class="space-y-6">
        <article v-for="(section, index) in sections" :key="section.title">
          <h2 class="font-poppins font-semibold text-lg text-primary-dark">{{ index + 1 }}. {{ section.title }}</h2>
          <p class="text-text-primary leading-relaxed mt-2">{{ section.content }}</p>
        </article>
      </div>
    </div>
  </div>
</template>
