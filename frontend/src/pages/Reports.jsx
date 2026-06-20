import { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Users } from 'lucide-react'
import { API_URL, TOKEN } from '../config'

const MONTHS = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr']

function Donut({ pct, color, trackColor = '#f1f5f9', size = 130, stroke = 12 }) {
  const r    = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const dash = Math.max(0, Math.min(1, pct / 100)) * circ
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"/>
    </svg>
  )
}

function DonutCard({ label, pct, count, total, color, trackColor }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 flex flex-col items-center gap-3">
      <div className="relative w-[130px] h-[130px]">
        <Donut pct={pct} color={color} trackColor={trackColor} size={130} stroke={13}/>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[24px] font-extrabold leading-none" style={{ color }}>{pct}%</span>
          <span className="text-[11px] text-slate-400 mt-0.5">{count} kishi</span>
        </div>
      </div>
      <div className="text-center">
        <div className="text-[14px] font-semibold text-slate-700">{label}</div>
        <div className="text-[12px] text-slate-400 mt-0.5">{total > 0 ? `${total} kun ichida` : '—'}</div>
      </div>
    </div>
  )
}

function Avatar({ name, size = 44 }) {
  const initials = (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const colors   = ['#2563eb','#7c3aed','#059669','#d97706','#dc2626','#0891b2']
  const color    = colors[(name || '').length % colors.length]
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: size * 0.3, flexShrink: 0 }}>
      {(name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
    </div>
  )
}

