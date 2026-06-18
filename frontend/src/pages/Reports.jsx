import { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Users } from 'lucide-react'
import { API_URL, TOKEN } from '../config'

const MONTHS = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr']

function Donut({ pct, color, trackColor = '#f1f5f9', size = 130, stroke = 12 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const dash = Math.max(0, Math.min(1, pct / 100)) * circ
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
    </svg>
  )
}

function DonutCard({ label, pct, count, total, color, trackColor }) {
  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', boxShadow: '0 1px 4px #0f172a06' }}>
      <div style={{ position: 'relative', width: 130, height: 130 }}>
        <Donut pct={pct} color={color} trackColor={trackColor} size={130} stroke={13} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '24px', fontWeight: 800, color, lineHeight: 1.1 }}>{pct}%</span>
          <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{count} kishi</span>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>{label}</div>
        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
          {total > 0 ? `${total} kun ichida` : '—'}
        </div>
      </div>
    </div>
  )
}

function Avatar({ name, size = 44 }) {
  const initials = (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const colors = ['#2563eb','#7c3aed','#059669','#d97706','#dc2626','#0891b2']
  const color = colors[(name || '').length % colors.length]
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: size * 0.3, flexShrink: 0 }}>
      {initials}
    </div>
  )
}

function RankBadge({ rank }) {
  const bg = rank === 1 ? '#fbbf24' : rank === 2 ? '#94a3b8' : rank === 3 ? '#cd7c2f' : '#e2e8f0'
  const color = rank <= 3 ? '#fff' : '#64748b'
  return (
    <div style={{ position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderRadius: '50%', background: bg, color, fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #fff' }}>
      {rank}
    </div>
  )
}

export default function Reports({ groups = [] }) {
  const now = new Date()
  const [year, setYear]       = useState(now.getFullYear())
  const [monthIdx, setMonthIdx] = useState(now.getMonth())
  const [orgFilter, setOrgFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('late')
  const [allDays, setAllDays] = useState([])
  const [loading, setLoading] = useState(true)

  const multiOrg        = groups.length > 1
  const visibleGroupIds = groups.map(g => g.id)
  const getWorkStart    = (gid) => groups.find(g => g.id === gid)?.work_start  || '09:00'
  const getWorkBegin    = (gid) => groups.find(g => g.id === gid)?.work_begin  || '06:00'
  const getWorkDays     = (gid) => (groups.find(g => g.id === gid)?.work_days  || '1,2,3,4,5,6').split(',').filter(Boolean)
  const getGrace        = (gid) => groups.find(g => g.id === gid)?.grace_minutes ?? 0

  const addMinutes = (t, min) => {
    const [h, m] = t.split(':').map(Number)
    const total = h * 60 + m + Number(min)
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
  }

  const isWorkDay = (dateStr, gid) => {
    const d = new Date(dateStr)
    const dow = String(d.getDay()) // 0=yakshanba, 1=dushanba...
    return getWorkDays(gid).includes(dow)
  }

  const prevMonth = () => {
    if (monthIdx === 0) { setMonthIdx(11); setYear(y => y - 1) }
    else setMonthIdx(m => m - 1)
  }
  const nextMonth = () => {
    const isCurrentMonth = year === now.getFullYear() && monthIdx === now.getMonth()
    if (isCurrentMonth) return
    if (monthIdx === 11) { setMonthIdx(0); setYear(y => y + 1) }
    else setMonthIdx(m => m + 1)
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const daysInMonth = new Date(year, monthIdx + 1, 0).getDate()
      const lastDay = (year === now.getFullYear() && monthIdx === now.getMonth())
        ? now.getDate() : daysInMonth
      const days = Array.from({ length: lastDay }, (_, i) =>
        `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`)

      const results = await Promise.all(days.map(async d => {
        try {
          const res = await fetch(`${API_URL}/attendance?date=${d}`, { headers: { 'X-API-Token': TOKEN } })
          const json = await res.json()
          return { date: d, rows: json.attendance || [] }
        } catch { return { date: d, rows: [] } }
      }))
      setAllDays(results)
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, monthIdx, visibleGroupIds.join(',')])

  const { empMap, totalDays, totalEmps } = useMemo(() => {
    const filtered = allDays.map(({ date, rows }) => ({
      date,
      rows: rows.filter(r =>
        visibleGroupIds.includes(r.group_id) &&
        (orgFilter === 'all' || r.group_id === orgFilter)
      )
    }))
    const days = filtered.filter(d => d.rows.length > 0).length || filtered.length

    const map = {}
    filtered.forEach(({ date, rows }) => {
      rows.forEach(r => {
        if (!isWorkDay(date, r.group_id)) return
        if (!map[r.employee_id]) map[r.employee_id] = { name: r.name, group_id: r.group_id, ontime: 0, late: 0, absent: 0 }
        const fi  = r.first_in
        const wb  = getWorkBegin(r.group_id)
        const ws  = getWorkStart(r.group_id)
        const lateThreshold = addMinutes(ws, getGrace(r.group_id))
        const eff = fi && fi >= wb ? fi : null
        if (!eff) map[r.employee_id].absent++
        else if (eff > lateThreshold) map[r.employee_id].late++
        else map[r.employee_id].ontime++
      })
    })
    return { empMap: map, totalDays: days, totalEmps: Object.keys(map).length }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDays, orgFilter])

  const empList = Object.values(empMap)

  // Umumiy sanlar
  const totalOntime = empList.reduce((s, e) => s + e.ontime, 0)
  const totalLate   = empList.reduce((s, e) => s + e.late,   0)
  const totalAbsent = empList.reduce((s, e) => s + e.absent, 0)
  const grandTotal  = totalOntime + totalLate + totalAbsent || 1

  const pctOntime = Math.round(totalOntime / grandTotal * 100)
  const pctLate   = Math.round(totalLate   / grandTotal * 100)
  const pctAbsent = Math.round(totalAbsent / grandTotal * 100)

  // Har bir xodim uchun o'rtacha
  const avgOntimeDays  = totalEmps ? (totalOntime / totalEmps).toFixed(1) : 0
  const avgLateDays    = totalEmps ? (totalLate   / totalEmps).toFixed(1) : 0
  const avgAbsentDays  = totalEmps ? (totalAbsent / totalEmps).toFixed(1) : 0

  // TOP-10 tab ma'lumotlari
  const tabs = [
    { key: 'late',   label: 'Kech keldi',  color: '#f59e0b', sort: e => -e.late,   val: e => `${e.late} kun` },
    { key: 'absent', label: 'Kelmadi',     color: '#ef4444', sort: e => -e.absent, val: e => `${e.absent} kun` },
    { key: 'ontime', label: "O'z vaqtida", color: '#22c55e', sort: e => -e.ontime, val: e => `${e.ontime} kun` },
  ]
  const activeTabInfo = tabs.find(t => t.key === activeTab)
  const topList = [...empList].sort(activeTabInfo.sort).slice(0, 10)

  const isCurrentMonth = year === now.getFullYear() && monthIdx === now.getMonth()

  return (
    <div>
      {/* ── HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={prevMonth} style={{ width: 32, height: 32, borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            <ChevronLeft size={16} />
          </button>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
            {MONTHS[monthIdx]} {year}
          </h1>
          <button onClick={nextMonth} style={{ width: 32, height: 32, borderRadius: '8px', border: '1px solid #e2e8f0', background: isCurrentMonth ? '#f8fafc' : '#fff', cursor: isCurrentMonth ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isCurrentMonth ? '#cbd5e1' : '#64748b' }}>
            <ChevronRight size={16} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', background: '#eff6ff', borderRadius: '20px', fontSize: '13px', fontWeight: 600, color: '#2563eb' }}>
            <Users size={13} /> {totalEmps} xodim
          </div>
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

      {loading ? (
        <div style={{ padding: '80px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>⏳</div>
          Ma'lumotlar yuklanmoqda...
        </div>
      ) : (<>

        {/* ── DONUT + O'RTACHA ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1.2fr', gap: '14px', marginBottom: '20px' }}>
          <DonutCard label="O'z vaqtida" pct={pctOntime} count={Math.round(totalOntime / (totalDays || 1))} total={totalDays} color="#2563eb" trackColor="#dbeafe" />
          <DonutCard label="Kelmadi"     pct={pctAbsent} count={Math.round(totalAbsent / (totalDays || 1))} total={totalDays} color="#ef4444" trackColor="#fee2e2" />
          <DonutCard label="Kech keldi"  pct={pctLate}   count={Math.round(totalLate / (totalDays || 1))}   total={totalDays} color="#f59e0b" trackColor="#fef3c7" />

          {/* O'rtacha panel */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px 22px', boxShadow: '0 1px 4px #0f172a06' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '16px' }}>Har bir xodimga o'rtacha / oy</div>
            {[
              { label: "O'z vaqtida",  val: `${avgOntimeDays} kun`, color: '#2563eb', bg: '#eff6ff' },
              { label: 'Kech keldi',   val: `${avgLateDays} kun`,   color: '#f59e0b', bg: '#fef3c7' },
              { label: 'Kelmadi',      val: `${avgAbsentDays} kun`, color: '#ef4444', bg: '#fee2e2' },
              { label: 'Ish kunlari',  val: `${totalDays} kun`,     color: '#64748b', bg: '#f1f5f9' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>{r.label}</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: r.color, background: r.bg, padding: '2px 10px', borderRadius: '20px' }}>{r.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── TOP-10 REYTING ── */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px #0f172a06' }}>
          {/* Header */}
          <div style={{ padding: '18px 22px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
              TOP-10 Reyting
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {tabs.map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                  padding: '6px 14px', borderRadius: '20px', border: '1.5px solid',
                  borderColor: activeTab === t.key ? t.color : '#e2e8f0',
                  background: activeTab === t.key ? t.color : '#fff',
                  color: activeTab === t.key ? '#fff' : '#64748b',
                  fontSize: '13px', fontWeight: activeTab === t.key ? 600 : 400, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards */}
          <div style={{ padding: '16px 22px', display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '20px' }}>
            {topList.length === 0 ? (
              <div style={{ padding: '24px', color: '#94a3b8', fontSize: '13px' }}>Ma'lumot yo'q</div>
            ) : topList.map((emp, i) => (
              <div key={emp.name} style={{
                flexShrink: 0, width: '110px',
                background: i === 0 ? '#fffbeb' : '#f8fafc',
                border: `1.5px solid ${i === 0 ? '#fde68a' : '#e2e8f0'}`,
                borderRadius: '14px', padding: '16px 12px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                transition: 'transform 0.15s',
              }}>
                <div style={{ position: 'relative' }}>
                  <Avatar name={emp.name} size={48} />
                  <RankBadge rank={i + 1} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a', lineHeight: 1.3 }}>
                    {(emp.name || '').split(' ')[0]}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '1px' }}>
                    {(emp.name || '').split(' ').slice(1).join(' ')}
                  </div>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: activeTabInfo.color }}>
                  {activeTabInfo.val(emp)}
                </div>
              </div>
            ))}
          </div>

          {/* Table view */}
          <div style={{ borderTop: '1px solid #f1f5f9' }}>
            {topList.map((emp, i) => (
              <div key={emp.name + i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 22px', borderBottom: i < topList.length - 1 ? '1px solid #f8fafc' : 'none', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: i < 3 ? activeTabInfo.color : '#94a3b8', minWidth: '22px' }}>{i + 1}</span>
                <Avatar name={emp.name} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.name}</div>
                  {multiOrg && <div style={{ fontSize: '11px', color: '#94a3b8' }}>{groups.find(g => g.id === emp.group_id)?.name || ''}</div>}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', fontWeight: 600 }}>{emp.ontime}✓</span>
                  <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', background: '#fef3c7', color: '#d97706', fontWeight: 600 }}>{emp.late}⚡</span>
                  <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', background: '#fee2e2', color: '#dc2626', fontWeight: 600 }}>{emp.absent}✗</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </>)}
    </div>
  )
}
