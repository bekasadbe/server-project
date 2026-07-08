import { useState, useRef } from 'react'
import { Clock3, Search, Building2, X, RotateCcw } from 'lucide-react'
import { apiFetch } from '../config'

const GRACE_STEPS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]

function TimeInput({ refEl, value, onChange }) {
  return (
    <div className="relative inline-flex">
      <button onClick={() => refEl.current?.showPicker()} type="button"
        className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 text-[13px] font-mono font-semibold cursor-pointer hover:bg-slate-200/70 transition-colors tabular-nums">
        {value}
      </button>
      <input ref={refEl} type="time" value={value} onChange={e => onChange(e.target.value)}
        className="absolute opacity-0 pointer-events-none w-px h-px"/>
    </div>
  )
}

export default function WorkSchedule({ employees = [], groups = [], onReload }) {
  const [search, setSearch]     = useState('')
  const [orgFilter, setOrgFilter] = useState('all')
  const [editEmp, setEditEmp]   = useState(null)
  const [saving, setSaving]     = useState(false)

  const [workStart, setWorkStart]   = useState('09:00')
  const [workFinish, setWorkFinish] = useState('18:00')
  const [workBegin, setWorkBegin]   = useState('06:00')
  const [grace, setGrace]           = useState(0)

  const startRef  = useRef(null)
  const finishRef = useRef(null)
  const beginRef  = useRef(null)

  const multiOrg = groups.length > 1
  const getGroup = (gid) => groups.find(g => g.id === gid)

  const filtered = employees.filter(e => {
    const matchName = (e.name||'').toLowerCase().includes(search.toLowerCase()) || e.id.includes(search)
    const matchOrg  = orgFilter === 'all' || e.group_id === orgFilter
    return matchName && matchOrg
  })

  const effective = (e, field, fallback) => {
    if (field === 'work_start')  return e.work_start  || getGroup(e.group_id)?.work_start  || fallback
    if (field === 'work_finish') return e.work_finish || getGroup(e.group_id)?.work_finish || fallback
    if (field === 'work_begin')  return e.work_begin  || getGroup(e.group_id)?.work_begin  || fallback
    if (field === 'grace')       return e.grace_minutes ?? getGroup(e.group_id)?.grace_minutes ?? fallback
  }

  const hasCustom = (e) => !!(e.work_start || e.work_finish || e.work_begin || (e.grace_minutes !== null && e.grace_minutes !== undefined))

  const openEdit = (e) => {
    setEditEmp(e)
    setWorkStart(effective(e, 'work_start', '09:00'))
    setWorkFinish(effective(e, 'work_finish', '18:00'))
    setWorkBegin(effective(e, 'work_begin', '06:00'))
    setGrace(effective(e, 'grace', 0))
  }

  const cycleGrace = (dir) => {
    const idx = GRACE_STEPS.indexOf(Number(grace))
    const next = dir === 1 ? Math.min(idx + 1, GRACE_STEPS.length - 1) : Math.max(idx - 1, 0)
    setGrace(GRACE_STEPS[next])
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await apiFetch(`/employees/${editEmp.id}/schedule`, {
        method: 'PUT',
        body: JSON.stringify({ work_start: workStart, work_finish: workFinish, work_begin: workBegin, grace_minutes: grace }),
      })
      setEditEmp(null)
      onReload?.()
    } catch {}
    setSaving(false)
  }

  const handleResetToGroup = async () => {
    setSaving(true)
    try {
      await apiFetch(`/employees/${editEmp.id}/schedule`, {
        method: 'PUT',
        body: JSON.stringify({ work_start: null, work_finish: null, work_begin: null, grace_minutes: null }),
      })
      setEditEmp(null)
      onReload?.()
    } catch {}
    setSaving(false)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-[19px] font-bold text-slate-900 m-0">Ish grafigi</h1>
          <p className="text-[13px] text-slate-400 mt-0.5 mb-0">Xodimlarning shaxsiy ish vaqti — 0.5 stavka, kechki smena va h.k.</p>
        </div>
      </div>

      <div className="flex gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl mb-5 text-[13px] text-blue-700 leading-relaxed">
        Har bir xodim uchun standart (guruh) ish vaqtidan farqli grafik belgilashingiz mumkin. Masalan, tushdan keyin keladigan 0.5 stavka xodim uchun ish boshlanishini 14:00 qilib qo'ysangiz, u endi "kelmadi" deb hisoblanmaydi.
      </div>

      {/* Filters */}
      <div className="flex gap-2.5 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input placeholder="Ism yoki ID bo'yicha qidirish..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full py-2 pl-9 pr-3 bg-white border border-slate-200 rounded-lg text-slate-800 text-[13px] outline-none focus:border-brand-400 transition-colors"/>
        </div>
        {multiOrg && (
          <div className="flex gap-1.5 flex-wrap">
            {[{ id: 'all', name: 'Hammasi' }, ...groups].map(g => (
              <button key={g.id} onClick={() => setOrgFilter(g.id)}
                className={`px-3 py-1.5 rounded-lg border text-[12px] cursor-pointer transition-colors ${orgFilter === g.id ? 'bg-brand-50 border-brand-300 text-brand-600 font-semibold' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                {g.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{minWidth:640}}>
          <thead>
            <tr className="bg-slate-50">
              {['Ism Familiya', ...(multiOrg?['Tashkilot']:[]), 'Boshlanish', 'Tugash', 'Grafik', ''].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-[12px] text-slate-400 font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={multiOrg?5:4} className="py-10 text-center text-sm text-slate-400">Xodim topilmadi</td></tr>
            ) : filtered.map(e => {
              const custom = hasCustom(e)
              return (
                <tr key={e.id} className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-[13.5px] font-medium text-slate-700">{e.name}</div>
                    {e.lavozim && <div className="text-[11px] text-slate-400">{e.lavozim}</div>}
                  </td>
                  {multiOrg && (
                    <td className="px-4 py-3 text-[12px] text-slate-400">
                      <span className="flex items-center gap-1"><Building2 size={11}/>{getGroup(e.group_id)?.name || ''}</span>
                    </td>
                  )}
                  <td className="px-4 py-3 text-[13px] font-mono text-slate-600">{effective(e, 'work_start', '09:00')}</td>
                  <td className="px-4 py-3 text-[13px] font-mono text-slate-600">{effective(e, 'work_finish', '18:00')}</td>
                  <td className="px-4 py-3">
                    {custom
                      ? <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-brand-600"><span className="w-1.5 h-1.5 rounded-full bg-brand-500"/> Shaxsiy</span>
                      : <span className="text-[12px] text-slate-400">Standart</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(e)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 text-[12px] font-semibold cursor-pointer hover:bg-slate-50 transition-colors">
                      Sozlash
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        </div>
      </div>

      {/* Edit modal */}
      {editEmp && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={e => e.target === e.currentTarget && setEditEmp(null)}>
          <div className="bg-white rounded-2xl border border-slate-200 p-7 w-full max-w-sm shadow-card-md">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-[17px] font-bold text-slate-900 m-0">{editEmp.name}</h2>
              <button onClick={() => setEditEmp(null)} className="bg-transparent border-none cursor-pointer text-slate-400 hover:text-slate-600"><X size={18}/></button>
            </div>
            <p className="text-[13px] text-slate-400 mb-5">Shaxsiy ish grafigi</p>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-slate-600">Ish boshlanishi</span>
                <TimeInput refEl={startRef} value={workStart} onChange={setWorkStart}/>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-slate-600">Ish tugashi</span>
                <TimeInput refEl={finishRef} value={workFinish} onChange={setWorkFinish}/>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-slate-600">Hisob boshlanadi</span>
                <TimeInput refEl={beginRef} value={workBegin} onChange={setWorkBegin}/>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-slate-600">Kechikish muhlati</span>
                <div className="flex items-center gap-0.5">
                  <button onClick={() => cycleGrace(-1)} disabled={grace===0}
                    className={`w-7 h-7 rounded-md border border-slate-200 bg-white flex items-center justify-center text-[13px] ${grace===0?'text-slate-200 cursor-not-allowed':'text-slate-500 cursor-pointer hover:bg-slate-50'}`}>−</button>
                  <span className="w-14 text-center text-[13px] font-mono font-semibold text-slate-700">{grace===0?"yo'q":`+${grace}d`}</span>
                  <button onClick={() => cycleGrace(1)} disabled={grace===60}
                    className={`w-7 h-7 rounded-md border border-slate-200 bg-white flex items-center justify-center text-[13px] ${grace===60?'text-slate-200 cursor-not-allowed':'text-slate-500 cursor-pointer hover:bg-slate-50'}`}>+</button>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              {hasCustom(editEmp) && (
                <button onClick={handleResetToGroup} disabled={saving}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-[13px] cursor-pointer hover:bg-slate-100 transition-colors">
                  <RotateCcw size={13}/> Standart
                </button>
              )}
              <button onClick={() => setEditEmp(null)} className="flex-1 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-[14px] cursor-pointer hover:bg-slate-100 transition-colors">Bekor</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-brand-600 border-none rounded-xl text-white text-[14px] font-semibold cursor-pointer hover:bg-brand-700 transition-colors disabled:opacity-50">
                {saving ? 'Saqlanmoqda…' : 'Saqlash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
