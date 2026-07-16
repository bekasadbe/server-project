import { useState } from 'react'
import { Users, Search, Building2, Pencil, Trash2 } from 'lucide-react'

const AVATAR_COLORS = ['#2B6CB0','#7c3aed','#0f766e','#b45309','#be123c','#0891b2','#4338ca']
function Avatar({ name }) {
  const initials = (name || '?').split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase()
  const bg = AVATAR_COLORS[(name || '').charCodeAt(0) % AVATAR_COLORS.length]
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-[12px] shrink-0" style={{ background: bg }}>
      {initials}
    </div>
  )
}

export default function Employees({ employees = [], groups = [], onUpdateEmployee, onDeleteEmployee, readonly = false }) {
  const [search, setSearch]       = useState('')
  const [orgFilter, setOrgFilter] = useState('all')
  const [showEdit, setShowEdit]   = useState(false)
  const [editEmp, setEditEmp]     = useState(null)
  const [editName, setEditName]   = useState('')
  const [editLavozim, setEditLavozim] = useState('')
  const [editError, setEditError] = useState('')
  const [saved, setSaved]         = useState(false)

  const multiOrg = groups.length > 1

  const openEdit = (emp) => {
    setEditEmp(emp); setEditName(emp.name); setEditLavozim(emp.lavozim || '')
    setEditError(''); setSaved(false); setShowEdit(true)
  }

  const handleSave = () => {
    if (!editName.trim()) return setEditError('Ism kiriting')
    onUpdateEmployee(editEmp.id, { name: editName.trim(), group_id: editEmp.group || editEmp.group_id, lavozim: editLavozim.trim() })
    setSaved(true)
    setTimeout(() => setShowEdit(false), 800)
  }

  const filtered = employees.filter(e => {
    const matchName = e.name.toLowerCase().includes(search.toLowerCase()) || e.id.includes(search)
    const matchOrg  = orgFilter === 'all' || e.group === orgFilter
    return matchName && matchOrg
  })

  const groupName = (gid) => groups.find(g => g.id === gid)?.name || gid

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[19px] font-bold text-slate-900 m-0">Xodimlar</h1>
          <p className="text-[13px] text-slate-400 mt-0.5 mb-0">Jami {employees.length} ta xodim</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2.5 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input placeholder="Ism yoki ID bo'yicha qidirish..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full py-2 pl-9 pr-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-[14px] outline-none focus:border-brand-400 transition-colors"/>
        </div>
        {multiOrg && (
          <div className="flex gap-1.5">
            {[{ id: 'all', name: `Hammasi (${employees.length})` }, ...groups.map(g => ({ id: g.id, name: `${g.name} (${employees.filter(e => e.group === g.id).length})` }))].map(g => (
              <button key={g.id} onClick={() => setOrgFilter(g.id)}
                className={`px-3.5 py-2 rounded-xl border text-[13px] cursor-pointer transition-colors ${orgFilter === g.id ? 'bg-brand-50 border-brand-600 text-brand-600 font-semibold' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                {g.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{minWidth:560}}>
          <thead>
            <tr className="bg-slate-50">
              <th className="px-4 py-2.5 text-left text-[12px] text-slate-400 font-normal">Ism Familiya</th>
              <th className="px-4 py-2.5 text-left text-[12px] text-slate-400 font-normal">Lavozim</th>
              <th className="px-4 py-2.5 text-left text-[12px] text-slate-400 font-normal">Face ID</th>
              {multiOrg && <th className="px-4 py-2.5 text-left text-[12px] text-slate-400 font-normal">Tashkilot</th>}
              {onUpdateEmployee && <th className="px-4 py-2.5"></th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map(emp => (
              <tr key={emp.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={emp.name}/>
                    <span className="text-[14px] font-medium text-slate-800">{emp.name}</span>
                  </div>
                </td>
                <td className={`px-4 py-2.5 text-[13px] ${emp.lavozim ? 'text-slate-500' : 'text-slate-300 italic'}`}>
                  {emp.lavozim || '—'}
                </td>
                <td className="px-4 py-2.5 text-[13px] text-slate-400 font-mono">#{emp.id}</td>
                {multiOrg && (
                  <td className="px-4 py-2.5 text-[13px] text-slate-500">
                    <span className="flex items-center gap-1"><Building2 size={12}/> {groupName(emp.group)}</span>
                  </td>
                )}
                {onUpdateEmployee && (
                  <td className="px-4 py-2.5 text-right">
                    <button onClick={() => openEdit(emp)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 rounded-lg text-white text-[12px] font-semibold cursor-pointer hover:bg-brand-700 transition-colors border-none">
                      <Pencil size={12}/> Tahrirlash
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={multiOrg ? 5 : 4} className="py-10 text-center text-sm text-slate-400">Xodim topilmadi</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Edit Modal */}
      {showEdit && editEmp && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={e => e.target === e.currentTarget && setShowEdit(false)}>
          <div className="bg-white rounded-2xl border border-slate-200 p-8 w-full max-w-sm shadow-card-md">
            <h2 className="text-[18px] font-bold text-slate-900 m-0 mb-1">Xodimni tahrirlash</h2>
            <p className="text-[13px] text-slate-400 mb-6">Face ID: #{editEmp.id}</p>
            <div className="flex flex-col gap-3.5">
              <div>
                <label className="text-[12px] text-slate-500 font-semibold block mb-1.5">Ism Familiya</label>
                <input value={editName} onChange={e => { setEditName(e.target.value); setEditError('') }}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-[14px] outline-none focus:border-brand-400 transition-colors"/>
              </div>
              <div>
                <label className="text-[12px] text-slate-500 font-semibold block mb-1.5">Lavozim</label>
                <input value={editLavozim} onChange={e => setEditLavozim(e.target.value)}
                  placeholder="Masalan: Dasturchi, Hisobchi..."
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-[14px] outline-none focus:border-brand-400 transition-colors"/>
              </div>
              {editError && <div className="px-3 py-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-[13px]">⚠️ {editError}</div>}
              {saved    && <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-xl text-green-700 text-[13px] font-semibold">✅ Saqlandi!</div>}
              <div className="flex gap-2 mt-1">
                {onDeleteEmployee && (
                  <button onClick={async () => {
                    if (!window.confirm(`"${editName}" xodimini o'chirasizmi?\n\nBu amalni qaytarib bo'lmaydi!`)) return
                    const ok = await onDeleteEmployee(editEmp.id)
                    if (ok) setShowEdit(false)
                  }} className="flex items-center gap-1.5 px-3.5 py-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-[14px] cursor-pointer hover:bg-rose-100 transition-colors">
                    <Trash2 size={14}/> O'chirish
                  </button>
                )}
                <button onClick={() => setShowEdit(false)}
                  className="flex-1 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-[14px] cursor-pointer hover:bg-slate-100 transition-colors">
                  Bekor
                </button>
                <button onClick={handleSave}
                  className="flex-1 py-2.5 bg-brand-600 border-none rounded-xl text-white text-[14px] font-semibold cursor-pointer hover:bg-brand-700 transition-colors">
                  Saqlash
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
