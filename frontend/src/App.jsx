import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import LiveEvents from './pages/LiveEvents'
import Employees from './pages/Employees'
import History from './pages/History'
import Reports from './pages/Reports'
import AdminPanel from './pages/AdminPanel'
import Login from './pages/Login'
import { getUser, logout } from './auth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const TOKEN   = 'Dav0mat@API#2026!'

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...opts,
    headers: { 'X-API-Token': TOKEN, 'Content-Type': 'application/json', ...opts.headers },
  })
  return res.json()
}

export default function App() {
  const [user, setUser]           = useState(getUser)
  const [page, setPage]           = useState('dashboard')
  const [employees, setEmployees] = useState([])
  const [groups, setGroups]       = useState([])

  useEffect(() => { if (user) loadData() }, [user])

  const loadData = async () => {
    try {
      const data = await apiFetch('/employees')
      setEmployees((data.employees || []).map(e => ({ ...e, group: e.group_id })))
      setGroups(data.groups || [])
    } catch {}
  }

  if (!user) return <Login onLogin={u => setUser(u)} />

  const handleLogout = () => { logout(); setUser(null) }

  const userGroup   = user.role === 'kadrlar' ? user.groupId : null
  const visibleEmps = userGroup ? employees.filter(e => e.group_id === userGroup) : employees
  const visibleGrps = userGroup ? groups.filter(g => g.id === userGroup) : groups

  const addEmployee = async (emp) => {
    await apiFetch('/employees', {
      method: 'POST',
      body: JSON.stringify({ id: emp.id, name: emp.name, group_id: emp.group || emp.group_id, lavozim: emp.lavozim || '' }),
    })
    loadData()
  }

  const deleteEmployee = async (id) => {
    await apiFetch(`/employees/${id}`, { method: 'DELETE' })
    loadData()
  }

  const updateEmployee = async (id, changes) => {
    await apiFetch(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name: changes.name, group_id: changes.group || changes.group_id, lavozim: changes.lavozim || '' }),
    })
    loadData()
  }

  const moveEmployee = async (id, group) => {
    const emp = employees.find(e => e.id === id)
    if (emp) await updateEmployee(id, { ...emp, group_id: group })
  }

  const pages = {
    dashboard: <Dashboard  employees={visibleEmps} groups={visibleGrps} />,
    live:      <LiveEvents groups={visibleGrps} />,
    history:   <History    groups={visibleGrps} />,
    employees: <Employees  employees={visibleEmps} groups={visibleGrps} />,
    reports:   <Reports    groups={visibleGrps} />,
    ...(user.role === 'admin' ? {
      admin: <AdminPanel
        employees={employees} groups={groups}
        onAddEmployee={addEmployee}
        onDeleteEmployee={deleteEmployee}
        onUpdateEmployee={updateEmployee}
        onAddGroup={() => loadData()}
        onDeleteGroup={() => loadData()}
        onMoveEmployee={moveEmployee}
        onUpdateGroup={() => loadData()}
      />
    } : {})
  }

  return (
    <div style={{ display:'flex', height:'100vh', background:'#f8fafc', color:'#0f172a', overflow:'hidden' }}>
      <Sidebar current={page} onChange={setPage} user={user} onLogout={handleLogout} />
      <main style={{ flex:1, overflowY:'auto', padding:'28px 32px', background:'#f8fafc' }}>
        {pages[page]}
      </main>
    </div>
  )
}
