import { LayoutDashboard, Users, Clock, FileBarChart2, Building2, Settings, LogOut, Shield, ChevronRight, Radio } from 'lucide-react'

const menu = [
  { key: 'dashboard',  label: 'Dashboard',    icon: LayoutDashboard, roles: ['admin','kadrlar'] },
  { key: 'live',       label: 'Jonli lenta',  icon: Radio,           roles: ['admin'] },
  { key: 'history',    label: 'Tarix',        icon: Clock,           roles: ['kadrlar'] },
  { key: 'employees',  label: 'Xodimlar',     icon: Users,           roles: ['kadrlar'] },
  { key: 'reports',    label: 'Hisobotlar',   icon: FileBarChart2,   roles: ['kadrlar'] },
  { key: 'admin',      label: 'Admin panel',  icon: Settings,        roles: ['admin'] },
]

export default function Sidebar({ current, onChange, user, onLogout }) {
  const roleColor = user?.role === 'admin' ? '#2563eb' : '#0891b2'
  const roleLabel = user?.role === 'admin' ? 'Admin' : 'Kadrlar'
  const roleBg    = user?.role === 'admin' ? '#eff6ff' : '#ecfeff'

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
        <div style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', borderRadius: '12px', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px #2563eb30' }}>
          <Building2 size={20} color="white" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a', letterSpacing: '-0.3px' }}>Davomat</div>
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
