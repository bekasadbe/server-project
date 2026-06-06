import { useState } from 'react'
import { Clock, Search, Building2 } from 'lucide-react'

const demoHistory = [
  { date:'2026-06-05', name:'Urinboyev Sadriddin',    org:'Inno Texnopark', arrived:'08:45', left:'18:10', late:0 },
  { date:'2026-06-05', name:"Ne'matov Asadbek",        org:'Inno Texnopark', arrived:'09:05', left:'18:00', late:5 },
  { date:'2026-06-05', name:'Erkin Davirov',           org:'Milliy Offis',   arrived:'08:40', left:'17:55', late:0 },
  { date:'2026-06-05', name:'Baxtiyor Islomov',        org:'Milliy Offis',   arrived:'09:15', left:null,    late:15 },
  { date:'2026-06-04', name:'Urinboyev Sadriddin',    org:'Inno Texnopark', arrived:'08:50', left:'18:05', late:0 },
  { date:'2026-06-04', name:'Toshmatov Shoxruh',      org:'Inno Texnopark', arrived:'09:20', left:'17:50', late:20 },
  { date:'2026-06-04', name:'Aziz Akramov',           org:'Milliy Offis',   arrived:'08:55', left:'18:10', late:0 },
  { date:'2026-06-03', name:'Maxamatov Xamidulla',    org:'Inno Texnopark', arrived:'10:38', left:'18:00', late:98 },
  { date:'2026-06-03', name:'Erkin Davirov',          org:'Milliy Offis',   arrived:'08:42', left:'17:58', late:0 },
]

export default function History() {
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo]   = useState('')

  const filtered = demoHistory.filter(r => {
    const matchName = r.name.toLowerCase().includes(search.toLowerCase())
    const matchFrom = !dateFrom || r.date >= dateFrom
    const matchTo   = !dateTo   || r.date <= dateTo
    return matchName && matchFrom && matchTo
  })

  return (
    <div>
      <div style={{ marginBottom:'24px' }}>
        <h1 style={{ margin:0, fontSize:'22px', fontWeight:700, color:'#f1f5f9', display:'flex', alignItems:'center', gap:'10px' }}>
          <Clock size={22} color="#6366f1" /> Keldi-ketdi tarixi
        </h1>
        <p style={{ margin:'4px 0 0', fontSize:'13px', color:'#64748b' }}>Barcha xodimlarning kirish va chiqish vaqtlari</p>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:'12px', marginBottom:'20px', flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:1, minWidth:'200px' }}>
          <Search size={15} color="#475569" style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)' }} />
          <input
            placeholder="Xodim nomi bo'yicha qidirish..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{
              width:'100%', padding:'9px 12px 9px 36px',
              background:'#161b27', border:'1px solid #1e2535',
              borderRadius:'8px', color:'#f1f5f9', fontSize:'14px',
              outline:'none', boxSizing:'border-box'
            }}
          />
        </div>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
          style={{ padding:'9px 12px', background:'#161b27', border:'1px solid #1e2535', borderRadius:'8px', color:'#f1f5f9', fontSize:'14px', outline:'none' }} />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
          style={{ padding:'9px 12px', background:'#161b27', border:'1px solid #1e2535', borderRadius:'8px', color:'#f1f5f9', fontSize:'14px', outline:'none' }} />
      </div>

      {/* Table */}
      <div style={{ background:'#161b27', borderRadius:'14px', border:'1px solid #1e2535', overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:'#0f1117' }}>
              {['Sana','Ism Familiya','Tashkilot','Keldi','Ketdi','Kechikish'].map(h => (
                <th key={h} style={{ padding:'11px 16px', textAlign:'left', fontSize:'12px', color:'#475569', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={i} style={{ borderTop:'1px solid #1e2535' }}>
                <td style={{ padding:'12px 16px', fontSize:'13px', color:'#64748b' }}>{r.date}</td>
                <td style={{ padding:'12px 16px', fontSize:'14px', color:'#e2e8f0', fontWeight:500 }}>{r.name}</td>
                <td style={{ padding:'12px 16px', fontSize:'13px', color:'#64748b' }}>
                  <span style={{ display:'inline-flex', alignItems:'center', gap:'4px' }}>
                    <Building2 size={12} /> {r.org}
                  </span>
                </td>
                <td style={{ padding:'12px 16px', fontSize:'14px', color:'#22c55e', fontWeight:600 }}>{r.arrived}</td>
                <td style={{ padding:'12px 16px', fontSize:'14px', color: r.left ? '#94a3b8' : '#475569' }}>{r.left || '—'}</td>
                <td style={{ padding:'12px 16px' }}>
                  {r.late > 0
                    ? <span style={{ padding:'3px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:600, background:'#f59e0b18', color:'#f59e0b' }}>{r.late} daq.</span>
                    : <span style={{ padding:'3px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:600, background:'#22c55e18', color:'#22c55e' }}>O'z vaqtida</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding:'40px', textAlign:'center', color:'#475569' }}>Ma'lumot topilmadi</div>
        )}
      </div>
    </div>
  )
}
