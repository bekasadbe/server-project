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
  ontime: { label:"O'z vaqtida", color:'#16a34a', bg:'#dcfce7' },
  late:   { label:'Kech keldi',  color:'#d97706', bg:'#fef3c7' },
  absent: { label:'Kelmadi',     color:'#dc2626', bg:'#fee2e2' },
}

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div style={{ background:'#ffffff', borderRadius:'14px', padding:'20px 24px', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', gap:'16px', boxShadow:'0 1px 3px #0f172a08' }}>
      <div style={{ background:bg, borderRadius:'12px', padding:'12px', display:'flex' }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div style={{ fontSize:'28px', fontWeight:700, color:'#0f172a' }}>{value}</div>
        <div style={{ fontSize:'13px', color:'#64748b', marginTop:'2px' }}>{label}</div>
      </div>
    </div>
  )
}

export default function Dashboard({ employees = [], groups = [] }) {
  const [orgFilter, setOrgFilter] = useState('all')
  const today    = new Date().toLocaleDateString('uz-UZ', { year:'numeric', month:'long', day:'numeric' })
  const multiOrg = groups.length > 1

  const filtered = orgFilter === 'all' ? employees : employees.filter(e => e.group === orgFilter)

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
          <h1 style={{ margin:0, fontSize:'22px', fontWeight:700, color:'#0f172a' }}>Bugungi davomat</h1>
          <p style={{ margin:'4px 0 0', fontSize:'13px', color:'#94a3b8' }}>{today}</p>
        </div>
        {multiOrg && (
          <div style={{ display:'flex', gap:'6px' }}>
            <button onClick={() => setOrgFilter('all')} style={{
              padding:'7px 14px', borderRadius:'8px', border:'1px solid',
              borderColor: orgFilter==='all'?'#2563eb':'#e2e8f0',
              background: orgFilter==='all'?'#eff6ff':'#ffffff',
              color: orgFilter==='all'?'#2563eb':'#64748b', fontSize:'13px', cursor:'pointer', fontWeight: orgFilter==='all'?600:400
            }}>Hammasi</button>
            {groups.map(g => (
              <button key={g.id} onClick={() => setOrgFilter(g.id)} style={{
                padding:'7px 14px', borderRadius:'8px', border:'1px solid',
                borderColor: orgFilter===g.id?'#2563eb':'#e2e8f0',
                background: orgFilter===g.id?'#eff6ff':'#ffffff',
                color: orgFilter===g.id?'#2563eb':'#64748b', fontSize:'13px', cursor:'pointer', fontWeight: orgFilter===g.id?600:400
              }}>{g.name}</button>
            ))}
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px', marginBottom:'24px' }}>
        <StatCard icon={Users}       label="Jami xodim"  value={filtered.length} color="#2563eb" bg="#eff6ff" />
        <StatCard icon={CheckCircle} label="O'z vaqtida" value={ontime}          color="#16a34a" bg="#dcfce7" />
        <StatCard icon={Clock}       label="Kech keldi"  value={late}            color="#d97706" bg="#fef3c7" />
        <StatCard icon={XCircle}     label="Kelmadi"     value={absent}          color="#dc2626" bg="#fee2e2" />
      </div>

      {/* Table + Chart */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:'16px' }}>
        <div style={{ background:'#ffffff', borderRadius:'14px', border:'1px solid #e2e8f0', overflow:'hidden', boxShadow:'0 1px 3px #0f172a08' }}>
          <div style={{ padding:'14px 20px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', gap:'8px' }}>
            <Users size={16} color="#2563eb"/>
            <span style={{ fontWeight:600, fontSize:'14px', color:'#0f172a' }}>Xodimlar holati</span>
            <span style={{ marginLeft:'auto', fontSize:'12px', color:'#94a3b8', background:'#f8fafc', padding:'3px 10px', borderRadius:'20px', border:'1px solid #e2e8f0' }}>
              ⚠️ Kelish vaqti: server ulanganidan keyin
            </span>
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#f8fafc' }}>
                {['Ism Familiya', ...(multiOrg?['Tashkilot']:[]), 'Keldi','Ketdi','Holat'].map(h => (
                  <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:'11px', color:'#94a3b8', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((emp) => {
                const s = statusInfo[emp.status]
                return (
                  <tr key={emp.id} style={{ borderTop:'1px solid #f1f5f9' }}>
                    <td style={{ padding:'11px 16px', fontSize:'14px', color:'#0f172a', fontWeight:500 }}>{emp.name}</td>
                    {multiOrg && (
                      <td style={{ padding:'11px 16px', fontSize:'13px', color:'#64748b' }}>
                        <span style={{ display:'inline-flex', alignItems:'center', gap:'4px' }}>
                          <Building2 size={12}/> {groupName(emp.group)}
                        </span>
                      </td>
                    )}
                    <td style={{ padding:'11px 16px', fontSize:'14px', color: emp.arrived?'#16a34a':'#cbd5e1', fontWeight:600 }}>{emp.arrived||'—'}</td>
                    <td style={{ padding:'11px 16px', fontSize:'14px', color: emp.left?'#475569':'#cbd5e1' }}>{emp.left||'—'}</td>
                    <td style={{ padding:'11px 16px' }}>
                      <span style={{ padding:'4px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:600, background:s.bg, color:s.color }}>{s.label}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div style={{ background:'#ffffff', borderRadius:'14px', border:'1px solid #e2e8f0', padding:'20px', boxShadow:'0 1px 3px #0f172a08' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'20px' }}>
            <TrendingUp size={16} color="#2563eb"/>
            <span style={{ fontWeight:600, fontSize:'14px', color:'#0f172a' }}>Haftalik ko'rsatkich</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weekData} barGap={4}>
              <XAxis dataKey="day" stroke="#e2e8f0" tick={{ fill:'#94a3b8', fontSize:12 }}/>
              <YAxis stroke="#e2e8f0" tick={{ fill:'#94a3b8', fontSize:12 }}/>
              <Tooltip contentStyle={{ background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:'8px', color:'#0f172a', boxShadow:'0 4px 12px #0f172a10' }} cursor={{ fill:'#f1f5f9' }}/>
              <Bar dataKey="keldi"   name="Keldi"   fill="#2563eb" radius={[4,4,0,0]}/>
              <Bar dataKey="kelmadi" name="Kelmadi" fill="#ef4444" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display:'flex', gap:'16px', justifyContent:'center', marginTop:'8px' }}>
            <span style={{ fontSize:'12px', color:'#64748b', display:'flex', alignItems:'center', gap:'6px' }}>
              <span style={{ width:'10px', height:'10px', borderRadius:'2px', background:'#2563eb', display:'inline-block' }}></span>Keldi
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
