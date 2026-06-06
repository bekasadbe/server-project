import { LayoutDashboard, Users, Clock, FileBarChart2, Building2, Settings, LogOut, Shield } from 'lucide-react'

const menu = [
  { key: 'dashboard', label: 'Dashboard',  icon: LayoutDashboard, roles: ['admin','kadrlar'] },
  { key: 'history',   label: 'Tarix',       icon: Clock,           roles: ['kadrlar'] },
  { key: 'employees', label: 'Xodimlar',    icon: Users,           roles: ['kadrlar'] },
  { key: 'reports',   label: 'Hisobotlar',  icon: FileBarChart2,   roles: ['kadrlar'] },
  { key: 'admin',     label: 'Admin panel', icon: Settings,        roles: ['admin'] },
]

export default function Sidebar({ current, onChange, user, onLogout }) {
  const roleColor = user?.role === 'admin' ? '#6366f1' : '#06b6d4'
  const roleLabel = user?.role === 'admin' ? 'Admin' : 'Kadrlar'

  return (
    <aside style={{
      width: '220px', minWidth: '220px',
      background: '#161b27',
      borderRight: '1px solid #1e2535',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid #1e2535', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink:0 }}>
          <Building2 size={20} color="white" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '15px', color: '#f1f5f9' }}>Davomat</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>Boshqaruv tizimi</div>
        </div>
      </div>

      {/* Menu */}
      <nav style={{ padding: '10px 8px', flex: 1 }}>
        {menu.filter(m => m.roles.includes(user?.role)).map(({ key, label, icon: Icon }) => {
          const active = current === key
          return (
            <button key={key} onClick={() => onChange(key)} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              width: '100%', padding: '10px 12px', borderRadius: '8px',
              border: 'none', cursor: 'pointer', marginBottom: '3px', textAlign: 'left',
              background: active ? '#6366f118' : 'transparent',
              color: active ? '#a5b4fc' : '#64748b',
              fontWeight: active ? 600 : 400, fontSize: '14px',
              borderLeft: active ? '3px solid #6366f1' : '3px solid transparent',
            }}>
              <Icon size={16} />
              {label}
            </button>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: '12px', borderTop: '1px solid #1e2535' }}>
        <div style={{ padding: '10px 12px', background: '#0f1117', borderRadius: '10px', marginBottom: '8px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <Shield size={14} color={roleColor} />
            <span style={{ fontSize:'13px', fontWeight:600, color:'#e2e8f0' }}>{user?.name}</span>
          </div>
          <span style={{ fontSize:'11px', color: roleColor, marginTop:'2px', display:'block' }}>{roleLabel}</span>
        </div>
        <button onClick={onLogout} style={{
          width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'7px',
          padding:'8px', background:'#ef444415', border:'1px solid #ef444425',
          borderRadius:'8px', color:'#f87171', fontSize:'13px', cursor:'pointer'
        }}>
          <LogOut size={14}/> Chiqish
        </button>
      </div>
    </aside>
  )
}
