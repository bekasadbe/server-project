import { useState } from 'react'
import { Users, Search, Building2 } from 'lucide-react'

const orgColors = [
  { color:'#2563eb', bg:'#eff6ff' },
  { color:'#0891b2', bg:'#ecfeff' },
  { color:'#16a34a', bg:'#dcfce7' },
  { color:'#d97706', bg:'#fef3c7' },
]

export default function Employees({ employees = [], groups = [] }) {
  const [search, setSearch]       = useState('')
  const [orgFilter, setOrgFilter] = useState('all')

  const multiOrg = groups.length > 1

  const filtered = employees.filter(e => {
    const matchName = e.name.toLowerCase().includes(search.toLowerCase()) || e.id.includes(search)
    const matchOrg  = orgFilter === 'all' || e.group === orgFilter
    return matchName && matchOrg
  })

  const groupName  = (gid) => groups.find(g => g.id === gid)?.name || gid
  const groupColor = (gid) => {
    const idx = groups.findIndex(g => g.id === gid)
    return orgColors[idx % orgColors.length] || orgColors[0]
  }

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
            <button onClick={() => setOrgFilter('all')} style={{
              padding:'9px 16px', borderRadius:'8px', border:'1px solid',
              borderColor: orgFilter==='all'?'#2563eb':'#e2e8f0',
              background: orgFilter==='all'?'#eff6ff':'#ffffff',
              color: orgFilter==='all'?'#2563eb':'#64748b', fontSize:'13px', cursor:'pointer', fontWeight: orgFilter==='all'?600:400
            }}>Hammasi ({employees.length})</button>
            {groups.map(g => {
              const cnt = employees.filter(e => e.group === g.id).length
              return (
                <button key={g.id} onClick={() => setOrgFilter(g.id)} style={{
                  padding:'9px 16px', borderRadius:'8px', border:'1px solid',
                  borderColor: orgFilter===g.id?'#2563eb':'#e2e8f0',
                  background: orgFilter===g.id?'#eff6ff':'#ffffff',
                  color: orgFilter===g.id?'#2563eb':'#64748b', fontSize:'13px', cursor:'pointer', fontWeight: orgFilter===g.id?600:400
                }}>{g.name} ({cnt})</button>
              )
            })}
          </>
        )}
      </div>

      {/* Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:'12px' }}>
        {filtered.map(emp => {
          const oc = groupColor(emp.group)
          return (
            <div key={emp.id} style={{ background:'#ffffff', borderRadius:'12px', border:'1px solid #e2e8f0', padding:'18px', display:'flex', alignItems:'center', gap:'14px', boxShadow:'0 1px 3px #0f172a06' }}>
              <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:'linear-gradient(135deg,#2563eb,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', fontWeight:700, color:'white', flexShrink:0 }}>
                {emp.name[0]}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:'14px', fontWeight:600, color:'#0f172a', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{emp.name}</div>
                {emp.lavozim && (
                  <div style={{ fontSize:'12px', color:'#2563eb', marginTop:'2px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{emp.lavozim}</div>
                )}
                <div style={{ fontSize:'12px', color:'#94a3b8', marginTop:'2px', fontFamily:'monospace' }}>ID: {emp.id}</div>
                {multiOrg && (
                  <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', marginTop:'6px', padding:'3px 8px', borderRadius:'20px', fontSize:'11px', fontWeight:600, background:oc.bg, color:oc.color }}>
                    <Building2 size={10}/> {groupName(emp.group)}
                  </span>
                )}
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'40px', color:'#94a3b8' }}>Xodim topilmadi</div>
        )}
      </div>
    </div>
  )
}
