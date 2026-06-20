import { useState, useEffect } from 'react'
import { CheckCircle, Clock, XCircle, Users, Building2, RefreshCw } from 'lucide-react'
import { API_URL, TOKEN } from '../config'

const statusInfo = {
  ontime: { label: "O'z vaqtida", color: 'text-green-700',  bg: 'bg-green-100' },
  late:   { label: 'Kech keldi',  color: 'text-amber-700',  bg: 'bg-amber-100' },
  absent: { label: 'Kelmadi',     color: 'text-red-600',    bg: 'bg-red-100'   },
}

function StatCard({ icon: Icon, label, value, iconColor, iconBg }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 flex items-center gap-4">
      <div className={`${iconBg} rounded-xl p-3 flex`}>
        <Icon size={22} className={iconColor} />
      </div>
      <div>
        <div className="text-[28px] font-normal text-slate-900 leading-none">{value}</div>
        <div className="text-[13px] text-slate-500 mt-1">{label}</div>
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
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
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
    const eff = getEffectiveFirstIn(row)
    if (!eff) return 'absent'
    return toHHMM(eff) <= addMinutes(getWorkStart(row.group_id), getGrace(row.group_id)) ? 'ontime' : 'late'
  }

  const visibleGroupIds = groups.map(g => g.id)

  const filtered = attendance.filter(r =>
    visibleGroupIds.includes(r.group_id) &&
    (orgFilter === 'all' || r.group_id === orgFilter)
  )

  const sorted = [...filtered].sort((a, b) => {
    const ord = { ontime: 0, late: 1, absent: 2 }
    const sa = getStatus(a), sb = getStatus(b)
    if (ord[sa] !== ord[sb]) return ord[sa] - ord[sb]
    if (a.first_in && b.first_in) return a.first_in.localeCompare(b.first_in)
    return (a.name || '').localeCompare(b.name || '')
  })

  const ontime = filtered.filter(r => getStatus(r) === 'ontime').length
  const late   = filtered.filter(r => getStatus(r) === 'late').length
  const absent = filtered.filter(r => getStatus(r) === 'absent').length

  const groupName = (gid) => groups.find(g => g.id === gid)?.name || gid

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-slate-900 m-0">Bugungi Davomat</h1>
          <p className="text-[13px] text-slate-400 mt-1 mb-0">{todayStr}</p>
        </div>
        <div className="flex items-center gap-2.5">
          {multiOrg && (
            <div className="flex gap-1.5">
              {[{ id: 'all', name: 'Hammasi' }, ...groups].map(g => (
                <button
                  key={g.id}
                  onClick={() => setOrgFilter(g.id)}
                  className={`px-3.5 py-1.5 rounded-lg border text-[13px] cursor-pointer transition-colors
                    ${orgFilter === g.id
                      ? 'bg-brand-50 border-brand-600 text-brand-600 font-semibold'
                      : 'bg-white border-slate-200 text-slate-500 font-normal hover:border-slate-300'
                    }`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={fetchAttendance}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 text-[13px] cursor-pointer hover:border-slate-300 transition-colors"
          >
            <RefreshCw size={14} /> Yangilash
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-3.5 mb-6">
        <StatCard icon={Users}       label="Jami xodim"   value={loading ? '…' : filtered.length} iconColor="text-brand-600" iconBg="bg-brand-50" />
        <StatCard icon={CheckCircle} label="O'z vaqtida"  value={loading ? '…' : ontime}          iconColor="text-green-600" iconBg="bg-green-50" />
        <StatCard icon={Clock}       label="Kech keldi"   value={loading ? '…' : late}            iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatCard icon={XCircle}     label="Kelmadi"      value={loading ? '…' : absent}          iconColor="text-red-500"   iconBg="bg-red-50"   />
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100">
          <Users size={16} className="text-brand-600" />
          <span className="text-[14px] font-semibold text-slate-800">Xodimlar holati</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Yuklanmoqda…</div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50">
                {['Ism Familiya', ...(multiOrg ? ['Tashkilot'] : []), 'Keldi', 'Kechikish', "Oxirgi o'tish", 'Holat'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[12px] text-slate-400 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map(row => {
                const s   = statusInfo[getStatus(row)]
                const eff = getEffectiveFirstIn(row)
                const isLate = getStatus(row) === 'late'

                let lateMin = null
                if (eff) {
                  const threshold = addMinutes(getWorkStart(row.group_id), getGrace(row.group_id))
                  const [wh, wm] = threshold.split(':').map(Number)
                  const [ah, am] = toHHMM(eff).split(':').map(Number)
                  const diff = (ah * 60 + am) - (wh * 60 + wm)
                  if (diff > 0) lateMin = diff
                }

                return (
                  <tr key={row.employee_id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="text-[14px] font-medium text-slate-800">{row.name}</div>
                      {row.lavozim && <div className="text-[11px] text-slate-400 mt-0.5">{row.lavozim}</div>}
                    </td>
                    {multiOrg && (
                      <td className="px-4 py-2.5 text-[13px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Building2 size={12} /> {groupName(row.group_id)}
                        </span>
                      </td>
                    )}
                    <td className="px-4 py-2.5">
                      {eff
                        ? <span className={`text-[15px] font-medium ${isLate ? 'text-orange-500' : 'text-green-600'}`}>{toHHMM(eff)}</span>
                        : <span className="text-[15px] text-slate-300">—</span>
                      }
                    </td>
                    <td className="px-4 py-2.5">
                      {lateMin
                        ? <span className="text-[13px] font-medium text-orange-500">+{lateMin} daq</span>
                        : <span className="text-[13px] text-slate-300">—</span>
                      }
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[15px] font-normal ${row.last_out ? 'text-slate-600' : 'text-slate-300'}`}>
                        {row.last_out ? toHHMM(row.last_out) : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[12px] font-semibold ${s.bg} ${s.color}`}>
                        {s.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={multiOrg ? 6 : 5} className="py-10 text-center text-sm text-slate-400">
                    Ma'lumot yo'q
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
