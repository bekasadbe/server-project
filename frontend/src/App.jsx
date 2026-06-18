import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import LiveEvents from './pages/LiveEvents'
import Employees from './pages/Employees'
import Settings from './pages/Settings'
import History from './pages/History'
import Reports from './pages/Reports'
import AdminPanel from './pages/AdminPanel'
import Login from './pages/Login'
import { getUser, logout } from './auth'

import { apiFetch } from './config'


export default function App() {
  const [user, setUser]           = useState(getUser)
  const [page, setPage]           = useState('dashboard')
  const [employees, setEmployees] = useState([])
  const [groups, setGroups]       = useState([])

  useEffect(() => { if (user) { loadData(); setPage('dashboard') } }, [user])

  const loadData = async () => {
    try {
      const data = await apiFetch('/employees')
      setEmployees((data.employees || []).map(e => ({ ...e, group: e.group_id })))
      const merged = (data.groups || []).map(g => ({
        ...g,
        login:      g.login      || g.id,
        password:   g.password   || '',
        work_start: g.work_start || '09:00',
        work_begin: g.work_begin || '06:00',
      }))
      setGroups(merged)
    } catch {}
  }

  if (!user) return <Login onLogin={u => setUser(u)} />

  const handleLogout = () => { logout(); setUser(null) }

  const userGroup      = user.role === 'kadrlar' ? user.groupId : null
  const linkedGroupIds = user.linkedGroupIds || []
  const visibleGroupIds = userGroup ? [userGroup, ...linkedGroupIds] : null
  const visibleEmps = visibleGroupIds ? employees.filter(e => visibleGroupIds.includes(e.group_id)) : employees
  const visibleGrps = visibleGroupIds ? groups.filter(g => visibleGroupIds.includes(g.id)) : groups

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

  const deleteEmployees = async (ids) => {
    await Promise.all(ids.map(id => apiFetch(`/employees/${id}`, { method: 'DELETE' })))
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

  const addGroup = async (grp) => {
    await apiFetch('/groups', {
      method: 'POST',
      body: JSON.stringify({
        id: grp.id, name: grp.name,
        login: grp.login || '', password: grp.password || '',
        work_start: grp.work_start || '09:00', work_begin: grp.work_begin || '06:00',
      }),
    })
    loadData()
  }

  const deleteGroup = async (id) => {
    await apiFetch(`/groups/${id}`, { method: 'DELETE' })
    loadData()
  }

  const updateGroup = async (id, changes) => {
    await apiFetch(`/groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        login: changes.login, password: changes.password,
        work_start: changes.work_start, work_begin: changes.work_begin,
        linked_groups: changes.linked_groups || [],
      }),
    })
    loadData()
  }

  const pages = {
    dashboard: <Dashboard  employees={visibleEmps} groups={visibleGrps} />,
    ...(user.role === 'admin' ? { live: <LiveEvents groups={groups} /> } : {}),
    history:   <History    groups={visibleGrps} />,
    employees: <Employees  employees={visibleEmps} groups={visibleGrps} onUpdateEmployee={updateEmployee} onDeleteEmployee={deleteEmployee} />,
    reports:   <Reports    groups={visibleGrps} />,
    ...(user.role === 'kadrlar' ? {
      settings: <Settings group={visibleGrps[0]} onUpdateGroup={updateGroup} />
    } : {}),
    ...(user.role === 'admin' ? {
      admin: <AdminPanel
        employees={employees} groups={groups}
        onAddEmployee={addEmployee}
        onDeleteEmployee={deleteEmployee}
        onDeleteEmployees={deleteEmployees}
        onUpdateEmployee={updateEmployee}
        onAddGroup={addGroup}
        onDeleteGroup={deleteGroup}
        onMoveEmployee={moveEmployee}
        onUpdateGroup={updateGroup}
      />
    } : {})
  }

  return (
    <div style={{ display:'flex', height:'100vh', background:'#f8fafc', color:'#0f172a', overflow:'hidden' }}>
      <Sidebar current={page} onChange={setPage} user={user} onLogout={handleLogout} />
      <main style={{ flex:1, overflowY:'auto', padding:'28px 32px', background:'#f8fafc' }}>
        {pages[page] ?? pages['dashboard']}
      </main>
    </div>
  )
}
