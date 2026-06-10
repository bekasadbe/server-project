import { useState } from 'react'
import { Users, Search, Building2 } from 'lucide-react'

export default function Employees({ employees = [], groups = [] }) {
  const [search, setSearch]       = useState('')
  const [orgFilter, setOrgFilter] = useState('all')

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
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={multiOrg?4:3} style={{ padding:'40px', textAlign:'center', color:'#94a3b8' }}>Xodim topilmadi</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
