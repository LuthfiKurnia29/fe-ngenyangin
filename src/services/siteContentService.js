const CONTACT_KEY = 'ngenyangin_contact'
const FAQ_KEY = 'ngenyangin_faq'
const POLICY_KEY = 'ngenyangin_food_policy'

const defaultContact = {
  email: 'halo@ngenyangin.id',
  phone: '0800-1234-5678',
  hours: 'Senin–Minggu, 07.00–22.00 WIB',
  message: 'Tim admin siap membantu konsumen dan supplier NGENYANGIN.'
}

const defaultPolicies = [
  {
    id: 'policy-uu-18-2012',
    title: 'Keamanan dan mutu pangan',
    content: 'Setiap pangan yang ditawarkan melalui NGENYANGIN harus aman, bermutu, higienis, dan layak dikonsumsi. Supplier wajib menjaga kebersihan bahan, peralatan, tempat pengolahan, serta proses penyimpanan dan pengangkutan makanan.',
    reference: 'Undang-Undang Republik Indonesia Nomor 18 Tahun 2012 tentang Pangan'
  },
  {
    id: 'policy-pp-86-2019',
    title: 'Pencegahan bahaya pangan',
    content: 'Supplier wajib mencegah cemaran biologis, kimia, dan benda lain pada makanan; menerapkan sanitasi yang baik; serta segera menghentikan penjualan dan melaporkan kepada admin apabila makanan diduga tidak aman atau menimbulkan kejadian luar biasa.',
    reference: 'Peraturan Pemerintah Republik Indonesia Nomor 86 Tahun 2019 tentang Keamanan Pangan'
  },
  {
    id: 'policy-label-information',
    title: 'Informasi makanan dan label',
    content: 'Informasi makanan harus benar, jelas, dan tidak menyesatkan. Supplier wajib mencantumkan nama makanan, komposisi atau alergen yang diketahui, kondisi makanan, tanggal atau batas waktu pengambilan, serta petunjuk penyimpanan apabila diperlukan.',
    reference: 'Undang-Undang Nomor 18 Tahun 2012 tentang Pangan dan Peraturan BPOM Nomor 31 Tahun 2018 tentang Label Pangan Olahan'
  },
  {
    id: 'policy-consumer-protection',
    title: 'Perlindungan konsumen',
    content: 'Konsumen berhak memperoleh makanan yang aman dan informasi yang benar. Supplier dilarang menjual makanan rusak, tercemar, kedaluwarsa, atau tidak sesuai dengan informasi yang ditampilkan. Keluhan keamanan pangan harus ditangani dengan itikad baik melalui admin.',
    reference: 'Undang-Undang Republik Indonesia Nomor 8 Tahun 1999 tentang Perlindungan Konsumen'
  },
  {
    id: 'policy-ngenyangin-operational',
    title: 'Standar operasional NGENYANGIN',
    content: 'Makanan harus dikemas atau ditutup dengan aman, dipisahkan dari bahan yang dapat mencemari, dan diserahkan sesuai batas waktu pengambilan. Konsumen wajib mengikuti petunjuk penyimpanan dan segera menghubungi admin jika menemukan dugaan masalah keamanan pangan.',
    reference: 'Kebijakan operasional NGENYANGIN berdasarkan ketentuan keamanan pangan yang berlaku'
  }
]

