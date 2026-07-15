import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff, KeyRound, Send, X, Users, CheckCircle2 } from 'lucide-react'
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
  const [editRole, setEditRole]         = useState('kadrlar')
  const [editTgId, setEditTgId]         = useState('')
  const [editError, setEditError]       = useState('')
  const [tgLinking, setTgLinking]       = useState(false)

  const [showAdd, setShowAdd]     = useState(false)
  const [newName, setNewName]     = useState('')
  const [newLogin, setNewLogin]   = useState('')
  const [newPass, setNewPass]     = useState('')
  const [newPassShow, setNewPassShow] = useState(false)
  const [newLinked, setNewLinked] = useState([])
  const [newRole, setNewRole]     = useState('kadrlar')
  const [newError, setNewError]   = useState('')
  const [visiblePass, setVisiblePass] = useState(false)
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    if (!selectedId && accounts.length > 0) setSelectedId(accounts[0].id)
    if (selectedId && !accounts.find(a => a.id === selectedId)) setSelectedId(accounts[0]?.id || null)
  }, [accounts])

  const selectedAcc = accounts.find(a => a.id === selectedId) || null

  const openEdit = (acc) => {
    setEditAcc(acc); setEditName(acc.name); setEditLogin(acc.login || ''); setEditPass('')
    setEditPassShow(false); setEditLinked((acc.linked_groups || '').split(',').filter(Boolean))
    setEditRole(acc.role || 'kadrlar'); setEditTgId(acc.telegram_id || ''); setEditError('')
    setTgLinking(!!acc.telegram_id); setShowEdit(true)
  }

  const handleSaveEdit = async () => {
    if (!editLogin.trim()) return setEditError('Login kiriting')
    try {
      await apiFetch(`/accounts/${editAcc.id}`, { method: 'PUT', body: JSON.stringify({ name: editName.trim(), login: editLogin.trim(), password: editPass.trim() || '[[keep]]', linked_groups: editLinked, role: editRole, telegram_id: editTgId.trim() || null }) })
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

      {accounts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-12 text-center text-slate-400 text-[14px]">Hali akkaunt yo'q. "Yangi akkaunt" tugmasini bosing.</div>
      ) : (
        <div className="flex gap-5 items-start flex-col lg:flex-row">
          {/* Akkaunt sidebar */}
          <div className="w-full lg:w-[260px] shrink-0 bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wide">Akkauntlar</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-400 font-semibold">{accounts.length}</span>
            </div>
            <div className="p-2 flex flex-col gap-0.5 max-h-[420px] overflow-y-auto">
              {accounts.map(acc => {
                const active = selectedId === acc.id
                return (
                  <button key={acc.id} onClick={() => { setSelectedId(acc.id); setVisiblePass(false) }}
                    className={`flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-lg border-none cursor-pointer transition-colors ${active ? 'bg-brand-50 text-brand-700' : 'bg-transparent text-slate-600 hover:bg-slate-50'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${active ? 'bg-brand-600' : 'bg-slate-100'}`}>
                      <KeyRound size={15} className={active ? 'text-white' : 'text-slate-400'}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-[13.5px] truncate ${active ? 'font-bold' : 'font-medium'}`}>{acc.name}</div>
                      <div className="text-[11.5px] text-slate-400 font-mono truncate">{acc.login || '—'}</div>
                    </div>
                    {acc.telegram_id && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Telegram bog'langan"/>}
                  </button>
                )
              })}
            </div>
            <div className="p-2 border-t border-slate-100">
              <button onClick={() => { setNewName(''); setNewLogin(''); setNewPass(''); setNewLinked([]); setNewError(''); setShowAdd(true) }}
                className="flex items-center justify-center gap-1.5 w-full px-3.5 py-2.5 rounded-lg border border-dashed border-slate-300 bg-transparent text-slate-500 text-[13px] font-medium cursor-pointer hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50/50 transition-colors">
                <Plus size={14}/> Yangi akkaunt
              </button>
            </div>
          </div>

          {/* Detail panel */}
          <div className="flex-1 min-w-0 w-full">
            {selectedAcc ? (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                      <KeyRound size={19} className="text-brand-600"/>
                    </div>
                    <div>
                      <div className="text-[16px] font-bold text-slate-900">{selectedAcc.name}</div>
                      <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-500 mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${selectedAcc.role === 'kuzatuvchi' ? 'bg-purple-500' : 'bg-cyan-500'}`}/>
                        {selectedAcc.role === 'kuzatuvchi' ? 'Kuzatuvchi' : 'Kadrlar'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => openEdit(selectedAcc)} className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 border-none rounded-lg text-white text-[13px] font-semibold cursor-pointer hover:bg-brand-700 transition-colors"><Pencil size={13}/> Tahrirlash</button>
                    <button onClick={() => handleDelete(selectedAcc)} className="p-2 bg-rose-50 border border-rose-200 rounded-lg cursor-pointer text-rose-500 hover:bg-rose-100 transition-colors"><Trash2 size={15}/></button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide mb-1.5">Login</div>
                    <div className="text-[14px] font-mono text-slate-800">{selectedAcc.login || '—'}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide mb-1.5">Parol</div>
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-mono text-slate-800">{visiblePass ? (selectedAcc.password || '—') : '••••••••'}</span>
                      <button onClick={() => setVisiblePass(!visiblePass)} className="bg-transparent border-none cursor-pointer text-slate-400 hover:text-slate-600 flex p-0.5">
                        {visiblePass ? <EyeOff size={14}/> : <Eye size={14}/>}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 mb-5">
                  <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide mb-2 flex items-center gap-1.5"><Send size={11}/> Telegram bot</div>
                  {selectedAcc.telegram_id ? (
                    <div className="flex items-center gap-2 text-[13.5px] text-emerald-700 font-medium">
                      <CheckCircle2 size={15} className="text-emerald-500"/> Bog'langan — ID: <span className="font-mono">{selectedAcc.telegram_id}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-[13.5px] text-slate-400">
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 shrink-0"/> Bog'lanmagan
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide mb-2 flex items-center gap-1.5"><Users size={11}/> Ko'radigan tashkilotlar</div>
                  <div className="flex flex-wrap gap-1.5">
                    {linkedNames(selectedAcc).length > 0
                      ? linkedNames(selectedAcc).map(name => <span key={name} className="text-[12px] px-2.5 py-1 bg-brand-50 text-brand-600 rounded-full font-semibold">{name}</span>)
                      : <span className="text-slate-300 text-[13px]">Belgilanmagan</span>
                    }
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 bg-white rounded-2xl border border-slate-100 text-slate-400 text-[14px]">Akkaunt tanlang</div>
            )}
          </div>
        </div>
      )}

      {/* Edit modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={e => e.target === e.currentTarget && setShowEdit(false)}>
          <div className="bg-white rounded-2xl border border-slate-200 p-8 w-full max-w-lg shadow-card-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-[18px] font-bold text-slate-900 m-0 mb-6">Akkauntni tahrirlash</h2>
            <div className="flex flex-col gap-3.5">
              <div className="grid grid-cols-2 gap-3.5">
                <div><label className={labelCls}>Akkaunt nomi</label><input value={editName} onChange={e => { setEditName(e.target.value); setEditError('') }} className={inputCls}/></div>
                <div><label className={labelCls}>Login</label><input value={editLogin} onChange={e => { setEditLogin(e.target.value); setEditError('') }} className={inputCls}/></div>
              </div>
              <div className="grid grid-cols-2 gap-3.5 items-start">
                <div>
                  <label className={labelCls}>Yangi parol <span className="font-normal text-slate-400">(bo'sh qolsa o'zgarmaydi)</span></label>
                  <div className="relative">
                    <input type={editPassShow ? 'text' : 'password'} value={editPass} placeholder="Yangi parol..." onChange={e => setEditPass(e.target.value)} className={`${inputCls} pr-10`}/>
                    <button type="button" onClick={() => setEditPassShow(!editPassShow)} className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-slate-400 flex">{editPassShow ? <EyeOff size={15}/> : <Eye size={15}/>}</button>
                  </div>
                </div>
                <div><label className={labelCls}>Rol</label><RoleButtons value={editRole} onChange={setEditRole}/></div>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <label className={labelCls}>Ko'radigan tashkilotlar</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <LinkedCheckboxes selected={editLinked} setSelected={setEditLinked} groups={groups}/>
                </div>
              </div>

              {/* Telegram bog'lash */}
              <div className="border-t border-slate-100 pt-4">
                <label className={labelCls}>Telegram bot</label>
                {!tgLinking ? (
                  <button type="button" onClick={() => setTgLinking(true)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-sky-50 border border-sky-200 rounded-xl text-sky-600 text-[13.5px] font-semibold cursor-pointer hover:bg-sky-100 transition-colors">
                    <Send size={15}/> Telegram botga bog'lash
                  </button>
                ) : (
                  <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-sky-700"><Send size={13}/> Telegram bilan bog'lash</span>
                      <button type="button" onClick={() => { setTgLinking(false); setEditTgId('') }}
                        className="bg-transparent border-none cursor-pointer text-sky-400 hover:text-sky-600 flex p-0.5"><X size={14}/></button>
                    </div>
                    <input value={editTgId} onChange={e => setEditTgId(e.target.value)} placeholder="Telegram ID, masalan: 1889501628"
                      className="w-full px-3 py-2 bg-white border border-sky-200 rounded-lg text-slate-800 text-[13.5px] outline-none focus:border-sky-400 transition-colors mb-1.5"/>
                    <p className="text-[11px] text-sky-600/70 m-0">Kimga tegishli: <b>{editName || 'akkaunt'}</b>. Bot orqali ochilganda shu ID avtomatik login qiladi.</p>
                  </div>
                )}
              </div>

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
