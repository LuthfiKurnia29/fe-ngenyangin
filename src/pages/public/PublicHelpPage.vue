<script setup>
import { siteContentService } from '@/services/siteContentService'

const policies = siteContentService.getPolicies()
const contact = siteContentService.getContact()

</script>

<template>
  <div class="min-h-full bg-white py-10 md:py-16">
    <div class="max-w-4xl mx-auto px-4">
      <div class="text-center mb-8">
        <h1 class="font-poppins font-bold text-headline text-primary-dark">
          Bantuan NGENYANGIN
        </h1>

        <p class="text-text-secondary mt-2">
          Kebijakan keamanan pangan dan informasi kontak yang dikelola admin.
        </p>
      </div>

      <section
        id="policy"
        class="bg-white border border-slate-200 rounded-md shadow-sm p-6 mb-8 scroll-mt-20"
      >
        <h2 class="font-poppins font-semibold text-lg text-primary-dark mb-4">
          Kebijakan Keamanan Pangan
        </h2>
        <div class="space-y-5">
          <article v-for="policy in policies" :key="policy.id">
            <h3 class="font-semibold text-text-primary">{{ policy.title }}</h3>
            <p class="text-text-secondary leading-relaxed mt-1">{{ policy.content }}</p>
            <p class="text-xs text-text-secondary mt-2">Dasar hukum: {{ policy.reference }}</p>
          </article>
        </div>
      </section>

      <section
        id="contact"
        class="bg-white border border-slate-200 rounded-md shadow-sm p-6 mt-8 scroll-mt-20"
      >
        <h2 class="font-poppins font-semibold text-lg text-primary-dark mb-2">
          Hubungi Kami
        </h2>

        <p class="text-text-secondary mb-4">
          {{ contact.message }}
        </p>

        <div class="space-y-2 text-text-primary">
          <p>
            Email:
            <a
              :href="`mailto:${contact.email}`"
              class="text-primary hover:underline"
            >
              {{ contact.email }}
            </a>
          </p>

          <p>
            Telepon:
            <a
              :href="`tel:${contact.phone}`"
              class="text-primary hover:underline"
            >
              {{ contact.phone }}
            </a>
          </p>

          <p>
            Jam layanan: {{ contact.hours }}
          </p>
        </div>
      </section>
    </div>
  </div>
</template>
