/**
 * foodServiceLocal.js — Client-side paginated food service using local 10K mock data.
 * Used by BrowsePage and SupplierStorePage for the large local dataset.
 * The supplier-facing CRUD operations still use foodService.js (backend).
 */

// Lazy-load to avoid blocking initial bundle
let _foods = null
let _suppliers = null

async function loadFoods() {
  if (_foods) return _foods
  const mod = await import('@/data/foodsLarge.json')
  _foods = mod.default
  return _foods
}

async function loadSuppliers() {
  if (_suppliers) return _suppliers
  const mod = await import('@/data/suppliers.json')
  _suppliers = mod.default
  return _suppliers
}

/**
 * Get paginated + filtered foods from local data.
 * @param {Object} opts
 * @param {number}  opts.page        - 1-based page number (default 1)
 * @param {number}  opts.pageSize    - items per page (default 24)
 * @param {string}  opts.category    - category name or 'all' / '' for all
 * @param {string}  opts.search      - substring search on name / supplierName
 * @param {string}  opts.supplierId  - filter by supplierId (for SupplierStorePage)
 * @param {boolean} opts.discountOnly - only items with discount > 0
 * @param {number}  opts.minDiscount - minimum discount percentage
 * @param {number}  opts.pickupWithinHours - only items whose pickup deadline is within this many hours
 * @param {string}  opts.locationQuery - substring search on outlet, address, or supplier name
 * @param {number}  opts.minPrice    - min discountPrice
 * @param {number}  opts.maxPrice    - max discountPrice
 * @returns {{ items: Array, total: number, page: number, totalPages: number }}
 */
export async function getLocalFoods({
  page = 1,
  pageSize = 24,
  category = '',
  search = '',
  supplierId = null,
  discountOnly = false,
  minDiscount = 0,
  pickupWithinHours = null,
  locationQuery = '',
  minPrice = 0,
  maxPrice = Infinity,
} = {}) {
  const all = await loadFoods()

  let result = all.filter(f => f.isActive !== false)

  // Category filter
  if (category && category !== 'all' && category !== 'Semua') {
    result = result.filter(f => f.category === category)
  }

  // Supplier filter
  if (supplierId) {
    result = result.filter(f => String(f.supplierId) === String(supplierId))
  }

  // Search filter (name + supplierName)
  if (search && search.trim()) {
    const q = search.trim().toLowerCase()
    result = result.filter(f =>
      f.name.toLowerCase().includes(q) ||
      (f.supplierName || '').toLowerCase().includes(q)
    )
  }

  // Discount filter
  if (discountOnly) {
    result = result.filter(f => (f.discount || 0) > 0)
  }

  if (minDiscount > 0) {
    result = result.filter(f => {
      const discount = Number(f.discount) || (
        Number(f.originalPrice) > 0
          ? Math.floor((Number(f.originalPrice) - Number(f.discountPrice)) / Number(f.originalPrice) * 100)
          : 0
      )
      return discount >= minDiscount
    })
  }

  if (pickupWithinHours !== null && pickupWithinHours !== undefined) {
    const now = new Date()
    result = result.filter(f => {
      if (!/^\d{1,2}:\d{2}$/.test(f.pickupDeadline || '')) return false
      const [hours, minutes] = f.pickupDeadline.split(':').map(Number)
      if (hours > 23 || minutes > 59) return false

      const deadline = new Date(now)
      deadline.setHours(hours, minutes, 0, 0)
      const remainingHours = (deadline.getTime() - now.getTime()) / (60 * 60 * 1000)
      return remainingHours >= 0 && remainingHours <= Number(pickupWithinHours)
    })
  }

  if (locationQuery && locationQuery.trim()) {
    const query = locationQuery.trim().toLowerCase()
    result = result.filter(f =>
      [f.outlet, f.address, f.supplierName]
        .some(value => String(value || '').toLowerCase().includes(query))
    )
  }

  // Price range filter
  if (minPrice > 0 || maxPrice < Infinity) {
    result = result.filter(f => {
      const p = f.discountPrice || f.originalPrice || 0
      return p >= minPrice && p <= maxPrice
    })
  }

  const total = result.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * pageSize
  const items = result.slice(start, start + pageSize)

  return { items, total, page: safePage, totalPages }
}

/**
 * Get a supplier's info by supplierId from local suppliers data.
 */
export async function getLocalSupplier(supplierId) {
  const suppliers = await loadSuppliers()
  return suppliers.find(s => String(s.id) === String(supplierId)) || null
}

/**
 * Get all 20 local categories
 */
export const LOCAL_CATEGORIES = [
  'Makanan Berat', 'Makanan Ringan', 'Roti & Kue', 'Dessert',
  'Minuman Dingin', 'Minuman Panas', 'Kopi & Teh', 'Jus & Smoothie',
  'Seafood', 'Ayam & Daging', 'Sayur & Salad', 'Mie & Pasta',
  'Nasi & Lauk', 'Jajanan Tradisional', 'Japanese', 'Korean',
  'Western', 'Vegetarian/Vegan', 'Frozen Food', 'Paket Hemat',
]
