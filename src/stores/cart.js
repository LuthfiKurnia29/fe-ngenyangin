import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref(JSON.parse(localStorage.getItem('ngenyangin_cart') || '[]'))

  function persist() {
    localStorage.setItem('ngenyangin_cart', JSON.stringify(items.value))
  }

  const itemCount = computed(() => items.value.reduce((sum, i) => sum + i.quantity, 0))
  const subtotal = computed(() => items.value.reduce((sum, i) => sum + i.discountPrice * i.quantity, 0))

  const currentSupplierId = computed(() => items.value[0]?.supplierId ?? null)
  const currentSupplierName = computed(() => items.value[0]?.supplierName ?? '')

  function addItem(food, quantity = 1, force = false) {
    // Validasi pembatasan 1 supplier per checkout
    if (items.value.length > 0 && currentSupplierId.value && food.supplierId) {
      if (String(currentSupplierId.value) !== String(food.supplierId)) {
        if (!force) {
          return {
            conflict: true,
            currentSupplierName: currentSupplierName.value || 'toko lain',
            newSupplierName: food.supplierName || 'toko baru',
          }
        }
        // Jika force = true, kosongkan keranjang dari toko sebelumnya
        items.value = []
      }
    }

    const existing = items.value.find(i => String(i.foodId) === String(food.id))
    if (existing) {
      existing.quantity += quantity
    } else {
      items.value.push({
        foodId: food.id,
        name: food.name,
        supplierName: food.supplierName,
        supplierId: food.supplierId,
        outlet: food.outlet,
        image: food.image,
        discountPrice: food.discountPrice,
        originalPrice: food.originalPrice,
        quantity,
        safetyApproved: food.safetyApproved,
        pickupDeadline: food.pickupDeadline
      })
    }
    persist()
    return { success: true }
  }

  function removeItem(foodId) {
    const idx = items.value.findIndex(i => String(i.foodId) === String(foodId))
    if (idx !== -1) items.value.splice(idx, 1)
    persist()
  }

  function updateQuantity(foodId, quantity) {
    const item = items.value.find(i => String(i.foodId) === String(foodId))
    if (item) {
      if (quantity <= 0) removeItem(foodId)
      else item.quantity = quantity
    }
    persist()
  }

  function clear() {
    items.value = []
    persist()
  }

  return {
    items,
    itemCount,
    subtotal,
    currentSupplierId,
    currentSupplierName,
    addItem,
    removeItem,
    updateQuantity,
    clear,
  }
})
