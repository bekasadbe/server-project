import { useState } from 'react'
import { CheckCircle, Clock, XCircle, Users, TrendingUp, Building2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const weekData = [
  { day:'Du', keldi:38, kelmadi:6 },
  { day:'Se', keldi:40, kelmadi:4 },
  { day:'Cho',keldi:35, kelmadi:9 },
  { day:'Pa', keldi:42, kelmadi:2 },
  { day:'Ju', keldi:39, kelmadi:5 },
]

const statusInfo = {
  ontime: { label:"O'z vaqtida", color:'#22c55e', bg:'#22c55e18' },
  late:   { label:'Kech keldi',  color:'#f59e0b', bg:'#f59e0b18' },
  absent: { label:'Kelmadi',     color:'#ef4444', bg:'#ef444418' },
}

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div style={{ background:'#161b27', borderRadius:'14px', padding:'20px 24px', border:'1px solid #1e2535', display:'flex', alignItems:'center', gap:'16px' }}>
      <div style={{ background:bg, borderRadius:'12px', padding:'12px', display:'flex' }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div style={{ fontSize:'28px', fontWeight:700, color:'#f1f5f9' }}>{value}</div>
        <div style={{ fontSize:'13px', color:'#64748b', marginTop:'2px' }}>{label}</div>
      </div>
    </div>
  )
}

