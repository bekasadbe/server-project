import { useState, useEffect } from 'react'
import { Clock, Search, Building2 } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const TOKEN   = 'Dav0mat@API#2026!'

export default function History({ groups = [] }) {
  const [rows, setRows]       = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch]   = useState('')
  const [date, setDate]       = useState(new Date().toISOString().slice(0, 10))

  const multiOrg = groups.length > 1

  const fetchData = async (d) => {
    setLoading(true)
    try {
      const res  = await fetch(`${API_URL}/attendance?date=${d}`, { headers: { 'X-API-Token': TOKEN } })
      const data = await res.json()
      setRows(data.attendance || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchData(date) }, [date])

  const groupName = (gid) => groups.find(g => g.id === gid)?.name || gid

  const filtered = rows.filter(r =>
    !search || (r.name || '').toLowerCase().includes(search.toLowerCase()) || r.employee_id.includes(search)
  )

  const getLate = (first_in) => {
    if (!first_in) return null
    const [h, m] = first_in.split(':').map(Number)
    const mins = (h - 9) * 60 + m
    return mins > 0 ? mins : 0
  }

  return (
    <div>
      <div style={{ marginBottom:'24px' }}>
        <h1 style={{ margin:0, fontSize:'22px', fontWeight:700, color:'#0f172a', display:'flex', alignItems:'center', gap:'10px' }}>
          <Clock size={22} color="#2563eb" /> Keldi-ketdi tarixi
        </h1>
        <p style={{ margin:'4px 0 0', fontSize:'13px', color:'#94a3b8' }}>Sana bo'yicha davomat</p>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:'10px', marginBottom:'20px', flexWrap:'wrap' }}>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          style={{ padding:'9px 12px', background:'#fff', border:'1px solid #e2e8f0', borderRadius:'8px', color:'#0f172a', fontSize:'14px', outline:'none', cursor:'pointer' }}/>
        <div style={{ position:'relative', flex:1, minWidth:'200px' }}>
          <Search size={15} color="#94a3b8" style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)' }}/>
          <input placeholder="Ism yoki ID bo'yicha qidirish..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width:'100%', padding:'9px 12px 9px 36px', background:'#fff', border:'1px solid #e2e8f0', borderRadius:'8px', color:'#0f172a', fontSize:'14px', outline:'none', boxSizing:'border-box' }}/>
        </div>
      </div>

      <div style={{ background:'#fff', borderRadius:'14px', border:'1px solid #e2e8f0', overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:'#f8fafc', borderBottom:'1px solid #e2e8f0' }}>
              {['Ism Familiya', ...(multiOrg?['Tashkilot']:[]), 'Keldi', 'Ketdi', 'Kechikish', 'Holat'].map(h => (
                <th key={h} style={{ padding:'11px 16px', textAlign:'left', fontSize:'11px', color:'#94a3b8', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={multiOrg?6:5} style={{ padding:'48px', textAlign:'center', color:'#94a3b8' }}>Yuklanmoqda...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={multiOrg?6:5} style={{ padding:'48px', textAlign:'center', color:'#94a3b8' }}>Ma'lumot yo'q</td></tr>
            ) : filtered.map(r => {
              const late = getLate(r.first_in)
              const present = !!r.first_in
              const ontime  = present && late === 0
              const status  = !present ? { label:'Kelmadi', color:'#dc2626', bg:'#fee2e2' }
                            : ontime   ? { label:"O'z vaqtida", color:'#16a34a', bg:'#dcfce7' }
                            :            { label:'Kech keldi', color:'#d97706', bg:'#fef3c7' }
              return (
                <tr key={r.employee_id} style={{ borderTop:'1px solid #f1f5f9' }}>
                  <td style={{ padding:'11px 16px' }}>
                    <div style={{ fontWeight:500, color:'#0f172a', fontSize:'14px' }}>{r.name}</div>
                    {r.lavozim && <div style={{ fontSize:'11px', color:'#94a3b8' }}>{r.lavozim}</div>}
                  </td>
                  {multiOrg && (
                    <td style={{ padding:'11px 16px', fontSize:'13px', color:'#64748b' }}>
                      <span style={{ display:'inline-flex', alignItems:'center', gap:'4px' }}>
                        <Building2 size={12}/> {groupName(r.group_id)}
                      </span>
                    </td>
                  )}
                  <td style={{ padding:'11px 16px', fontFamily:'monospace', fontSize:'14px', color:r.first_in?'#16a34a':'#cbd5e1', fontWeight:600 }}>{r.first_in || '—'}</td>
                  <td style={{ padding:'11px 16px', fontFamily:'monospace', fontSize:'14px', color:r.last_out?'#475569':'#cbd5e1' }}>{r.last_out || '—'}</td>
                  <td style={{ padding:'11px 16px', fontSize:'13px', color: late > 0 ? '#d97706' : '#94a3b8' }}>
                    {late > 0 ? `${late} daq.` : '—'}
                  </td>
                  <td style={{ padding:'11px 16px' }}>
                    <span style={{ padding:'4px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:600, background:status.bg, color:status.color }}>{status.label}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
