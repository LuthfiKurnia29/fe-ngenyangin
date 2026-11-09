import api from './api'

const delay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Format timestamp ke string waktu lokal
 */
function formatTime(isoString) {
  if (!isoString) return ''
  try {
    return new Date(isoString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
  } catch {
    return ''
  }
}

/**
 * Normalisasi data pesanan dari API backend Supabase ke format yang dikonsumsi oleh komponen frontend.
 */
export function mapPurchase(p) {
  if (!p) return null

  const details = p.detail_purchases || p.items || []
  const firstItem = details[0] || {}

  // Hitung total kuantitas dari item details jika ada
  const totalQty = details.reduce((sum, item) => sum + Number(item.quantity || 1), 0) || Number(p.quantity || 1)

  // Mapping status pembayaran berdasarkan status pesanan
  let paymentStatus = 'Menunggu Pembayaran'
  if (p.status === 'Diproses' || p.status === 'Siap Diambil' || p.status === 'Dalam Pengantaran' || p.status === 'Selesai') {
    paymentStatus = 'Lunas'
  } else if (p.status === 'Dibatalkan') {
    paymentStatus = 'Dibatalkan'
  }

  // Bangun timeline untuk komponen OrderTimeline.vue
  const statusStepMap = {
    'Menunggu': 0,
    'Diproses': 1,
    'Siap Diambil': 2,
    'Dalam Pengantaran': 2,
    'Selesai': 3,
    'Dibatalkan': -1,
  }
  const currentStep = statusStepMap[p.status] ?? 0

  const timelineSteps = [
    {
      step: 'Pesanan Dibuat',
      time: formatTime(p.created_at || p.createdAt),
      status: currentStep >= 0 ? 'completed' : 'pending',
    },
    {
      step: 'Diproses Supplier',
      time: currentStep >= 1 ? formatTime(p.updated_at || p.updatedAt) : null,
      status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'active' : 'pending',
    },
    {
      step: p.delivery_method === 'courier' ? 'Dalam Pengantaran' : 'Siap Diambil',
      time: currentStep >= 2 ? formatTime(p.updated_at || p.updatedAt) : null,
      status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'active' : 'pending',
    },
    {
      step: 'Selesai',
      time: currentStep === 3 ? formatTime(p.updated_at || p.updatedAt) : null,
      status: currentStep === 3 ? 'completed' : 'pending',
    },
  ]

  if (p.status === 'Dibatalkan') {
    timelineSteps.push({
      step: 'Pesanan Dibatalkan',
      time: formatTime(p.updated_at || p.updatedAt),
      status: 'error',
    })
  }

  return {
    ...p,
    id: p.id,
    orderNumber: p.order_number || p.orderNumber || `ORD-${p.id}`,
    status: p.status || 'Menunggu',
    total: Number(p.total || 0),
    deliveryMethod: p.delivery_method || p.deliveryMethod || 'pickup',
    deliveryAddress: p.delivery_address || p.deliveryAddress || '',
    deliveryFee: Number(p.delivery_fee || p.deliveryFee || 0),
    specialNote: p.special_note || p.specialNote || '',
    paymentStatus: p.paymentStatus || paymentStatus,
    paymentUrl: p.payment_url || p.paymentUrl || null,
    snapToken: p.snap_token || p.snapToken || null,
    supplierId: p.supplier_id || p.supplierId || p.supplier?.id,
    supplierName: p.supplier?.outlet || p.supplier?.name || p.supplierName || 'Supplier',
    supplierPhone: p.supplier?.phone || '',
    consumerId: p.consumer_id || p.consumerId || p.consumer?.id,
    consumerName: p.consumer?.name || p.consumerName || '',
    consumerPhone: p.consumer?.phone || '',
    createdAt: p.created_at || p.createdAt || new Date().toISOString(),
    updatedAt: p.updated_at || p.updatedAt || new Date().toISOString(),
    items: details,
    foodName: firstItem.food_name || firstItem.name || p.foodName || 'Pesanan Makanan',
    foodImage: firstItem.food_image || firstItem.image || p.foodImage || '',
    quantity: totalQty,
    timeline: timelineSteps,
    review: p.review_comment ? { rating: p.rating, comment: p.review_comment, createdAt: p.reviewed_at } : p.review || null,
  }
}

export const orderService = {
  /**
   * Membuat transaksi / purchase baru ke Backend API, lalu langsung
   * request Snap Token Midtrans melalui POST /purchase/:id/pay.
   * Backend menggunakan 2 langkah terpisah:
   *   Step 1: POST /purchase        → simpan order ke DB (belum ada snap token)
   *   Step 2: POST /purchase/:id/pay → generate Snap Token ke Midtrans
   */
  async create(orderPayload) {
    // Step 1: Buat order di database
    let orderData
    try {
      const res = await api.post('/purchase', orderPayload)
      orderData = res.data?.data || res.data
      if (!orderData?.id) throw new Error('Response tidak mengandung ID pesanan')
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Gagal membuat pesanan'
      throw new Error(errorMsg)
    }

    // Step 2: Generate Snap Token Midtrans melalui endpoint /pay
    try {
      const payRes = await api.post(`/purchase/${orderData.id}/pay`)
      const payData = payRes.data?.data || payRes.data
      // Gabungkan: data order + snap_token & payment_url dari step 2
      return mapPurchase({
        ...orderData,
        snap_token: payData?.snap_token || payData?.token,
        payment_url: payData?.payment_url || payData?.redirect_url || orderData.payment_url,
      })
    } catch (err) {
      // Jika step 2 gagal (misalnya Midtrans error), tetap kembalikan order
      // agar user bisa mencoba bayar ulang dari halaman pesanan
      console.warn('Gagal generate Snap Token:', err.response?.data?.message || err.message)
      return mapPurchase(orderData)
    }
  },

  /**
   * Mengambil semua pesanan (sesuai peran login) dari backend API
   */
  async getAll(params = {}) {
    try {
      const res = await api.get('/purchase', { params })
      const rawList = res.data?.data?.data || res.data?.data || res.data || []
      return (Array.isArray(rawList) ? rawList : []).map(mapPurchase)
    } catch (err) {
      console.warn('Gagal memuat pesanan dari backend API:', err)
      return []
    }
  },

  /**
   * Mengambil detail pesanan berdasarkan ID
   */
  async getById(id) {
    try {
      const res = await api.get(`/purchase/${id}`)
      const raw = res.data?.data || res.data
      if (!raw) throw new Error('Pesanan tidak ditemukan')
      return mapPurchase(raw)
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Pesanan tidak ditemukan'
      throw new Error(errorMsg)
    }
  },

  /**
   * Cek status transaksi langsung dari Midtrans & sinkronisasikan status DB
   */
  async checkStatus(id) {
    try {
      const res = await api.get(`/purchase/${id}/status`)
      const raw = res.data?.data?.order || res.data?.data || res.data
      return mapPurchase(raw)
    } catch (err) {
      console.warn('Gagal memeriksa status Midtrans:', err)
      return null
    }
  },

  /**
   * Memperbarui status pesanan (misal oleh supplier: 'Diproses', 'Siap Diambil', dsb)
   */
  async updateStatus(id, newStatus) {
    try {
      const res = await api.put(`/purchase/${id}`, { status: newStatus })
      const raw = res.data?.data || res.data
      return mapPurchase(raw)
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Gagal memperbarui status pesanan'
      throw new Error(errorMsg)
    }
  },

  /**
   * Mengambil pesanan untuk consumer (kompatibilitas query)
   */
  async getByConsumerId(consumerId, user = null) {
    return this.getAll({ consumer_id: consumerId })
  },

  /**
   * Mengambil pesanan untuk supplier (kompatibilitas query)
   */
  async getBySupplierId(supplierId, user = null) {
    return this.getAll({ supplier_id: supplierId })
  },

  async addReview(orderId, review) {
    try {
      const res = await api.put(`/purchase/${orderId}`, {
        rating: review.rating,
        review_comment: review.comment,
        reviewed_at: new Date().toISOString(),
      })
      return res.data?.data || review
    } catch (err) {
      console.warn('Gagal menyimpan ulasan ke backend:', err)
      return review
    }
  },
}
