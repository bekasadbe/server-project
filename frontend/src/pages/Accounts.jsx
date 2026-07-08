import { useState } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff, KeyRound } from 'lucide-react'
import { apiFetch } from '../config'

const inputCls = "w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-[14px] outline-none focus:border-brand-400 transition-colors"
const labelCls = "text-[12px] text-slate-500 font-semibold block mb-1.5"

function LinkedCheckboxes({ selected, setSelected, groups, excludeId }) {
  return (
    <div className="flex flex-col gap-1.5">
      {groups.map(g => {
        if (g.id === excludeId) return null
        const checked = selected.includes(g.id)
        return (
          <label key={g.id} className="flex items-center gap-2 cursor-pointer text-[13px] text-slate-700">
            <input type="checkbox" checked={checked}
              onChange={() => setSelected(prev => checked ? prev.filter(x => x !== g.id) : [...prev, g.id])}
              className="w-4 h-4 cursor-pointer accent-brand-600"/>
            {g.name}
          </label>
        )
      })}
    </div>
  )
}

function RoleButtons({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {[['kadrlar','Kadrlar'],['kuzatuvchi','Kuzatuvchi']].map(([val, label]) => (
        <button key={val} type="button" onClick={() => onChange(val)}
          className={`flex-1 py-2 rounded-lg border text-[13px] cursor-pointer transition-colors ${value === val ? 'bg-brand-50 border-brand-300 text-brand-600 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'}`}>
          {label}
        </button>
      ))}
    </div>
  )
}