function RankBadge({ rank }) {
  const bg    = rank === 1 ? '#fbbf24' : rank === 2 ? '#94a3b8' : rank === 3 ? '#cd7c2f' : '#e2e8f0'
  const color = rank <= 3 ? '#fff' : '#64748b'
  return (
    <div style={{ position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderRadius: '50%', background: bg, color, fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #fff' }}>
      {rank}
    </div>
  )
}

export default function Reports({ groups = [] }) {
  const now = new Date()
  const [year, setYear]         = useState(now.getFullYear())
  const [monthIdx, setMonthIdx] = useState(now.getMonth())
  const [orgFilter, setOrgFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('late')
  const [allDays, setAllDays]   = useState([])
  const [loading, setLoading]   = useState(true)

  const multiOrg        = groups.length > 1
  const visibleGroupIds = groups.map(g => g.id)
  const getWorkStart  = (gid) => groups.find(g => g.id === gid)?.work_start    || '09:00'
  const getWorkFinish = (gid) => groups.find(g => g.id === gid)?.work_finish   || '18:00'
  const getWorkBegin  = (gid) => groups.find(g => g.id === gid)?.work_begin    || '06:00'
  const getWorkDays   = (gid) => (groups.find(g => g.id === gid)?.work_days    || '1,2,3,4,5,6').split(',').filter(Boolean)
  const getGrace      = (gid) => groups.find(g => g.id === gid)?.grace_minutes ?? 0

  const addMinutes = (t, min) => {
    const [h, m] = t.split(':').map(Number)
    const total = h * 60 + m + Number(min)
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
  }
  const isWorkDay = (dateStr, gid) => getWorkDays(gid).includes(String(new Date(dateStr).getDay()))

  const isCurrentMonth = year === now.getFullYear() && monthIdx === now.getMonth()
  const prevMonth = () => { if (monthIdx === 0) { setMonthIdx(11); setYear(y => y-1) } else setMonthIdx(m => m-1) }
  const nextMonth = () => { if (isCurrentMonth) return; if (monthIdx === 11) { setMonthIdx(0); setYear(y => y+1) } else setMonthIdx(m => m+1) }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const daysInMonth = new Date(year, monthIdx + 1, 0).getDate()
      const lastDay     = isCurrentMonth ? now.getDate() : daysInMonth
      const days        = Array.from({ length: lastDay }, (_, i) => `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`)
      const results = await Promise.all(days.map(async d => {
        try { const res = await fetch(`${API_URL}/attendance?date=${d}`, { headers: { 'X-API-Token': TOKEN } }); const json = await res.json(); return { date: d, rows: json.attendance || [] } }
        catch { return { date: d, rows: [] } }
      }))
      setAllDays(results); setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, monthIdx, visibleGroupIds.join(',')])

  const { empMap, totalDays, totalEmps } = useMemo(() => {
    const filtered = allDays.map(({ date, rows }) => ({ date, rows: rows.filter(r => visibleGroupIds.includes(r.group_id) && (orgFilter === 'all' || r.group_id === orgFilter)) }))
    const days = filtered.filter(d => d.rows.length > 0).length || filtered.length
    const map  = {}
    filtered.forEach(({ date, rows }) => {
      rows.forEach(r => {
        if (!isWorkDay(date, r.group_id)) return
        if (!map[r.employee_id]) map[r.employee_id] = { name: r.name, group_id: r.group_id, ontime: 0, late: 0, absent: 0, earlyOut: 0 }
        const eff = r.first_in && r.first_in >= getWorkBegin(r.group_id) ? r.first_in : null
        const lt  = addMinutes(getWorkStart(r.group_id), getGrace(r.group_id))
        if (!eff) map[r.employee_id].absent++
        else if (eff > lt) map[r.employee_id].late++
        else map[r.employee_id].ontime++
        if (r.last_out && r.last_out < getWorkFinish(r.group_id)) map[r.employee_id].earlyOut++
      })
    })
    return { empMap: map, totalDays: days, totalEmps: Object.keys(map).length }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDays, orgFilter])

  const empList      = Object.values(empMap)
  const totalOntime  = empList.reduce((s, e) => s + e.ontime,   0)
  const totalLate    = empList.reduce((s, e) => s + e.late,     0)
  const totalAbsent  = empList.reduce((s, e) => s + e.absent,   0)
  const totalEarlyOut= empList.reduce((s, e) => s + e.earlyOut, 0)
  const grandTotal   = totalOntime + totalLate + totalAbsent || 1
  const pctOntime    = Math.round(totalOntime / grandTotal * 100)
  const pctLate      = Math.round(totalLate   / grandTotal * 100)
  const pctAbsent    = Math.round(totalAbsent / grandTotal * 100)
  const avgOntimeDays   = totalEmps ? (totalOntime    / totalEmps).toFixed(1) : 0
  const avgLateDays     = totalEmps ? (totalLate      / totalEmps).toFixed(1) : 0
  const avgAbsentDays   = totalEmps ? (totalAbsent    / totalEmps).toFixed(1) : 0
  const avgEarlyOutDays = totalEmps ? (totalEarlyOut  / totalEmps).toFixed(1) : 0

  const tabs = [
    { key: 'late',     label: 'Kech keldi',  color: '#f59e0b', sort: e => -e.late,     val: e => `${e.late} kun`     },
    { key: 'absent',   label: 'Kelmadi',     color: '#ef4444', sort: e => -e.absent,   val: e => `${e.absent} kun`   },
    { key: 'earlyOut', label: 'Erta ketdi',  color: '#9333ea', sort: e => -e.earlyOut, val: e => `${e.earlyOut} kun` },
    { key: 'ontime',   label: "O'z vaqtida", color: '#22c55e', sort: e => -e.ontime,   val: e => `${e.ontime} kun`   },
  ]
  const activeTabInfo = tabs.find(t => t.key === activeTab)
  const topList = [...empList].sort(activeTabInfo.sort).slice(0, 10)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <button onClick={prevMonth} className="w-8 h-8 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-50 transition-colors">
            <ChevronLeft size={16}/>
          </button>
          <h1 className="m-0 text-[22px] font-extrabold text-slate-900">{MONTHS[monthIdx]} {year}</h1>
          <button onClick={nextMonth}
            className={`w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center transition-colors ${isCurrentMonth ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-white text-slate-500 cursor-pointer hover:bg-slate-50'}`}>
            <ChevronRight size={16}/>
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-50 rounded-full text-[13px] font-semibold text-brand-600">
            <Users size={13}/> {totalEmps} xodim
          </div>
        </div>
        {multiOrg && (
          <div className="flex gap-1.5 flex-wrap">
            {[{ id: 'all', name: 'Hammasi' }, ...groups].map(g => (
              <button key={g.id} onClick={() => setOrgFilter(g.id)}
                className={`px-3.5 py-1.5 rounded-xl border text-[13px] cursor-pointer transition-colors ${orgFilter === g.id ? 'bg-brand-50 border-brand-600 text-brand-600 font-semibold' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                {g.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="text-[28px] mb-2">⏳</div>
          Ma'lumotlar yuklanmoqda…
        </div>
      ) : (
        <>
          {/* Donut cards + avg */}
          <div className="grid gap-3.5 mb-5" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1.2fr' }}>
            <DonutCard label="O'z vaqtida" pct={pctOntime} count={Math.round(totalOntime/(totalDays||1))} total={totalDays} color="#2563eb" trackColor="#dbeafe"/>
            <DonutCard label="Kelmadi"     pct={pctAbsent} count={Math.round(totalAbsent/(totalDays||1))} total={totalDays} color="#ef4444" trackColor="#fee2e2"/>
            <DonutCard label="Kech keldi"  pct={pctLate}   count={Math.round(totalLate/(totalDays||1))}   total={totalDays} color="#f59e0b" trackColor="#fef3c7"/>
            <DonutCard label="Erta ketdi"  pct={Math.round(totalEarlyOut/grandTotal*100)} count={Math.round(totalEarlyOut/(totalDays||1))} total={totalDays} color="#9333ea" trackColor="#f3e8ff"/>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
              <p className="text-[13px] font-bold text-slate-700 mb-4 m-0">Har bir xodimga o'rtacha / oy</p>
              {[
                { label:"O'z vaqtida", val:`${avgOntimeDays} kun`,   color:'#2563eb', bg:'#eff6ff' },
                { label:'Kech keldi',  val:`${avgLateDays} kun`,     color:'#f59e0b', bg:'#fef3c7' },
                { label:'Kelmadi',     val:`${avgAbsentDays} kun`,   color:'#ef4444', bg:'#fee2e2' },
                { label:'Erta ketdi',  val:`${avgEarlyOutDays} kun`, color:'#9333ea', bg:'#f3e8ff' },
                { label:'Ish kunlari', val:`${totalDays} kun`,       color:'#64748b', bg:'#f1f5f9' },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between mb-2.5">
                  <span className="text-[13px] text-slate-500">{r.label}</span>
                  <span className="text-[13px] font-bold px-2.5 py-0.5 rounded-full" style={{ color: r.color, background: r.bg }}>{r.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* TOP-10 */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-wrap gap-2.5">
              <span className="text-[15px] font-bold text-slate-900">TOP-10 Reyting</span>
              <div className="flex gap-1.5">
                {tabs.map(t => (
                  <button key={t.key} onClick={() => setActiveTab(t.key)}
                    className="px-3.5 py-1 rounded-full border-2 text-[13px] cursor-pointer transition-all"
                    style={{ borderColor: activeTab === t.key ? t.color : '#e2e8f0', background: activeTab === t.key ? t.color : '#fff', color: activeTab === t.key ? '#fff' : '#64748b', fontWeight: activeTab === t.key ? 600 : 400 }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 px-5 py-4 overflow-x-auto pb-5">
              {topList.length === 0 ? (
                <p className="text-slate-400 text-[13px]">Ma'lumot yo'q</p>
              ) : topList.map((emp, i) => (
                <div key={emp.name} className="shrink-0 w-28 rounded-2xl border-2 p-4 flex flex-col items-center gap-2 transition-transform hover:-translate-y-1"
                  style={{ background: i === 0 ? '#fffbeb' : '#f8fafc', borderColor: i === 0 ? '#fde68a' : '#e2e8f0' }}>
                  <div className="relative">
                    <Avatar name={emp.name} size={48}/>
                    <RankBadge rank={i + 1}/>
                  </div>
                  <div className="text-center">
                    <div className="text-[12px] font-semibold text-slate-900 leading-tight">{(emp.name||'').split(' ')[0]}</div>
                    <div className="text-[11px] text-slate-400">{(emp.name||'').split(' ').slice(1).join(' ')}</div>
                  </div>
                  <div className="text-[14px] font-extrabold" style={{ color: activeTabInfo.color }}>{activeTabInfo.val(emp)}</div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100">
              {topList.map((emp, i) => (
                <div key={emp.name + i} className={`flex items-center gap-3 px-5 py-2.5 ${i < topList.length - 1 ? 'border-b border-slate-50' : ''} ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                  <span className="text-[13px] font-bold w-5 shrink-0" style={{ color: i < 3 ? activeTabInfo.color : '#94a3b8' }}>{i + 1}</span>
                  <Avatar name={emp.name} size={32}/>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-slate-800 truncate">{emp.name}</div>
                    {multiOrg && <div className="text-[11px] text-slate-400">{groups.find(g => g.id === emp.group_id)?.name || ''}</div>}
                  </div>
                  <div className="flex gap-1.5 shrink-0 flex-wrap">
                    <span className="text-[12px] px-2 py-0.5 rounded-xl bg-brand-50 text-brand-600 font-semibold">{emp.ontime}✓</span>
                    <span className="text-[12px] px-2 py-0.5 rounded-xl bg-amber-50 text-amber-600 font-semibold">{emp.late}⚡</span>
                    <span className="text-[12px] px-2 py-0.5 rounded-xl bg-red-50 text-red-600 font-semibold">{emp.absent}✗</span>
                    <span className="text-[12px] px-2 py-0.5 rounded-xl bg-purple-50 text-purple-600 font-semibold">{emp.earlyOut}↩</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
