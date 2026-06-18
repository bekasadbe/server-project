import { LayoutDashboard, Users, Clock, FileBarChart2, Settings, LogOut, Shield, ChevronRight, Radio, Settings2, Building2, KeyRound, CalendarDays } from 'lucide-react'


const menu = [
  { key: 'dashboard',  label: 'Davomat',       icon: LayoutDashboard, roles: ['admin','kadrlar','kuzatuvchi'] },
  { key: 'live',       label: 'Jonli lenta',   icon: Radio,           roles: ['admin'] },
  { key: 'history',    label: 'Hisobotlar',    icon: Clock,           roles: ['kadrlar','kuzatuvchi'] },
  { key: 'schedule',   label: 'Jadvallar',     icon: CalendarDays,    roles: ['kadrlar','kuzatuvchi'] },
  { key: 'employees',  label: 'Xodimlar',      icon: Users,           roles: ['kadrlar','kuzatuvchi'] },
  { key: 'reports',    label: 'Statistika',    icon: FileBarChart2,   roles: ['kadrlar','kuzatuvchi'] },
  { key: 'settings',   label: 'Sozlamalar',    icon: Settings2,       roles: ['kadrlar'] },
  { key: 'admin',      label: 'Tashkilotlar',  icon: Building2,       roles: ['admin'] },
  { key: 'accounts',   label: 'Akkauntlar',    icon: KeyRound,        roles: ['admin'] },
]

export default function Sidebar({ current, onChange, user, onLogout }) {
  const isViewer   = user?.role === 'kuzatuvchi'
  const roleColor  = user?.role === 'admin' ? '#2563eb' : isViewer ? '#7c3aed' : '#0891b2'
  const roleLabel  = user?.role === 'admin' ? 'Admin' : isViewer ? 'Kuzatuvchi' : 'Kadrlar'
  const roleBg     = user?.role === 'admin' ? '#eff6ff' : isViewer ? '#f5f3ff' : '#ecfeff'

  return (
    <aside style={{
      width: '240px', minWidth: '240px',
      background: '#ffffff',
      borderRight: '1px solid #e2e8f0',
      display: 'flex', flexDirection: 'column',
      boxShadow: '1px 0 0 #e2e8f0',
    }}>
      {/* Logo */}
      <div style={{ padding: '22px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ flexShrink: 0 }}>
          <svg width="38" height="38" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#60a5fa"/>
                <stop offset="100%" stopColor="#1d4ed8"/>
              </linearGradient>
            </defs>
            <rect width="64" height="64" rx="14" fill="#EFF6FF"/>
            <circle cx="32" cy="32" r="18" fill="none" stroke="url(#logoGrad)" strokeWidth="2.5"/>
            <path d="M23 32.5L29 38.5L41 25.5" stroke="url(#logoGrad)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <div style={{
            fontWeight: 800, fontSize: '16px', letterSpacing: '-0.4px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>Davomatlar.uz</div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '1px' }}>Boshqaruv tizimi</div>
        </div>
      </div>

      {/* Section label */}
      <div style={{ padding: '18px 20px 6px' }}>
        <span style={{ fontSize: '10px', fontWeight: 700, color: '#cbd5e1', letterSpacing: '1px', textTransform: 'uppercase' }}>Menyu</span>
      </div>

      {/* Menu */}
      <nav style={{ padding: '4px 12px', flex: 1 }}>
        {menu.filter(m => m.roles.includes(user?.role)).map(({ key, label, icon: Icon }) => {
          const active = current === key
          return (
            <button key={key} onClick={() => onChange(key)} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              width: '100%', padding: '10px 12px', borderRadius: '10px',
              border: 'none', cursor: 'pointer', marginBottom: '2px', textAlign: 'left',
              background: active ? '#eff6ff' : 'transparent',
              color: active ? '#2563eb' : '#475569',
              fontWeight: active ? 600 : 400, fontSize: '14px',
              transition: 'all 0.15s',
            }}>
              <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
              <span style={{ flex: 1 }}>{label}</span>
              {active && <ChevronRight size={14} color="#93c5fd" />}
            </button>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ padding: '10px 12px', background: roleBg, borderRadius: '10px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: roleColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Shield size={15} color="white" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
            <div style={{ fontSize: '11px', color: roleColor, marginTop: '1px' }}>{roleLabel}</div>
          </div>
        </div>
        <button onClick={onLogout} style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
          padding: '9px', background: '#fff1f2', border: '1px solid #fecdd3',
          borderRadius: '8px', color: '#e11d48', fontSize: '13px', cursor: 'pointer', fontWeight: 500,
        }}>
          <LogOut size={14} /> Chiqish
        </button>
      </div>
    </aside>
  )
}