// ⚠️ Server ulangandan keyin bu arrived/left ma'lumotlari API dan keladi
// Hozircha xodimlar ro'yxati ko'rsatiladi, arrived/left yo'q
export default function Dashboard({ employees = [], groups = [] }) {
  const [orgFilter, setOrgFilter] = useState('all')
  const today    = new Date().toLocaleDateString('uz-UZ', { year:'numeric', month:'long', day:'numeric' })
  const multiOrg = groups.length > 1

  const filtered = orgFilter === 'all' ? employees : employees.filter(e => e.group === orgFilter)

  // Hozircha arrived yo'q (server ulanmagan) — demo uchun random holat
  const withStatus = filtered.map(e => ({
    ...e,
    arrived: e.arrived || null,
    status:  e.arrived
      ? (e.arrived < '09:00' ? 'ontime' : 'late')
      : 'absent'
  }))

  const sorted = [...withStatus].sort((a, b) => {
    const order = { ontime:0, late:1, absent:2 }
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status]
    if (a.arrived && b.arrived) return a.arrived.localeCompare(b.arrived)
    return 0
  })

  const ontime = sorted.filter(e => e.status === 'ontime').length
  const late   = sorted.filter(e => e.status === 'late').length
  const absent = sorted.filter(e => e.status === 'absent').length

  const groupName = (gid) => groups.find(g => g.id === gid)?.name || gid

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
        <div>
          <h1 style={{ margin:0, fontSize:'22px', fontWeight:700, color:'#f1f5f9' }}>Bugungi davomat</h1>
          <p style={{ margin:'4px 0 0', fontSize:'13px', color:'#64748b' }}>{today}</p>
        </div>
        {multiOrg && (
          <div style={{ display:'flex', gap:'8px' }}>
            <button onClick={() => setOrgFilter('all')} style={{
              padding:'7px 14px', borderRadius:'8px', border:'1px solid',
              borderColor: orgFilter==='all'?'#6366f1':'#1e2535',
              background: orgFilter==='all'?'#6366f120':'transparent',
              color: orgFilter==='all'?'#a5b4fc':'#64748b', fontSize:'13px', cursor:'pointer', fontWeight: orgFilter==='all'?600:400
            }}>Hammasi</button>
            {groups.map(g => (
              <button key={g.id} onClick={() => setOrgFilter(g.id)} style={{
                padding:'7px 14px', borderRadius:'8px', border:'1px solid',
                borderColor: orgFilter===g.id?'#6366f1':'#1e2535',
                background: orgFilter===g.id?'#6366f120':'transparent',
                color: orgFilter===g.id?'#a5b4fc':'#64748b', fontSize:'13px', cursor:'pointer', fontWeight: orgFilter===g.id?600:400
              }}>{g.name}</button>
            ))}
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px', marginBottom:'24px' }}>
        <StatCard icon={Users}       label="Jami xodim"  value={filtered.length} color="#6366f1" bg="#6366f118" />
        <StatCard icon={CheckCircle} label="O'z vaqtida" value={ontime}          color="#22c55e" bg="#22c55e18" />
        <StatCard icon={Clock}       label="Kech keldi"  value={late}            color="#f59e0b" bg="#f59e0b18" />
        <StatCard icon={XCircle}     label="Kelmadi"     value={absent}          color="#ef4444" bg="#ef444418" />
      </div>

      {/* Table + Chart */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:'16px' }}>
        <div style={{ background:'#161b27', borderRadius:'14px', border:'1px solid #1e2535', overflow:'hidden' }}>
          <div style={{ padding:'14px 20px', borderBottom:'1px solid #1e2535', display:'flex', alignItems:'center', gap:'8px' }}>
            <Users size={16} color="#6366f1"/>
            <span style={{ fontWeight:600, fontSize:'14px', color:'#f1f5f9' }}>Xodimlar holati</span>
            <span style={{ marginLeft:'auto', fontSize:'12px', color:'#475569', background:'#0f1117', padding:'3px 10px', borderRadius:'20px' }}>
              ⚠️ Kelish vaqti: server ulanganidan keyin
            </span>
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#0f1117' }}>
                {['Ism Familiya', ...(multiOrg?['Tashkilot']:[]), 'Keldi','Ketdi','Holat'].map(h => (
                  <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:'12px', color:'#475569', fontWeight:600, textTransform:'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((emp, i) => {
                const s = statusInfo[emp.status]
                return (
                  <tr key={emp.id} style={{ borderTop:'1px solid #1e2535' }}>
                    <td style={{ padding:'11px 16px', fontSize:'14px', color:'#e2e8f0', fontWeight:500 }}>{emp.name}</td>
                    {multiOrg && (
                      <td style={{ padding:'11px 16px', fontSize:'13px', color:'#64748b' }}>
                        <span style={{ display:'inline-flex', alignItems:'center', gap:'4px' }}>
                          <Building2 size={12}/> {groupName(emp.group)}
                        </span>
                      </td>
                    )}
                    <td style={{ padding:'11px 16px', fontSize:'14px', color: emp.arrived?'#22c55e':'#475569', fontWeight:600 }}>{emp.arrived||'—'}</td>
                    <td style={{ padding:'11px 16px', fontSize:'14px', color: emp.left?'#94a3b8':'#475569' }}>{emp.left||'—'}</td>
                    <td style={{ padding:'11px 16px' }}>
                      <span style={{ padding:'4px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:600, background:s.bg, color:s.color }}>{s.label}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div style={{ background:'#161b27', borderRadius:'14px', border:'1px solid #1e2535', padding:'20px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'20px' }}>
            <TrendingUp size={16} color="#6366f1"/>
            <span style={{ fontWeight:600, fontSize:'14px', color:'#f1f5f9' }}>Haftalik ko'rsatkich</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weekData} barGap={4}>
              <XAxis dataKey="day" stroke="#334155" tick={{ fill:'#64748b', fontSize:12 }}/>
              <YAxis stroke="#334155" tick={{ fill:'#64748b', fontSize:12 }}/>
              <Tooltip contentStyle={{ background:'#1e2535', border:'1px solid #334155', borderRadius:'8px', color:'#f1f5f9' }} cursor={{ fill:'#ffffff08' }}/>
              <Bar dataKey="keldi"   name="Keldi"   fill="#6366f1" radius={[4,4,0,0]}/>
              <Bar dataKey="kelmadi" name="Kelmadi" fill="#ef4444" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display:'flex', gap:'16px', justifyContent:'center', marginTop:'8px' }}>
            <span style={{ fontSize:'12px', color:'#64748b', display:'flex', alignItems:'center', gap:'6px' }}>
              <span style={{ width:'10px', height:'10px', borderRadius:'2px', background:'#6366f1', display:'inline-block' }}></span>Keldi
            </span>
            <span style={{ fontSize:'12px', color:'#64748b', display:'flex', alignItems:'center', gap:'6px' }}>
              <span style={{ width:'10px', height:'10px', borderRadius:'2px', background:'#ef4444', display:'inline-block' }}></span>Kelmadi
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
