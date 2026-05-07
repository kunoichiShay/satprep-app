const API         = import.meta.env.VITE_API_URL
const SESSION_KEY = 'satprep_session'

function readSession () {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY))
  } catch {
    return null
  }
}

export const UserStore = {
  getCurrentUser () {
    return readSession()
  },

  async register ({ firstName, lastName, email, password }) {
    try {
      const res  = await fetch(`${API}/auth/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ firstName, lastName, email, password }),
      })
      const data = await res.json()
      if (!res.ok) return { ok: false, error: data.detail ?? 'Registration failed.' }
      localStorage.setItem(SESSION_KEY, JSON.stringify(data))
      return { ok: true, user: data }
    } catch {
      return { ok: false, error: 'Cannot reach the server. Is the backend running?' }
    }
  },

  async login (email, password) {
    try {
      const res  = await fetch(`${API}/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) return { ok: false, error: data.detail ?? 'Login failed.' }
      localStorage.setItem(SESSION_KEY, JSON.stringify(data))
      return { ok: true, user: data }
    } catch {
      return { ok: false, error: 'Cannot reach the server. Is the backend running?' }
    }
  },

  logout () {
    localStorage.removeItem(SESSION_KEY)
  },
}
