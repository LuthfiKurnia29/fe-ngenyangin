import api from './api'

const unwrap = (res) => res.data?.data ?? res.data

const toError = (e, fallback) =>
  new Error(e.response?.data?.message || fallback)

// BE hanya menyimpan name/email/role, jadi avatar dibuat di FE
const withAvatar = (user) => ({
  ...user,
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
    try {
      // payload: { name, email, password, role }
      await api.post('/auth/register', payload)
      // login otomatis setelah daftar
      return await this.login(payload.email, payload.password)
    } catch (e) {
      throw toError(e, 'Pendaftaran gagal')
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

  async logout() {
    try { await api.post('/auth/logout') } catch { /* abaikan */ }
  },
}