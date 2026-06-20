import { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Users, CheckCircle2, Clock, XCircle, LogOut, Trophy, Sunrise, Timer } from 'lucide-react'
import { API_URL, TOKEN } from '../config'

const MONTHS = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr']

const AVATAR_COLORS = ['#2B6CB0','#7c3aed','#0f766e','#b45309','#be123c','#0891b2','#4338ca']
function avatarColor(name) { return AVATAR_COLORS[(name||'').charCodeAt(0) % AVATAR_COLORS.length] }

function Avatar({ name, size = 32 }) {
  const initials = (name||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()
  return (
    <div className="flex items-center justify-center text-white font-bold shrink-0"
      style={{ width:size, height:size, borderRadius:'50%', background:avatarColor(name), fontSize:size*0.35 }}>
      {initials}
    </div>
  )
}

function timeToMin(t) {
  if (!t) return null
  const [h,m] = t.split(':').map(Number)
  return h*60+m
}
function minToTime(min) {
  if (min==null) return '—'
  return `${String(Math.floor(min/60)).padStart(2,'0')}:${String(min%60).padStart(2,'0')}`
}
function minToHM(min) {
  if (!min || min<=0) return null
  return `${Math.floor(min/60)}s ${min%60}d`
}

const STAT_CARDS = [
  { key:'ontime',   label:"O'z vaqtida", icon:CheckCircle2, iconCls:'text-green-600',  bg:'bg-green-50',  border:'border-green-100',  num:t=>t.pctOntime, sub:t=>`${t.avgOntime} kun / xodim` },
  { key:'late',     label:'Kech keldi',  icon:Clock,        iconCls:'text-amber-500',  bg:'bg-amber-50',  border:'border-amber-100',  num:t=>t.pctLate,   sub:t=>`${t.avgLate} kun / xodim`   },
  { key:'absent',   label:'Kelmadi',     icon:XCircle,      iconCls:'text-red-500',    bg:'bg-red-50',    border:'border-red-100',    num:t=>t.pctAbsent, sub:t=>`${t.avgAbsent} kun / xodim` },
  { key:'earlyOut', label:'Erta ketdi',  icon:LogOut,       iconCls:'text-purple-600', bg:'bg-purple-50', border:'border-purple-100', num:t=>t.pctEarly,  sub:t=>`${t.avgEarly} kun / xodim`  },
]

function PodiumCard({ emp, rank, multiOrg, groups, valueNode, barH, barColor }) {
  const rs = [
    { ringColor:'#f59e0b', badgeColor:'#f59e0b', numColor:'text-amber-500',  avatarSize:64, medal:'🥇', titleSize:'text-[14px]' },
    { ringColor:'#94a3b8', badgeColor:'#94a3b8', numColor:'text-slate-400',  avatarSize:52, medal:'🥈', titleSize:'text-[13px]' },
    { ringColor:'#fb923c', badgeColor:'#fb923c', numColor:'text-orange-400', avatarSize:52, medal:'🥉', titleSize:'text-[13px]' },
  ][rank-1]

  return (
    <div className="flex flex-col items-center gap-2 flex-1 max-w-[160px]">
      <div className={`text-[11px] font-bold uppercase tracking-wider ${rs.numColor}`}>{rank}-o'rin</div>
      <div className="rounded-full" style={{ outline:`3px solid ${rs.ringColor}`, outlineOffset:'2px' }}>
        <Avatar name={emp.name} size={rs.avatarSize}/>
      </div>
      <div className="text-center">
        <div className={`${rs.titleSize} font-bold text-slate-900 leading-tight`}>{emp.name.split(' ')[0]}</div>
        <div className="text-[11px] text-slate-400">{emp.name.split(' ').slice(1).join(' ')}</div>
        {multiOrg && <div className="text-[10px] text-slate-300 mt-0.5">{groups.find(g=>g.id===emp.group_id)?.name}</div>}
      </div>
      {valueNode}
      <div className="w-full rounded-t-xl flex items-center justify-center text-[20px]" style={{ height:barH, background:barColor }}>
        {rs.medal}
      </div>
    </div>
  )
}

function RankingTable({ list, multiOrg, groups, startRank, valFn }) {
  if (!list.length) return null
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-slate-50">
          <th className="px-5 py-2.5 text-left text-[12px] text-slate-400 font-normal w-10">#</th>
          <th className="px-4 py-2.5 text-left text-[12px] text-slate-400 font-normal">Xodim</th>
          {multiOrg && <th className="px-4 py-2.5 text-left text-[12px] text-slate-400 font-normal">Tashkilot</th>}
          <th className="px-4 py-2.5 text-center text-[12px] text-slate-400 font-normal">Kelgan kun</th>
          <th className="px-4 py-2.5 text-center text-[12px] text-slate-400 font-normal">O'z vaqtida</th>
          <th className="px-4 py-2.5 text-center text-[12px] text-slate-400 font-normal">Kech</th>
          <th className="px-5 py-2.5 text-right text-[12px] text-slate-400 font-normal">{valFn.label}</th>
        </tr>
      </thead>
      <tbody>
        {list.map((emp,i) => (
          <tr key={emp.name+i} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
            <td className="px-5 py-3"><span className="text-[13px] font-bold text-slate-300">{startRank+i}</span></td>
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
              <span className="text-[15px] font-extrabold font-mono text-slate-700">{valFn.get(emp)}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
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
  const getWorkStart  = gid => groups.find(g=>g.id===gid)?.work_start  || '09:00'
  const getWorkFinish = gid => groups.find(g=>g.id===gid)?.work_finish || '18:00'
  const getWorkBegin  = gid => groups.find(g=>g.id===gid)?.work_begin  || '06:00'
  const getWorkDays   = gid => (groups.find(g=>g.id===gid)?.work_days  || '1,2,3,4,5,6').split(',').filter(Boolean)
  const getGrace      = gid => groups.find(g=>g.id===gid)?.grace_minutes ?? 0

  const addMinutes = (t,min) => {
    const [h,m] = t.split(':').map(Number)
    const total = h*60+m+Number(min)
    return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`
  }
  const isWorkDay = (dateStr,gid) => getWorkDays(gid).includes(String(new Date(dateStr).getDay()))
  const isCurrentMonth = year===now.getFullYear() && monthIdx===now.getMonth()
  const prevMonth = () => { if(monthIdx===0){setMonthIdx(11);setYear(y=>y-1)}else setMonthIdx(m=>m-1) }
  const nextMonth = () => { if(isCurrentMonth)return; if(monthIdx===11){setMonthIdx(0);setYear(y=>y+1)}else setMonthIdx(m=>m+1) }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const daysInMonth = new Date(year,monthIdx+1,0).getDate()
      const lastDay = isCurrentMonth ? now.getDate() : daysInMonth
      const days = Array.from({length:lastDay},(_,i)=>`${year}-${String(monthIdx+1).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`)
      const results = await Promise.all(days.map(async d => {
        try { const r=await fetch(`${API_URL}/attendance?date=${d}`,{headers:{'X-API-Token':TOKEN}}); const j=await r.json(); return {date:d,rows:j.attendance||[]} }
        catch { return {date:d,rows:[]} }
      }))
      setAllDays(results); setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, monthIdx, visibleGroupIds.join(',')])

  const { empMap, totalDays } = useMemo(() => {
    const filtered = allDays.map(({date,rows}) => ({
      date,
      rows: rows.filter(r => visibleGroupIds.includes(r.group_id) && (orgFilter==='all'||r.group_id===orgFilter))
    }))
    const days = filtered.filter(d=>d.rows.length>0).length || filtered.length
    const map  = {}
    filtered.forEach(({date,rows}) => {
      rows.forEach(r => {
        if (!isWorkDay(date,r.group_id)) return
        if (!map[r.employee_id]) map[r.employee_id] = {
          name:r.name, group_id:r.group_id,
          ontime:0, late:0, absent:0, earlyOut:0,
          inTimes:[], workedMins:0, presentDays:0
        }
        const wb  = getWorkBegin(r.group_id)
        const ws  = getWorkStart(r.group_id)
        const wf  = getWorkFinish(r.group_id)
        const lt  = addMinutes(ws, getGrace(r.group_id))
        const eff = r.first_in && r.first_in>=wb ? r.first_in : null
        if (!eff)         map[r.employee_id].absent++
        else if (eff>lt)  map[r.employee_id].late++
        else              map[r.employee_id].ontime++
        if (r.last_out && r.last_out<wf) map[r.employee_id].earlyOut++
        if (eff) {
          const min = timeToMin(eff)
          if (min!=null) { map[r.employee_id].inTimes.push(min); map[r.employee_id].presentDays++ }
          // ishlagan vaqt: last_out - eff
          if (r.last_out) {
            const worked = timeToMin(r.last_out) - min
            if (worked>0) map[r.employee_id].workedMins += worked
          }
        }
      })
    })
    Object.values(map).forEach(e => {
      e.avgInMin = e.inTimes.length>0
        ? Math.round(e.inTimes.reduce((s,v)=>s+v,0)/e.inTimes.length)
        : null
      e.avgWorkedMins = e.presentDays>0 ? Math.round(e.workedMins/e.presentDays) : 0
    })
    return { empMap:map, totalDays:days }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDays, orgFilter])

  // Reytinglar uchun ohirgi 7 ish kunidan hisoblash
  const rankingMap = useMemo(() => {
    const last7 = allDays.slice(-7)
    const filtered = last7.map(({date,rows}) => ({
      date,
      rows: rows.filter(r => visibleGroupIds.includes(r.group_id) && (orgFilter==='all'||r.group_id===orgFilter))
    }))
    const map = {}
    filtered.forEach(({date,rows}) => {
      rows.forEach(r => {
        if (!isWorkDay(date,r.group_id)) return
        if (!map[r.employee_id]) map[r.employee_id] = {
          name:r.name, group_id:r.group_id,
          ontime:0, late:0, absent:0,
          inTimes:[], workedMins:0, presentDays:0
        }
        const wb  = getWorkBegin(r.group_id)
        const ws  = getWorkStart(r.group_id)
        const wf  = getWorkFinish(r.group_id)
        const lt  = addMinutes(ws, getGrace(r.group_id))
        const eff = r.first_in && r.first_in>=wb ? r.first_in : null
        if (!eff)        map[r.employee_id].absent++
        else if (eff>lt) map[r.employee_id].late++
        else             map[r.employee_id].ontime++
        if (eff) {
          const min = timeToMin(eff)
          if (min!=null) { map[r.employee_id].inTimes.push(min); map[r.employee_id].presentDays++ }
          if (r.last_out) {
            const worked = timeToMin(r.last_out) - min
            if (worked>0) map[r.employee_id].workedMins += worked
          }
        }
      })
    })
    Object.values(map).forEach(e => {
      e.avgInMin = e.inTimes.length>0
        ? Math.round(e.inTimes.reduce((s,v)=>s+v,0)/e.inTimes.length)
        : null
    })
    return map
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDays, orgFilter])

  const rankList = Object.values(rankingMap)

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
    avgOntime: totalEmps ? (totalOntime  /totalEmps).toFixed(1):0,
    avgLate:   totalEmps ? (totalLate    /totalEmps).toFixed(1):0,
    avgAbsent: totalEmps ? (totalAbsent  /totalEmps).toFixed(1):0,
    avgEarly:  totalEmps ? (totalEarlyOut/totalEmps).toFixed(1):0,
  }

  // 1. Ko'p ishlagan (ohirgi 7 ish kuni)
  const workedList = [...rankList]
    .filter(e=>e.workedMins>0)
    .sort((a,b)=>b.workedMins-a.workedMins)
    .slice(0,10)

  // 2. Erta keluvchilar (ohirgi 7 ish kuni)
  const earlyList = [...rankList]
    .filter(e=>e.avgInMin!=null && e.presentDays>=2)
    .sort((a,b)=>a.avgInMin-b.avgInMin)
    .slice(0,10)

  const renderSection = ({ title, subtitle, icon: Icon, iconCls, iconBg, list, badge, barColors, valNode, valFn }) => {
    const podium = list.slice(0,3)
    const rest   = list.slice(3)
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden mb-6">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center`}>
            <Icon size={17} className={iconCls}/>
          </div>
          <div>
            <div className="text-[15px] font-bold text-slate-900">{title}</div>
            <div className="text-[12px] text-slate-400">{subtitle}</div>
          </div>
          <div className={`ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold ${badge}`}>
            <Trophy size={12}/> TOP {list.length}
          </div>
        </div>

        {list.length === 0 ? (
          <div className="py-14 text-center text-slate-400 text-[13px]">Ma'lumot yetarli emas</div>
        ) : (
          <>
            {/* Podium */}
            <div className="flex items-end justify-center gap-6 px-8 pt-8 pb-0 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
              {/* 2-o'rin */}
              {podium[1] && (
                <PodiumCard emp={podium[1]} rank={2} multiOrg={multiOrg} groups={groups}
                  barH={64} barColor={barColors[1]}
                  valueNode={
                    <div className="bg-slate-100 rounded-xl px-4 py-2 text-center w-full">
                      <div className="text-[18px] font-extrabold text-slate-700 font-mono">{valNode(podium[1])}</div>
                      <div className="text-[10px] text-slate-400">{podium[1].presentDays} kun</div>
                    </div>
                  }
                />
              )}
              {/* 1-o'rin */}
              {podium[0] && (
                <PodiumCard emp={podium[0]} rank={1} multiOrg={multiOrg} groups={groups}
                  barH={96} barColor={barColors[0]}
                  valueNode={
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-center w-full">
                      <div className="text-[22px] font-extrabold text-amber-600 font-mono">{valNode(podium[0])}</div>
                      <div className="text-[10px] text-amber-400">{podium[0].presentDays} kun</div>
                    </div>
                  }
                />
              )}
              {/* 3-o'rin */}
              {podium[2] && (
                <PodiumCard emp={podium[2]} rank={3} multiOrg={multiOrg} groups={groups}
                  barH={40} barColor={barColors[2]}
                  valueNode={
                    <div className="bg-orange-50 rounded-xl px-4 py-2 text-center w-full">
                      <div className="text-[18px] font-extrabold text-orange-500 font-mono">{valNode(podium[2])}</div>
                      <div className="text-[10px] text-orange-300">{podium[2].presentDays} kun</div>
                    </div>
                  }
                />
              )}
            </div>

            {/* 4-10 jadval */}
            {rest.length > 0 && (
              <RankingTable list={rest} multiOrg={multiOrg} groups={groups} startRank={4} valFn={valFn}/>
            )}
          </>
        )}

        <div className="px-5 py-3 border-t border-slate-100 text-[12px] text-slate-400">
          <span className="font-semibold text-slate-600">{totalDays} ish kuni</span> ko'rib chiqildi · {totalEmps} xodim
        </div>
      </div>
    )
  }

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
            className={`w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center transition-colors ${isCurrentMonth?'bg-slate-50 text-slate-300 cursor-not-allowed':'bg-white text-slate-500 cursor-pointer hover:bg-slate-50'}`}>
            <ChevronRight size={16}/>
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-50 rounded-full text-[13px] font-semibold text-brand-600 ml-1">
            <Users size={13}/> {totalEmps} xodim
          </div>
        </div>
        {multiOrg && (
          <div className="flex gap-1.5 flex-wrap">
            {[{id:'all',name:'Hammasi'},...groups].map(g=>(
              <button key={g.id} onClick={()=>setOrgFilter(g.id)}
                className={`px-3.5 py-1.5 rounded-xl border text-[13px] cursor-pointer transition-colors ${orgFilter===g.id?'bg-brand-50 border-brand-600 text-brand-600 font-semibold':'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
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

          {/* Ko'p ishlagan */}
          {renderSection({
            title: "Eng ko'p ishlagan",
            subtitle: "Ohirgi 7 ish kuni bo'yicha jami ishlagan vaqt",
            icon: Timer, iconCls: 'text-brand-600', iconBg: 'bg-brand-50 border border-brand-100',
            badge: 'bg-brand-50 text-brand-600',
            list: workedList,
            barColors: ['#2B6CB0','#90CDF4','#63B3ED'],
            valNode: emp => minToHM(emp.workedMins) || '—',
            valFn: { label: 'Jami ishladi', get: emp => minToHM(emp.workedMins)||'—' }
          })}

          {/* Erta keluvchilar */}
          {renderSection({
            title: 'Eng erta keluvchilar',
            subtitle: "Ohirgi 7 ish kuni bo'yicha o'rtacha kelish vaqti",
            icon: Sunrise, iconCls: 'text-amber-500', iconBg: 'bg-amber-50 border border-amber-100',
            badge: 'bg-amber-50 text-amber-600',
            list: earlyList,
            barColors: ['#fbbf24','#cbd5e1','#fdba74'],
            valNode: emp => minToTime(emp.avgInMin),
            valFn: { label: "O'rtacha kelish", get: emp => minToTime(emp.avgInMin) }
          })}
        </>
      )}
    </div>
  )
}
