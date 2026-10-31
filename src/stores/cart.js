import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref(JSON.parse(localStorage.getItem('ngenyangin_cart') || '[]'))

  function persist() {
    localStorage.setItem('ngenyangin_cart', JSON.stringify(items.value))
  }

  const itemCount = computed(() => items.value.reduce((sum, i) => sum + i.quantity, 0))
  const subtotal = computed(() => items.value.reduce((sum, i) => sum + i.discountPrice * i.quantity, 0))

  function addItem(food, quantity = 1) {
    const existing = items.value.find(i => i.foodId === food.id)
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
  }

  function removeItem(foodId) {
    const idx = items.value.findIndex(i => i.foodId === foodId)
    if (idx !== -1) items.value.splice(idx, 1)
    persist()
  }

  function updateQuantity(foodId, quantity) {
    const item = items.value.find(i => i.foodId === foodId)
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

  return { items, itemCount, subtotal, addItem, removeItem, updateQuantity, clear }
})
