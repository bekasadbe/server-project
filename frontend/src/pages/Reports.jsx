import { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Users, CheckCircle2, Clock, XCircle, LogOut, Trophy, Sunrise } from 'lucide-react'
import { API_URL, TOKEN } from '../config'

const MONTHS = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr']

const AVATAR_COLORS = ['#2B6CB0','#7c3aed','#0f766e','#b45309','#be123c','#0891b2','#4338ca']
function avatarColor(name) { return AVATAR_COLORS[(name || '').charCodeAt(0) % AVATAR_COLORS.length] }

function Avatar({ name, size = 32 }) {
  const initials = (name || '?').split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase()
  return (
    <div className="flex items-center justify-center text-white font-bold shrink-0"
      style={{ width: size, height: size, borderRadius: '50%', background: avatarColor(name), fontSize: size * 0.35 }}>
      {initials}
    </div>
  )
}

const RANK_STYLE = [
  { ring: 'ring-2 ring-amber-400',  badge: 'bg-amber-400',  num: 'text-amber-500',  bg: 'bg-amber-50',  label: '🥇' },
  { ring: 'ring-2 ring-slate-400',  badge: 'bg-slate-400',  num: 'text-slate-400',  bg: 'bg-slate-50',  label: '🥈' },
  { ring: 'ring-2 ring-orange-400', badge: 'bg-orange-400', num: 'text-orange-400', bg: 'bg-orange-50', label: '🥉' },
]

