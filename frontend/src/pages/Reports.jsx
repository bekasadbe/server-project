import { useState, useEffect } from 'react'
import { FileBarChart2, Building2 } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const TOKEN   = 'Dav0mat@API#2026!'

function getLast7Days() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

export default function Reports({ groups = [] }) {
  const [stats, setStats]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [orgFilter, setOrgFilter] = useState('all')
  const multiOrg = groups.length > 1

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const days = getLast7Days()
      const results = await Promise.all(
        days.map(async (d) => {
          try {
            const res  = await fetch(`${API_URL}/attendance?date=${d}`, { headers: { 'X-API-Token': TOKEN } })
            const data = await res.json()
            const rows = (data.attendance || []).filter(r => orgFilter === 'all' || r.group_id === orgFilter)
            const total  = rows.length
            const ontime = rows.filter(r => r.first_in && r.first_in < '09:00').length
            const late   = rows.filter(r => r.first_in && r.first_in >= '09:00').length
            const absent = rows.filter(r => !r.first_in).length
            return { date: d, total, ontime, late, absent }
          } catch {
            return { date: d, total: 0, ontime: 0, late: 0, absent: 0 }
          }
        })
      )
      setStats(results)
      setLoading(false)
    }
    load()
  }, [orgFilter])

  const totalDays    = stats.length
  const avgOntime    = totalDays ? Math.round(stats.reduce((s, r) => s + r.ontime, 0) / totalDays) : 0
  const avgLate      = totalDays ? Math.round(stats.reduce((s, r) => s + r.late, 0) / totalDays) : 0
  const avgAbsent    = totalDays ? Math.round(stats.reduce((s, r) => s + r.absent, 0) / totalDays) : 0

  const dayLabel = (d) => {
    const date = new Date(d)
    return date.toLocaleDateString('uz-UZ', { month:'short', day:'numeric' })
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
        <div>
          <h1 style={{ margin:0, fontSize:'22px', fontWeight:700, color:'#0f172a', display:'flex', alignItems:'center', gap:'10px' }}>
            <FileBarChart2 size={22} color="#2563eb" /> Hisobotlar
          </h1>
          <p style={{ margin:'4px 0 0', fontSize:'13px', color:'#94a3b8' }}>So'nggi 7 kunlik tahlil</p>
        </div>
        {multiOrg && (
          <div style={{ display:'flex', gap:'6px' }}>
            <button onClick={() => setOrgFilter('all')} style={{ padding:'7px 14px', borderRadius:'8px', border:'1px solid', borderColor:orgFilter==='all'?'#2563eb':'#e2e8f0', background:orgFilter==='all'?'#eff6ff':'#fff', color:orgFilter==='all'?'#2563eb':'#64748b', fontSize:'13px', cursor:'pointer' }}>Hammasi</button>
            {groups.map(g => (
              <button key={g.id} onClick={() => setOrgFilter(g.id)} style={{ padding:'7px 14px', borderRadius:'8px', border:'1px solid', borderColor:orgFilter===g.id?'#2563eb':'#e2e8f0', background:orgFilter===g.id?'#eff6ff':'#fff', color:orgFilter===g.id?'#2563eb':'#64748b', fontSize:'13px', cursor:'pointer' }}>{g.name}</button>
            ))}
          </div>
        )}
      </div>

      {/* O'rtacha kunlik */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px', marginBottom:'24px' }}>
        {[
          { label:"O'rtacha o'z vaqtida", value: avgOntime, color:'#16a34a', bg:'#dcfce7' },
          { label:"O'rtacha kech keldi",  value: avgLate,   color:'#d97706', bg:'#fef3c7' },
          { label:"O'rtacha kelmadi",     value: avgAbsent, color:'#dc2626', bg:'#fee2e2' },
        ].map(card => (
          <div key={card.label} style={{ background:'#fff', borderRadius:'14px', padding:'20px 24px', border:'1px solid #e2e8f0', boxShadow:'0 1px 3px #0f172a08' }}>
            <div style={{ fontSize:'13px', color:'#64748b', marginBottom:'8px' }}>{card.label}</div>
            <div style={{ fontSize:'32px', fontWeight:700, color:card.color }}>{loading ? '...' : card.value}</div>
            <div style={{ fontSize:'12px', color:'#94a3b8', marginTop:'4px' }}>kishi/kun</div>
          </div>
        ))}
      </div>

      {/* Kunlik jadval */}
      <div style={{ background:'#fff', borderRadius:'14px', border:'1px solid #e2e8f0', overflow:'hidden' }}>
        <div style={{ padding:'14px 20px', borderBottom:'1px solid #f1f5f9', fontWeight:600, fontSize:'14px', color:'#0f172a' }}>
          Kunlik statistika
        </div>
        {loading ? (
          <div style={{ padding:'48px', textAlign:'center', color:'#94a3b8' }}>Yuklanmoqda...</div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#f8fafc' }}>
                {['Sana', 'Jami', "O'z vaqtida", 'Kech keldi', 'Kelmadi', 'Davomat %'].map(h => (
                  <th key={h} style={{ padding:'11px 16px', textAlign:'left', fontSize:'11px', color:'#94a3b8', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.map(row => {
                const pct = row.total ? Math.round((row.ontime + row.late) / row.total * 100) : 0
                return (
                  <tr key={row.date} style={{ borderTop:'1px solid #f1f5f9' }}>
                    <td style={{ padding:'11px 16px', fontSize:'14px', fontWeight:600, color:'#0f172a' }}>{dayLabel(row.date)}</td>
                    <td style={{ padding:'11px 16px', fontSize:'14px', color:'#475569' }}>{row.total}</td>
                    <td style={{ padding:'11px 16px', fontSize:'14px', color:'#16a34a', fontWeight:600 }}>{row.ontime}</td>
                    <td style={{ padding:'11px 16px', fontSize:'14px', color:'#d97706', fontWeight:600 }}>{row.late}</td>
                    <td style={{ padding:'11px 16px', fontSize:'14px', color:'#dc2626', fontWeight:600 }}>{row.absent}</td>
                    <td style={{ padding:'11px 16px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                        <div style={{ flex:1, height:'6px', background:'#f1f5f9', borderRadius:'3px', overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${pct}%`, background: pct>=80?'#16a34a':pct>=60?'#d97706':'#dc2626', borderRadius:'3px', transition:'width 0.3s' }}/>
                        </div>
                        <span style={{ fontSize:'13px', fontWeight:600, color:'#475569', minWidth:'35px' }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
