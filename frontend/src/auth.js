const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const TOKEN   = 'Dav0mat@API#2026!'

// Statik fallback (faqat oflayn holat uchun)
export const USERS = [
  { username: 'admin',  password: 'Inno@Adm!n2026', role: 'admin',   name: 'Administrator' },
  { username: 'inno',   password: 'Inno@2026#kdr',   role: 'kadrlar', name: 'Inno Texnopark', groupId: 'inno'   },
  { username: 'milliy', password: 'Milliy@2026#kdr',  role: 'kadrlar', name: 'Milliy Offis',   groupId: 'milliy' },
]

// API orqali login (async)
export async function loginAsync(username, password) {
  try {
    const res = await fetch(`${API_URL}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Token': TOKEN },
      body: JSON.stringify({ username, password }),
    })
    const data = await res.json()
    if (data.ok) {
      const user = { username, password, role: data.role, name: data.name, groupId: data.groupId || null }
      localStorage.setItem('user', JSON.stringify(user))
      return user
    }
    return null
  } catch {
    // API ishlamasa — statik foydalanuvchilardan qidirish
    return loginStatic(username, password)
  }
}

function loginStatic(username, password) {
  const user = USERS.find(u => u.username === username && u.password === password)
  if (user) {
    localStorage.setItem('user', JSON.stringify(user))
    return user
  }
  return null
}

// Eski sync login (faqat fallback)
export function login(username, password) {
  return loginStatic(username, password)
}

export function logout() {
  localStorage.removeItem('user')
}

export function getUser() {
  const u = localStorage.getItem('user')
  return u ? JSON.parse(u) : null
}

export function isAdmin() {
  const u = getUser()
  return u?.role === 'admin'
}
