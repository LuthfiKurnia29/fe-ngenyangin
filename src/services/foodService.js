import api from './api'

const BASE = '/products'

const unwrap = (res) => res.data?.data ?? res.data

/**
 * Normalisasi URL gambar dari backend
 * Mengubah path relatif backend (seperti /uploads/...) menjadi URL lengkap.
 */
export function resolveImageUrl(url) {
  if (!url || typeof url !== 'string') return ''
  const trimmed = url.trim()
  if (!trimmed) return ''
  if (/^(https?:|data:|blob:|\/\/)/i.test(trimmed)) {
    return trimmed
  }
  const apiBase = import.meta.env.VITE_API_URL || ''
  try {
    const origin = new URL(apiBase).origin
    return `${origin}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`
  } catch {
    return trimmed
  }
}

// Samakan nama kolom BE (snake_case) dengan field yang dipakai komponen FE (camelCase)
export const mapFood = (f) => {
  if (!f) return null

  const originalPrice = Number(f.original_price ?? f.originalPrice ?? 0)
  const discountPrice = Number(f.discount_price ?? f.discountPrice ?? originalPrice)
  let discount = Number(f.discount ?? 0)
  if (!discount && originalPrice > discountPrice && originalPrice > 0) {
    discount = Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
  }

  const rawImage = f.image_url ?? f.image ?? ''
  const image = resolveImageUrl(rawImage)

  return {
    ...f,
    id: f.id,
    name: f.name || 'Makanan Tanpa Nama',
    supplierId: f.supplier_id ?? f.supplierId,
    // data toko diutamakan dari profil supplier (join users), fallback ke kolom di products
    supplierName: f.supplier?.outlet || f.supplier?.name || f.supplier_name || f.supplierName || 'Supplier',
    outlet: f.supplier?.address || f.outlet || f.address || '',
    address: f.supplier?.address || f.address || '',
    supplierPhone: f.supplier?.phone ?? '',
    categoryId: f.category_id ?? f.categoryId ?? f.category_detail?.id ?? null,
    categoryDetail: f.category_detail ?? null,
    category: f.category_detail?.name || f.category?.name || f.category_name || f.category || 'Semua',
    image,
    originalPrice,
    discountPrice,
    discount,
    stock: Number(f.stock ?? 0),
    pickupDeadline: f.pickup_deadline ?? f.pickupDeadline ?? f.pickup_time ?? '21:00',
    safetyApproved: f.safety_approved ?? f.safetyApproved ?? false,
    isActive: f.is_active ?? f.isActive ?? true,
    description: f.description || '',
    tags: Array.isArray(f.tags) ? f.tags : [],
  }
}

export const foodService = {
  /**
   * Mengambil data produk dengan paginasi dan filter dari backend API
   */
  async getPaginated(params = {}) {
    const res = await api.get(BASE, { params })
    const data = unwrap(res)

    if (data && Array.isArray(data.items)) {
      const items = data.items.map(mapFood)
      const total = Number(data.total ?? items.length)
      const pageSize = Number(params.pageSize || params.limit || 24)
      const totalPages = Number(data.totalPages ?? data.total_pages ?? Math.max(1, Math.ceil(total / pageSize)))
      const page = Number(data.page ?? params.page ?? 1)
      return { items, total, page, totalPages }
    }

    const list = Array.isArray(data) ? data : (Array.isArray(data?.products) ? data.products : [])
    const items = list.map(mapFood)
    return {
      items,
      total: items.length,
      page: 1,
      totalPages: 1,
    }
  },

  /**
   * Mengambil semua produk (mendukung operasi array dan meta paginasi)
   */
  async getAll(params = {}) {
    const result = await this.getPaginated(params)
    const items = result.items
    items.total = result.total
    items.page = result.page
    items.totalPages = result.totalPages
    items.items = items
    return items
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
