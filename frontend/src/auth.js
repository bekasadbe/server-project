// Foydalanuvchilar (server ulangandan keyin DB ga ko'chiriladi)
export const USERS = [
  { username: 'admin',   password: 'admin123',   role: 'admin',   name: 'Administrator'    },
  { username: 'inno',    password: 'inno123',    role: 'kadrlar', name: 'Inno Texnopark',  groupId: 'inno'   },
  { username: 'milliy',  password: 'milliy123',  role: 'kadrlar', name: 'Milliy Offis',    groupId: 'milliy' },
]

export function login(username, password) {
  // Avval statik userlarda qidirish
  let user = USERS.find(u => u.username === username && u.password === password)

  // Topilmasa — admin tomonidan yaratilgan dinamik tashkilot loginlari
  if (!user) {
    try {
      const groups = JSON.parse(localStorage.getItem('groups') || '[]')
      const grp = groups.find(g => g.login === username && g.password === password)
      if (grp) {
        user = { username: grp.login, password: grp.password, role: 'kadrlar', name: grp.name, groupId: grp.id }
      }
    } catch {}
  }

  if (user) {
    localStorage.setItem('user', JSON.stringify(user))
    return user
  }
  return null
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
