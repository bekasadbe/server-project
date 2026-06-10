import { useState } from 'react'
import { Plus, Trash2, Search, FolderOpen, Folder, Eye, EyeOff, Key, Pencil, UserPlus, Settings2, AlertCircle, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'

export default function AdminPanel({ employees, groups, onAddEmployee, onDeleteEmployee, onDeleteEmployees, onUpdateEmployee, onAddGroup, onDeleteGroup, onMoveEmployee, onUpdateGroup }) {
  const [selectedGroup, setSelectedGroup] = useState(groups[0]?.id || null)
  const [search, setSearch]               = useState('')
  const [selected, setSelected]           = useState(new Set())

  const [newId, setNewId]     = useState('')
  const [newName, setNewName] = useState('')
  const [addError, setAddError] = useState('')

  const [showNewOrg, setShowNewOrg] = useState(false)
  const [orgName, setOrgName]       = useState('')
  const [orgLogin, setOrgLogin]     = useState('')
  const [orgPass, setOrgPass]       = useState('')
  const [orgError, setOrgError]     = useState('')
  const [showOrgPass, setShowOrgPass] = useState(false)

  const [showPassFor, setShowPassFor] = useState(null)

  const [showEditEmp, setShowEditEmp] = useState(false)
  const [editEmpId, setEditEmpId]       = useState('')
  const [editEmpNewId, setEditEmpNewId] = useState('')
  const [editEmpName, setEditEmpName]   = useState('')
  const [editEmpLavozim, setEditEmpLavozim] = useState('')
  const [editEmpError, setEditEmpError] = useState('')

  const [showAddEmp, setShowAddEmp] = useState(false)

  const [showEditCred, setShowEditCred] = useState(false)
  const [editLogin, setEditLogin]       = useState('')
  const [editPass, setEditPass]         = useState('')
  const [editPassShow, setEditPassShow] = useState(false)
  const [credError, setCredError]       = useState('')

  const currentGroup = groups.find(g => g.id === selectedGroup) || (groups.length > 0 ? groups[0] : null)
  const groupEmps    = employees.filter(e => e.group === selectedGroup)
  const filtered     = groupEmps.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) || e.id.includes(search)
  )

  const toggleSelect = (id) => {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }
  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set())
    else setSelected(new Set(filtered.map(e => e.id)))
  }

  const handleAddEmployee = () => {
    if (!newId.trim())   return setAddError('ID kiriting')
    if (!newName.trim()) return setAddError('Ism kiriting')
    const fid = newId.trim().padStart(8, '0')
    if (employees.find(e => e.id === fid)) return setAddError('Bu ID allaqachon mavjud')
    onAddEmployee({ id: fid, name: newName.trim(), group: selectedGroup, lavozim: '' })
    setNewId(''); setNewName(''); setAddError(''); setShowAddEmp(false)
  }

  const openEditEmp = (emp) => {
    setEditEmpId(emp.id)
    setEditEmpNewId(emp.id)
    setEditEmpName(emp.name)
    setEditEmpLavozim(emp.lavozim || '')
    setEditEmpError('')
    setShowEditEmp(true)
  }

  const handleSaveEmp = () => {
    if (!editEmpNewId.trim()) return setEditEmpError('ID kiriting')
    if (!editEmpName.trim())  return setEditEmpError('Ism kiriting')
    const fid = editEmpNewId.trim().padStart(8, '0')
    if (fid !== editEmpId && employees.find(e => e.id === fid))
      return setEditEmpError('Bu ID allaqachon mavjud')
    onUpdateEmployee(editEmpId, { id: fid, name: editEmpName.trim(), lavozim: editEmpLavozim.trim() })
    setShowEditEmp(false)
  }

  const handleSaveCred = () => {
    if (!editLogin.trim()) return setCredError('Login kiriting')
    if (!editPass.trim())  return setCredError('Parol kiriting')
    onUpdateGroup(selectedGroup, { login: editLogin.trim(), password: editPass.trim() })
    setShowEditCred(false); setCredError('')
  }

  const handleAddOrg = () => {
    if (!orgName.trim())  return setOrgError('Tashkilot nomi kiriting')
    if (!orgLogin.trim()) return setOrgError('Login kiriting')
    if (!orgPass.trim())  return setOrgError('Parol kiriting')
    const id = orgLogin.trim().toLowerCase().replace(/\s+/g, '_')
    if (groups.find(g => g.id === id || g.login === orgLogin)) return setOrgError('Bu login allaqachon mavjud')
    onAddGroup({ id, name: orgName.trim(), login: orgLogin.trim(), password: orgPass.trim() })
    setOrgName(''); setOrgLogin(''); setOrgPass(''); setOrgError(''); setShowNewOrg(false)
    setSelectedGroup(id)
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px',
    background: '#ffffff', border: '1px solid #e2e8f0',
    borderRadius: '8px', color: '#0f172a', fontSize: '14px',
    outline: 'none', boxSizing: 'border-box',
  }
  const modalStyle = {
    background: '#ffffff', borderRadius: '16px',
    border: '1px solid #e2e8f0', padding: '32px',
    width: '100%', maxWidth: '420px',
    boxShadow: '0 20px 60px #0f172a18',
  }
  const overlayStyle = {
    position: 'fixed', inset: 0,
    background: 'rgba(15,23,42,0.35)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    backdropFilter: 'blur(2px)',
  }

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>Admin panel</h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>Tashkilotlar va xodimlarni boshqarish</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '16px', alignItems: 'start' }}>

        {/* LEFT — Organizations */}
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px #0f172a08' }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tashkilotlar</span>
            <button onClick={() => setShowNewOrg(true)} style={{
              background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px',
              color: '#2563eb', padding: '4px 10px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600,
            }}><Plus size={12} /> Yangi</button>
          </div>
          <div style={{ padding: '8px' }}>
            {groups.map(g => {
              const count  = employees.filter(e => e.group === g.id).length
              const active = selectedGroup === g.id
              return (
                <button key={g.id} onClick={() => { setSelectedGroup(g.id); setSearch(''); setSelected(new Set()) }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '9px 10px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                    textAlign: 'left', marginBottom: '2px',
                    background: active ? '#eff6ff' : 'transparent',
                  }}>
                  {active
                    ? <FolderOpen size={15} color="#2563eb" />
                    : <Folder size={15} color="#94a3b8" />}
                  <span style={{ flex: 1, fontSize: '13px', color: active ? '#2563eb' : '#475569', fontWeight: active ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {g.name}
                  </span>
                  <span style={{ fontSize: '11px', color: active ? '#93c5fd' : '#cbd5e1', background: active ? '#dbeafe' : '#f1f5f9', padding: '1px 7px', borderRadius: '20px', fontWeight: 600 }}>{count}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* RIGHT — Employee table */}
        {currentGroup ? (
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px #0f172a08' }}>
            {/* Toolbar */}
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Search */}
              <div style={{ flex: 1, position: 'relative' }}>
                <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  placeholder={`${currentGroup.name} xodimlarini qidirish...`}
                  value={search} onChange={e => setSearch(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px 9px 36px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '9px', color: '#0f172a', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Action icons */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  title="Login/parol o'zgartirish"
                  onClick={() => { setEditLogin(currentGroup.login); setEditPass(currentGroup.password); setShowEditCred(true) }}
                  style={{ padding: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', display: 'flex', color: '#64748b' }}>
                  <Settings2 size={16} />
                </button>
                <button
                  title="Tashkilotni o'chirish"
                  onClick={() => onDeleteGroup(currentGroup.id)}
                  style={{ padding: '8px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '8px', cursor: 'pointer', display: 'flex', color: '#e11d48' }}>
                  <Trash2 size={16} />
                </button>
                <button
                  title="Login/parolni ko'rish"
                  onClick={() => setShowPassFor(showPassFor === currentGroup.id ? null : currentGroup.id)}
                  style={{ padding: '8px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', cursor: 'pointer', display: 'flex', color: '#d97706' }}>
                  <AlertCircle size={16} />
                </button>
                <button style={{ padding: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', display: 'flex', color: '#64748b' }}>
                  <MoreHorizontal size={16} />
                </button>
              </div>

              {/* Bulk delete */}
              {selected.size > 0 && (
                <button onClick={() => {
                  if (window.confirm(`${selected.size} ta xodimni o'chirasizmi?`)) {
                    onDeleteEmployees([...selected])
                    setSelected(new Set())
                  }
                }} style={{
                  background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '9px',
                  color: '#e11d48', padding: '9px 14px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap',
                }}>
                  <Trash2 size={14} /> {selected.size} ta o'chirish
                </button>
              )}

              {/* Add button */}
              <button onClick={() => { setNewId(''); setNewName(''); setAddError(''); setShowAddEmp(true) }} style={{
                background: '#2563eb', border: 'none', borderRadius: '9px',
                color: 'white', padding: '9px 16px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600,
                boxShadow: '0 2px 8px #2563eb40', whiteSpace: 'nowrap',
              }}>
                <UserPlus size={15} /> Xodim qo'shish
              </button>

              {/* Pagination info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                <button style={{ padding: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', display: 'flex', color: '#94a3b8' }}><ChevronLeft size={14} /></button>
                <button style={{ padding: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', display: 'flex', color: '#94a3b8' }}><ChevronRight size={14} /></button>
                <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '4px', whiteSpace: 'nowrap' }}>
                  {filtered.length} ta xodim
                </span>
              </div>
            </div>

            {/* Parol ko'rinishi */}
            {showPassFor === currentGroup.id && (
              <div style={{ padding: '10px 18px', background: '#fffbeb', borderBottom: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={13} color="#d97706" />
                <span style={{ fontSize: '13px', color: '#92400e' }}>Login: <strong>{currentGroup.login}</strong></span>
                <span style={{ color: '#fde68a' }}>|</span>
                <span style={{ fontSize: '13px', color: '#92400e' }}>Parol: <strong style={{ fontFamily: 'monospace' }}>{currentGroup.password}</strong></span>
                <button onClick={() => setShowPassFor(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#d97706', fontSize: '18px', lineHeight: 1 }}>×</button>
              </div>
            )}

            {/* Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '11px 16px', width: '40px' }}>
                    <input type="checkbox"
                      checked={filtered.length > 0 && selected.size === filtered.length}
                      onChange={toggleAll}
                      style={{ cursor: 'pointer', accentColor: '#2563eb' }} />
                  </th>
                  {['Ism Familiya', 'Lavozim', 'Face ID', 'Guruh', ''].map((h, i) => (
                    <th key={i} style={{ padding: '11px 14px', textAlign: 'left', fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp) => {
                  const isSelected = selected.has(emp.id)
                  return (
                    <tr key={emp.id} style={{ borderTop: '1px solid #f1f5f9', background: isSelected ? '#eff6ff' : 'transparent' }}>
                      <td style={{ padding: '11px 16px' }}>
                        <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(emp.id)}
                          style={{ cursor: 'pointer', accentColor: '#2563eb' }} />
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: isSelected ? '#2563eb' : '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: isSelected ? '#fff' : '#2563eb', flexShrink: 0 }}>
                            {emp.name[0]}
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{emp.name}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '13px', color: emp.lavozim ? '#475569' : '#cbd5e1', fontStyle: emp.lavozim ? 'normal' : 'italic' }}>
                        {emp.lavozim || '—'}
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '13px', color: '#64748b', fontFamily: 'monospace' }}>
                        #{emp.id}
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <select value={emp.group} onChange={e => onMoveEmployee(emp.id, e.target.value)}
                          style={{ padding: '5px 8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#475569', fontSize: '12px', outline: 'none', cursor: 'pointer' }}>
                          {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: '11px 14px', textAlign: 'right' }}>
                        <button onClick={() => openEditEmp(emp)} style={{
                          background: '#2563eb', border: 'none', borderRadius: '7px',
                          color: 'white', padding: '6px 14px', cursor: 'pointer',
                          fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px',
                        }}>
                          <Pencil size={12} /> Tahrirlash
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#94a3b8', fontSize: '14px', background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            Chap tarafdan tashkilot tanlang
          </div>
        )}
      </div>

      {/* XODIMNI TAHRIRLASH MODAL */}
      {showEditEmp && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Xodimni tahrirlash</h2>
            <p style={{ margin: '0 0 24px', fontSize: '13px', color: '#94a3b8' }}>ID: {editEmpId}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '5px', fontWeight: 600 }}>Face ID raqami</label>
                <input value={editEmpNewId} onChange={e => { setEditEmpNewId(e.target.value); setEditEmpError('') }} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '5px', fontWeight: 600 }}>Ism Familiya</label>
                <input value={editEmpName} onChange={e => { setEditEmpName(e.target.value); setEditEmpError('') }} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '5px', fontWeight: 600 }}>Lavozim</label>
                <input value={editEmpLavozim} onChange={e => setEditEmpLavozim(e.target.value)}
                  placeholder="Masalan: Dasturchi, Hisobchi..."
                  style={inputStyle} />
              </div>
              {editEmpError && (
                <div style={{ padding: '8px 12px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '7px', color: '#e11d48', fontSize: '13px' }}>
                  ⚠️ {editEmpError}
                </div>
              )}
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button onClick={() => {
                  if (window.confirm(`${editEmpName} ni o'chirasizmi?`)) {
                    onDeleteEmployee(editEmpId)
                    setShowEditEmp(false)
                  }
                }} style={{ padding: '10px 14px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '9px', color: '#e11d48', fontSize: '14px', cursor: 'pointer', display:'flex', alignItems:'center', gap:'5px' }}>
                  <Trash2 size={14} /> O'chirish
                </button>
                <button onClick={() => setShowEditEmp(false)}
                  style={{ flex: 1, padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '9px', color: '#64748b', fontSize: '14px', cursor: 'pointer' }}>
                  Bekor qilish
                </button>
                <button onClick={handleSaveEmp}
                  style={{ flex: 1, padding: '10px', background: '#2563eb', border: 'none', borderRadius: '9px', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px #2563eb30' }}>
                  Saqlash
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* XODIM QO'SHISH MODAL */}
      {showAddEmp && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Xodim qo'shish</h2>
            <p style={{ margin: '0 0 24px', fontSize: '13px', color: '#94a3b8' }}>{currentGroup?.name}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '5px', fontWeight: 600 }}>Face ID raqami</label>
                <input value={newId} onChange={e => { setNewId(e.target.value); setAddError('') }}
                  placeholder="Masalan: 00000123" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '5px', fontWeight: 600 }}>Ism Familiya</label>
                <input value={newName} onChange={e => { setNewName(e.target.value); setAddError('') }}
                  placeholder="Masalan: Karimov Bobur" style={inputStyle} />
              </div>
              {addError && (
                <div style={{ padding: '8px 12px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '7px', color: '#e11d48', fontSize: '13px' }}>
                  ⚠️ {addError}
                </div>
              )}
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button onClick={() => setShowAddEmp(false)}
                  style={{ flex: 1, padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '9px', color: '#64748b', fontSize: '14px', cursor: 'pointer' }}>
                  Bekor qilish
                </button>
                <button onClick={handleAddEmployee}
                  style={{ flex: 1, padding: '10px', background: '#2563eb', border: 'none', borderRadius: '9px', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px #2563eb30' }}>
                  Qo'shish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LOGIN/PAROL O'ZGARTIRISH MODAL */}
      {showEditCred && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, maxWidth: '400px' }}>
            <h2 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Login / Parol</h2>
            <p style={{ margin: '0 0 24px', fontSize: '13px', color: '#94a3b8' }}>{currentGroup?.name}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '5px', fontWeight: 600 }}>Login</label>
                <input value={editLogin} onChange={e => { setEditLogin(e.target.value); setCredError('') }} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '5px', fontWeight: 600 }}>Parol</label>
                <div style={{ position: 'relative' }}>
                  <input type={editPassShow ? 'text' : 'password'} value={editPass}
                    onChange={e => { setEditPass(e.target.value); setCredError('') }}
                    style={{ ...inputStyle, paddingRight: '40px' }} />
                  <button type="button" onClick={() => setEditPassShow(!editPassShow)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
                    {editPassShow ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              {credError && (
                <div style={{ padding: '8px 12px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '7px', color: '#e11d48', fontSize: '13px' }}>
                  {credError}
                </div>
              )}
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button onClick={() => setShowEditCred(false)}
                  style={{ flex: 1, padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '9px', color: '#64748b', fontSize: '14px', cursor: 'pointer' }}>
                  Bekor qilish
                </button>
                <button onClick={handleSaveCred}
                  style={{ flex: 1, padding: '10px', background: '#2563eb', border: 'none', borderRadius: '9px', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px #2563eb30' }}>
                  Saqlash
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* YANGI TASHKILOT MODAL */}
      {showNewOrg && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ margin: '0 0 24px', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Yangi tashkilot</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '5px', fontWeight: 600 }}>Tashkilot nomi</label>
                <input value={orgName} onChange={e => { setOrgName(e.target.value); setOrgError('') }}
                  placeholder="Masalan: IT bo'limi" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '5px', fontWeight: 600 }}>Login</label>
                <input value={orgLogin} onChange={e => { setOrgLogin(e.target.value); setOrgError('') }}
                  placeholder="Masalan: itbolim" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '5px', fontWeight: 600 }}>Parol</label>
                <div style={{ position: 'relative' }}>
                  <input type={showOrgPass ? 'text' : 'password'} value={orgPass}
                    onChange={e => { setOrgPass(e.target.value); setOrgError('') }}
                    placeholder="••••••••"
                    style={{ ...inputStyle, paddingRight: '40px' }} />
                  <button type="button" onClick={() => setShowOrgPass(!showOrgPass)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
                    {showOrgPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              {orgError && (
                <div style={{ padding: '8px 12px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '7px', color: '#e11d48', fontSize: '13px' }}>
                  {orgError}
                </div>
              )}
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button onClick={() => { setShowNewOrg(false); setOrgName(''); setOrgLogin(''); setOrgPass(''); setOrgError('') }}
                  style={{ flex: 1, padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '9px', color: '#64748b', fontSize: '14px', cursor: 'pointer' }}>
                  Bekor qilish
                </button>
                <button onClick={handleAddOrg}
                  style={{ flex: 1, padding: '10px', background: '#2563eb', border: 'none', borderRadius: '9px', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px #2563eb30' }}>
                  Yaratish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
