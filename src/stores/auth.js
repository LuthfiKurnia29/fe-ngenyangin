import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userService } from '@/services/userService'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('ngenyangin_user') || 'null'))
  const isLoading = ref(false)
  const error = ref(null)

  const isLoggedIn = computed(() => !!user.value)
  const role = computed(() => user.value?.role || null)
  const userName = computed(() => user.value?.name || '')

  async function login(email, password) {
    isLoading.value = true
    error.value = null
    try {
      const loggedUser = await userService.login(email, password)
      user.value = loggedUser
      localStorage.setItem('ngenyangin_user', JSON.stringify(loggedUser))
      return loggedUser
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function register(data) {
    isLoading.value = true
    error.value = null
    try {
      const newUser = await userService.register(data)
      user.value = newUser
      localStorage.setItem('ngenyangin_user', JSON.stringify(newUser))
      return newUser
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
  await userService.logout()
  user.value = null
  localStorage.removeItem('ngenyangin_user')
  localStorage.removeItem('ngenyangin_token')
}

  return { user, isLoading, error, isLoggedIn, role, userName, login, register, logout }
})
