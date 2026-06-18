import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { API_URL, TOKEN } from '../config'

const DAY_LABELS = ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan']
const MONTH_SHORT = ['Yan','Fev','Mar','Apr','May','Iyn','Iyl','Avg','Sen','Okt','Noy','Dek']

function getWeekDays(baseMonday) {
  return Array.from({ length: 6 }, (_, i) => {
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
  const [monday, setMonday]   = useState(() => getMonday(new Date()))
  const [dayData, setDayData] = useState({}) // dateStr → { empId → {first_in, last_out} }
  const [loading, setLoading] = useState(false)
  const [orgFilter, setOrgFilter] = useState('all')

  const multiOrg = groups.length > 1
  const visibleGroupIds = groups.map(g => g.id)
  const days = getWeekDays(monday)

  const getWorkStart  = (gid) => groups.find(g => g.id === gid)?.work_start  || '09:00'
  const getWorkFinish = (gid) => groups.find(g => g.id === gid)?.work_finish || '18:00'
  const getWorkBegin  = (gid) => groups.find(g => g.id === gid)?.work_begin  || '06:00'
  const getWorkDays   = (gid) => (groups.find(g => g.id === gid)?.work_days  || '1,2,3,4,5,6').split(',').filter(Boolean)
  const isDayOff      = (d, gid) => !getWorkDays(gid).includes(String(d.getDay()))

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const results = await Promise.all(days.map(async d => {
        const ds = toDateStr(d)
        try {
          const res = await fetch(`${API_URL}/attendance?date=${ds}`, { headers: { 'X-API-Token': TOKEN } })
          const json = await res.json()
          const map = {}
          ;(json.attendance || []).forEach(r => { map[r.employee_id] = r })
          return [ds, map]
        } catch { return [ds, {}] }
      }))
      setDayData(Object.fromEntries(results))
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monday.getTime(), visibleGroupIds.join(',')])

  const prevWeek = () => { const m = new Date(monday); m.setDate(m.getDate() - 7); setMonday(m) }
  const nextWeek = () => { const m = new Date(monday); m.setDate(m.getDate() + 7); setMonday(m) }

  const filteredEmps = employees.filter(e =>
    visibleGroupIds.includes(e.group_id) &&
    (orgFilter === 'all' || e.group_id === orgFilter)
  ).sort((a, b) => a.name.localeCompare(b.name))

  const weekLabel = () => {
    const last = days[days.length - 1]
    return `${days[0].getDate()} ${MONTH_SHORT[days[0].getMonth()]} — ${last.getDate()} ${MONTH_SHORT[last.getMonth()]} ${last.getFullYear()}`
  }

  const CellContent = ({ emp, day }) => {
    const ds = toDateStr(day)
    const future   = isFuture(day)
    const todayDay = isToday(day)
    const rec      = dayData[ds]?.[emp.id]
    const wb  = getWorkBegin(emp.group_id)
    const ws  = getWorkStart(emp.group_id)
    const wf  = getWorkFinish(emp.group_id)
    const off = isDayOff(day, emp.group_id)

    // Dam olish kuni
    if (off) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '8px', background: '#f1f5f9', color: '#94a3b8', fontWeight: 600 }}>Dam olish</span>
        </div>
      )
    }

    // Ma'lumot bor
    if (rec && (rec.first_in || rec.last_out)) {
      const fi = rec.first_in
      const lo = rec.last_out
      const eff = fi && fi >= wb ? fi : null
      const late = eff && eff > ws
      const statusColor = !eff ? '#94a3b8' : late ? '#f59e0b' : '#16a34a'

      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: eff ? statusColor : '#94a3b8' }}>
            {eff || '—:——'}
          </span>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            {lo || '—:——'}
          </span>
          {eff && (
            <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '8px', background: late ? '#fef3c7' : '#dcfce7', color: late ? '#d97706' : '#16a34a', fontWeight: 600, marginTop: '1px' }}>
              {late ? 'Kech' : "O'z vaqtida"}
            </span>
          )}
        </div>
      )
    }

    // Kelajak / bugun / o'tgan ish kuni — ma'lumot yo'q
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
        <span style={{ fontSize: '13px', fontWeight: 500, color: future ? '#d1d5db' : '#94a3b8' }}>
          {ws}
        </span>
        <span style={{ fontSize: '12px', color: future ? '#e5e7eb' : '#cbd5e1' }}>
          {wf}
        </span>
        {todayDay && (
          <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '8px', background: '#fef3c7', color: '#d97706', fontWeight: 600, marginTop: '1px' }}>
            Hali yo'q
          </span>
        )}
      </div>
    )
  }

  const nameInitials = (name) => (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const nameColor = (name) => {
    const colors = ['#2563eb','#7c3aed','#059669','#d97706','#dc2626','#0891b2']
    return colors[(name || '').length % colors.length]
  }

  const colW = 110

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
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            {/* Column headers */}
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '14px 20px', textAlign: 'left', minWidth: 200, position: 'sticky', left: 0, background: '#f8fafc', zIndex: 2, borderRight: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', letterSpacing: '0.5px' }}>ISM FAMILIYA</span>
                </th>
                {days.map((d, i) => {
                  const today = isToday(d)
                  return (
                    <th key={i} style={{ padding: '12px 8px', textAlign: 'center', width: colW, background: today ? '#eff6ff' : '#f8fafc', borderLeft: '1px solid #e2e8f0', borderBottom: today ? '2px solid #2563eb' : 'none' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: today ? '#2563eb' : '#64748b' }}>{DAY_LABELS[i]}</div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: today ? '#2563eb' : '#0f172a', marginTop: '2px' }}>{d.getDate()}</div>
                      <div style={{ fontSize: '11px', color: today ? '#93c5fd' : '#94a3b8' }}>{MONTH_SHORT[d.getMonth()]}</div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : filteredEmps.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                    Xodimlar topilmadi
                  </td>
                </tr>
              ) : filteredEmps.map((emp, ri) => (
                <tr key={emp.id} style={{ borderBottom: ri < filteredEmps.length - 1 ? '1px solid #f1f5f9' : 'none', background: ri % 2 === 0 ? '#fff' : '#fafafa' }}>
                  {/* Name column */}
                  <td style={{ padding: '12px 20px', position: 'sticky', left: 0, background: ri % 2 === 0 ? '#fff' : '#fafafa', zIndex: 1, borderRight: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: nameColor(emp.name), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '12px', flexShrink: 0 }}>
                        {nameInitials(emp.name)}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 145 }}>{emp.name}</div>
                        {emp.lavozim && <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.lavozim}</div>}
                      </div>
                    </div>
                  </td>
                  {/* Day cells */}
                  {days.map((d, di) => {
                    const today = isToday(d)
                    return (
                      <td key={di} style={{ padding: '10px 8px', textAlign: 'center', borderLeft: '1px solid #f1f5f9', background: today ? '#f8fbff' : 'transparent', verticalAlign: 'middle' }}>
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
        <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {[
            { color: '#16a34a', bg: '#dcfce7', label: "O'z vaqtida keldi" },
            { color: '#f59e0b', bg: '#fef3c7', label: 'Kech keldi' },
            { color: '#94a3b8', bg: '#f1f5f9', label: "Kelmadi / Ma'lumot yo'q" },
            { color: '#d1d5db', bg: '#f9fafb', label: 'Rejalashtirilgan vaqt' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: 10, height: 10, borderRadius: '3px', background: l.bg, border: `1.5px solid ${l.color}` }} />
              <span style={{ fontSize: '11px', color: '#64748b' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
