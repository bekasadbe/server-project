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
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function isFuture(d) {
  const today = new Date(); today.setHours(0,0,0,0)
  return d > today
}

function isToday(d) {
  const today = new Date(); today.setHours(0,0,0,0)
  return d.getTime() === today.getTime()
}

function Avatar({ name }) {
  const initials = (name || '?').split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase()
  const COLORS = ['#2B6CB0','#7c3aed','#0f766e','#b45309','#be123c','#0891b2','#4338ca']
  const bg = COLORS[(name || '').charCodeAt(0) % COLORS.length]
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-[12px] shrink-0" style={{ background: bg }}>
      {initials}
    </div>
  )
}

function Cell({ emp, day, dayData, leaves, groups }) {
  const getGroup       = (gid) => groups.find(g => g.id === gid)
  const getWorkDays    = (gid) => (getGroup(gid)?.work_days || '1,2,3,4,5,6').split(',').filter(Boolean)
  const addMin = (t, min) => {
    const [h, m] = t.split(':').map(Number)
    const total = h*60+m+Number(min)
    return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`
  }

  const ds     = toDateStr(day)
  const future = isFuture(day)
  const today  = isToday(day)
  const off    = !getWorkDays(emp.group_id).includes(String(day.getDay()))
  const rec    = dayData[ds]?.[emp.id]
  const leave  = leaves.find(l => l.employee_id === emp.id && l.start_date <= ds && l.end_date >= ds)
  const isWeekend = day.getDay() === 0 || day.getDay() === 6

  // Xodimning shaxsiy grafigi (backend attendance javobida allaqachon hisoblangan)
  // yoki emp/guruh fallback
  const g  = getGroup(emp.group_id)
  const ws = rec?.work_start    || emp.work_start    || g?.work_start    || '09:00'
  const wf = rec?.work_finish   || emp.work_finish    || g?.work_finish   || '18:00'
  const wb = rec?.work_begin    || emp.work_begin    || g?.work_begin    || '06:00'
  const grace = rec?.grace_minutes ?? emp.grace_minutes ?? g?.grace_minutes ?? 0

  // Ta'til / Kasallik
  if (leave) {
    const sick = leave.leave_type === 'sick'
    return (
      <div className={`mx-0.5 my-0.5 px-2.5 py-1.5 rounded-lg border border-slate-100 min-h-[52px] flex flex-col justify-center ${sick ? 'bg-purple-50/60' : 'bg-cyan-50/60'}`}>
        <div className={`flex items-center gap-1 text-[12px] font-medium ${sick ? 'text-purple-600' : 'text-cyan-600'}`}>
          {sick ? <Stethoscope size={11}/> : <Palmtree size={11}/>}
          {sick ? 'Kasallik' : "Ta'til"}
        </div>
      </div>
    )
  }

  // Ma'lumot bor
  if (rec && (rec.first_in || rec.last_out)) {
    const fi  = rec.first_in
    const lo  = rec.last_out
    const lt  = addMin(ws, grace)
    const eff = fi && fi >= wb ? fi : null
    const late     = eff && eff > lt
    const earlyOut = lo && lo < wf
    const inCls  = !eff ? 'text-slate-300' : late ? 'text-orange-500' : 'text-green-600'
    const outCls = earlyOut ? 'text-orange-500' : lo ? 'text-green-600' : 'text-slate-300'
    return (
      <div className="mx-0.5 my-0.5 px-2.5 py-1.5 rounded-lg border border-slate-100 bg-slate-50/60 min-h-[52px] flex flex-col justify-center">
        <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-0.5">
          {rec?.has_custom_schedule ? <span className="w-1 h-1 rounded-full bg-brand-500 shrink-0" title="Shaxsiy grafik"/> : null}
          {ws} — {wf}
        </div>
        <div className="flex items-center gap-1 text-[13px] font-semibold">
          <span className={inCls}>{eff || '—:——'}</span>
          <span className="text-slate-300">·</span>
          <span className={outCls}>{lo || '—:——'}</span>
        </div>
      </div>
    )
  }

  // Dam olish kuni
  if (off || (isWeekend && !rec)) {
    return (
      <div className="mx-0.5 my-0.5 px-2.5 py-1.5 rounded-lg border border-slate-100 bg-slate-50/40 min-h-[52px] flex flex-col justify-center">
        <div className="text-[12px] text-slate-300">Dam olish</div>
      </div>
    )
  }

  // Kelmadi / hali yo'q / rejalashtirilgan
  const textCls = today ? 'text-amber-500' : future ? 'text-slate-300' : 'text-red-500'
  const label   = today ? "hali yo'q" : future ? '—' : 'kelmadi'
  return (
    <div className="mx-0.5 my-0.5 px-2.5 py-1.5 rounded-lg border border-slate-100 bg-white min-h-[52px] flex flex-col justify-center">
      <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-0.5">
        {rec?.has_custom_schedule ? <span className="w-1 h-1 rounded-full bg-brand-500 shrink-0" title="Shaxsiy grafik"/> : null}
        {ws} — {wf}
      </div>
      <div className={`text-[12px] font-semibold ${textCls}`}>{label}</div>
    </div>
  )
}

export default function Jadvallar({ groups = [], employees = [] }) {
  const [monday, setMonday]       = useState(() => getMonday(new Date()))
  const [dayData, setDayData]     = useState({})
  const [leaves, setLeaves]       = useState([])
  const [loading, setLoading]     = useState(false)
  const [orgFilter, setOrgFilter] = useState('all')

  const multiOrg        = groups.length > 1
  const visibleGroupIds = groups.map(g => g.id)
  const days            = getWeekDays(monday)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const from = toDateStr(days[0])
      const to   = toDateStr(days[days.length - 1])
      const [attResults, leavesData] = await Promise.all([
        Promise.all(days.map(async d => {
          const ds = toDateStr(d)
          try {
            const res  = await fetch(`${API_URL}/attendance?date=${ds}`, { headers: { 'X-API-Token': TOKEN } })
            const json = await res.json()
            const map  = {}
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

  const prevWeek = () => { const m = new Date(monday); m.setDate(m.getDate()-7); setMonday(m) }
  const nextWeek = () => { const m = new Date(monday); m.setDate(m.getDate()+7); setMonday(m) }

  const filteredEmps = employees
    .filter(e => visibleGroupIds.includes(e.group_id) && (orgFilter === 'all' || e.group_id === orgFilter))
    .sort((a, b) => a.name.localeCompare(b.name))

  const weekLabel = () => {
    const last = days[days.length - 1]
    return `${days[0].getDate()} ${MONTH_SHORT[days[0].getMonth()]} — ${last.getDate()} ${MONTH_SHORT[last.getMonth()]} ${last.getFullYear()}`
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button onClick={prevWeek} className="w-8 h-8 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-50 transition-colors">
            <ChevronLeft size={16}/>
          </button>
          <div>
            <h1 className="m-0 text-[19px] font-bold text-slate-900">Jadvallar</h1>
            <p className="m-0 text-[12px] text-slate-400">{weekLabel()}</p>
          </div>
          <button onClick={nextWeek} className="w-8 h-8 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-50 transition-colors">
            <ChevronRight size={16}/>
          </button>
          <button onClick={() => setMonday(getMonday(new Date()))}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-500 text-[13px] cursor-pointer hover:bg-slate-50 transition-colors font-medium">
            Bu hafta
          </button>
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

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ tableLayout: 'fixed', minWidth: '900px' }}>
            <colgroup>
              <col style={{ width: '18%' }}/>
              {days.map((_, i) => <col key={i} style={{ width: `${82/7}%` }}/>)}
            </colgroup>
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 text-left border-r border-slate-100">
                  <span className="text-[12px] text-slate-400 font-normal">Ism Familiya</span>
                </th>
                {days.map((d, i) => {
                  const today  = isToday(d)
                  const isSun  = d.getDay() === 0
                  return (
                    <th key={i} className={`py-2.5 px-1 text-center border-l border-slate-100 ${today ? 'bg-brand-50' : ''}`}
                      style={{ borderBottom: today ? '2px solid #2B6CB0' : undefined }}>
                      <div className={`text-[11px] font-normal ${today ? 'text-brand-600' : isSun ? 'text-orange-500' : 'text-slate-400'}`}>{DAY_LABELS[i]}</div>
                      <div className={`text-[17px] font-semibold mt-0.5 ${today ? 'text-brand-600' : isSun ? 'text-orange-500' : 'text-slate-800'}`}>{d.getDate()}</div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="py-16 text-center text-slate-400 text-[13px]">Yuklanmoqda…</td></tr>
              ) : filteredEmps.length === 0 ? (
                <tr><td colSpan={8} className="py-16 text-center text-slate-400 text-[13px]">Xodimlar topilmadi</td></tr>
              ) : filteredEmps.map((emp, ri) => (
                <tr key={emp.id} className={`border-t border-slate-50 ${ri % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'}`}>
                  <td className="px-4 py-2 border-r border-slate-100 overflow-hidden">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={emp.name}/>
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium text-slate-800 truncate">{emp.name}</div>
                        {emp.lavozim && <div className="text-[11px] text-slate-400 truncate">{emp.lavozim}</div>}
                      </div>
                    </div>
                  </td>
                  {days.map((d, di) => {
                    const today   = isToday(d)
                    const isSun   = d.getDay() === 0
                    return (
                      <td key={di} className={`p-0 border-l border-slate-50 align-middle ${today ? 'bg-brand-50/30' : isSun ? 'bg-orange-50/30' : ''}`}>
                        <Cell emp={emp} day={d} dayData={dayData} leaves={leaves} groups={groups}/>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="px-4 py-3 border-t border-slate-100 flex gap-5 flex-wrap">
          {[
            { cls: 'bg-green-500',  label: "O'z vaqtida" },
            { cls: 'bg-orange-400', label: 'Kech / Erta ketdi' },
            { cls: 'bg-red-400',    label: 'Kelmadi' },
            { cls: 'bg-purple-500', label: 'Kasallik' },
            { cls: 'bg-cyan-500',   label: "Ta'til" },
            { cls: 'bg-slate-300',  label: 'Dam olish' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${l.cls}`}/>
              <span className="text-[11px] text-slate-500">{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