const consumerQuestions = [
  ['Bagaimana cara membuat akun konsumen?', 'Klik Daftar, pilih Konsumen, isi data diri, baca Syarat & Ketentuan, lalu centang persetujuan sebelum mendaftar.'],
  ['Bagaimana cara masuk ke akun?', 'Klik Masuk, masukkan email dan password yang terdaftar, lalu tekan Masuk.'],
  ['Bagaimana cara mencari makanan?', 'Buka menu Jelajah untuk melihat makanan surplus, kategori, outlet, dan supplier yang tersedia.'],
  ['Bagaimana cara menggunakan pencarian?', 'Ketik nama makanan atau supplier pada kolom pencarian di halaman Jelajah.'],
  ['Bagaimana cara melihat detail makanan?', 'Klik kartu makanan untuk melihat harga, deskripsi, jumlah, supplier, dan batas waktu pengambilan.'],
  ['Bagaimana cara menambahkan makanan ke keranjang?', 'Buka detail makanan lalu pilih jumlah dan tekan tombol tambah ke keranjang.'],
  ['Bagaimana cara melihat isi keranjang?', 'Klik ikon keranjang pada navbar untuk meninjau makanan dan jumlah pesanan.'],
  ['Bagaimana cara melakukan checkout?', 'Dari keranjang, tekan Checkout, lengkapi metode pengambilan atau pengantaran, lalu konfirmasi pesanan.'],
  ['Apakah harga makanan sudah mendapat diskon?', 'Harga yang ditampilkan mengikuti harga surplus yang ditetapkan supplier dan dapat berbeda untuk setiap makanan.'],
  ['Bagaimana cara memilih pengambilan makanan?', 'Saat checkout, pilih Ambil di Outlet atau opsi pengantaran jika tersedia.'],
  ['Bagaimana cara melihat pesanan saya?', 'Buka menu Pesanan Saya untuk melihat daftar dan status pesanan.'],
  ['Bagaimana cara melihat status pesanan?', 'Klik salah satu pesanan untuk melihat timeline proses pesanan secara lengkap.'],
  ['Apa yang harus dilakukan jika ada masalah pesanan?', 'Gunakan menu Pengaduan pada area akun atau hubungi kontak admin di footer.'],
  ['Kapan saya dapat memberikan ulasan?', 'Ulasan dapat diberikan setelah pesanan selesai melalui halaman pesanan atau halaman ulasan.'],
  ['Bagaimana cara mengubah profil konsumen?', 'Buka menu profil pada navbar, ubah data yang diperlukan, lalu simpan perubahan.']
]

const supplierQuestions = [
  ['Bagaimana cara mendaftar sebagai supplier?', 'Klik Bergabung sebagai Supplier, lengkapi formulir pendaftaran, baca dokumen Syarat & Ketentuan, lalu setujui sebelum mendaftar.'],
  ['Apa yang harus disiapkan supplier?', 'Siapkan nama, email aktif, nomor telepon, password, serta informasi usaha yang benar.'],
  ['Bagaimana cara masuk ke dashboard supplier?', 'Setelah registrasi berhasil, masuk menggunakan email dan password supplier.'],
  ['Bagaimana cara menambahkan makanan?', 'Buka menu Tambah Makanan, isi data makanan, harga, stok, kategori, dan unggah foto jika tersedia.'],
  ['Informasi apa yang wajib diisi saat menambahkan makanan?', 'Nama, kategori, harga, jumlah stok, waktu pengambilan, dan informasi makanan harus diisi secara akurat.'],
  ['Bagaimana cara mengunggah foto makanan?', 'Pada formulir makanan, pilih file foto yang jelas lalu tunggu hingga unggahan selesai sebelum menyimpan.'],
  ['Bagaimana cara mengubah makanan?', 'Buka daftar makanan di dashboard, pilih makanan, lalu tekan Edit untuk memperbarui datanya.'],
  ['Bagaimana cara menghapus makanan?', 'Pilih makanan pada daftar supplier lalu gunakan aksi hapus dan konfirmasi perubahan.'],
  ['Bagaimana cara melihat pesanan masuk?', 'Buka menu Pesanan Masuk pada navbar supplier untuk melihat pesanan dari konsumen.'],
  ['Bagaimana cara memproses pesanan?', 'Buka detail pesanan dan perbarui status sesuai tahap pesanan yang sedang dilakukan.'],
  ['Bagaimana cara menandai pesanan siap diambil?', 'Setelah pesanan disiapkan, ubah statusnya menjadi Siap Diambil pada detail pesanan.'],
  ['Bagaimana cara mengelola profil toko?', 'Buka Profil Toko, perbarui nama outlet, alamat, deskripsi, dan kontak, lalu simpan.'],
  ['Bagaimana supplier menjaga keamanan pangan?', 'Pastikan makanan layak jual, dikemas aman, dan informasi waktu pengambilan ditulis dengan benar.'],
  ['Apa yang dilakukan jika supplier menerima keluhan?', 'Baca detail pengaduan dan berikan informasi yang benar; admin membantu menyelesaikan sengketa bila diperlukan.'],
  ['Bagaimana cara menghubungi admin?', 'Gunakan email atau nomor telepon admin yang tersedia pada footer dan halaman Bantuan.']
]

