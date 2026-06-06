import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import History from './pages/History'
import Reports from './pages/Reports'
import AdminPanel from './pages/AdminPanel'
import Login from './pages/Login'
import { getUser, logout } from './auth'
import { initialEmployees, initialGroups } from './store'

// localStorage dan o'qish, bo'lmasa initial dan
function loadLS(key, fallback) {
  try {
    const s = localStorage.getItem(key)
    return s ? JSON.parse(s) : fallback
  } catch { return fallback }
}
function saveLS(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}

export default function App() {
  const [user, setUser]           = useState(getUser)
  const [page, setPage]           = useState('dashboard')
  const [employees, setEmployees] = useState(() => loadLS('employees', initialEmployees))
  const [groups, setGroups]       = useState(() => loadLS('groups', initialGroups))

  if (!user) return <Login onLogin={u => setUser(u)} />

  const handleLogout = () => { logout(); setUser(null) }

  // Kadrlar uchun faqat o'z guruhini ko'rsatish
  const userGroup   = user.role === 'kadrlar' ? user.groupId : null
  const visibleEmps = userGroup ? employees.filter(e => e.group === userGroup) : employees
  const visibleGrps = userGroup ? groups.filter(g => g.id === userGroup) : groups

  const updateEmployees = (fn) => {
    setEmployees(prev => { const next = fn(prev); saveLS('employees', next); return next })
  }
  const updateGroups = (fn) => {
    setGroups(prev => { const next = fn(prev); saveLS('groups', next); return next })
  }

  const addEmployee    = (emp)          => updateEmployees(prev => [...prev, emp])
  const deleteEmployee = (id)           => updateEmployees(prev => prev.filter(e => e.id !== id))
  const moveEmployee   = (id, group)    => updateEmployees(prev => prev.map(e => e.id===id ? {...e, group} : e))
  const updateEmployee = (id, changes)  => updateEmployees(prev => prev.map(e => e.id===id ? {...e, ...changes} : e))
  const addGroup       = (g)         => updateGroups(prev => [...prev, g])
  const deleteGroup    = (id)        => {
    updateGroups(prev => prev.filter(g => g.id !== id))
    updateEmployees(prev => prev.filter(e => e.group !== id))
  }

  const pages = {
    dashboard: <Dashboard employees={visibleEmps} groups={visibleGrps} />,
    history:   <History   employees={visibleEmps} groups={visibleGrps} />,
    employees: <Employees employees={visibleEmps} groups={visibleGrps} />,
    reports:   <Reports   employees={visibleEmps} groups={visibleGrps} />,
    ...(user.role === 'admin' ? {
      admin: <AdminPanel
        employees={employees} groups={groups}
        onAddEmployee={addEmployee} onDeleteEmployee={deleteEmployee} onUpdateEmployee={updateEmployee}
        onAddGroup={addGroup} onDeleteGroup={deleteGroup}
        onMoveEmployee={moveEmployee}
        onUpdateGroup={(id, data) => updateGroups(prev => prev.map(g => g.id===id ? {...g,...data} : g))}
      />
    } : {})
  }

  return (
    <div style={{display:'flex', height:'100vh', background:'#0f1117', color:'white', overflow:'hidden', margin:0, padding:0, maxWidth:'100%', border:'none', textAlign:'left'}}>
      <Sidebar current={page} onChange={setPage} user={user} onLogout={handleLogout} />
      <main style={{flex:1, overflowY:'auto', padding:'24px', background:'#0f1117'}}>
        {pages[page]}
      </main>
    </div>
  )
}
