import api from './api'

const unwrap = (res) => res.data?.data ?? res.data

const toError = (e, fallback) => {
  if (e.response?.data?.message) return new Error(e.response.data.message)
  if (e.request && !e.response) return new Error('Tidak bisa terhubung ke server. Pastikan backend berjalan di port 5000.')
  return new Error(e.message || fallback)
}

// BE hanya menyimpan name/email/role, jadi avatar dibuat di FE
const withAvatar = (user) => ({
  ...user,
  role: user.role === 'customer' ? 'consumer' : user.role,
  avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name || user.email)}`,
})

export const userService = {
  async login(email, password) {
    try {
      const res = await api.post('/auth/login', { email, password })
      const data = unwrap(res)
      // sesuaikan nama field dengan response BE
      localStorage.setItem('ngenyangin_token', data.access_token)
      return withAvatar(data.user)
    } catch (e) {
      throw toError(e, 'Email atau password salah')
    }
  },

  async register(payload) {
    // payload: { name, email, password, role }
    try {
      await api.post('/auth/register', payload)
    } catch (e) {
      throw toError(e, 'Pendaftaran gagal')
    }
    // login otomatis setelah daftar; error-nya dibiarkan apa adanya
    try {
      return await this.login(payload.email, payload.password)
    } catch (e) {
      throw new Error(`Akun terdaftar, tapi masuk otomatis gagal: ${e.message}`)
    }
  },

  // BE belum punya GET /users/:id. Sementara hanya bisa mengambil user yang sedang login.
  async getById(id) {
    try {
      const res = await api.get('/auth/me')
      const data = unwrap(res)
      const me = withAvatar(data.user ?? data)
      if (id && me.id !== id) throw new Error('Pengguna tidak ditemukan')
      return me
    } catch (e) {
      throw e.message ? e : toError(e, 'Pengguna tidak ditemukan')
    }
  },

  // payload: { name, phone, address }
  async updateProfile(payload) {
    try {
      const res = await api.put('/auth/profile', payload)
      const data = unwrap(res)
      return withAvatar(data.user ?? data)
    } catch (e) {
      throw toError(e, 'Gagal menyimpan profil')
    }
  },

  async logout() {
    try { await api.post('/auth/logout') } catch { /* abaikan */ }
  },
}