export const API_URL = import.meta.env.VITE_API_URL || 'https://davomatlar.uz'
export const TOKEN   = 'Dav0mat@API#2026!'

export async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...opts,
    headers: {
      'X-API-Token': TOKEN,
      'Content-Type': 'application/json',
      ...opts.headers,
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `So'rov xato qaytardi (${res.status})`)
  return data
}