export default function Accounts({ groups, accounts, onReload }) {
  const [showEdit, setShowEdit]     = useState(false)
  const [editAcc, setEditAcc]       = useState(null)
  const [editName, setEditName]     = useState('')
  const [editLogin, setEditLogin]   = useState('')
  const [editPass, setEditPass]     = useState('')
  const [editPassShow, setEditPassShow] = useState(false)
  const [editLinked, setEditLinked] = useState([])
  const [editRole, setEditRole]     = useState('kadrlar')
  const [editError, setEditError]   = useState('')

  const [showAdd, setShowAdd]     = useState(false)
  const [newName, setNewName]     = useState('')
  const [newLogin, setNewLogin]   = useState('')
  const [newPass, setNewPass]     = useState('')
  const [newPassShow, setNewPassShow] = useState(false)
  const [newLinked, setNewLinked] = useState([])
  const [newRole, setNewRole]     = useState('kadrlar')
  const [newError, setNewError]   = useState('')
  const [visiblePass, setVisiblePass] = useState(null)

  const openEdit = (acc) => {
    setEditAcc(acc); setEditName(acc.name); setEditLogin(acc.login || ''); setEditPass('')
    setEditPassShow(false); setEditLinked((acc.linked_groups || '').split(',').filter(Boolean))
    setEditRole(acc.role || 'kadrlar'); setEditError(''); setShowEdit(true)
  }

  const handleSaveEdit = async () => {
    if (!editLogin.trim()) return setEditError('Login kiriting')
    try {
      await apiFetch(`/accounts/${editAcc.id}`, { method: 'PUT', body: JSON.stringify({ name: editName.trim(), login: editLogin.trim(), password: editPass.trim() || '[[keep]]', linked_groups: editLinked, role: editRole }) })
      setShowEdit(false); onReload()
    } catch (e) { setEditError('Saqlashda xato: ' + (e?.message || String(e))) }
  }

  const handleAdd = async () => {
    if (!newName.trim())  return setNewError('Akkaunt nomini kiriting')
    if (!newLogin.trim()) return setNewError('Login kiriting')
    if (!newPass.trim())  return setNewError('Parol kiriting')
    if (accounts.find(a => a.login === newLogin.trim())) return setNewError('Bu login allaqachon mavjud')
    await apiFetch('/accounts', { method: 'POST', body: JSON.stringify({ name: newName.trim(), login: newLogin.trim(), password: newPass.trim(), linked_groups: newLinked, role: newRole }) })
    setNewName(''); setNewLogin(''); setNewPass(''); setNewLinked([]); setNewRole('kadrlar'); setNewError('')
    setShowAdd(false); onReload()
  }

  const handleDelete = async (acc) => {
    if (!window.confirm(`"${acc.name}" akkauntini o'chirasizmi?`)) return
    await apiFetch(`/accounts/${acc.id}`, { method: 'DELETE' }); onReload()
  }

  const linkedNames = (acc) => (acc.linked_groups || '').split(',').filter(Boolean).map(id => groups.find(g => g.id === id)?.name).filter(Boolean)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[19px] font-bold text-slate-900 m-0">Akkauntlar</h1>
          <p className="text-[13px] text-slate-400 mt-1 mb-0">Login, parol va qaysi tashkilotlarni ko'rishini boshqarish</p>
        </div>
        <button onClick={() => { setNewName(''); setNewLogin(''); setNewPass(''); setNewLinked([]); setNewError(''); setShowAdd(true) }}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 border-none rounded-lg text-white text-[13px] font-semibold cursor-pointer hover:bg-brand-700 transition-colors">
          <Plus size={14}/> Yangi akkaunt
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {accounts.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-[14px]">Hali akkaunt yo'q. "Yangi akkaunt" tugmasini bosing.</div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{minWidth:640}}>
            <thead>
              <tr className="bg-slate-50">
                {['Akkaunt nomi', 'Login', 'Parol', 'Rol', "Ko'radigan tashkilotlar", ''].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[12px] text-slate-400 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {accounts.map((acc, i) => (
                <tr key={acc.id} className={`border-t border-slate-50 hover:bg-slate-50/50 transition-colors`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                        <KeyRound size={14} className="text-brand-600"/>
                      </div>
                      <span className="font-semibold text-[14px] text-slate-800">{acc.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-slate-600 font-mono">{acc.login || <span className="text-slate-300">—</span>}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-slate-600 text-[13px]">{visiblePass === acc.id ? (acc.password || '—') : '••••••••'}</span>
                      <button onClick={() => setVisiblePass(visiblePass === acc.id ? null : acc.id)}
                        className="bg-transparent border-none cursor-pointer text-slate-400 hover:text-slate-600 flex p-0.5">
                        {visiblePass === acc.id ? <EyeOff size={13}/> : <Eye size={13}/>}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-600">
                      <span className={`w-1.5 h-1.5 rounded-full ${acc.role === 'kuzatuvchi' ? 'bg-purple-500' : 'bg-cyan-500'}`}/>
                      {acc.role === 'kuzatuvchi' ? 'Kuzatuvchi' : 'Kadrlar'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {linkedNames(acc).length > 0
                        ? linkedNames(acc).map(name => <span key={name} className="text-[11px] px-2 py-0.5 bg-brand-50 text-brand-600 rounded-full font-semibold">{name}</span>)
                        : <span className="text-slate-300 text-[12px]">Belgilanmagan</span>
                      }
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 justify-end">
                      <button onClick={() => openEdit(acc)} className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer text-slate-500 hover:bg-slate-100 transition-colors"><Pencil size={14}/></button>
                      <button onClick={() => handleDelete(acc)} className="p-1.5 bg-rose-50 border border-rose-200 rounded-lg cursor-pointer text-rose-500 hover:bg-rose-100 transition-colors"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={e => e.target === e.currentTarget && setShowEdit(false)}>
          <div className="bg-white rounded-2xl border border-slate-200 p-8 w-full max-w-sm shadow-card-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-[18px] font-bold text-slate-900 m-0 mb-6">Akkauntni tahrirlash</h2>
            <div className="flex flex-col gap-3.5">
              <div><label className={labelCls}>Akkaunt nomi</label><input value={editName} onChange={e => { setEditName(e.target.value); setEditError('') }} className={inputCls}/></div>
              <div><label className={labelCls}>Login</label><input value={editLogin} onChange={e => { setEditLogin(e.target.value); setEditError('') }} className={inputCls}/></div>
              <div>
                <label className={labelCls}>Yangi parol <span className="font-normal text-slate-400">(bo'sh qolsa o'zgarmaydi)</span></label>
                <div className="relative">
                  <input type={editPassShow ? 'text' : 'password'} value={editPass} placeholder="Yangi parol..." onChange={e => setEditPass(e.target.value)} className={`${inputCls} pr-10`}/>
                  <button type="button" onClick={() => setEditPassShow(!editPassShow)} className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-slate-400 flex">{editPassShow ? <EyeOff size={15}/> : <Eye size={15}/>}</button>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <label className={labelCls}>Ko'radigan tashkilotlar</label>
                <LinkedCheckboxes selected={editLinked} setSelected={setEditLinked} groups={groups}/>
              </div>
              <div><label className={labelCls}>Rol</label><RoleButtons value={editRole} onChange={setEditRole}/></div>
              {editError && <div className="px-3 py-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-[13px]">{editError}</div>}
              <div className="flex gap-2 mt-1">
                <button onClick={() => setShowEdit(false)} className="flex-1 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-[14px] cursor-pointer hover:bg-slate-100 transition-colors">Bekor</button>
                <button onClick={handleSaveEdit} className="flex-1 py-2.5 bg-brand-600 border-none rounded-xl text-white text-[14px] font-semibold cursor-pointer hover:bg-brand-700 transition-colors">Saqlash</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="bg-white rounded-2xl border border-slate-200 p-8 w-full max-w-sm shadow-card-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-[18px] font-bold text-slate-900 m-0 mb-6">Yangi akkaunt</h2>
            <div className="flex flex-col gap-3.5">
              <div><label className={labelCls}>Akkaunt nomi</label><input value={newName} onChange={e => { setNewName(e.target.value); setNewError('') }} placeholder="Masalan: Rahbar, Markaz kadrlar" className={inputCls}/></div>
              <div><label className={labelCls}>Login</label><input value={newLogin} onChange={e => { setNewLogin(e.target.value); setNewError('') }} className={inputCls}/></div>
              <div>
                <label className={labelCls}>Parol</label>
                <div className="relative">
                  <input type={newPassShow ? 'text' : 'password'} value={newPass} onChange={e => { setNewPass(e.target.value); setNewError('') }} className={`${inputCls} pr-10`}/>
                  <button type="button" onClick={() => setNewPassShow(!newPassShow)} className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-slate-400 flex">{newPassShow ? <EyeOff size={15}/> : <Eye size={15}/>}</button>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <label className={labelCls}>Ko'radigan tashkilotlar</label>
                <LinkedCheckboxes selected={newLinked} setSelected={setNewLinked} groups={groups}/>
              </div>
              <div><label className={labelCls}>Rol</label><RoleButtons value={newRole} onChange={setNewRole}/></div>
              {newError && <div className="px-3 py-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-[13px]">{newError}</div>}
              <div className="flex gap-2 mt-1">
                <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-[14px] cursor-pointer hover:bg-slate-100 transition-colors">Bekor</button>
                <button onClick={handleAdd} className="flex-1 py-2.5 bg-brand-600 border-none rounded-xl text-white text-[14px] font-semibold cursor-pointer hover:bg-brand-700 transition-colors">Yaratish</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
