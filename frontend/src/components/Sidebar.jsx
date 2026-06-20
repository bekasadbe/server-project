import { LayoutDashboard, Users, Clock, FileBarChart2, Settings2, LogOut, Shield, ChevronRight, Radio, Building2, KeyRound, CalendarDays, Stethoscope } from 'lucide-react'

const menu = [
  { key: 'dashboard', label: 'Bugun',             icon: LayoutDashboard, roles: ['admin','kadrlar','kuzatuvchi'] },
  { key: 'live',      label: 'Jonli lenta',       icon: Radio,           roles: ['admin'] },
  { key: 'schedule',  label: 'Jadval',            icon: CalendarDays,    roles: ['kadrlar','kuzatuvchi'] },
  { key: 'history',   label: 'Hisobot',           icon: Clock,           roles: ['kadrlar','kuzatuvchi'] },
  { key: 'reports',   label: 'Statistika',        icon: FileBarChart2,   roles: ['kadrlar','kuzatuvchi'] },
  { key: 'employees', label: 'Xodimlar',          icon: Users,           roles: ['kadrlar','kuzatuvchi'] },
  { key: 'leaves',    label: "Kasallik & Ta'til", icon: Stethoscope,     roles: ['kadrlar'] },
  { key: 'settings',  label: 'Sozlamalar',        icon: Settings2,       roles: ['kadrlar'] },
  { key: 'admin',     label: 'Tashkilotlar',      icon: Building2,       roles: ['admin'] },
  { key: 'accounts',  label: 'Akkauntlar',        icon: KeyRound,        roles: ['admin'] },
]

export default function Sidebar({ current, onChange, user, onLogout }) {
  const isViewer = user?.role === 'kuzatuvchi'
  const roleLabel = user?.role === 'admin' ? 'Admin' : isViewer ? 'Kuzatuvchi' : 'Kadrlar'
  const roleColor = user?.role === 'admin' ? 'bg-blue-100 text-blue-600' : isViewer ? 'bg-purple-100 text-purple-600' : 'bg-cyan-100 text-cyan-600'

  return (
    <aside className="w-[240px] min-w-[240px] h-full bg-white border-r border-slate-100 flex flex-col select-none">

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="7" stroke="white" strokeWidth="1.5"/>
            <path d="M7 10.5L9 12.5L13 8.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <div className="text-[15px] font-bold text-slate-800 tracking-tight">Davomatlar.uz</div>
          <div className="text-[11px] text-slate-400">Boshqaruv tizimi</div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-2 mb-2">Menyu</p>
        {menu.filter(m => m.roles.includes(user?.role)).map(({ key, label, icon: Icon }) => {
          const active = current === key
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm font-medium transition-all duration-150 cursor-pointer border-none
                ${active
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
            >
              <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
              <span className="flex-1 text-left">{label}</span>
              {active && <ChevronRight size={13} className="text-blue-300" />}
            </button>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-3 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 mb-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${roleColor}`}>
            <Shield size={14} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-slate-700 truncate">{user?.name}</div>
            <div className="text-[11px] text-slate-400">{roleLabel}</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-red-50 text-red-500 text-[13px] font-medium hover:bg-red-100 transition-colors border-none cursor-pointer"
        >
          <LogOut size={13} /> Chiqish
        </button>
      </div>
    </aside>
  )
}
