<template>
  <footer class="bg-primary-dark text-white">
    <div class="section-container py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Brand column -->
        <div class="md:col-span-1">
          <div class="inline-flex items-center px-4 py-2 bg-white/10 rounded-md mb-4">
            <!-- Logo versi kontras untuk latar gelap: filter invert putih -->
            <Logo height="h-10" variant="light" />
          </div>
          <p class="text-sm text-white/70 leading-relaxed">
            Selamatkan makanan surplus UMKM kuliner. Hemat lebih banyak, kurangi pemborosan pangan.
          </p>
          <div class="flex gap-3 mt-4">
            <span class="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 cursor-pointer transition-colors">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </span>
            <span class="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 cursor-pointer transition-colors">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12c0 3.259.014 3.668.072 4.948.058 1.279.259 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24c3.259 0 3.668-.014 4.948-.072 1.277-.058 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947 0-3.259-.014-3.667-.072-4.947-.058-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85 0 3.204-.015 3.585-.074 4.85-.061 1.17-.255 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 01-2.88 0 1.44 1.44 0 012.88 0z"/></svg>
            </span>
          </div>
        </div>

        <!-- Tentang -->
        <div>
          <h3 class="font-poppins font-semibold text-sm mb-4 text-white">Tentang</h3>
          <ul class="space-y-2.5 text-sm text-white/70">
            <li><RouterLink to="/#tentang" class="hover:text-white transition-colors">Tentang Kami</RouterLink></li>
            <li><RouterLink to="/#cara-kerja" class="hover:text-white transition-colors">Cara Kerja</RouterLink></li>
            <li><RouterLink to="/#misi" class="hover:text-white transition-colors">Misi Kami</RouterLink></li>
            <li><RouterLink to="/daftar?role=supplier" class="hover:text-white transition-colors">Bergabung sebagai Supplier</RouterLink></li>
          </ul>
        </div>

        <!-- Bantuan -->
        <div>
          <h3 class="font-poppins font-semibold text-sm mb-4 text-white">Bantuan</h3>
          <ul class="space-y-2.5 text-sm text-white/70">
            <li><RouterLink to="/bantuan#policy" class="hover:text-white transition-colors">Kebijakan Keamanan Pangan</RouterLink></li>
            <li><RouterLink to="/faq" class="hover:text-white transition-colors">FAQ</RouterLink></li>
            <li><RouterLink to="/bantuan#contact" class="hover:text-white transition-colors">Hubungi Kami</RouterLink></li>
          </ul>
        </div>

        <!-- Kontak -->
        <div>
          <h3 class="font-poppins font-semibold text-sm mb-4 text-white">Kontak</h3>
          <ul class="space-y-2.5 text-sm text-white/70">
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              <a :href="`mailto:${contact.email}`" class="hover:text-white">{{ contact.email }}</a>
            </li>
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
              <a :href="`tel:${contact.phone}`" class="hover:text-white">{{ contact.phone }}</a>
            </li>
          </ul>
          <div class="mt-4 p-3 bg-white/10 rounded-md">
            <p class="text-xs text-white/70">Layanan pelanggan dan pengaduan:</p>
            <p class="text-sm font-medium text-white">{{ contact.hours }}</p>
            <p class="text-xs text-white/70 mt-1">Hubungi admin melalui nomor di atas. Pengaduan akan dicatat dan ditindaklanjuti oleh admin.</p>
            <p v-if="contactError" class="text-xs text-amber-200 mt-1">Informasi kontak belum berhasil diperbarui.</p>
          </div>
        </div>
      </div>

      <div class="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p class="text-xs text-white/50">© 2026 NGENYANGIN. Semua hak dilindungi.</p>
        <div class="flex gap-4 text-xs text-white/50">
          <RouterLink to="/syarat-ketentuan" class="hover:text-white/80 transition-colors">Syarat & Ketentuan</RouterLink>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { contentService } from '@/services/contentService'

const contact = ref({
  email: 'halo@ngenyangin.id',
  phone: '0800-1234-5678',
  hours: 'Senin–Minggu, 07.00–22.00 WIB',
})
const contactError = ref('')

onMounted(async () => {
  try {
    const record = await contentService.get('contact', 'all')
    contact.value = record.content
  } catch (error) {
    contactError.value = error.message
    console.error('Gagal memuat kontak footer:', error)
  }
})
</script>