const defaultFaq = [
  ...consumerQuestions.map(([question, answer]) => ({ audience: 'Konsumen', question, answer })),
  ...supplierQuestions.map(([question, answer]) => ({ audience: 'Supplier', question, answer }))
]

function read(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null')
    return value || fallback
  } catch (error) {
    console.error(`Gagal membaca ${key}:`, error)
    return fallback
  }
}

export const siteContentService = {
  getFaq() {
    return read(FAQ_KEY, defaultFaq).map((item) => ({ ...item }))
  },
  saveFaq(faq) {
    const cleaned = faq
      .map((item) => ({
        id: item.id || `faq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        audience: item.audience === 'Supplier' ? 'Supplier' : 'Konsumen',
        question: String(item.question || '').trim(),
        answer: String(item.answer || '').trim()
      }))
    if (cleaned.some((item) => !item.question || !item.answer)) {
      throw new Error('Lengkapi pertanyaan dan jawaban semua FAQ sebelum menyimpan.')
    }
    localStorage.setItem(FAQ_KEY, JSON.stringify(cleaned))
    return this.getFaq()
  },
  getPolicies() {
    const stored = read(POLICY_KEY, null)
    if (Array.isArray(stored)) {
      return stored.map((policy) => ({ ...policy }))
    }
    if (stored && typeof stored === 'object' && stored.title && stored.content) {
      return [{
        id: 'policy-legacy',
        title: String(stored.title),
        content: String(stored.content),
        reference: 'Kebijakan keamanan pangan NGENYANGIN'
      }]
    }
    return defaultPolicies.map((policy) => ({ ...policy }))
  },
  savePolicies(policies) {
    const cleaned = policies.map((policy) => ({
      id: policy.id || `policy-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: String(policy.title || '').trim(),
      content: String(policy.content || '').trim(),
      reference: String(policy.reference || '').trim()
    }))
    if (cleaned.length === 0) throw new Error('Minimal harus ada satu kebijakan keamanan pangan.')
    if (cleaned.some((policy) => !policy.title || !policy.content || !policy.reference)) {
      throw new Error('Lengkapi judul, isi, dan dasar hukum semua kebijakan sebelum menyimpan.')
    }
    localStorage.setItem(POLICY_KEY, JSON.stringify(cleaned))
    return this.getPolicies()
  },
  getPolicy() {
    const [policy] = this.getPolicies()
    return policy
  },
  savePolicy(policy) {
    return this.savePolicies([{
      ...policy,
      reference: policy.reference || 'Kebijakan keamanan pangan NGENYANGIN'
    }])[0]
  },
  getContact() {
    return { ...defaultContact, ...read(CONTACT_KEY, {}) }
  },
  saveContact(contact) {
    const cleaned = {
      email: String(contact.email || '').trim(),
      phone: String(contact.phone || '').trim(),
      hours: String(contact.hours || '').trim(),
      message: String(contact.message || '').trim()
    }
    if (!cleaned.email || !cleaned.phone || !cleaned.hours || !cleaned.message) throw new Error('Kontak admin harus diisi lengkap.')
    localStorage.setItem(CONTACT_KEY, JSON.stringify(cleaned))
    return this.getContact()
  }
}
