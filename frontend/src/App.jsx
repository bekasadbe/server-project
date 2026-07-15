import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import LiveEvents from './pages/LiveEvents'
import Employees from './pages/Employees'
import Settings from './pages/Settings'
import History from './pages/History'
import Reports from './pages/Reports'
import AdminPanel from './pages/AdminPanel'
import Accounts from './pages/Accounts'
import Jadvallar from './pages/Jadvallar'
import Leaves from './pages/Leaves'
import WorkSchedule from './pages/WorkSchedule'
import Login from './pages/Login'
import { getUser, logout } from './auth'

import { apiFetch } from './config'

function SplashScreen() {
  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a56db 0%, #1e429f 100%)',
      zIndex: 9999,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 36 }}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="24" fill="rgba(255,255,255,0.15)"/>
          <path d="M13 25L20 32L35 17" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div>
          <div style={{ color: 'white', fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1.1 }}>Davomatlar.uz</div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 }}>Boshqaruv tizimi</div>
        </div>
      </div>

      {/* Animated dots */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%',
            background: 'rgba(255,255,255,0.7)',
            animation: `splashDot 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}/>
        ))}
      </div>

      <style>{`
        @keyframes splashDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default function App() {
  const [user, setUser]           = useState(getUser)
  const [page, setPage]           = useState('dashboard')
  const [employees, setEmployees]       = useState([])
  const [groups, setGroups]             = useState([])
  const [accounts, setAccounts]         = useState([])
  const [settingsDirty, setSettingsDirty] = useState(false)
  const [sidebarOpen, setSidebarOpen]     = useState(false)
  const [splashing, setSplashing]         = useState(false)
  const [tgNotLinked, setTgNotLinked]     = useState(false)

  useEffect(() => { if (user) { loadData(); setPage('dashboard') } }, [user])

  const loadData = async () => {
    try {
      const data = await apiFetch('/employees')
      setEmployees((data.employees || []).map(e => ({ ...e, group: e.group_id })))
      setGroups((data.groups || []).map(g => ({
        ...g,
        work_start: g.work_start || '09:00',
        work_begin: g.work_begin || '06:00',
      })))
      setAccounts(data.accounts || [])
    } catch {}
  }

  if (splashing) return <SplashScreen />

  if (tgNotLinked) return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '2rem',
      background: 'linear-gradient(135deg, #1a56db 0%, #1e429f 100%)',
    }}>
      <div style={{ fontSize: 56, marginBottom: 24 }}>🔒</div>
      <div style={{ color: 'white', fontSize: 20, fontWeight: 700, marginBottom: 12, textAlign: 'center' }}>
        Kirish huquqi yo'q
      </div>
      <div style={{
        background: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: '20px 28px',
        color: 'rgba(255,255,255,0.9)', fontSize: 15, textAlign: 'center', lineHeight: 1.6,
        maxWidth: 320,
      }}>
        Sizning Telegram akkauntingiz hali tizimga biriktirilmagan.<br/><br/>
        Iltimos, admin bilan bog'laning.
      </div>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 32 }}>
        @davomatlaruzbot
      </div>
    </div>
  )

  if (!user) {
    const tgId = new URLSearchParams(window.location.search).get('tg_id')
      || window.Telegram?.WebApp?.initDataUnsafe?.user?.id
    if (tgId) {
      fetch(`/api/auth/telegram?tg_id=${tgId}`)
        .then(r => r.json())
        .then(data => {
          if (data.ok && data.user) {
            localStorage.setItem('user', JSON.stringify(data.user))
            setSplashing(true)
            setTimeout(() => { setUser(data.user); setSplashing(false) }, 1200)
          } else {
            setTgNotLinked(true)
          }
        })
        .catch(() => { setTgNotLinked(true) })
      return <SplashScreen />
    }
    return <Login onLogin={u => {
      setSplashing(true)
      setTimeout(() => { setUser(u); setSplashing(false) }, 1800)
    }} />
  }

  const handleLogout = () => { logout(); setUser(null) }

  const linkedGroupIds  = user.linkedGroupIds || []
  const isViewer        = user.role === 'kuzatuvchi'
  const isKadrlar       = user.role === 'kadrlar' || user.role === 'kuzatuvchi'
  const visibleGroupIds = isKadrlar ? linkedGroupIds : null
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
        work_finish: changes.work_finish, work_days: changes.work_days,
        grace_minutes: changes.grace_minutes ?? 0,
        linked_groups: changes.linked_groups || [],
      }),
    })
    loadData()
  }

  const pages = {
    dashboard: <Dashboard  employees={visibleEmps} groups={visibleGrps} />,
    ...(user.role === 'admin' ? { live: <LiveEvents groups={groups} /> } : {}),
    history:   <History    groups={visibleGrps} />,
    schedule:  <Jadvallar  groups={visibleGrps} employees={visibleEmps} />,
    employees: <Employees  employees={visibleEmps} groups={visibleGrps} onUpdateEmployee={isViewer ? null : updateEmployee} onDeleteEmployee={isViewer ? null : deleteEmployee} readonly={isViewer} />,
    reports:   <Reports    groups={visibleGrps} />,
    ...(!isViewer ? {
      workSchedule: <WorkSchedule employees={visibleEmps} groups={visibleGrps} onReload={loadData} />
    } : {}),
    ...(!isViewer && user.role !== 'admin' ? {
      settings: <Settings group={visibleGrps[0]} onUpdateGroup={updateGroup} onDirtyChange={setSettingsDirty} />,
      leaves: <Leaves employees={visibleEmps} groups={visibleGrps} />
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
      />,
      accounts: <Accounts
        groups={groups}
        accounts={accounts}
        onReload={loadData}
      />,
    } : {})
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-30 md:hidden" onClick={() => setSidebarOpen(false)}/>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 transition-transform duration-300 md:relative md:translate-x-0 md:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar current={page} onChange={(p) => {
          if (page === 'settings' && settingsDirty) {
            if (!window.confirm("Saqlanmagan o'zgarishlar bor. Chiqib ketasizmi?")) return
          }
          setSettingsDirty(false)
          setPage(p)
          setSidebarOpen(false)
        }} user={user} onLogout={handleLogout} />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-100 md:hidden">
          <button onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 cursor-pointer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <span className="text-[15px] font-bold text-brand-600">Davomatlar.uz</span>
        </div>
        <main className="flex-1 overflow-y-auto px-4 py-5 md:px-8 md:py-7 bg-slate-50">
          {pages[page] ?? pages['dashboard']}
        </main>
      </div>
    </div>
  )
}
