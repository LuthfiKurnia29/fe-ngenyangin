import api from './api'

const BASE = '/products'

const unwrap = (res) => res.data?.data ?? res.data

// Samakan nama field BE dengan yang dipakai komponen FE
const mapFood = (f) => ({
  ...f,
  price: f.price ?? f.harga ?? 0,
  image: f.image ?? f.image_url ?? '',
  // field yang dipakai FoodCard tapi belum ada di tabel BE
  supplierName: f.supplierName ?? 'Supplier',
  outlet: f.outlet ?? '-',
  pickupDeadline: f.pickupDeadline ?? '-',
  originalPrice: f.originalPrice ?? f.price ?? f.harga ?? 0,
  discountPrice: f.discountPrice ?? f.price ?? f.harga ?? 0,
  discount: f.discount ?? 0,
  isActive: f.is_empty === undefined ? true : !f.is_empty,
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
    const foods = await this.getAll()
    return foods.filter(f => f.supplierId === supplierId)
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

  async remove(id) {
    await api.delete(`${BASE}/${id}`)
  },
}