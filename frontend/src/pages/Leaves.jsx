import { useState, useEffect } from 'react'
import { Plus, Trash2, Stethoscope, Palmtree, Search, X } from 'lucide-react'
import { apiFetch } from '../config'

const LEAVE_TYPES = [
  { key: 'sick',     label: 'Kasallik', icon: Stethoscope, color: '#9333ea', bg: '#f3e8ff', border: '#d8b4fe' },
  { key: 'vacation', label: "Ta'til",   icon: Palmtree,    color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc' },
]
const typeInfo = (t) => LEAVE_TYPES.find(l => l.key === t) || LEAVE_TYPES[0]

const inputCls = "w-full px-3 py-2.5 border border-slate-200 rounded-xl text-[13px] outline-none focus:border-brand-400 transition-colors bg-white"
const labelCls = "text-[12px] text-slate-500 font-semibold block mb-1.5"

export default function Leaves({ employees = [], groups = [] }) {
  const [leaves, setLeaves]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [showAdd, setShowAdd]   = useState(false)
  const [month, setMonth]       = useState(() => new Date().toISOString().slice(0, 7))
  const [newEmp, setNewEmp]     = useState('')
  const [newType, setNewType]   = useState('sick')
  const [newStart, setNewStart] = useState(new Date().toISOString().slice(0, 10))
  const [newEnd, setNewEnd]     = useState(new Date().toISOString().slice(0, 10))
  const [newNote, setNewNote]   = useState('')
  const [saving, setSaving]     = useState(false)
  const [empSearch, setEmpSearch] = useState('')

  const fromDate = `${month}-01`
  const toDate   = `${month}-31`

  const load = async () => {
    setLoading(true)
    try {
      const data   = await apiFetch(`/leaves?from=${fromDate}&to=${toDate}`)
      const empIds = new Set(employees.map(e => e.id))
      setLeaves((data.leaves || []).filter(l => empIds.has(l.employee_id)))
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [month])

  const handleAdd = async () => {
    if (!newEmp || !newStart || !newEnd) return
    setSaving(true)
    try {
      await apiFetch('/leaves', { method: 'POST', body: JSON.stringify({ employee_id: newEmp, leave_type: newType, start_date: newStart, end_date: newEnd, note: newNote }) })
      setShowAdd(false); setNewEmp(''); setNewNote(''); setEmpSearch('')
      await load()
    } catch {}
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("O'chirishni tasdiqlaysizmi?")) return
    await apiFetch(`/leaves/${id}`, { method: 'DELETE' })
    load()
  }

  const getEmpName = (eid) => employees.find(e => e.id === eid)?.name    || eid
  const getEmpLav  = (eid) => employees.find(e => e.id === eid)?.lavozim || ''
  const getGrpName = (eid) => { const gid = employees.find(e => e.id === eid)?.group_id; return groups.find(g => g.id === gid)?.name || '' }

  const filtered     = leaves.filter(l => !search || getEmpName(l.employee_id).toLowerCase().includes(search.toLowerCase()))
  const filteredEmps = employees.filter(e => !empSearch || e.name.toLowerCase().includes(empSearch.toLowerCase()))
  const sickCount    = leaves.filter(l => l.leave_type === 'sick').length
  const vacCount     = leaves.filter(l => l.leave_type === 'vacation').length

  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - 2 + i)
    return d.toISOString().slice(0, 7)
  })

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="flex items-center gap-2.5 text-[22px] font-bold text-slate-900 m-0">
            <Stethoscope size={22} className="text-purple-600"/> Kasallik & Ta'tillar
          </h1>
          <p className="text-[13px] text-slate-400 mt-1 mb-0">Xodimlarni kasallik va ta'til davrlarini boshqarish</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 border-none rounded-xl text-white text-[14px] font-semibold cursor-pointer hover:bg-purple-700 transition-colors">
          <Plus size={16}/> Qo'shish
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2.5 mb-5 flex-wrap items-center">
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-xl">
          <Stethoscope size={14} className="text-purple-600"/>
          <span className="text-[13px] font-bold text-purple-600">{sickCount} kasallik</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-cyan-50 border border-cyan-200 rounded-xl">
          <Palmtree size={14} className="text-cyan-600"/>
          <span className="text-[13px] font-bold text-cyan-600">{vacCount} ta'til</span>
        </div>
        <select value={month} onChange={e => setMonth(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-xl bg-white text-[13px] text-slate-700 cursor-pointer outline-none">
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input placeholder="Xodim nomi..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full py-2 pl-9 pr-3 border border-slate-200 rounded-xl text-[13px] outline-none focus:border-brand-400 transition-colors bg-white"/>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50">
              {['Xodim', 'Tashkilot', 'Turi', 'Boshlanish', 'Tugash', 'Kun', 'Izoh', ''].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-[12px] text-slate-400 font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="py-12 text-center text-sm text-slate-400">Yuklanmoqda…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="py-12 text-center text-sm text-slate-400">Ma'lumot yo'q</td></tr>
            ) : filtered.map(l => {
              const ti   = typeInfo(l.leave_type)
              const days = Math.round((new Date(l.end_date) - new Date(l.start_date)) / 86400000) + 1
              return (
                <tr key={l.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-2.5">
                    <div className="text-[14px] font-medium text-slate-800">{getEmpName(l.employee_id)}</div>
                    {getEmpLav(l.employee_id) && <div className="text-[11px] text-slate-400">{getEmpLav(l.employee_id)}</div>}
                  </td>
                  <td className="px-4 py-2.5 text-[12px] text-slate-500">{getGrpName(l.employee_id)}</td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-semibold border"
                      style={{ background: ti.bg, color: ti.color, borderColor: ti.border }}>
                      <ti.icon size={11}/> {ti.label}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[13px] text-slate-500 font-mono">{l.start_date}</td>
                  <td className="px-4 py-2.5 text-[13px] text-slate-500 font-mono">{l.end_date}</td>
                  <td className="px-4 py-2.5 text-[13px] font-bold" style={{ color: ti.color }}>{days} kun</td>
                  <td className="px-4 py-2.5 text-[12px] text-slate-400">{l.note || '—'}</td>
                  <td className="px-4 py-2.5">
                    <button onClick={() => handleDelete(l.id)}
                      className="bg-transparent border-none cursor-pointer text-slate-300 hover:text-red-500 transition-colors p-1">
                      <Trash2 size={15}/>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50"
          onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="bg-white rounded-2xl p-7 w-full max-w-md shadow-card-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[17px] font-bold text-slate-900 m-0">Kasallik / Ta'til qo'shish</h2>
              <button onClick={() => setShowAdd(false)} className="bg-transparent border-none cursor-pointer text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <div className="flex flex-col gap-3.5">
              <div>
                <label className={labelCls}>Turi</label>
                <div className="flex gap-2">
                  {LEAVE_TYPES.map(t => (
                    <button key={t.key} onClick={() => setNewType(t.key)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 text-[13px] cursor-pointer transition-all"
                      style={{ borderColor: newType === t.key ? t.color : '#e2e8f0', background: newType === t.key ? t.bg : '#fff', color: newType === t.key ? t.color : '#64748b', fontWeight: newType === t.key ? 700 : 400 }}>
                      <t.icon size={14}/> {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>Xodim</label>
                <input placeholder="Ism bo'yicha qidirish..." value={empSearch} onChange={e => setEmpSearch(e.target.value)} className={`${inputCls} mb-1.5`}/>
                <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl">
                  {filteredEmps.slice(0, 30).map(e => (
                    <div key={e.id} onClick={() => { setNewEmp(e.id); setEmpSearch(e.name) }}
                      className={`px-3 py-2 cursor-pointer border-b border-slate-50 text-[13px] ${newEmp === e.id ? 'bg-brand-50 text-brand-600 font-semibold' : 'hover:bg-slate-50 text-slate-700'}`}>
                      {e.name} {e.lavozim && <span className="text-slate-400 text-[11px]">— {e.lavozim}</span>}
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div><label className={labelCls}>Boshlanish</label><input type="date" value={newStart} onChange={e => setNewStart(e.target.value)} className={inputCls}/></div>
                <div><label className={labelCls}>Tugash</label><input type="date" value={newEnd} onChange={e => setNewEnd(e.target.value)} className={inputCls}/></div>
              </div>
              <div>
                <label className={labelCls}>Izoh (ixtiyoriy)</label>
                <input value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Masalan: shifoxona, rejalashtirilgan..." className={inputCls}/>
              </div>
            </div>
            <div className="flex gap-2.5 mt-5">
              <button onClick={() => setShowAdd(false)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-600 text-[14px] cursor-pointer hover:bg-slate-50 transition-colors">
                Bekor
              </button>
              <button onClick={handleAdd} disabled={!newEmp || saving}
                className={`flex-[2] py-2.5 border-none rounded-xl text-white text-[14px] font-semibold transition-colors ${!newEmp || saving ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-purple-600 cursor-pointer hover:bg-purple-700'}`}>
                {saving ? 'Saqlanmoqda…' : 'Saqlash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
