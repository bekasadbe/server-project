import { API_URL, TOKEN } from './config'

// API orqali login — bazadan tekshiradi (bcrypt)
export async function loginAsync(username, password) {
  try {
    const res = await fetch(`${API_URL}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Token': TOKEN },
      body: JSON.stringify({ username, password }),
    })
    const data = await res.json()
    if (data.ok) {
      const user = { username, role: data.role, name: data.name, groupId: data.groupId || null, linkedGroupIds: data.linkedGroupIds || [], loginAt: Date.now() }
      localStorage.setItem('user', JSON.stringify(user))
      return { user }
    }
    return { error: data.error || "Login yoki parol noto'g'ri" }
  } catch {
    return { error: "Serverga ulanishda xatolik" }
  }
}

export function logout() {
  localStorage.removeItem('user')
}

export function getUser() {
  const u = localStorage.getItem('user')
  if (!u) return null
  try {
    const user = JSON.parse(u)
    // Session muddati: 12 soat
    if (user.loginAt && Date.now() - user.loginAt > 12 * 60 * 60 * 1000) {
      localStorage.removeItem('user')
      return null
    }
    return user
  } catch {
    return null
  }
}

export function isAdmin() {
  return getUser()?.role === 'admin'
}
