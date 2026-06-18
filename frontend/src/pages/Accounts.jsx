import { useState } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff, KeyRound } from 'lucide-react'
import { apiFetch } from '../config'

export default function Accounts({ groups, accounts, onReload }) {
  const [showEdit, setShowEdit]     = useState(false)
  const [editAcc, setEditAcc]       = useState(null)
  const [editName, setEditName]     = useState('')
  const [editLogin, setEditLogin]   = useState('')
  const [editPass, setEditPass]     = useState('')
  const [editPassShow, setEditPassShow] = useState(false)
  const [editLinked, setEditLinked] = useState([])
  const [editError, setEditError]   = useState('')

  const [showAdd, setShowAdd]       = useState(false)
  const [newName, setNewName]       = useState('')
  const [newLogin, setNewLogin]     = useState('')
  const [newPass, setNewPass]       = useState('')
  const [newPassShow, setNewPassShow] = useState(false)
  const [newLinked, setNewLinked]   = useState([])
  const [newError, setNewError]     = useState('')

  const [visiblePass, setVisiblePass] = useState(null)

  const inputStyle = {
    width: '100%', padding: '10px 12px',
    background: '#ffffff', border: '1px solid #e2e8f0',
    borderRadius: '8px', color: '#0f172a', fontSize: '14px',
    outline: 'none', boxSizing: 'border-box',
  }
  const overlayStyle = {
    position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.35)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    backdropFilter: 'blur(2px)',
  }
  const modalStyle = {
    background: '#ffffff', borderRadius: '16px',
    border: '1px solid #e2e8f0', padding: '32px',
    width: '100%', maxWidth: '440px',
    boxShadow: '0 20px 60px #0f172a18',
    maxHeight: '90vh', overflowY: 'auto',
  }

  const openEdit = (acc) => {
    setEditAcc(acc)
    setEditName(acc.name)
    setEditLogin(acc.login || '')
    setEditPass('')
    setEditPassShow(false)
    setEditLinked((acc.linked_groups || '').split(',').filter(Boolean))
    setEditError('')
    setShowEdit(true)
  }

  const handleSaveEdit = async () => {
    if (!editLogin.trim()) return setEditError('Login kiriting')
    await apiFetch(`/accounts/${editAcc.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: editName.trim(),
        login: editLogin.trim(),
        password: editPass.trim() || '[[keep]]',
        linked_groups: editLinked,
      }),
    })
    setShowEdit(false)
    onReload()
  }

  const handleAdd = async () => {
    if (!newName.trim())  return setNewError('Akkaunt nomini kiriting')
    if (!newLogin.trim()) return setNewError('Login kiriting')
    if (!newPass.trim())  return setNewError('Parol kiriting')
    if (accounts.find(a => a.login === newLogin.trim())) return setNewError('Bu login allaqachon mavjud')
    await apiFetch('/accounts', {
      method: 'POST',
      body: JSON.stringify({
        name: newName.trim(),
        login: newLogin.trim(),
        password: newPass.trim(),
        linked_groups: newLinked,
      }),
    })
    setNewName(''); setNewLogin(''); setNewPass(''); setNewLinked([]); setNewError('')
    setShowAdd(false)
    onReload()
  }

  const handleDelete = async (acc) => {
    if (!window.confirm(`"${acc.name}" akkauntini o'chirasizmi?`)) return
    await apiFetch(`/accounts/${acc.id}`, { method: 'DELETE' })
    onReload()
  }

  const linkedNames = (acc) => {
    const ids = (acc.linked_groups || '').split(',').filter(Boolean)
    return ids.map(id => groups.find(g => g.id === id)?.name).filter(Boolean)
  }

  const LinkedCheckboxes = ({ selected, setSelected, excludeId }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {groups.map(g => {
        if (g.id === excludeId) return null
        const checked = selected.includes(g.id)
        return (
          <label key={g.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#374151' }}>
            <input type="checkbox" checked={checked}
              onChange={() => setSelected(prev => checked ? prev.filter(x => x !== g.id) : [...prev, g.id])}
              style={{ width: '15px', height: '15px', cursor: 'pointer' }} />
            {g.name}
          </label>
        )
      })}
    </div>
  )

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>Akkauntlar</h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>Login, parol va qaysi tashkilotlarni ko'rishini boshqarish</p>
        </div>
        <button onClick={() => { setNewName(''); setNewLogin(''); setNewPass(''); setNewLinked([]); setNewError(''); setShowAdd(true) }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: '#2563eb', border: 'none', borderRadius: '10px', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={15} /> Yangi akkaunt
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {accounts.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
            Hali akkaunt yo'q. "Yangi akkaunt" tugmasini bosing.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 18px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: '12px' }}>Akkaunt nomi</th>
                <th style={{ padding: '12px 18px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: '12px' }}>Login</th>
                <th style={{ padding: '12px 18px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: '12px' }}>Parol</th>
                <th style={{ padding: '12px 18px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: '12px' }}>Ko'radigan tashkilotlar</th>
                <th style={{ padding: '12px 18px' }}></th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((acc, i) => (
                <tr key={acc.id} style={{ borderBottom: i < accounts.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <KeyRound size={14} color="#2563eb" />
                      </div>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{acc.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px', color: '#374151', fontFamily: 'monospace' }}>
                    {acc.login || <span style={{ color: '#cbd5e1' }}>—</span>}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontFamily: 'monospace', color: '#374151', fontSize: '13px' }}>
                        {visiblePass === acc.id ? (acc.password || '—') : '••••••••'}
                      </span>
                      <button onClick={() => setVisiblePass(visiblePass === acc.id ? null : acc.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', padding: '2px' }}>
                        {visiblePass === acc.id ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {linkedNames(acc).length > 0
                        ? linkedNames(acc).map(name => (
                          <span key={name} style={{ padding: '2px 8px', background: '#eff6ff', color: '#2563eb', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>{name}</span>
                        ))
                        : <span style={{ color: '#cbd5e1', fontSize: '12px' }}>Belgilanmagan</span>
                      }
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button onClick={() => openEdit(acc)}
                        style={{ padding: '7px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '7px', cursor: 'pointer', display: 'flex', color: '#64748b' }}>
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(acc)}
                        style={{ padding: '7px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '7px', cursor: 'pointer', display: 'flex', color: '#e11d48' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* EDIT MODAL */}
      {showEdit && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ margin: '0 0 24px', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Akkauntni tahrirlash</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '5px', fontWeight: 600 }}>Akkaunt nomi</label>
                <input value={editName} onChange={e => { setEditName(e.target.value); setEditError('') }} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '5px', fontWeight: 600 }}>Login</label>
                <input value={editLogin} onChange={e => { setEditLogin(e.target.value); setEditError('') }} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '5px', fontWeight: 600 }}>
                  Yangi parol <span style={{ fontWeight: 400, color: '#94a3b8' }}>(bo'sh qolsa o'zgarmaydi)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input type={editPassShow ? 'text' : 'password'} value={editPass} placeholder="Yangi parol..."
                    onChange={e => setEditPass(e.target.value)}
                    style={{ ...inputStyle, paddingRight: '40px' }} />
                  <button type="button" onClick={() => setEditPassShow(!editPassShow)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
                    {editPassShow ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                  Ko'radigan tashkilotlar
                </label>
                <LinkedCheckboxes selected={editLinked} setSelected={setEditLinked} />
              </div>
              {editError && <div style={{ padding: '8px 12px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '7px', color: '#e11d48', fontSize: '13px' }}>{editError}</div>}
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button onClick={() => setShowEdit(false)} style={{ flex: 1, padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '9px', color: '#64748b', fontSize: '14px', cursor: 'pointer' }}>Bekor qilish</button>
                <button onClick={handleSaveEdit} style={{ flex: 1, padding: '10px', background: '#2563eb', border: 'none', borderRadius: '9px', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Saqlash</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD MODAL */}
      {showAdd && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ margin: '0 0 24px', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Yangi akkaunt</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '5px', fontWeight: 600 }}>Akkaunt nomi</label>
                <input value={newName} onChange={e => { setNewName(e.target.value); setNewError('') }} placeholder="Masalan: Rahbar, Markaz kadrlar" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '5px', fontWeight: 600 }}>Login</label>
                <input value={newLogin} onChange={e => { setNewLogin(e.target.value); setNewError('') }} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '5px', fontWeight: 600 }}>Parol</label>
                <div style={{ position: 'relative' }}>
                  <input type={newPassShow ? 'text' : 'password'} value={newPass}
                    onChange={e => { setNewPass(e.target.value); setNewError('') }}
                    style={{ ...inputStyle, paddingRight: '40px' }} />
                  <button type="button" onClick={() => setNewPassShow(!newPassShow)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
                    {newPassShow ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                  Ko'radigan tashkilotlar
                </label>
                <LinkedCheckboxes selected={newLinked} setSelected={setNewLinked} />
              </div>
              {newError && <div style={{ padding: '8px 12px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '7px', color: '#e11d48', fontSize: '13px' }}>{newError}</div>}
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '9px', color: '#64748b', fontSize: '14px', cursor: 'pointer' }}>Bekor qilish</button>
                <button onClick={handleAdd} style={{ flex: 1, padding: '10px', background: '#2563eb', border: 'none', borderRadius: '9px', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Yaratish</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
