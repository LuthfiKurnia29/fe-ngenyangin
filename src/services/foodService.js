import foodsData from '@/data/foods.json'

const delay = (ms = 150) => new Promise(resolve => setTimeout(resolve, ms))

export const foodService = {
  async getAll() {
    await delay()
    return [...foodsData]
  },

  async getById(id) {
    await delay()
    const food = foodsData.find(f => f.id === id)
    if (!food) throw new Error('Makanan tidak ditemukan')
    return { ...food }
  },

  async getByCategory(category) {
    await delay()
    if (!category || category === 'Semua') return [...foodsData]
    return foodsData.filter(f => f.category === category)
  },

  async getBySupplierId(supplierId) {
    await delay()
    return foodsData.filter(f => f.supplierId === supplierId)
  },

  async search(query) {
    await delay()
    const q = query.toLowerCase()
    return foodsData.filter(f =>
      f.name.toLowerCase().includes(q) ||
      f.supplierName.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q) ||
      f.outlet.toLowerCase().includes(q)
    )
  },

  async getCategories() {
    await delay(50)
    return ['Semua', 'Makanan Berat', 'Jajanan', 'Roti & Kue', 'Minuman', 'Sayur & Buah']
  },

  // Simulate creating a food listing (supplier)
  async create(data) {
    await delay(300)
    const newFood = {
      id: 'f' + Date.now(),
      ...data,
      safetyApproved: true,
      isActive: true,
      createdAt: new Date().toISOString()
    }
    // In real app, would POST to API
    return newFood
  },

  async update(id, data) {
    await delay(300)
    return { id, ...data }
  }
}
