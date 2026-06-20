import { useState, useEffect } from 'react'
import { CheckCircle, Clock, XCircle, Users, Building2, RefreshCw, TrendingUp } from 'lucide-react'
import { API_URL, TOKEN } from '../config'

function StatCard({ icon: Icon, label, value, color, loading }) {
  const colors = {
    blue:   { bg: 'bg-blue-50',   icon: 'text-blue-500',   val: 'text-blue-600'   },
    green:  { bg: 'bg-green-50',  icon: 'text-green-500',  val: 'text-green-600'  },
    amber:  { bg: 'bg-amber-50',  icon: 'text-amber-500',  val: 'text-amber-600'  },
    red:    { bg: 'bg-red-50',    icon: 'text-red-400',    val: 'text-red-500'    },
  }
  const c = colors[color] || colors.blue
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm">
      <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
        <Icon size={22} className={c.icon} />
      </div>
      <div>
        <div className={`text-2xl font-semibold ${c.val}`}>{loading ? '…' : value}</div>
        <div className="text-[13px] text-slate-400 mt-0.5">{label}</div>
      </div>
    </div>
  )
}

export default function Dashboard({ employees = [], groups = [] }) {
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading]       = useState(true)
  const [orgFilter, setOrgFilter]   = useState('all')

  const today    = new Date().toISOString().slice(0, 10)
  const todayStr = new Date().toLocaleDateString('uz-UZ', { year:'numeric', month:'long', day:'numeric' })
  const multiOrg = groups.length > 1

  const fetchAttendance = async () => {
    setLoading(true)
    try {
      const res  = await fetch(`${API_URL}/attendance?date=${today}`, { headers: { 'X-API-Token': TOKEN } })
      const data = await res.json()
      setAttendance(data.attendance || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    fetchAttendance()
    const t = setInterval(fetchAttendance, 60000)
    return () => clearInterval(t)
  }, [])

  const getGroup     = (gid) => groups.find(g => g.id === gid)
  const getWorkStart = (gid) => getGroup(gid)?.work_start    || '09:00'
  const getWorkBegin = (gid) => getGroup(gid)?.work_begin    || '06:00'
  const getGrace     = (gid) => getGroup(gid)?.grace_minutes ?? 0

  const addMinutes = (t, min) => {
    const [h, m] = t.split(':').map(Number)
    const total = h * 60 + m + Number(min)
    return `${String(Math.floor(total / 60)).padStart(2,'0')}:${String(total % 60).padStart(2,'0')}`
  }

  const toHHMM = (t) => {
    if (!t) return ''
    return t.length > 8 ? t.slice(11, 16) : t.slice(0, 5)
  }

  const getEffectiveFirstIn = (row) => {
    if (!row.first_in) return null
    const timeStr = toHHMM(row.first_in)
    return timeStr >= getWorkBegin(row.group_id) ? row.first_in : null
  }

  const getStatus = (row) => {
    const effectiveIn = getEffectiveFirstIn(row)
    if (!effectiveIn) return 'absent'
    const lateThreshold = addMinutes(getWorkStart(row.group_id), getGrace(row.group_id))
    return toHHMM(effectiveIn) <= lateThreshold ? 'ontime' : 'late'
  }

  const getLateMin = (row) => {
    const eff = getEffectiveFirstIn(row)
    if (!eff) return 0
    const [wh, wm] = addMinutes(getWorkStart(row.group_id), getGrace(row.group_id)).split(':').map(Number)
    const [ah, am] = toHHMM(eff).split(':').map(Number)
    return Math.max(0, (ah * 60 + am) - (wh * 60 + wm))
  }

  const visibleGroupIds = groups.map(g => g.id)

  const filtered = attendance.filter(r =>
    visibleGroupIds.includes(r.group_id) &&
    (orgFilter === 'all' || r.group_id === orgFilter)
  )

  const sorted = [...filtered].sort((a, b) => {
    const ord = { ontime:0, late:1, absent:2 }
    const sa = getStatus(a), sb = getStatus(b)
    if (ord[sa] !== ord[sb]) return ord[sa] - ord[sb]
    if (a.first_in && b.first_in) return a.first_in.localeCompare(b.first_in)
    return (a.name || '').localeCompare(b.name || '')
  })

  const ontime = filtered.filter(r => getStatus(r) === 'ontime').length
  const late   = filtered.filter(r => getStatus(r) === 'late').length
  const absent = filtered.filter(r => getStatus(r) === 'absent').length

  const groupName = (gid) => groups.find(g => g.id === gid)?.name || gid

  const statusBadge = {
    ontime: <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-600">O'z vaqtida</span>,
    late:   <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-600">Kech keldi</span>,
    absent: <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-400">Kelmadi</span>,
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Bugungi davomat</h1>
          <p className="text-sm text-slate-400 mt-0.5">{todayStr}</p>
        </div>
        <div className="flex items-center gap-2">
          {multiOrg && (
            <div className="flex gap-1.5">
              {[{ id: 'all', name: 'Hammasi' }, ...groups].map(g => (
                <button key={g.id} onClick={() => setOrgFilter(g.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all cursor-pointer
                    ${orgFilter === g.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'}`}>
                  {g.name}
                </button>
              ))}
            </div>
          )}
          <button onClick={fetchAttendance}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-500 bg-white border border-slate-200 hover:border-blue-300 transition-all cursor-pointer">
            <RefreshCw size={13} /> Yangilash
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users}       label="Jami xodim"  value={loading ? '…' : filtered.length} color="blue"  loading={loading} />
        <StatCard icon={CheckCircle} label="O'z vaqtida" value={loading ? '…' : ontime}          color="green" loading={loading} />
        <StatCard icon={Clock}       label="Kech keldi"  value={loading ? '…' : late}            color="amber" loading={loading} />
        <StatCard icon={XCircle}     label="Kelmadi"     value={loading ? '…' : absent}          color="red"   loading={loading} />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-50">
          <TrendingUp size={16} className="text-blue-500" />
          <span className="text-[14px] font-semibold text-slate-700">Xodimlar holati</span>
          <span className="ml-auto text-xs text-slate-400">{sorted.length} ta xodim</span>
        </div>
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">Yuklanmoqda…</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Ism Familiya', ...(multiOrg ? ['Tashkilot'] : []), 'Keldi', 'Kechikish', "Oxirgi o'tish", 'Holat'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs text-slate-400 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, i) => {
                const status   = getStatus(row)
                const eff      = getEffectiveFirstIn(row)
                const lateMin  = getLateMin(row)
                return (
                  <tr key={row.employee_id} className={`border-b border-slate-50 last:border-0 ${i % 2 === 1 ? 'bg-slate-50/40' : ''}`}>
                    <td className="px-5 py-3">
                      <div className="text-[14px] font-medium text-slate-700">{row.name}</div>
                      {row.lavozim && <div className="text-xs text-slate-400 mt-0.5">{row.lavozim}</div>}
                    </td>
                    {multiOrg && (
                      <td className="px-5 py-3 text-sm text-slate-500">
                        <span className="flex items-center gap-1"><Building2 size={11}/> {groupName(row.group_id)}</span>
                      </td>
                    )}
                    <td className="px-5 py-3">
                      {eff
                        ? <span className={`text-[15px] font-medium ${status === 'late' ? 'text-amber-500' : 'text-green-500'}`}>{toHHMM(eff)}</span>
                        : <span className="text-slate-300 text-[15px]">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      {lateMin > 0
                        ? <span className="text-xs font-medium text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">+{lateMin} daq</span>
                        : <span className="text-slate-300 text-sm">—</span>}
                    </td>
                    <td className="px-5 py-3 text-[15px] text-slate-500">{row.last_out ? toHHMM(row.last_out) : <span className="text-slate-300">—</span>}</td>
                    <td className="px-5 py-3">{statusBadge[status]}</td>
                  </tr>
                )
              })}
              {sorted.length === 0 && (
                <tr><td colSpan={multiOrg ? 6 : 5} className="py-16 text-center text-slate-400 text-sm">Ma'lumot yo'q</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
