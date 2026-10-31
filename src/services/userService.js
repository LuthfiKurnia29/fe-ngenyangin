import usersData from '@/data/users.json'

const delay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms))

export const userService = {
  async login(email, password) {
    await delay(300)
    const user = usersData.find(u => u.email === email && u.password === password)
    if (!user) throw new Error('Email atau password salah')
    const { password: _, ...safeUser } = user
    return safeUser
  },

  async getById(id) {
    await delay()
    const user = usersData.find(u => u.id === id)
    if (!user) throw new Error('Pengguna tidak ditemukan')
    const { password: _, ...safeUser } = user
    return safeUser
  },

  async register(data) {
    await delay(400)
    // Simulate registration
    const newUser = {
      id: 'u' + Date.now(),
      ...data,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`
    }
    const { password: _, ...safeUser } = newUser
    return safeUser
  }
}