const STAT_CARDS = [
  { key: 'ontime',   label: "O'z vaqtida", icon: CheckCircle2, iconCls: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-100', num: t => t.pctOntime, sub: t => `${t.avgOntime} kun / xodim` },
  { key: 'late',     label: 'Kech keldi',  icon: Clock,        iconCls: 'text-amber-500',  bg: 'bg-amber-50',  border: 'border-amber-100', num: t => t.pctLate,   sub: t => `${t.avgLate} kun / xodim`   },
  { key: 'absent',   label: 'Kelmadi',     icon: XCircle,      iconCls: 'text-red-500',    bg: 'bg-red-50',    border: 'border-red-100',   num: t => t.pctAbsent, sub: t => `${t.avgAbsent} kun / xodim` },
  { key: 'earlyOut', label: 'Erta ketdi',  icon: LogOut,       iconCls: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100',num: t => t.pctEarly,  sub: t => `${t.avgEarly} kun / xodim`  },
]

// "HH:MM" → daqiqaga aylantirish
function timeToMin(t) {
  if (!t) return null
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}
function minToTime(min) {
  if (min == null) return '—'
  return `${String(Math.floor(min/60)).padStart(2,'0')}:${String(min%60).padStart(2,'0')}`
}

export default function Reports({ groups = [] }) {
  const now = new Date()
  const [year, setYear]           = useState(now.getFullYear())
  const [monthIdx, setMonthIdx]   = useState(now.getMonth())
  const [orgFilter, setOrgFilter] = useState('all')
  const [allDays, setAllDays]     = useState([])
  const [loading, setLoading]     = useState(true)

  const multiOrg        = groups.length > 1
  const visibleGroupIds = groups.map(g => g.id)
  const getWorkStart  = (gid) => groups.find(g => g.id === gid)?.work_start  || '09:00'
  const getWorkFinish = (gid) => groups.find(g => g.id === gid)?.work_finish || '18:00'
  const getWorkBegin  = (gid) => groups.find(g => g.id === gid)?.work_begin  || '06:00'
  const getWorkDays   = (gid) => (groups.find(g => g.id === gid)?.work_days  || '1,2,3,4,5,6').split(',').filter(Boolean)
  const getGrace      = (gid) => groups.find(g => g.id === gid)?.grace_minutes ?? 0

  const addMinutes = (t, min) => {
    const [h, m] = t.split(':').map(Number)
    const total = h*60+m+Number(min)
    return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`
  }
  const isWorkDay = (dateStr, gid) => getWorkDays(gid).includes(String(new Date(dateStr).getDay()))
  const isCurrentMonth = year === now.getFullYear() && monthIdx === now.getMonth()
  const prevMonth = () => { if (monthIdx === 0) { setMonthIdx(11); setYear(y=>y-1) } else setMonthIdx(m=>m-1) }
  const nextMonth = () => { if (isCurrentMonth) return; if (monthIdx===11) { setMonthIdx(0); setYear(y=>y+1) } else setMonthIdx(m=>m+1) }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const daysInMonth = new Date(year, monthIdx+1, 0).getDate()
      const lastDay     = isCurrentMonth ? now.getDate() : daysInMonth
      const days = Array.from({length: lastDay}, (_,i) => `${year}-${String(monthIdx+1).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`)
      const results = await Promise.all(days.map(async d => {
        try { const r = await fetch(`${API_URL}/attendance?date=${d}`, {headers:{'X-API-Token':TOKEN}}); const j = await r.json(); return {date:d, rows:j.attendance||[]} }
        catch { return {date:d, rows:[]} }
      }))
      setAllDays(results); setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, monthIdx, visibleGroupIds.join(',')])

  const { empMap, totalDays } = useMemo(() => {
    const filtered = allDays.map(({date, rows}) => ({
      date,
      rows: rows.filter(r => visibleGroupIds.includes(r.group_id) && (orgFilter==='all' || r.group_id===orgFilter))
    }))
    const days = filtered.filter(d => d.rows.length>0).length || filtered.length
    const map  = {}
    filtered.forEach(({date, rows}) => {
      rows.forEach(r => {
        if (!isWorkDay(date, r.group_id)) return
        if (!map[r.employee_id]) map[r.employee_id] = {
          name: r.name, group_id: r.group_id,
          ontime: 0, late: 0, absent: 0, earlyOut: 0,
          inTimes: []  // erta kelish uchun
        }
        const wb  = getWorkBegin(r.group_id)
        const ws  = getWorkStart(r.group_id)
        const wf  = getWorkFinish(r.group_id)
        const lt  = addMinutes(ws, getGrace(r.group_id))
        const eff = r.first_in && r.first_in >= wb ? r.first_in : null
        if (!eff)        map[r.employee_id].absent++
        else if (eff > lt) map[r.employee_id].late++
        else             map[r.employee_id].ontime++
        if (r.last_out && r.last_out < wf) map[r.employee_id].earlyOut++
        // erta kelish vaqtini yig'ish (faqat kelgan kunlar)
        if (eff) {
          const min = timeToMin(eff)
          if (min != null) map[r.employee_id].inTimes.push(min)
        }
      })
    })
    // O'rtacha kelish vaqtini hisoblash
    Object.values(map).forEach(e => {
      e.avgInMin = e.inTimes.length > 0
        ? Math.round(e.inTimes.reduce((s,v)=>s+v,0) / e.inTimes.length)
        : null
      e.presentDays = e.inTimes.length
    })
    return { empMap: map, totalDays: days }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDays, orgFilter])

  const empList       = Object.values(empMap)
  const totalEmps     = empList.length
  const totalOntime   = empList.reduce((s,e)=>s+e.ontime,   0)
  const totalLate     = empList.reduce((s,e)=>s+e.late,     0)
  const totalAbsent   = empList.reduce((s,e)=>s+e.absent,   0)
  const totalEarlyOut = empList.reduce((s,e)=>s+e.earlyOut, 0)
  const grandTotal    = totalOntime+totalLate+totalAbsent || 1

  const stats = {
    pctOntime: Math.round(totalOntime  /grandTotal*100),
    pctLate:   Math.round(totalLate    /grandTotal*100),
    pctAbsent: Math.round(totalAbsent  /grandTotal*100),
    pctEarly:  Math.round(totalEarlyOut/grandTotal*100),
    avgOntime: totalEmps ? (totalOntime   /totalEmps).toFixed(1) : 0,
    avgLate:   totalEmps ? (totalLate     /totalEmps).toFixed(1) : 0,
    avgAbsent: totalEmps ? (totalAbsent   /totalEmps).toFixed(1) : 0,
    avgEarly:  totalEmps ? (totalEarlyOut /totalEmps).toFixed(1) : 0,
  }

  // Erta keluvchilar: o'rtacha kelish vaqti eng kichik (kamida 3 kun kelgan)
  const earlyList = [...empList]
    .filter(e => e.avgInMin != null && e.presentDays >= 3)
    .sort((a, b) => a.avgInMin - b.avgInMin)
    .slice(0, 10)

  const podium = earlyList.slice(0, 3)
  const rest   = earlyList.slice(3)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="w-8 h-8 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-50 transition-colors">
            <ChevronLeft size={16}/>
          </button>
          <h1 className="m-0 text-[22px] font-bold text-slate-900">{MONTHS[monthIdx]} {year}</h1>
          <button onClick={nextMonth}
            className={`w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center transition-colors ${isCurrentMonth ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-white text-slate-500 cursor-pointer hover:bg-slate-50'}`}>
            <ChevronRight size={16}/>
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-50 rounded-full text-[13px] font-semibold text-brand-600 ml-1">
            <Users size={13}/> {totalEmps} xodim
          </div>
        </div>
        {multiOrg && (
          <div className="flex gap-1.5 flex-wrap">
            {[{id:'all',name:'Hammasi'}, ...groups].map(g => (
              <button key={g.id} onClick={() => setOrgFilter(g.id)}
                className={`px-3.5 py-1.5 rounded-xl border text-[13px] cursor-pointer transition-colors ${orgFilter===g.id ? 'bg-brand-50 border-brand-600 text-brand-600 font-semibold' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                {g.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-24 text-center text-slate-400 text-[14px]">Yuklanmoqda…</div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {STAT_CARDS.map(c => {
              const Icon = c.icon
              return (
                <div key={c.key} className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
                  <div className={`w-10 h-10 rounded-xl ${c.bg} ${c.border} border flex items-center justify-center mb-3`}>
                    <Icon size={18} className={c.iconCls}/>
                  </div>
                  <div className="text-[28px] font-extrabold text-slate-900 leading-none mb-1">{c.num(stats)}%</div>
                  <div className="text-[13px] font-semibold text-slate-700 mb-0.5">{c.label}</div>
                  <div className="text-[12px] text-slate-400">{c.sub(stats)}</div>
                </div>
              )
            })}
          </div>

          {/* Erta keluvchilar reyting */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
            {/* Section header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                <Sunrise size={17} className="text-amber-500"/>
              </div>
              <div>
                <div className="text-[15px] font-bold text-slate-900">Eng erta keluvchilar</div>
                <div className="text-[12px] text-slate-400">O'rtacha kelish vaqti bo'yicha · kamida 3 kun kelgan</div>
              </div>
              <div className="ml-auto flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full text-[12px] font-semibold text-amber-600">
                <Trophy size={12}/> TOP {earlyList.length}
              </div>
            </div>

            {earlyList.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-[13px]">Ma'lumot yetarli emas</div>
            ) : (
              <>
                {/* Podium — top 3 */}
                <div className="flex items-end justify-center gap-4 px-8 pt-8 pb-6 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
                  {/* 2-o'rin chapda */}
                  {podium[1] && (
                    <div className="flex flex-col items-center gap-2 flex-1 max-w-[160px]">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">2-o'rin</div>
                      <div className={`${RANK_STYLE[1].ring} rounded-full`}>
                        <Avatar name={podium[1].name} size={52}/>
                      </div>
                      <div className="text-center">
                        <div className="text-[13px] font-bold text-slate-900 leading-tight">{podium[1].name.split(' ')[0]}</div>
                        <div className="text-[11px] text-slate-400">{podium[1].name.split(' ').slice(1).join(' ')}</div>
                        {multiOrg && <div className="text-[10px] text-slate-300 mt-0.5">{groups.find(g=>g.id===podium[1].group_id)?.name}</div>}
                      </div>
                      <div className="bg-slate-100 rounded-xl px-4 py-2 text-center w-full">
                        <div className="text-[18px] font-extrabold text-slate-700 font-mono">{minToTime(podium[1].avgInMin)}</div>
                        <div className="text-[10px] text-slate-400">{podium[1].presentDays} kun o'rtacha</div>
                      </div>
                      <div className="w-full h-16 bg-slate-200 rounded-t-xl flex items-center justify-center">
                        <span className="text-[22px]">🥈</span>
                      </div>
                    </div>
                  )}

                  {/* 1-o'rin o'rtada, balandroq */}
                  {podium[0] && (
                    <div className="flex flex-col items-center gap-2 flex-1 max-w-[180px]">
                      <div className="text-[11px] font-bold text-amber-500 uppercase tracking-wider mb-1">1-o'rin</div>
                      <div className={`${RANK_STYLE[0].ring} rounded-full shadow-lg`}>
                        <Avatar name={podium[0].name} size={64}/>
                      </div>
                      <div className="text-center">
                        <div className="text-[14px] font-bold text-slate-900 leading-tight">{podium[0].name.split(' ')[0]}</div>
                        <div className="text-[11px] text-slate-400">{podium[0].name.split(' ').slice(1).join(' ')}</div>
                        {multiOrg && <div className="text-[10px] text-slate-300 mt-0.5">{groups.find(g=>g.id===podium[0].group_id)?.name}</div>}
                      </div>
                      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-center w-full">
                        <div className="text-[22px] font-extrabold text-amber-600 font-mono">{minToTime(podium[0].avgInMin)}</div>
                        <div className="text-[10px] text-amber-400">{podium[0].presentDays} kun o'rtacha</div>
                      </div>
                      <div className="w-full h-24 bg-amber-400 rounded-t-xl flex items-center justify-center">
                        <span className="text-[26px]">🥇</span>
                      </div>
                    </div>
                  )}

                  {/* 3-o'rin o'ngda */}
                  {podium[2] && (
                    <div className="flex flex-col items-center gap-2 flex-1 max-w-[160px]">
                      <div className="text-[11px] font-bold text-orange-400 uppercase tracking-wider mb-1">3-o'rin</div>
                      <div className={`${RANK_STYLE[2].ring} rounded-full`}>
                        <Avatar name={podium[2].name} size={52}/>
                      </div>
                      <div className="text-center">
                        <div className="text-[13px] font-bold text-slate-900 leading-tight">{podium[2].name.split(' ')[0]}</div>
                        <div className="text-[11px] text-slate-400">{podium[2].name.split(' ').slice(1).join(' ')}</div>
                        {multiOrg && <div className="text-[10px] text-slate-300 mt-0.5">{groups.find(g=>g.id===podium[2].group_id)?.name}</div>}
                      </div>
                      <div className="bg-orange-50 rounded-xl px-4 py-2 text-center w-full">
                        <div className="text-[18px] font-extrabold text-orange-500 font-mono">{minToTime(podium[2].avgInMin)}</div>
                        <div className="text-[10px] text-orange-300">{podium[2].presentDays} kun o'rtacha</div>
                      </div>
                      <div className="w-full h-10 bg-orange-300 rounded-t-xl flex items-center justify-center">
                        <span className="text-[20px]">🥉</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4-10 qator */}
                {rest.length > 0 && (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-5 py-2.5 text-left text-[12px] text-slate-400 font-normal w-10">#</th>
                        <th className="px-4 py-2.5 text-left text-[12px] text-slate-400 font-normal">Xodim</th>
                        {multiOrg && <th className="px-4 py-2.5 text-left text-[12px] text-slate-400 font-normal">Tashkilot</th>}
                        <th className="px-4 py-2.5 text-center text-[12px] text-slate-400 font-normal">Kelgan kun</th>
                        <th className="px-4 py-2.5 text-center text-[12px] text-slate-400 font-normal">O'z vaqtida</th>
                        <th className="px-4 py-2.5 text-center text-[12px] text-slate-400 font-normal">Kech</th>
                        <th className="px-5 py-2.5 text-right text-[12px] text-slate-400 font-normal">O'rtacha kelish</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rest.map((emp, i) => (
                        <tr key={emp.name+i} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3">
                            <span className="text-[13px] font-bold text-slate-300">{i+4}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <Avatar name={emp.name} size={32}/>
                              <span className="text-[14px] font-medium text-slate-800">{emp.name}</span>
                            </div>
                          </td>
                          {multiOrg && <td className="px-4 py-3 text-[12px] text-slate-400">{groups.find(g=>g.id===emp.group_id)?.name||''}</td>}
                          <td className="px-4 py-3 text-center">
                            <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full bg-brand-50 text-brand-600">{emp.presentDays} kun</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-600">{emp.ontime} kun</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">{emp.late} kun</span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <span className="text-[15px] font-extrabold font-mono text-slate-700">{minToTime(emp.avgInMin)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}

            <div className="px-5 py-3 border-t border-slate-100 text-[12px] text-slate-400">
              <span className="font-semibold text-slate-600">{totalDays} ish kuni</span> ko'rib chiqildi · {totalEmps} xodim
            </div>
          </div>
        </>
      )}
    </div>
  )
}
