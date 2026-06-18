import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Stethoscope, Palmtree } from 'lucide-react'
import { API_URL, TOKEN, apiFetch } from '../config'

const DAY_LABELS = ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak']
const MONTH_SHORT = ['Yan','Fev','Mar','Apr','May','Iyn','Iyl','Avg','Sen','Okt','Noy','Dek']

function getWeekDays(baseMonday) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(baseMonday)
    d.setDate(d.getDate() + i)
    return d
  })
}

function getMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function isFuture(d) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return d > today
}

function isToday(d) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return d.getTime() === today.getTime()
}

export default function Jadvallar({ groups = [], employees = [] }) {
  const [monday, setMonday]     = useState(() => getMonday(new Date()))
  const [dayData, setDayData]   = useState({})
  const [leaves, setLeaves]     = useState([])
  const [loading, setLoading]   = useState(false)
  const [orgFilter, setOrgFilter] = useState('all')

  const multiOrg = groups.length > 1
  const visibleGroupIds = groups.map(g => g.id)
  const days = getWeekDays(monday)

  const getWorkStart  = (gid) => groups.find(g => g.id === gid)?.work_start  || '09:00'
  const getWorkFinish = (gid) => groups.find(g => g.id === gid)?.work_finish || '18:00'
  const getWorkBegin  = (gid) => groups.find(g => g.id === gid)?.work_begin  || '06:00'
  const getWorkDays   = (gid) => (groups.find(g => g.id === gid)?.work_days  || '1,2,3,4,5,6').split(',').filter(Boolean)
  const getGrace      = (gid) => groups.find(g => g.id === gid)?.grace_minutes ?? 0
  const isDayOff      = (d, gid) => !getWorkDays(gid).includes(String(d.getDay()))

  const addMinutes = (t, min) => {
    const [h, m] = t.split(':').map(Number)
    const total = h * 60 + m + Number(min)
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const from = toDateStr(days[0])
      const to   = toDateStr(days[days.length - 1])

      const [attResults, leavesData] = await Promise.all([
        Promise.all(days.map(async d => {
          const ds = toDateStr(d)
          try {
            const res = await fetch(`${API_URL}/attendance?date=${ds}`, { headers: { 'X-API-Token': TOKEN } })
            const json = await res.json()
            const map = {}
            ;(json.attendance || []).forEach(r => { map[r.employee_id] = r })
            return [ds, map]
          } catch { return [ds, {}] }
        })),
        apiFetch(`/leaves?from=${from}&to=${to}`).catch(() => ({ leaves: [] }))
      ])

      const empIds = new Set(employees.map(e => e.id))
      setDayData(Object.fromEntries(attResults))
      setLeaves((leavesData.leaves || []).filter(l => empIds.has(l.employee_id)))
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monday.getTime(), visibleGroupIds.join(',')])

  const prevWeek = () => { const m = new Date(monday); m.setDate(m.getDate() - 7); setMonday(m) }
  const nextWeek = () => { const m = new Date(monday); m.setDate(m.getDate() + 7); setMonday(m) }

  const getLeaveForDay = (empId, dateStr) => {
    return leaves.find(l => l.employee_id === empId && l.start_date <= dateStr && l.end_date >= dateStr)
  }

  const filteredEmps = employees.filter(e =>
    visibleGroupIds.includes(e.group_id) &&
    (orgFilter === 'all' || e.group_id === orgFilter)
  ).sort((a, b) => a.name.localeCompare(b.name))

  const weekLabel = () => {
    const last = days[days.length - 1]
    return `${days[0].getDate()} ${MONTH_SHORT[days[0].getMonth()]} — ${last.getDate()} ${MONTH_SHORT[last.getMonth()]} ${last.getFullYear()}`
  }

  const CellContent = ({ emp, day }) => {
    const ds       = toDateStr(day)
    const future   = isFuture(day)
    const todayDay = isToday(day)
    const rec      = dayData[ds]?.[emp.id]
    const wb       = getWorkBegin(emp.group_id)
    const ws       = getWorkStart(emp.group_id)
    const wf       = getWorkFinish(emp.group_id)
    const off      = isDayOff(day, emp.group_id)
    const leave    = getLeaveForDay(emp.id, ds)
    const isWeekend = day.getDay() === 0 || day.getDay() === 6

    const cellStyle = (borderColor, bg = '#fff') => ({
      margin: '3px', padding: '6px 10px', borderRadius: '10px',
      background: isWeekend && !leave && !(rec && (rec.first_in || rec.last_out)) ? '#f0f0f1' : bg,
      border: `2px solid ${isWeekend && !leave && !(rec && (rec.first_in || rec.last_out)) ? '#e2e8f0' : borderColor}`,
      minHeight: '46px', display: 'flex', flexDirection: 'column', justifyContent: 'center',
    })
    const plannedStyle = { fontSize: '13px', color: '#94a3b8', fontWeight: 400, marginBottom: '3px', textAlign: 'left' }
    const timeStyle    = { fontSize: '15px', fontWeight: 400, textAlign: 'left' }

    // Ta'til / Kasallik
    if (leave) {
      const isSick = leave.leave_type === 'sick'
      const lColor = isSick ? '#9333ea' : '#06b6d4'
      return (
        <div style={cellStyle(lColor, isSick ? '#fdf4ff' : '#ecfeff')}>
          <div style={{ fontSize: '12px', fontWeight: 400, color: lColor, display: 'flex', alignItems: 'center', gap: '4px' }}>
            {isSick ? <Stethoscope size={12} color={lColor} /> : <Palmtree size={12} color={lColor} />}
            {isSick ? 'Kasallik' : "Ta'til"}
          </div>
        </div>
      )
    }

    // Ma'lumot bor
    if (rec && (rec.first_in || rec.last_out)) {
      const fi            = rec.first_in
      const lo            = rec.last_out
      const lateThreshold = addMinutes(ws, getGrace(emp.group_id))
      const eff           = fi && fi >= wb ? fi : null
      const late          = eff && eff > lateThreshold
      const earlyOut      = lo && lo < wf
      const inColor       = !eff ? '#94a3b8' : late ? '#f97316' : '#22c55e'
      const outColor      = earlyOut ? '#f97316' : '#22c55e'

      return (
        <div style={cellStyle('#06b6d4', '#f0fdfa')}>
          <div style={plannedStyle}>{ws} - {wf}</div>
          <div style={{ display: 'flex', gap: '3px', ...timeStyle }}>
            <span style={{ color: inColor }}>{eff || '—:——'}</span>
            <span style={{ color: '#d1d5db' }}> - </span>
            <span style={{ color: lo ? outColor : '#d1d5db' }}>{lo || '—:——'}</span>
          </div>
        </div>
      )
    }

    // Dam olish kuni (ma'lumot yo'q)
    if (off) return (
      <div style={cellStyle('#e2e8f0', '#f8fafc')}>
        <div style={{ ...plannedStyle, marginBottom: 0, color: '#cbd5e1' }}>Dam olish</div>
      </div>
    )

    // Ma'lumot yo'q (ish kuni)
    return (
      <div style={cellStyle(todayDay ? '#fbbf24' : future ? '#f1f5f9' : '#f43f5e', todayDay ? '#fff' : future ? '#fff' : '#fff5f5')}>
        <div style={plannedStyle}>{ws} - {wf}</div>
        <div style={{ ...timeStyle, fontSize: '13px', color: todayDay ? '#f59e0b' : future ? '#e2e8f0' : '#f43f5e' }}>
          {todayDay ? "hali yo'q" : future ? '—' : 'kelmadi'}
        </div>
      </div>
    )
  }

  const nameInitials = (name) => (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const nameColor = () => '#0891b2'

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={prevWeek} style={{ width: 32, height: 32, borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            <ChevronLeft size={16} />
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>Jadvallar</h1>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#94a3b8' }}>{weekLabel()}</p>
          </div>
          <button onClick={nextWeek} style={{ width: 32, height: 32, borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            <ChevronRight size={16} />
          </button>
          <button onClick={() => setMonday(getMonday(new Date()))} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
            Bu hafta
          </button>
        </div>

        {multiOrg && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button onClick={() => setOrgFilter('all')} style={{ padding: '6px 13px', borderRadius: '8px', border: '1px solid', borderColor: orgFilter === 'all' ? '#2563eb' : '#e2e8f0', background: orgFilter === 'all' ? '#eff6ff' : '#fff', color: orgFilter === 'all' ? '#2563eb' : '#64748b', fontSize: '13px', cursor: 'pointer', fontWeight: orgFilter === 'all' ? 600 : 400 }}>Hammasi</button>
            {groups.map(g => (
              <button key={g.id} onClick={() => setOrgFilter(g.id)} style={{ padding: '6px 13px', borderRadius: '8px', border: '1px solid', borderColor: orgFilter === g.id ? '#2563eb' : '#e2e8f0', background: orgFilter === g.id ? '#eff6ff' : '#fff', color: orgFilter === g.id ? '#2563eb' : '#64748b', fontSize: '13px', cursor: 'pointer', fontWeight: orgFilter === g.id ? 600 : 400 }}>{g.name}</button>
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px #0f172a06' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '20%' }} />
              {days.map((_, i) => <col key={i} style={{ width: `${80 / days.length}%` }} />)}
            </colgroup>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', borderRight: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.5px' }}>ISM FAMILIYA</span>
                </th>
                {days.map((d, i) => {
                  const today = isToday(d)
                  const isSun = d.getDay() === 0
                  const isSat = d.getDay() === 6
                  return (
                    <th key={i} style={{ padding: '10px 4px', textAlign: 'center', background: today ? '#eff6ff' : (isSun || isSat) ? '#f0f0f1' : '#f8fafc', borderLeft: '1px solid #e2e8f0', borderBottom: today ? '2px solid #2563eb' : 'none' }}>
                      <div style={{ fontSize: '11px', fontWeight: 400, color: today ? '#2563eb' : isSun ? '#f97316' : '#64748b' }}>{DAY_LABELS[i]}</div>
                      <div style={{ fontSize: '16px', fontWeight: 400, color: today ? '#2563eb' : isSun ? '#f97316' : '#0f172a', marginTop: '1px' }}>{d.getDate()}</div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>Yuklanmoqda...</td></tr>
              ) : filteredEmps.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>Xodimlar topilmadi</td></tr>
              ) : filteredEmps.map((emp, ri) => (
                <tr key={emp.id} style={{ borderBottom: ri < filteredEmps.length - 1 ? '1px solid #f1f5f9' : 'none', background: ri % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '10px 16px', borderRight: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: nameColor(emp.name), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '13px', flexShrink: 0 }}>
                        {nameInitials(emp.name)}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '14px', fontWeight: 400, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.name}</div>
                        {emp.lavozim && <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.lavozim}</div>}
                      </div>
                    </div>
                  </td>
                  {days.map((d, di) => {
                    const today  = isToday(d)
                    const isSun  = d.getDay() === 0
                    const isSat  = d.getDay() === 6
                    return (
                      <td key={di} style={{ padding: '2px', textAlign: 'center', borderLeft: '1px solid #f1f5f9', background: today ? '#f8fbff' : (isSun || isSat) ? '#f4f4f5' : 'transparent', verticalAlign: 'middle' }}>
                        <CellContent emp={emp} day={d} />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div style={{ padding: '10px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {[
            { color: '#16a34a', label: "O'z vaqtida" },
            { color: '#f59e0b', label: 'Kech keldi' },
            { color: '#f97316', label: 'Kech / Erta ketdi' },
            { color: '#9333ea', label: 'Kasallik' },
            { color: '#0891b2', label: "Ta'til" },
            { color: '#cbd5e1', label: 'Kelmadi / Rejalashtirilgan' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
              <span style={{ fontSize: '11px', color: '#64748b' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
