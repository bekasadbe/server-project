import { useState, useEffect } from 'react'
import { BarChart2, TrendingUp, UserX, UserCheck, Clock, Award, AlertTriangle } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

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

function dayLabel(d) {
  const date = new Date(d)
  return date.toLocaleDateString('uz-UZ', { month: 'numeric', day: 'numeric' }).replace('.', '/')
}

export default function Reports({ groups = [] }) {
  const [stats, setStats]     = useState([])
  const [empStats, setEmpStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [orgFilter, setOrgFilter] = useState('all')
  const multiOrg = groups.length > 1

  const getWorkStart = (gid) => groups.find(g => g.id === gid)?.work_start || '09:00'

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const days = getLast7Days()
      const allData = await Promise.all(
        days.map(async (d) => {
          try {
            const res  = await fetch(`${API_URL}/attendance?date=${d}`, { headers: { 'X-API-Token': TOKEN } })
            const data = await res.json()
            return { date: d, rows: data.attendance || [] }
          } catch { return { date: d, rows: [] } }
        })
      )

      // Kunlik statistika
      const dayStats = allData.map(({ date, rows }) => {
        const filtered = rows.filter(r => orgFilter === 'all' || r.group_id === orgFilter)
        const total  = filtered.length
        const ontime = filtered.filter(r => r.first_in && r.first_in <= getWorkStart(r.group_id)).length
        const late   = filtered.filter(r => r.first_in && r.first_in > getWorkStart(r.group_id)).length
        const absent = filtered.filter(r => !r.first_in).length
        const pct    = total ? Math.round((ontime + late) / total * 100) : 0
        return { date, label: dayLabel(date), total, ontime, late, absent, pct }
      })
      setStats(dayStats)

      // Xodim reytingi (7 kun bo'yicha)
      const empMap = {}
      allData.forEach(({ rows }) => {
        const filtered = rows.filter(r => orgFilter === 'all' || r.group_id === orgFilter)
        filtered.forEach(r => {
          if (!empMap[r.employee_id]) empMap[r.employee_id] = { name: r.name, absent: 0, late: 0, present: 0 }
          if (!r.first_in) empMap[r.employee_id].absent++
          else if (r.first_in > getWorkStart(r.group_id)) empMap[r.employee_id].late++
          else empMap[r.employee_id].present++
        })
      })
      setEmpStats(Object.values(empMap))
      setLoading(false)
    }
    load()
  }, [orgFilter])

  const totalDays = stats.length
  const avgPct    = totalDays ? Math.round(stats.reduce((s, r) => s + r.pct, 0) / totalDays) : 0
  const avgLate   = totalDays ? Math.round(stats.reduce((s, r) => s + r.late, 0) / totalDays) : 0
  const avgAbsent = totalDays ? Math.round(stats.reduce((s, r) => s + r.absent, 0) / totalDays) : 0

  const topAbsent = [...empStats].sort((a, b) => b.absent - a.absent).slice(0, 5).filter(e => e.absent > 0)
  const topLate   = [...empStats].sort((a, b) => b.late - a.late).slice(0, 5).filter(e => e.late > 0)
  const topBest   = [...empStats].sort((a, b) => b.present - a.present).slice(0, 5).filter(e => e.present > 0)

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null
    return (
      <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:'10px', padding:'12px 16px', boxShadow:'0 4px 16px #0f172a12' }}>
        <div style={{ fontWeight:700, marginBottom:'6px', color:'#0f172a' }}>{label}</div>
        {payload.map(p => (
          <div key={p.name} style={{ fontSize:'13px', color:p.color, marginBottom:'2px' }}>
            {p.name}: <strong>{p.value}</strong>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
        <div>
          <h1 style={{ margin:0, fontSize:'22px', fontWeight:700, color:'#0f172a', display:'flex', alignItems:'center', gap:'10px' }}>
            <BarChart2 size={22} color="#2563eb"/> Statistika
          </h1>
          <p style={{ margin:'4px 0 0', fontSize:'13px', color:'#94a3b8' }}>So'nggi 7 kunlik tahlil</p>
        </div>
        {multiOrg && (
          <div style={{ display:'flex', gap:'6px' }}>
            <button onClick={() => setOrgFilter('all')} style={{ padding:'7px 14px', borderRadius:'8px', border:'1px solid', borderColor:orgFilter==='all'?'#2563eb':'#e2e8f0', background:orgFilter==='all'?'#eff6ff':'#fff', color:orgFilter==='all'?'#2563eb':'#64748b', fontSize:'13px', cursor:'pointer', fontWeight:orgFilter==='all'?600:400 }}>Hammasi</button>
            {groups.map(g => (
              <button key={g.id} onClick={() => setOrgFilter(g.id)} style={{ padding:'7px 14px', borderRadius:'8px', border:'1px solid', borderColor:orgFilter===g.id?'#2563eb':'#e2e8f0', background:orgFilter===g.id?'#eff6ff':'#fff', color:orgFilter===g.id?'#2563eb':'#64748b', fontSize:'13px', cursor:'pointer', fontWeight:orgFilter===g.id?600:400 }}>{g.name}</button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ padding:'80px', textAlign:'center', color:'#94a3b8' }}>Yuklanmoqda...</div>
      ) : (<>

        {/* Stat kartalar */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px', marginBottom:'24px' }}>
          {[
            { label:'7 kunlik o\'rtacha davomat', value:`${avgPct}%`, icon:TrendingUp, color:'#2563eb', bg:'#eff6ff' },
            { label:'O\'rtacha kech keldi',        value:avgLate,     icon:Clock,      color:'#d97706', bg:'#fef3c7' },
            { label:'O\'rtacha kelmadi',           value:avgAbsent,   icon:UserX,      color:'#dc2626', bg:'#fee2e2' },
          ].map(c => (
            <div key={c.label} style={{ background:'#fff', borderRadius:'14px', padding:'20px 24px', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', gap:'16px', boxShadow:'0 1px 3px #0f172a08' }}>
              <div style={{ background:c.bg, borderRadius:'12px', padding:'12px', display:'flex', flexShrink:0 }}>
                <c.icon size={22} color={c.color}/>
              </div>
              <div>
                <div style={{ fontSize:'13px', color:'#64748b', marginBottom:'4px' }}>{c.label}</div>
                <div style={{ fontSize:'28px', fontWeight:700, color:c.color }}>{c.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Grafik — Davomat foizi */}
        <div style={{ background:'#fff', borderRadius:'14px', border:'1px solid #e2e8f0', padding:'20px', marginBottom:'16px', boxShadow:'0 1px 3px #0f172a08' }}>
          <div style={{ fontWeight:700, fontSize:'14px', color:'#0f172a', marginBottom:'16px', display:'flex', alignItems:'center', gap:'8px' }}>
            <TrendingUp size={16} color="#2563eb"/> Davomat foizi (7 kun)
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats} margin={{ top:5, right:10, left:-20, bottom:0 }}>
              <defs>
                <linearGradient id="pctGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
              <XAxis dataKey="label" tick={{ fontSize:12, fill:'#94a3b8' }}/>
              <YAxis domain={[0,100]} tick={{ fontSize:12, fill:'#94a3b8' }} unit="%"/>
              <Tooltip content={<CustomTooltip/>}/>
              <Area type="monotone" dataKey="pct" name="Davomat %" stroke="#2563eb" strokeWidth={2.5} fill="url(#pctGrad)" dot={{ fill:'#2563eb', r:4 }}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Grafik — Keldi/Kelmadi/Kech */}
        <div style={{ background:'#fff', borderRadius:'14px', border:'1px solid #e2e8f0', padding:'20px', marginBottom:'16px', boxShadow:'0 1px 3px #0f172a08' }}>
          <div style={{ fontWeight:700, fontSize:'14px', color:'#0f172a', marginBottom:'16px', display:'flex', alignItems:'center', gap:'8px' }}>
            <BarChart2 size={16} color="#2563eb"/> Kunlik taqsimot
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats} margin={{ top:5, right:10, left:-20, bottom:0 }} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
              <XAxis dataKey="label" tick={{ fontSize:12, fill:'#94a3b8' }}/>
              <YAxis tick={{ fontSize:12, fill:'#94a3b8' }}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Legend wrapperStyle={{ fontSize:'12px' }}/>
              <Bar dataKey="ontime" name="O'z vaqtida" fill="#16a34a" radius={[3,3,0,0]}/>
              <Bar dataKey="late"   name="Kech keldi"  fill="#f59e0b" radius={[3,3,0,0]}/>
              <Bar dataKey="absent" name="Kelmadi"     fill="#ef4444" radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Reytinglar */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px' }}>
          {[
            { title:'Eng ko\'p kelmagan', icon:UserX,    color:'#dc2626', bg:'#fee2e2', data:topAbsent, key:'absent', unit:'kun' },
            { title:'Eng ko\'p kech kelgan', icon:Clock,  color:'#d97706', bg:'#fef3c7', data:topLate,   key:'late',   unit:'marta' },
            { title:'Eng devomli',         icon:Award,   color:'#16a34a', bg:'#dcfce7', data:topBest,   key:'present',unit:'kun' },
          ].map(block => (
            <div key={block.title} style={{ background:'#fff', borderRadius:'14px', border:'1px solid #e2e8f0', overflow:'hidden', boxShadow:'0 1px 3px #0f172a08' }}>
              <div style={{ padding:'14px 16px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', gap:'8px', background:block.bg }}>
                <block.icon size={15} color={block.color}/>
                <span style={{ fontWeight:700, fontSize:'13px', color:block.color }}>{block.title}</span>
              </div>
              <div style={{ padding:'8px 0' }}>
                {block.data.length === 0 ? (
                  <div style={{ padding:'16px', textAlign:'center', color:'#94a3b8', fontSize:'13px' }}>Ma'lumot yo'q</div>
                ) : block.data.map((e, i) => (
                  <div key={e.name} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'8px 16px', borderBottom: i < block.data.length-1 ? '1px solid #f8fafc' : 'none' }}>
                    <span style={{ fontWeight:700, fontSize:'13px', color:'#94a3b8', minWidth:'18px' }}>{i+1}</span>
                    <div style={{ width:'30px', height:'30px', borderRadius:'50%', background:'linear-gradient(135deg,#2563eb,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:'12px', flexShrink:0 }}>
                      {(e.name||'?')[0]}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:'13px', fontWeight:500, color:'#0f172a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{e.name}</div>
                    </div>
                    <span style={{ fontSize:'13px', fontWeight:700, color:block.color }}>{e[block.key]} {block.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </>)}
    </div>
  )
}
