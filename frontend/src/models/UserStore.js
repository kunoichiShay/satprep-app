/**
 * UserStore — manages user accounts via the FastAPI backend.
 *
 * After a successful login/register the user profile (without password) is
 * cached in localStorage under SESSION_KEY so getCurrentUser() is synchronous
 * and the app can boot without an extra network request.
 *
 * Game progress (XP, streaks, learned words) continues to be stored in
 * localStorage keyed by userId.
 */

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
  /** Return the cached user profile for the current session, or null. */
  getCurrentUser () {
    return readSession()
  },

  /**
   * Register a new account via the backend.
   * Returns { ok: true, user } or { ok: false, error: string }.
   */
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

  /**
   * Log in with email + password via the backend.
   * Returns { ok: true, user } or { ok: false, error: string }.
   */
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

  /** Clear the current session (does not delete the account). */
  logout () {
    localStorage.removeItem(SESSION_KEY)
  },
}
