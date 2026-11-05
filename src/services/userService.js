import api from './api'

const unwrap = (res) => res.data?.data ?? res.data

const toError = (e, fallback) => {
  if (e.response?.data?.message) return new Error(e.response.data.message)
  if (e.request && !e.response) return new Error('Tidak bisa terhubung ke server. Pastikan backend berjalan di port 5000.')
  return new Error(e.message || fallback)
}

// Samakan bentuk user dari BE. Foto kosong -> ikon default dirender oleh <UserAvatar>.
const withAvatar = (user) => ({
  ...user,
  role: user.role === 'customer' ? 'consumer' : user.role,
  avatar: user.avatar || '',
  gender: user.gender || '',
  outlet: user.outlet || '',
  description: user.description || '',
})

export const userService = {
  async login(email, password) {
    try {
      const res = await api.post('/auth/login', { email, password })
      const data = unwrap(res)
      // BE mengirim token di data.session.access_token
      const token = data.session?.access_token ?? data.access_token
      if (!token) throw new Error('Login berhasil tetapi token tidak diterima dari server')
      localStorage.setItem('ngenyangin_token', token)
      return withAvatar(data.user)
    } catch (e) {
      throw toError(e, 'Email atau password salah')
    }
  },

  async register(payload) {
    // payload: { name, email, password, role }
    try {
      const res = await api.post('/auth/register', payload)
      return unwrap(res)
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

  // payload: { name, phone, address, gender?, outlet?, description?, avatar? }
  async updateProfile(payload) {
    try {
      const res = await api.put('/auth/profile', payload)
      const data = unwrap(res)
      return withAvatar(data.user ?? data)
    } catch (e) {
      throw toError(e, 'Gagal menyimpan profil')
    }
  },

  // Upload foto profil ke BE (Supabase Storage). Mengembalikan URL publik.
  async uploadAvatar(file) {
    const body = new FormData()
    body.append('image', file)
    try {
      const res = await api.post('/auth/avatar', body, { headers: { 'Content-Type': 'multipart/form-data' } })
      return unwrap(res).avatar_url
    } catch (e) {
      throw toError(e, 'Gagal mengunggah foto profil')
    }
  },

  async logout() {
    try { await api.post('/auth/logout') } catch { /* abaikan */ }
  },
}