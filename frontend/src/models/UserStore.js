/**
 * UserStore — manages multiple user accounts.
 * All data is persisted to localStorage as JSON under two keys:
 *   satprep_users   → array of user profile objects
 *   satprep_session → id of the currently logged-in user
 */

const USERS_KEY   = 'satprep_users'
const SESSION_KEY = 'satprep_session'

function readUsers () {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
  } catch {
    return []
  }
}

function writeUsers (users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export const UserStore = {
  /** Return all registered users. */
  getAllUsers () {
    return readUsers()
  },

  /** Return the currently logged-in user object, or null. */
  getCurrentUser () {
    const userId = localStorage.getItem(SESSION_KEY)
    if (!userId) return null
    return readUsers().find(u => u.id === userId) ?? null
  },

  /**
   * Register a new account.
   * Returns { ok: true, user } on success or { ok: false, error: string }.
   */
  register ({ firstName, lastName, email, password }) {
    const users = readUsers()
    if (users.find(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
      return { ok: false, error: 'An account with that email already exists.' }
    }
    const user = {
      id:        crypto.randomUUID(),
      firstName: firstName.trim(),
      lastName:  lastName.trim(),
      email:     email.trim().toLowerCase(),
      password,
      createdAt: new Date().toISOString(),
    }
    users.push(user)
    writeUsers(users)
    localStorage.setItem(SESSION_KEY, user.id)
    return { ok: true, user }
  },

  /**
   * Log in with email + password.
   * Returns { ok: true, user } on success or { ok: false, error: string }.
   */
  login (email, password) {
    const user = readUsers().find(
      u =>
        u.email.toLowerCase() === email.trim().toLowerCase() &&
        u.password === password
    )
    if (!user) return { ok: false, error: 'Incorrect email or password.' }
    localStorage.setItem(SESSION_KEY, user.id)
    return { ok: true, user }
  },

  /** Clear the current session (does not delete the account). */
  logout () {
    localStorage.removeItem(SESSION_KEY)
  },
}
