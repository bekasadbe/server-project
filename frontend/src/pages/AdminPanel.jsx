import { useState } from 'react'
import { Plus, Trash2, Search, FolderOpen, Folder, Eye, EyeOff, Key, Pencil, UserPlus } from 'lucide-react'

export default function AdminPanel({ employees, groups, onAddEmployee, onDeleteEmployee, onUpdateEmployee, onAddGroup, onDeleteGroup, onMoveEmployee, onUpdateGroup }) {
  const [selectedGroup, setSelectedGroup] = useState(groups[0]?.id || null)
  const [search, setSearch]               = useState('')

  // Yangi xodim
  const [newId, setNewId]     = useState('')
  const [newName, setNewName] = useState('')
  const [addError, setAddError] = useState('')

  // Yangi tashkilot modal
  const [showNewOrg, setShowNewOrg] = useState(false)
  const [orgName, setOrgName]       = useState('')
  const [orgLogin, setOrgLogin]     = useState('')
  const [orgPass, setOrgPass]       = useState('')
  const [orgError, setOrgError]     = useState('')
  const [showOrgPass, setShowOrgPass] = useState(false)

  // Parol ko'rsatish
  const [showPassFor, setShowPassFor] = useState(null)

  // Xodimni tahrirlash modal
  const [showEditEmp, setShowEditEmp] = useState(false)
  const [editEmpId, setEditEmpId]     = useState('')
  const [editEmpNewId, setEditEmpNewId] = useState('')
  const [editEmpName, setEditEmpName]   = useState('')
  const [editEmpError, setEditEmpError] = useState('')

  // Xodim qo'shish modal
  const [showAddEmp, setShowAddEmp] = useState(false)

  // Login/parol o'zgartirish modal
  const [showEditCred, setShowEditCred] = useState(false)
  const [editLogin, setEditLogin]       = useState('')
  const [editPass, setEditPass]         = useState('')
  const [editPassShow, setEditPassShow] = useState(false)
  const [credError, setCredError]       = useState('')

  const currentGroup = groups.find(g => g.id === selectedGroup) ||
    (groups.length > 0 ? groups[0] : null)
  const groupEmps    = employees.filter(e => e.group === selectedGroup)
  const filtered     = groupEmps.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) || e.id.includes(search)
  )

  const handleAddEmployee = () => {
    if (!newId.trim())   return setAddError('ID kiriting')
    if (!newName.trim()) return setAddError('Ism kiriting')
    const fid = newId.trim().padStart(8, '0')
    if (employees.find(e => e.id === fid)) return setAddError('Bu ID allaqachon mavjud')
    onAddEmployee({ id: fid, name: newName.trim(), group: selectedGroup })
    setNewId(''); setNewName(''); setAddError(''); setShowAddEmp(false)
  }

  const openEditEmp = (emp) => {
    setEditEmpId(emp.id)
    setEditEmpNewId(emp.id)
    setEditEmpName(emp.name)
    setEditEmpError('')
    setShowEditEmp(true)
  }

  const handleSaveEmp = () => {
    if (!editEmpNewId.trim()) return setEditEmpError('ID kiriting')
    if (!editEmpName.trim())  return setEditEmpError('Ism kiriting')
    const fid = editEmpNewId.trim().padStart(8, '0')
    // Boshqa xodimda bu ID bor-yo'qligini tekshirish
    if (fid !== editEmpId && employees.find(e => e.id === fid))
      return setEditEmpError('Bu ID allaqachon mavjud')
    onUpdateEmployee(editEmpId, { id: fid, name: editEmpName.trim() })
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

  return (
    <div>
      <div style={{ marginBottom:'20px' }}>
        <h1 style={{ margin:0, fontSize:'22px', fontWeight:700, color:'#f1f5f9' }}>⚙️ Admin panel</h1>
        <p style={{ margin:'4px 0 0', fontSize:'13px', color:'#64748b' }}>Tashkilotlar va xodimlarni boshqarish</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', gap:'16px', alignItems:'start' }}>

        {/* ===== CHAP — Tashkilotlar daraxti ===== */}
        <div style={{ background:'#161b27', borderRadius:'14px', border:'1px solid #1e2535', overflow:'hidden' }}>
          <div style={{ padding:'12px', borderBottom:'1px solid #1e2535', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:'13px', fontWeight:600, color:'#94a3b8' }}>TASHKILOTLAR</span>
            <button onClick={() => setShowNewOrg(true)} style={{
              background:'#6366f120', border:'1px solid #6366f130', borderRadius:'6px',
              color:'#a5b4fc', padding:'4px 8px', cursor:'pointer', display:'flex', alignItems:'center', gap:'4px', fontSize:'12px'
            }}><Plus size={12}/> Yangi</button>
          </div>

          <div style={{ padding:'8px' }}>
            {groups.map(g => {
              const count  = employees.filter(e => e.group === g.id).length
              const active = selectedGroup === g.id
              return (
                <button key={g.id} onClick={() => { setSelectedGroup(g.id); setSearch(''); setAddError('') }}
                  style={{
                    width:'100%', display:'flex', alignItems:'center', gap:'8px',
                    padding:'9px 10px', borderRadius:'8px', border:'none', cursor:'pointer', textAlign:'left', marginBottom:'2px',
                    background: active ? '#6366f120' : 'transparent',
                    borderLeft: active ? '3px solid #6366f1' : '3px solid transparent',
                  }}>
                  {active
                    ? <FolderOpen size={15} color="#6366f1"/>
                    : <Folder size={15} color="#475569"/>}
                  <span style={{ flex:1, fontSize:'13px', color: active ? '#a5b4fc' : '#94a3b8', fontWeight: active ? 600 : 400, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {g.name}
                  </span>
                  <span style={{ fontSize:'11px', color:'#475569', flexShrink:0 }}>{count}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ===== O'NG — Tanlangan tashkilot xodimlari ===== */}
        {currentGroup ? (
          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>

            {/* Tashkilot header */}
            <div style={{ background:'#161b27', borderRadius:'14px', border:'1px solid #1e2535', padding:'16px 20px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                  <FolderOpen size={20} color="#6366f1"/>
                  <div>
                    <div style={{ fontSize:'16px', fontWeight:700, color:'#f1f5f9' }}>{currentGroup.name}</div>
                    <div style={{ fontSize:'12px', color:'#64748b', marginTop:'2px' }}>{groupEmps.length} ta xodim</div>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                  {/* Login/parol + tahrirlash */}
                  <div style={{ background:'#0f1117', borderRadius:'9px', padding:'8px 14px', border:'1px solid #1e2535', display:'flex', alignItems:'center', gap:'10px' }}>
                    <Key size={13} color="#475569"/>
                    <span style={{ fontSize:'13px', color:'#a5b4fc', fontWeight:600 }}>{currentGroup.login}</span>
                    <span style={{ color:'#334155' }}>/</span>
                    <span style={{ fontSize:'13px', color:'#94a3b8', fontFamily:'monospace' }}>
                      {showPassFor === currentGroup.id ? currentGroup.password : '••••••••'}
                    </span>
                    <button onClick={() => setShowPassFor(showPassFor === currentGroup.id ? null : currentGroup.id)}
                      style={{ background:'none', border:'none', cursor:'pointer', color:'#475569', display:'flex' }}>
                      {showPassFor === currentGroup.id ? <EyeOff size={13}/> : <Eye size={13}/>}
                    </button>
                    <button onClick={() => { setEditLogin(currentGroup.login); setEditPass(currentGroup.password); setShowEditCred(true) }}
                      style={{ background:'#6366f115', border:'1px solid #6366f130', borderRadius:'6px', color:'#a5b4fc', padding:'4px 8px', cursor:'pointer', display:'flex', alignItems:'center', gap:'4px', fontSize:'12px' }}>
                      <Pencil size={12}/> O'zgartirish
                    </button>
                  </div>
                  {/* Xodim qo'shish */}
                  <button onClick={() => { setNewId(''); setNewName(''); setAddError(''); setShowAddEmp(true) }} style={{
                    background:'#22c55e18', border:'1px solid #22c55e30', borderRadius:'8px',
                    color:'#4ade80', padding:'8px 14px', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', fontSize:'13px', fontWeight:600
                  }}><UserPlus size={15}/> Xodim qo'shish</button>
                  {/* O'chirish */}
                  <button onClick={() => onDeleteGroup(currentGroup.id)} style={{
                    background:'#ef444415', border:'1px solid #ef444430', borderRadius:'8px',
                    color:'#f87171', padding:'8px 12px', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', fontSize:'13px'
                  }}><Trash2 size={14}/> O'chirish</button>
                </div>
              </div>
            </div>

            {/* Xodimlar jadvali */}
            <div style={{ background:'#161b27', borderRadius:'14px', border:'1px solid #1e2535', overflow:'hidden' }}>
              <div style={{ padding:'12px 16px', borderBottom:'1px solid #1e2535', display:'flex', alignItems:'center', gap:'10px' }}>
                <Search size={14} color="#475569"/>
                <input placeholder="Xodim qidirish..." value={search} onChange={e => setSearch(e.target.value)}
                  style={{ flex:1, background:'none', border:'none', color:'#f1f5f9', fontSize:'13px', outline:'none' }}/>
                <span style={{ fontSize:'12px', color:'#475569' }}>{filtered.length} ta</span>
              </div>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'#0f1117' }}>
                    {['№','Face ID','Ism Familiya','Boshqa guruhga',''].map((h, i) => (
                      <th key={i} style={{ padding:'9px 14px', textAlign:'left', fontSize:'11px', color:'#475569', fontWeight:600, textTransform:'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((emp, i) => (
                    <tr key={emp.id} style={{ borderTop:'1px solid #1e2535' }}>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#475569' }}>{i+1}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#64748b', fontFamily:'monospace' }}>{emp.id}</td>
                      <td style={{ padding:'10px 14px', fontSize:'14px', color:'#e2e8f0', fontWeight:500 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                          <div style={{ width:'28px', height:'28px', borderRadius:'8px', background:'#6366f120', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:700, color:'#a5b4fc', flexShrink:0 }}>
                            {emp.name[0]}
                          </div>
                          {emp.name}
                        </div>
                      </td>
                      <td style={{ padding:'10px 14px' }}>
                        <select value={emp.group} onChange={e => onMoveEmployee(emp.id, e.target.value)}
                          style={{ padding:'4px 8px', background:'#1e2535', border:'1px solid #334155', borderRadius:'6px', color:'#94a3b8', fontSize:'12px', outline:'none' }}>
                          {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                      </td>
                      <td style={{ padding:'10px 14px', textAlign:'right' }}>
                        <div style={{ display:'flex', gap:'6px', justifyContent:'flex-end' }}>
                          <button onClick={() => openEditEmp(emp)} style={{
                            background:'#6366f115', border:'1px solid #6366f130', borderRadius:'6px',
                            color:'#a5b4fc', padding:'5px 8px', cursor:'pointer', display:'inline-flex'
                          }}><Pencil size={13}/></button>
                          <button onClick={() => onDeleteEmployee(emp.id)} style={{
                            background:'#ef444415', border:'1px solid #ef444430', borderRadius:'6px',
                            color:'#f87171', padding:'5px 8px', cursor:'pointer', display:'inline-flex'
                          }}><Trash2 size={13}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'200px', color:'#475569', fontSize:'14px' }}>
            Chap tarafdan tashkilot tanlang
          </div>
        )}
      </div>

      {/* ===== XODIMNI TAHRIRLASH MODAL ===== */}
      {showEditEmp && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'#161b27', borderRadius:'16px', border:'1px solid #1e2535', padding:'32px', width:'100%', maxWidth:'420px' }}>
            <h2 style={{ margin:'0 0 6px', fontSize:'18px', fontWeight:700, color:'#f1f5f9' }}>✏️ Xodimni tahrirlash</h2>
            <p style={{ margin:'0 0 24px', fontSize:'13px', color:'#64748b' }}>ID: {editEmpId}</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              <div>
                <label style={{ fontSize:'12px', color:'#64748b', display:'block', marginBottom:'5px' }}>Face ID raqami</label>
                <input value={editEmpNewId} onChange={e => { setEditEmpNewId(e.target.value); setEditEmpError('') }}
                  style={{ width:'100%', padding:'10px 12px', background:'#0f1117', border:'1px solid #1e2535', borderRadius:'8px', color:'#f1f5f9', fontSize:'14px', outline:'none', boxSizing:'border-box' }}/>
              </div>
              <div>
                <label style={{ fontSize:'12px', color:'#64748b', display:'block', marginBottom:'5px' }}>Ism Familiya</label>
                <input value={editEmpName} onChange={e => { setEditEmpName(e.target.value); setEditEmpError('') }}
                  style={{ width:'100%', padding:'10px 12px', background:'#0f1117', border:'1px solid #1e2535', borderRadius:'8px', color:'#f1f5f9', fontSize:'14px', outline:'none', boxSizing:'border-box' }}/>
              </div>
              {editEmpError && <div style={{ padding:'8px 12px', background:'#ef444415', border:'1px solid #ef444430', borderRadius:'7px', color:'#f87171', fontSize:'13px' }}>⚠️ {editEmpError}</div>}
              <div style={{ display:'flex', gap:'10px', marginTop:'4px' }}>
                <button onClick={() => setShowEditEmp(false)}
                  style={{ flex:1, padding:'10px', background:'#1e2535', border:'none', borderRadius:'9px', color:'#94a3b8', fontSize:'14px', cursor:'pointer' }}>Bekor qilish</button>
                <button onClick={handleSaveEmp}
                  style={{ flex:1, padding:'10px', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', border:'none', borderRadius:'9px', color:'white', fontSize:'14px', fontWeight:600, cursor:'pointer' }}>Saqlash</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== XODIM QO'SHISH MODAL ===== */}
      {showAddEmp && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'#161b27', borderRadius:'16px', border:'1px solid #1e2535', padding:'32px', width:'100%', maxWidth:'420px' }}>
            <h2 style={{ margin:'0 0 6px', fontSize:'18px', fontWeight:700, color:'#f1f5f9' }}>👤 Xodim qo'shish</h2>
            <p style={{ margin:'0 0 24px', fontSize:'13px', color:'#64748b' }}>{currentGroup?.name}</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              <div>
                <label style={{ fontSize:'12px', color:'#64748b', display:'block', marginBottom:'5px' }}>Face ID raqami</label>
                <input value={newId} onChange={e => { setNewId(e.target.value); setAddError('') }}
                  placeholder="Masalan: 00000123"
                  style={{ width:'100%', padding:'10px 12px', background:'#0f1117', border:'1px solid #1e2535', borderRadius:'8px', color:'#f1f5f9', fontSize:'14px', outline:'none', boxSizing:'border-box' }}/>
              </div>
              <div>
                <label style={{ fontSize:'12px', color:'#64748b', display:'block', marginBottom:'5px' }}>Ism Familiya</label>
                <input value={newName} onChange={e => { setNewName(e.target.value); setAddError('') }}
                  placeholder="Masalan: Karimov Bobur"
                  style={{ width:'100%', padding:'10px 12px', background:'#0f1117', border:'1px solid #1e2535', borderRadius:'8px', color:'#f1f5f9', fontSize:'14px', outline:'none', boxSizing:'border-box' }}/>
              </div>
              {addError && <div style={{ padding:'8px 12px', background:'#ef444415', border:'1px solid #ef444430', borderRadius:'7px', color:'#f87171', fontSize:'13px' }}>⚠️ {addError}</div>}
              <div style={{ display:'flex', gap:'10px', marginTop:'4px' }}>
                <button onClick={() => setShowAddEmp(false)}
                  style={{ flex:1, padding:'10px', background:'#1e2535', border:'none', borderRadius:'9px', color:'#94a3b8', fontSize:'14px', cursor:'pointer' }}>Bekor qilish</button>
                <button onClick={handleAddEmployee}
                  style={{ flex:1, padding:'10px', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', border:'none', borderRadius:'9px', color:'white', fontSize:'14px', fontWeight:600, cursor:'pointer' }}>Qo'shish</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== LOGIN/PAROL O'ZGARTIRISH MODAL ===== */}
      {showEditCred && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'#161b27', borderRadius:'16px', border:'1px solid #1e2535', padding:'32px', width:'100%', maxWidth:'400px' }}>
            <h2 style={{ margin:'0 0 6px', fontSize:'18px', fontWeight:700, color:'#f1f5f9' }}>🔑 Login / Parol</h2>
            <p style={{ margin:'0 0 24px', fontSize:'13px', color:'#64748b' }}>{currentGroup?.name}</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              <div>
                <label style={{ fontSize:'12px', color:'#64748b', display:'block', marginBottom:'5px' }}>Login</label>
                <input value={editLogin} onChange={e => { setEditLogin(e.target.value); setCredError('') }}
                  style={{ width:'100%', padding:'10px 12px', background:'#0f1117', border:'1px solid #1e2535', borderRadius:'8px', color:'#f1f5f9', fontSize:'14px', outline:'none', boxSizing:'border-box' }}/>
              </div>
              <div>
                <label style={{ fontSize:'12px', color:'#64748b', display:'block', marginBottom:'5px' }}>Parol</label>
                <div style={{ position:'relative' }}>
                  <input type={editPassShow ? 'text' : 'password'} value={editPass} onChange={e => { setEditPass(e.target.value); setCredError('') }}
                    style={{ width:'100%', padding:'10px 36px 10px 12px', background:'#0f1117', border:'1px solid #1e2535', borderRadius:'8px', color:'#f1f5f9', fontSize:'14px', outline:'none', boxSizing:'border-box' }}/>
                  <button type="button" onClick={() => setEditPassShow(!editPassShow)}
                    style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#475569', display:'flex' }}>
                    {editPassShow ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </button>
                </div>
              </div>
              {credError && <div style={{ padding:'8px 12px', background:'#ef444415', border:'1px solid #ef444430', borderRadius:'7px', color:'#f87171', fontSize:'13px' }}>{credError}</div>}
              <div style={{ display:'flex', gap:'10px', marginTop:'4px' }}>
                <button onClick={() => setShowEditCred(false)}
                  style={{ flex:1, padding:'10px', background:'#1e2535', border:'none', borderRadius:'9px', color:'#94a3b8', fontSize:'14px', cursor:'pointer' }}>Bekor qilish</button>
                <button onClick={handleSaveCred}
                  style={{ flex:1, padding:'10px', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', border:'none', borderRadius:'9px', color:'white', fontSize:'14px', fontWeight:600, cursor:'pointer' }}>Saqlash</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== YANGI TASHKILOT MODAL ===== */}
      {showNewOrg && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'#161b27', borderRadius:'16px', border:'1px solid #1e2535', padding:'32px', width:'100%', maxWidth:'420px' }}>
            <h2 style={{ margin:'0 0 24px', fontSize:'18px', fontWeight:700, color:'#f1f5f9' }}>📁 Yangi tashkilot</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              <div>
                <label style={{ fontSize:'12px', color:'#64748b', display:'block', marginBottom:'5px' }}>Tashkilot nomi</label>
                <input value={orgName} onChange={e => { setOrgName(e.target.value); setOrgError('') }}
                  placeholder="Masalan: IT bo'limi"
                  style={{ width:'100%', padding:'10px 12px', background:'#0f1117', border:'1px solid #1e2535', borderRadius:'8px', color:'#f1f5f9', fontSize:'14px', outline:'none', boxSizing:'border-box' }}/>
              </div>
              <div>
                <label style={{ fontSize:'12px', color:'#64748b', display:'block', marginBottom:'5px' }}>Login</label>
                <input value={orgLogin} onChange={e => { setOrgLogin(e.target.value); setOrgError('') }}
                  placeholder="Masalan: itbolim"
                  style={{ width:'100%', padding:'10px 12px', background:'#0f1117', border:'1px solid #1e2535', borderRadius:'8px', color:'#f1f5f9', fontSize:'14px', outline:'none', boxSizing:'border-box' }}/>
              </div>
              <div>
                <label style={{ fontSize:'12px', color:'#64748b', display:'block', marginBottom:'5px' }}>Parol</label>
                <div style={{ position:'relative' }}>
                  <input type={showOrgPass ? 'text' : 'password'} value={orgPass} onChange={e => { setOrgPass(e.target.value); setOrgError('') }}
                    placeholder="••••••••"
                    style={{ width:'100%', padding:'10px 36px 10px 12px', background:'#0f1117', border:'1px solid #1e2535', borderRadius:'8px', color:'#f1f5f9', fontSize:'14px', outline:'none', boxSizing:'border-box' }}/>
                  <button type="button" onClick={() => setShowOrgPass(!showOrgPass)} style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#475569', display:'flex' }}>
                    {showOrgPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </button>
                </div>
              </div>
              {orgError && <div style={{ padding:'8px 12px', background:'#ef444415', border:'1px solid #ef444430', borderRadius:'7px', color:'#f87171', fontSize:'13px' }}>{orgError}</div>}
              <div style={{ display:'flex', gap:'10px', marginTop:'4px' }}>
                <button onClick={() => { setShowNewOrg(false); setOrgName(''); setOrgLogin(''); setOrgPass(''); setOrgError('') }}
                  style={{ flex:1, padding:'10px', background:'#1e2535', border:'none', borderRadius:'9px', color:'#94a3b8', fontSize:'14px', cursor:'pointer' }}>
                  Bekor qilish
                </button>
                <button onClick={handleAddOrg}
                  style={{ flex:1, padding:'10px', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', border:'none', borderRadius:'9px', color:'white', fontSize:'14px', fontWeight:600, cursor:'pointer' }}>
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
