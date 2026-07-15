import { LayoutDashboard, Users, Clock, FileBarChart2, LogOut, Shield, ChevronRight, Radio, Settings2, Building2, KeyRound, CalendarDays, Stethoscope, Upload, Clock3 } from 'lucide-react'

const menu = [
  { key: 'dashboard',     label: 'Bugun',             icon: LayoutDashboard, roles: ['admin','kadrlar','kuzatuvchi'] },
  { key: 'live',          label: 'Jonli lenta',       icon: Radio,           roles: ['admin'] },
  { key: 'schedule',      label: 'Jadval',            icon: CalendarDays,    roles: ['kadrlar','kuzatuvchi'] },
  { key: 'history',       label: 'Hisobot',           icon: Clock,           roles: ['kadrlar','kuzatuvchi'] },
  { key: 'reports',       label: 'Statistika',        icon: FileBarChart2,   roles: ['kadrlar','kuzatuvchi'] },
  { key: 'employees',     label: 'Xodimlar',          icon: Users,           roles: ['kadrlar'] },
  { key: 'workSchedule',  label: 'Ish grafigi',       icon: Clock3,          roles: ['kadrlar'] },
  { key: 'leaves',        label: "Kasallik & Ta'til", icon: Stethoscope,     roles: ['kadrlar'] },
  { key: 'settings',      label: 'Sozlamalar',        icon: Settings2,       roles: ['kadrlar'] },
  { key: 'admin',         label: 'Tashkilotlar',      icon: Building2,       roles: ['admin'] },
  { key: 'accounts',      label: 'Akkauntlar',        icon: KeyRound,        roles: ['admin'] },
]

export default function Sidebar({ current, onChange, user, onLogout }) {
  const isViewer  = user?.role === 'kuzatuvchi'
  const roleLabel = user?.role === 'admin' ? 'Admin' : isViewer ? 'Kuzatuvchi' : 'Kadrlar'
  const roleColor = user?.role === 'admin' ? 'bg-brand-600' : isViewer ? 'bg-purple-600' : 'bg-cyan-600'

  return (
    <aside className="flex flex-col w-60 min-w-[240px] h-full min-h-screen bg-white border-r border-slate-100 shadow-[1px_0_0_#f1f5f9]">

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-slate-100">
        <div className="shrink-0">
          <svg width="36" height="36" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lg1" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#60a5fa"/>
                <stop offset="100%" stopColor="#1d4ed8"/>
              </linearGradient>
            </defs>
            <rect width="64" height="64" rx="14" fill="#EFF6FF"/>
            <circle cx="32" cy="32" r="18" fill="none" stroke="url(#lg1)" strokeWidth="2.5"/>
            <path d="M23 32.5L29 38.5L41 25.5" stroke="url(#lg1)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <div className="text-base font-extrabold tracking-tight bg-gradient-to-br from-blue-500 to-blue-700 bg-clip-text text-transparent">
            Davomatlar.uz
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Boshqaruv tizimi</div>
        </div>
      </div>

      {/* Section label */}
      <div className="px-5 pt-5 pb-1.5">
        <span className="text-[10px] font-bold text-slate-300 tracking-widest uppercase">Menyu</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-1 space-y-0.5">
        {menu.filter(m => m.roles.includes(user?.role)).map(({ key, label, icon: Icon }) => {
          const active = current === key
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer border-none
                ${active
                  ? 'bg-brand-50 text-brand-600 font-semibold'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 bg-transparent'
                }`}
            >
              <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
              <span className="flex-1 text-left">{label}</span>
              {active && <ChevronRight size={14} className="text-blue-300" />}
            </button>
          )
        })}
      </nav>

      {/* User card + Logout */}
      <div className="p-4 border-t border-slate-100 space-y-2">
        <div className={`flex items-center gap-2.5 p-2.5 rounded-xl ${user?.role === 'admin' ? 'bg-brand-50' : isViewer ? 'bg-purple-50' : 'bg-cyan-50'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${roleColor}`}>
            <Shield size={14} color="white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-slate-800 truncate">{user?.name}</div>
            <div className={`text-[11px] mt-0.5 ${user?.role === 'admin' ? 'text-brand-600' : isViewer ? 'text-purple-600' : 'text-cyan-600'}`}>{roleLabel}</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-600 text-[13px] font-medium cursor-pointer hover:bg-rose-100 transition-colors"
        >
          <LogOut size={14} /> Chiqish
        </button>
      </div>
    </aside>
  )
}
