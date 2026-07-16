import { useState } from 'react'
import { Plus, Trash2, Search, Building2, Pencil, UserPlus, Users, Inbox } from 'lucide-react'

const inputCls = "w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-[14px] outline-none focus:border-brand-400 transition-colors"
const labelCls = "text-[12px] text-slate-500 font-semibold block mb-1.5"

function Modal({ title, subtitle, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl border border-slate-200 p-8 w-full max-w-sm shadow-card-md">
        <h2 className="text-[18px] font-bold text-slate-900 m-0 mb-1">{title}</h2>
        {subtitle && <p className="text-[13px] text-slate-400 mb-6 m-0">{subtitle}</p>}
        {children}
      </div>
    </div>
  )
}

export default function AdminPanel({ employees, groups, onAddEmployee, onDeleteEmployee, onDeleteEmployees, onUpdateEmployee, onAddGroup, onDeleteGroup, onMoveEmployee, onUpdateGroup }) {
  const [selectedGroup, setSelectedGroup] = useState(groups[0]?.id || null)
  const [search, setSearch]   = useState('')
  const [selected, setSelected] = useState(new Set())

  const [newId, setNewId]     = useState('')
  const [newName, setNewName] = useState('')
  const [addError, setAddError] = useState('')

  const [showNewOrg, setShowNewOrg] = useState(false)
  const [orgName, setOrgName]       = useState('')
  const [orgError, setOrgError]     = useState('')

  const [showEditEmp, setShowEditEmp]         = useState(false)
  const [editEmpId, setEditEmpId]             = useState('')
  const [editEmpNewId, setEditEmpNewId]       = useState('')
  const [editEmpName, setEditEmpName]         = useState('')
  const [editEmpLavozim, setEditEmpLavozim]   = useState('')
  const [editEmpGroupId, setEditEmpGroupId]   = useState('')
  const [editEmpError, setEditEmpError]       = useState('')
  const [showAddEmp, setShowAddEmp]           = useState(false)

  const currentGroup = groups.find(g => g.id === selectedGroup) || (groups.length > 0 ? groups[0] : null)
  const groupEmps    = employees.filter(e => e.group === selectedGroup)
  const filtered     = groupEmps.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.id.includes(search))

  const toggleSelect = (id) => { const next = new Set(selected); next.has(id) ? next.delete(id) : next.add(id); setSelected(next) }
  const toggleAll    = () => { if (selected.size === filtered.length) setSelected(new Set()); else setSelected(new Set(filtered.map(e => e.id))) }

  const handleAddEmployee = () => {
    if (!newId.trim())   return setAddError('ID kiriting')
    if (!newName.trim()) return setAddError('Ism kiriting')
    const fid = newId.trim().padStart(8, '0')
    if (employees.find(e => e.id === fid)) return setAddError('Bu ID allaqachon mavjud')
    onAddEmployee({ id: fid, name: newName.trim(), group: selectedGroup, lavozim: '' })
    setNewId(''); setNewName(''); setAddError(''); setShowAddEmp(false)
  }

  const openEditEmp = (emp) => {
    setEditEmpId(emp.id); setEditEmpNewId(emp.id); setEditEmpName(emp.name)
    setEditEmpLavozim(emp.lavozim || ''); setEditEmpGroupId(emp.group_id || emp.group || '')
    setEditEmpError(''); setShowEditEmp(true)
  }

  const handleSaveEmp = () => {
    if (!editEmpNewId.trim()) return setEditEmpError('ID kiriting')
    if (!editEmpName.trim())  return setEditEmpError('Ism kiriting')
    const fid = editEmpNewId.trim().padStart(8, '0')
    if (fid !== editEmpId && employees.find(e => e.id === fid)) return setEditEmpError('Bu ID allaqachon mavjud')
    onUpdateEmployee(editEmpId, { id: fid, name: editEmpName.trim(), lavozim: editEmpLavozim.trim(), group_id: editEmpGroupId })
    setShowEditEmp(false)
  }

  const handleAddOrg = () => {
    if (!orgName.trim()) return setOrgError('Tashkilot nomi kiriting')
    const id = orgName.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') || ('org_' + Date.now())
    if (groups.find(g => g.id === id)) return setOrgError('Bu nom bilan tashkilot allaqachon mavjud')
    onAddGroup({ id, name: orgName.trim(), login: '', password: '' })
    setOrgName(''); setOrgError(''); setShowNewOrg(false)
    setSelectedGroup(id)
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[19px] font-bold text-slate-900 m-0">Admin panel</h1>
        <p className="text-[13px] text-slate-400 mt-1 mb-0">Tashkilotlar va xodimlarni boshqarish</p>
      </div>

      <div className="flex gap-5 items-start flex-col lg:flex-row">
        {/* Org sidebar */}
        <div className="w-full lg:w-[260px] shrink-0 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wide">Tashkilotlar</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-400 font-semibold">{groups.length}</span>
          </div>
          <div className="p-2 flex flex-col gap-0.5 max-h-[420px] overflow-y-auto">
            {groups.map(g => {
              const count  = employees.filter(e => e.group === g.id).length
              const active = selectedGroup === g.id
              return (
                <button key={g.id} onClick={() => { setSelectedGroup(g.id); setSearch(''); setSelected(new Set()) }}
                  className={`flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-lg border-none cursor-pointer transition-colors ${active ? 'bg-brand-50 text-brand-700' : 'bg-transparent text-slate-600 hover:bg-slate-50'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${active ? 'bg-brand-600' : 'bg-slate-100'}`}>
                    <Building2 size={15} className={active ? 'text-white' : 'text-slate-400'}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-[13.5px] truncate ${active ? 'font-bold' : 'font-medium'}`}>{g.name}</div>
                    <div className="text-[11.5px] text-slate-400 flex items-center gap-1"><Users size={10}/> {count} ta xodim</div>
                  </div>
                </button>
              )
            })}
          </div>
          <div className="p-2 border-t border-slate-100">
            <button onClick={() => setShowNewOrg(true)}
              className="flex items-center justify-center gap-1.5 w-full px-3.5 py-2.5 rounded-lg border border-dashed border-slate-300 bg-transparent text-slate-500 text-[13px] font-medium cursor-pointer hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50/50 transition-colors">
              <Plus size={14}/> Yangi tashkilot
            </button>
          </div>
        </div>

        {/* Employee panel */}
        <div className="flex-1 min-w-0 w-full">
          {currentGroup ? (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-slate-100 flex-wrap">
                <div className="flex-1 relative min-w-[160px]">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                  <input placeholder="Ism yoki ID bo'yicha qidirish..."
                    value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full py-2 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-[13px] outline-none focus:border-brand-400 transition-colors"/>
                </div>
                {selected.size > 0 && (
                  <button onClick={async () => {
                    if (!window.confirm(`${selected.size} ta xodimni o'chirasizmi?`)) return
                    const ok = await onDeleteEmployees([...selected])
                    if (ok) setSelected(new Set())
                  }} className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-600 text-[13px] font-semibold cursor-pointer hover:bg-rose-100 transition-colors whitespace-nowrap">
                    <Trash2 size={14}/> {selected.size} ta o'chirish
                  </button>
                )}
                <button onClick={() => {
                  if (window.confirm(`"${currentGroup.name}" tashkilotini o'chirasizmi?\n\nBarcha xodimlar ham o'chib ketadi!`)) onDeleteGroup(currentGroup.id)
                }} className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-500 cursor-pointer hover:bg-rose-100 transition-colors shrink-0" title="Tashkilotni o'chirish">
                  <Trash2 size={15}/>
                </button>
                <button onClick={() => { setNewId(''); setNewName(''); setAddError(''); setShowAddEmp(true) }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 border-none rounded-lg text-white text-[13px] font-semibold cursor-pointer hover:bg-brand-700 transition-colors whitespace-nowrap">
                  <UserPlus size={14}/> Xodim qo'shish
                </button>
              </div>

              {/* Stat strip */}
              <div className="flex items-center gap-5 px-4 py-2.5 bg-slate-50/70 border-b border-slate-100 text-[12px] text-slate-500">
                <span><b className="text-slate-800">{groupEmps.length}</b> jami xodim</span>
                <span className="w-px h-3 bg-slate-200"/>
                <span><b className="text-slate-800">{filtered.length}</b> ko'rsatilmoqda</span>
                {selected.size > 0 && <>
                  <span className="w-px h-3 bg-slate-200"/>
                  <span className="text-brand-600 font-semibold">{selected.size} tanlangan</span>
                </>}
              </div>

              <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{minWidth:520}}>
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-4 py-2.5 w-10">
                      <input type="checkbox" checked={filtered.length > 0 && selected.size === filtered.length} onChange={toggleAll} className="cursor-pointer accent-brand-600"/>
                    </th>
                    {['Ism Familiya', 'Lavozim', 'Face ID', ''].map((h, i) => (
                      <th key={i} className="px-4 py-2.5 text-left text-[12px] text-slate-400 font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(emp => {
                    const isSel = selected.has(emp.id)
                    return (
                      <tr key={emp.id} className={`border-t border-slate-50 transition-colors ${isSel ? 'bg-brand-50' : 'hover:bg-slate-50/50'}`}>
                        <td className="px-4 py-2.5">
                          <input type="checkbox" checked={isSel} onChange={() => toggleSelect(emp.id)} className="cursor-pointer accent-brand-600"/>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0 ${isSel ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-600'}`}>
                              {emp.name[0]}
                            </div>
                            <span className="text-[14px] font-semibold text-slate-800">{emp.name}</span>
                          </div>
                        </td>
                        <td className={`px-4 py-2.5 text-[13px] ${emp.lavozim ? 'text-slate-500' : 'text-slate-300 italic'}`}>{emp.lavozim || '—'}</td>
                        <td className="px-4 py-2.5 text-[13px] text-slate-400 font-mono">#{emp.id}</td>
                        <td className="px-4 py-2.5 text-right">
                          <button onClick={() => openEditEmp(emp)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 rounded-lg text-white text-[12px] font-semibold cursor-pointer hover:bg-brand-700 transition-colors border-none">
                            <Pencil size={12}/> Tahrirlash
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={5} className="py-14 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center"><Inbox size={18} className="text-slate-300"/></div>
                        <span className="text-[13.5px] text-slate-400">{search ? 'Hech narsa topilmadi' : "Bu tashkilotda hali xodim yo'q"}</span>
                      </div>
                    </td></tr>
                  )}
                </tbody>
              </table>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 h-72 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center"><Building2 size={24} className="text-slate-300"/></div>
              <div className="text-center">
                <div className="text-[14px] font-semibold text-slate-500">Tashkilot tanlanmagan</div>
                <div className="text-[12.5px] text-slate-400 mt-0.5">Chapdan tashkilot tanlang yoki yangisini yarating</div>
              </div>
              <button onClick={() => setShowNewOrg(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 border-none rounded-lg text-white text-[13px] font-semibold cursor-pointer hover:bg-brand-700 transition-colors">
                <Plus size={14}/> Yangi tashkilot
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit emp modal */}
      {showEditEmp && (
        <Modal title="Xodimni tahrirlash" subtitle={`ID: ${editEmpId}`} onClose={() => setShowEditEmp(false)}>
          <div className="flex flex-col gap-3.5">
            <div><label className={labelCls}>Face ID raqami</label><input value={editEmpNewId} onChange={e => { setEditEmpNewId(e.target.value); setEditEmpError('') }} className={inputCls}/></div>
            <div><label className={labelCls}>Ism Familiya</label><input value={editEmpName} onChange={e => { setEditEmpName(e.target.value); setEditEmpError('') }} className={inputCls}/></div>
            <div><label className={labelCls}>Lavozim</label><input value={editEmpLavozim} onChange={e => setEditEmpLavozim(e.target.value)} placeholder="Masalan: Dasturchi..." className={inputCls}/></div>
            {editEmpError && <div className="px-3 py-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-[13px]">⚠️ {editEmpError}</div>}
            <div className="flex gap-2 mt-1">
              <button onClick={async () => {
                if (!window.confirm(`${editEmpName} ni o'chirasizmi?`)) return
                const ok = await onDeleteEmployee(editEmpId)
                if (ok) setShowEditEmp(false)
              }}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-[14px] cursor-pointer hover:bg-rose-100 transition-colors">
                <Trash2 size={14}/> O'chirish
              </button>
              <button onClick={() => setShowEditEmp(false)} className="flex-1 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-[14px] cursor-pointer hover:bg-slate-100 transition-colors">Bekor</button>
              <button onClick={handleSaveEmp} className="flex-1 py-2.5 bg-brand-600 border-none rounded-xl text-white text-[14px] font-semibold cursor-pointer hover:bg-brand-700 transition-colors">Saqlash</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add emp modal */}
      {showAddEmp && (
        <Modal title="Xodim qo'shish" subtitle={currentGroup?.name} onClose={() => setShowAddEmp(false)}>
          <div className="flex flex-col gap-3.5">
            <div><label className={labelCls}>Face ID raqami</label><input value={newId} onChange={e => { setNewId(e.target.value); setAddError('') }} placeholder="Masalan: 00000123" className={inputCls}/></div>
            <div><label className={labelCls}>Ism Familiya</label><input value={newName} onChange={e => { setNewName(e.target.value); setAddError('') }} placeholder="Masalan: Karimov Bobur" className={inputCls}/></div>
            {addError && <div className="px-3 py-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-[13px]">⚠️ {addError}</div>}
            <div className="flex gap-2 mt-1">
              <button onClick={() => setShowAddEmp(false)} className="flex-1 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-[14px] cursor-pointer hover:bg-slate-100 transition-colors">Bekor</button>
              <button onClick={handleAddEmployee} className="flex-1 py-2.5 bg-brand-600 border-none rounded-xl text-white text-[14px] font-semibold cursor-pointer hover:bg-brand-700 transition-colors">Qo'shish</button>
            </div>
          </div>
        </Modal>
      )}

      {/* New org modal */}
      {showNewOrg && (
        <Modal title="Yangi tashkilot" onClose={() => { setShowNewOrg(false); setOrgName(''); setOrgError('') }}>
          <div className="flex flex-col gap-3.5">
            <div><label className={labelCls}>Tashkilot nomi</label><input value={orgName} onChange={e => { setOrgName(e.target.value); setOrgError('') }} placeholder="Masalan: IT bo'limi" className={inputCls} autoFocus/></div>
            {orgError && <div className="px-3 py-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-[13px]">{orgError}</div>}
            <div className="flex gap-2 mt-1">
              <button onClick={() => { setShowNewOrg(false); setOrgName(''); setOrgError('') }}
                className="flex-1 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-[14px] cursor-pointer hover:bg-slate-100 transition-colors">Bekor</button>
              <button onClick={handleAddOrg} className="flex-1 py-2.5 bg-brand-600 border-none rounded-xl text-white text-[14px] font-semibold cursor-pointer hover:bg-brand-700 transition-colors">Yaratish</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
