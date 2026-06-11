import { useState } from 'react'
import { Users, Search, Building2, Pencil } from 'lucide-react'

export default function Employees({ employees = [], groups = [], onUpdateEmployee }) {
  const [search, setSearch]       = useState('')
  const [orgFilter, setOrgFilter] = useState('all')

  const [showEdit, setShowEdit]       = useState(false)
  const [editEmp, setEditEmp]         = useState(null)
  const [editName, setEditName]       = useState('')
  const [editLavozim, setEditLavozim] = useState('')
  const [editError, setEditError]     = useState('')
  const [saved, setSaved]             = useState(false)

  const openEdit = (emp) => {
    setEditEmp(emp)
    setEditName(emp.name)
    setEditLavozim(emp.lavozim || '')
    setEditError('')
    setSaved(false)
    setShowEdit(true)
  }

  const handleSave = () => {
    if (!editName.trim()) return setEditError('Ism kiriting')
    onUpdateEmployee(editEmp.id, { name: editName.trim(), group_id: editEmp.group || editEmp.group_id, lavozim: editLavozim.trim() })
    setSaved(true)
    setTimeout(() => setShowEdit(false), 800)
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px',
    background: '#fff', border: '1px solid #e2e8f0',
    borderRadius: '8px', color: '#0f172a', fontSize: '14px',
    outline: 'none', boxSizing: 'border-box',
  }

  const multiOrg = groups.length > 1

  const filtered = employees.filter(e => {
    const matchName = e.name.toLowerCase().includes(search.toLowerCase()) || e.id.includes(search)
    const matchOrg  = orgFilter === 'all' || e.group === orgFilter
    return matchName && matchOrg
  })

  const groupName = (gid) => groups.find(g => g.id === gid)?.name || gid

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
        <div>
          <h1 style={{ margin:0, fontSize:'22px', fontWeight:700, color:'#0f172a', display:'flex', alignItems:'center', gap:'10px' }}>
            <Users size={22} color="#2563eb"/> Xodimlar
          </h1>
          <p style={{ margin:'4px 0 0', fontSize:'13px', color:'#94a3b8' }}>Jami {employees.length} ta xodim</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:'10px', marginBottom:'20px', flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:1, minWidth:'200px' }}>
          <Search size={15} color="#94a3b8" style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)' }}/>
          <input placeholder="Ism yoki ID bo'yicha qidirish..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ width:'100%', padding:'9px 12px 9px 36px', background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:'9px', color:'#0f172a', fontSize:'14px', outline:'none', boxSizing:'border-box' }}/>
        </div>
        {multiOrg && (
          <>
            <button onClick={() => setOrgFilter('all')} style={{ padding:'9px 16px', borderRadius:'8px', border:'1px solid', borderColor:orgFilter==='all'?'#2563eb':'#e2e8f0', background:orgFilter==='all'?'#eff6ff':'#ffffff', color:orgFilter==='all'?'#2563eb':'#64748b', fontSize:'13px', cursor:'pointer', fontWeight:orgFilter==='all'?600:400 }}>
              Hammasi ({employees.length})
            </button>
            {groups.map(g => {
              const cnt = employees.filter(e => e.group === g.id).length
              return (
                <button key={g.id} onClick={() => setOrgFilter(g.id)} style={{ padding:'9px 16px', borderRadius:'8px', border:'1px solid', borderColor:orgFilter===g.id?'#2563eb':'#e2e8f0', background:orgFilter===g.id?'#eff6ff':'#ffffff', color:orgFilter===g.id?'#2563eb':'#64748b', fontSize:'13px', cursor:'pointer', fontWeight:orgFilter===g.id?600:400 }}>
                  {g.name} ({cnt})
                </button>
              )
            })}
          </>
        )}
      </div>

      {/* Table */}
      <div style={{ background:'#fff', borderRadius:'14px', border:'1px solid #e2e8f0', overflow:'hidden', boxShadow:'0 1px 3px #0f172a08' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:'#f8fafc' }}>
              <th style={{ padding:'11px 16px', textAlign:'left', fontSize:'11px', color:'#94a3b8', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px' }}>Ism Familiya</th>
              <th style={{ padding:'11px 16px', textAlign:'left', fontSize:'11px', color:'#94a3b8', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px' }}>Lavozim</th>
              <th style={{ padding:'11px 16px', textAlign:'left', fontSize:'11px', color:'#94a3b8', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px' }}>Face ID</th>
              {multiOrg && <th style={{ padding:'11px 16px', textAlign:'left', fontSize:'11px', color:'#94a3b8', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px' }}>Tashkilot</th>}
              {onUpdateEmployee && <th style={{ padding:'11px 16px' }}></th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp, i) => (
              <tr key={emp.id} style={{ borderTop:'1px solid #f1f5f9', background: i%2===0 ? '#fff' : '#fafafa' }}>
                <td style={{ padding:'11px 16px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'linear-gradient(135deg,#2563eb,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:700, color:'white', flexShrink:0 }}>
                      {emp.name[0]}
                    </div>
                    <span style={{ fontSize:'14px', fontWeight:500, color:'#0f172a' }}>{emp.name}</span>
                  </div>
                </td>
                <td style={{ padding:'11px 16px', fontSize:'13px', color: emp.lavozim ? '#475569' : '#cbd5e1', fontStyle: emp.lavozim ? 'normal' : 'italic' }}>
                  {emp.lavozim || '—'}
                </td>
                <td style={{ padding:'11px 16px', fontSize:'13px', color:'#64748b', fontFamily:'monospace' }}>
                  #{emp.id}
                </td>
                {multiOrg && (
                  <td style={{ padding:'11px 16px', fontSize:'13px', color:'#64748b' }}>
                    <span style={{ display:'inline-flex', alignItems:'center', gap:'4px' }}>
                      <Building2 size={12}/> {groupName(emp.group)}
                    </span>
                  </td>
                )}
                {onUpdateEmployee && (
                  <td style={{ padding:'11px 16px', textAlign:'right' }}>
                    <button onClick={() => openEdit(emp)} style={{
                      background:'#2563eb', border:'none', borderRadius:'7px',
                      color:'white', padding:'6px 14px', cursor:'pointer',
                      fontSize:'12px', fontWeight:600, display:'inline-flex', alignItems:'center', gap:'5px',
                    }}>
                      <Pencil size={12}/> Tahrirlash
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={multiOrg?4:3} style={{ padding:'40px', textAlign:'center', color:'#94a3b8' }}>Xodim topilmadi</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* TAHRIRLASH MODAL */}
      {showEdit && editEmp && (
        <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.35)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, backdropFilter:'blur(2px)' }}>
          <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid #e2e8f0', padding:'32px', width:'100%', maxWidth:'400px', boxShadow:'0 20px 60px #0f172a18' }}>
            <h2 style={{ margin:'0 0 4px', fontSize:'18px', fontWeight:700, color:'#0f172a' }}>Xodimni tahrirlash</h2>
            <p style={{ margin:'0 0 24px', fontSize:'13px', color:'#94a3b8' }}>Face ID: #{editEmp.id}</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              <div>
                <label style={{ fontSize:'12px', color:'#64748b', display:'block', marginBottom:'5px', fontWeight:600 }}>Ism Familiya</label>
                <input value={editName} onChange={e => { setEditName(e.target.value); setEditError('') }} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize:'12px', color:'#64748b', display:'block', marginBottom:'5px', fontWeight:600 }}>Lavozim</label>
                <input value={editLavozim} onChange={e => setEditLavozim(e.target.value)}
                  placeholder="Masalan: Dasturchi, Hisobchi..." style={inputStyle} />
              </div>
              {editError && (
                <div style={{ padding:'8px 12px', background:'#fff1f2', border:'1px solid #fecdd3', borderRadius:'7px', color:'#e11d48', fontSize:'13px' }}>⚠️ {editError}</div>
              )}
              {saved && (
                <div style={{ padding:'8px 12px', background:'#dcfce7', border:'1px solid #bbf7d0', borderRadius:'7px', color:'#16a34a', fontSize:'13px', fontWeight:600 }}>✅ Saqlandi!</div>
              )}
              <div style={{ display:'flex', gap:'10px', marginTop:'4px' }}>
                <button onClick={() => setShowEdit(false)}
                  style={{ flex:1, padding:'10px', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:'9px', color:'#64748b', fontSize:'14px', cursor:'pointer' }}>
                  Bekor qilish
                </button>
                <button onClick={handleSave}
                  style={{ flex:1, padding:'10px', background:'#2563eb', border:'none', borderRadius:'9px', color:'white', fontSize:'14px', fontWeight:600, cursor:'pointer', boxShadow:'0 2px 8px #2563eb30' }}>
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
