import api from './api'

const BASE = '/products'

const unwrap = (res) => res.data?.data ?? res.data

// Samakan nama kolom BE (snake_case) dengan field yang dipakai komponen FE (camelCase)
const mapFood = (f) => ({
  ...f,
  supplierId: f.supplier_id ?? f.supplierId,
  // data toko diutamakan dari profil supplier (join users), fallback ke kolom di products
  supplierName: f.supplier?.outlet || f.supplier?.name || f.supplier_name || f.supplierName || 'Supplier',
  outlet: f.supplier?.address || f.outlet || f.address || '',
  address: f.supplier?.address || f.address || '',
  supplierPhone: f.supplier?.phone ?? '',
  image: f.image_url ?? f.image ?? '',
  originalPrice: f.original_price ?? f.originalPrice ?? 0,
  discountPrice: f.discount_price ?? f.discountPrice ?? 0,
  discount: f.discount ?? 0,
  pickupDeadline: f.pickup_deadline ?? f.pickupDeadline ?? '',
  safetyApproved: f.safety_approved ?? f.safetyApproved ?? false,
  isActive: f.is_active ?? f.isActive ?? true,
  tags: f.tags ?? [],
})

export const foodService = {
  async getAll(params = {}) {
    const res = await api.get(BASE, { params })
    const data = unwrap(res)
    return (data.items ?? data).map(mapFood)
  },

  async getById(id) {
    try {
      const res = await api.get(`${BASE}/${id}`)
      return mapFood(unwrap(res))
    } catch (e) {
      if (e.response?.status === 404) throw new Error('Makanan tidak ditemukan')
      throw e
    }
  },

  async getByCategory(category) {
    if (!category || category === 'Semua') return this.getAll()
    return this.getAll({ category })
  },

  async search(query) {
    return this.getAll({ search: query })
  },

  async getBySupplierId(supplierId) {
    return this.getAll({ supplier_id: supplierId })
  },

  async getCategories() {
    return ['Semua', 'Makanan Berat', 'Jajanan', 'Roti & Kue', 'Minuman', 'Sayur & Buah']
  },

  async create(data) {
    const res = await api.post(BASE, data)
    return mapFood(unwrap(res))
  },

  async update(id, data) {
    const res = await api.put(`${BASE}/${id}`, data)
    return mapFood(unwrap(res))
  },

  // Upload gambar ke BE (Supabase Storage). Mengembalikan URL publik.
  async uploadImage(file) {
    const body = new FormData()
    body.append('image', file)
    const res = await api.post(`${BASE}/upload`, body, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return unwrap(res).image_url
  },

  async remove(id) {
    await api.delete(`${BASE}/${id}`)
  },
}