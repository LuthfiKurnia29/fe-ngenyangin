const STORAGE_KEY = 'ngenyangin_terms'

const defaultSections = [
  {
    id: 'terms-service',
    title: 'Layanan',
    content: 'NGENYANGIN mempertemukan konsumen dengan supplier makanan surplus. Ketersediaan, harga, dan waktu pengambilan mengikuti informasi yang ditampilkan supplier.'
  },
  {
    id: 'terms-account',
    title: 'Akun dan data pengguna',
    content: 'Pengguna wajib memberikan data yang benar dan menjaga keamanan akunnya. Akun dapat ditangguhkan jika digunakan untuk penipuan, penyalahgunaan, atau pelanggaran ketentuan.'
  },
  {
    id: 'terms-orders',
    title: 'Transaksi dan pengambilan',
    content: 'Pesanan harus dibayar dan diambil sesuai instruksi pada aplikasi. Konsumen dan supplier wajib berkomunikasi dengan sopan dan menyelesaikan kendala melalui fitur pengaduan.'
  },
  {
    id: 'terms-food-safety',
    title: 'Keamanan pangan',
    content: 'Supplier bertanggung jawab memastikan makanan layak jual, mencantumkan informasi yang akurat, dan mengemas makanan dengan aman. Konsumen wajib mengikuti petunjuk penyimpanan dan konsumsi.'
  },
  {
    id: 'terms-changes',
    title: 'Perubahan ketentuan',
    content: 'Admin dapat memperbarui syarat dan ketentuan. Versi terbaru akan ditampilkan di halaman ini dan wajib dibaca sebelum pengguna membuat akun.'
  }
]

function cloneSections(sections) {
  return sections.map((section) => ({
    id: section.id || `terms-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: section.title,
    content: section.content
  }))
}

function readSections() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (Array.isArray(stored) && stored.length > 0) return cloneSections(stored)
  } catch (error) {
    console.error('Gagal membaca syarat dan ketentuan:', error)
  }
  return cloneSections(defaultSections)
}

export const termsService = {
  getSections() {
    return readSections()
  },

  saveSections(sections) {
    const cleaned = sections
      .map((section) => ({
        id: section.id || `terms-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: String(section.title || '').trim(),
        content: String(section.content || '').trim()
      }))

    if (cleaned.length === 0) throw new Error('Minimal harus ada satu ketentuan.')
    if (cleaned.some((section) => !section.title || !section.content)) {
      throw new Error('Lengkapi judul dan isi semua ketentuan sebelum menyimpan.')
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned))
    return cloneSections(cleaned)
  }
}
