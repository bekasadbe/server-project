import { useState, useEffect } from 'react'
import { CheckCircle, Clock, XCircle, Users, Building2, RefreshCw } from 'lucide-react'

import { API_URL, TOKEN } from '../config'

const statusInfo = {
  ontime: { label:"O'z vaqtida", color:'#16a34a', bg:'#dcfce7' },
  late:   { label:'Kech keldi',  color:'#d97706', bg:'#fef3c7' },
  absent: { label:'Kelmadi',     color:'#dc2626', bg:'#fee2e2' },
}

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div style={{ background:'#fff', borderRadius:'14px', padding:'20px 24px', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', gap:'16px', boxShadow:'0 1px 3px #0f172a08' }}>
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
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading]       = useState(true)
  const [orgFilter, setOrgFilter]   = useState('all')

  const today    = new Date().toISOString().slice(0, 10)
  const todayStr = new Date().toLocaleDateString('uz-UZ', { year:'numeric', month:'long', day:'numeric' })
  const multiOrg = groups.length > 1

  const fetchAttendance = async () => {
    setLoading(true)
    try {
      const res  = await fetch(`${API_URL}/attendance?date=${today}`, { headers: { 'X-API-Token': TOKEN } })
      const data = await res.json()
      setAttendance(data.attendance || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    fetchAttendance()
    const t = setInterval(fetchAttendance, 60000)
    return () => clearInterval(t)
  }, [])

  const getGroup      = (gid) => groups.find(g => g.id === gid)
  const getWorkStart  = (gid) => getGroup(gid)?.work_start    || '09:00'
  const getWorkFinish = (gid) => getGroup(gid)?.work_finish   || '18:00'
  const getWorkBegin  = (gid) => getGroup(gid)?.work_begin    || '06:00'
  const getGrace      = (gid) => getGroup(gid)?.grace_minutes ?? 0

  const isEarlyOut = (row) => row.last_out && row.last_out < getWorkFinish(row.group_id)

  const addMinutes = (t, min) => {
    const [h, m] = t.split(':').map(Number)
    const total = h * 60 + m + Number(min)
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
  }

  const toHHMM = (t) => {
    if (!t) return ''
    return t.length > 8 ? t.slice(11, 16) : t.slice(0, 5)
  }

  const getEffectiveFirstIn = (row) => {
    if (!row.first_in) return null
    const timeStr = toHHMM(row.first_in)
    return timeStr >= getWorkBegin(row.group_id) ? row.first_in : null
  }

  const getStatus = (row) => {
    const effectiveIn = getEffectiveFirstIn(row)
    if (!effectiveIn) return 'absent'
    const lateThreshold = addMinutes(getWorkStart(row.group_id), getGrace(row.group_id))
    return toHHMM(effectiveIn) <= lateThreshold ? 'ontime' : 'late'
  }

  const visibleGroupIds = groups.map(g => g.id)

  const filtered = attendance.filter(r =>
    visibleGroupIds.includes(r.group_id) &&
    (orgFilter === 'all' || r.group_id === orgFilter)
  )

  const sorted = [...filtered].sort((a, b) => {
    const ord = { ontime:0, late:1, absent:2 }
    const sa = getStatus(a), sb = getStatus(b)
    if (ord[sa] !== ord[sb]) return ord[sa] - ord[sb]
    if (a.first_in && b.first_in) return a.first_in.localeCompare(b.first_in)
    return (a.name || '').localeCompare(b.name || '')
  })

  const ontime   = filtered.filter(r => getStatus(r) === 'ontime').length
  const late     = filtered.filter(r => getStatus(r) === 'late').length
  const absent   = filtered.filter(r => getStatus(r) === 'absent').length
  const earlyOut = filtered.filter(r => isEarlyOut(r)).length

  const groupName = (gid) => groups.find(g => g.id === gid)?.name || gid

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
        <div>
          <h1 style={{ margin:0, fontSize:'22px', fontWeight:700, color:'#0f172a' }}>Bugungi Davomat</h1>
          <p style={{ margin:'4px 0 0', fontSize:'13px', color:'#94a3b8' }}>{todayStr}</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          {multiOrg && (
            <div style={{ display:'flex', gap:'6px' }}>
              <button onClick={() => setOrgFilter('all')} style={{ padding:'7px 14px', borderRadius:'8px', border:'1px solid', borderColor:orgFilter==='all'?'#2563eb':'#e2e8f0', background:orgFilter==='all'?'#eff6ff':'#fff', color:orgFilter==='all'?'#2563eb':'#64748b', fontSize:'13px', cursor:'pointer', fontWeight:orgFilter==='all'?600:400 }}>Hammasi</button>
              {groups.map(g => (
                <button key={g.id} onClick={() => setOrgFilter(g.id)} style={{ padding:'7px 14px', borderRadius:'8px', border:'1px solid', borderColor:orgFilter===g.id?'#2563eb':'#e2e8f0', background:orgFilter===g.id?'#eff6ff':'#fff', color:orgFilter===g.id?'#2563eb':'#64748b', fontSize:'13px', cursor:'pointer', fontWeight:orgFilter===g.id?600:400 }}>{g.name}</button>
              ))}
            </div>
          )}
          <button onClick={fetchAttendance} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 14px', borderRadius:'8px', border:'1px solid #e2e8f0', background:'#fff', color:'#475569', fontSize:'13px', cursor:'pointer' }}>
            <RefreshCw size={14} /> Yangilash
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'14px', marginBottom:'24px' }}>
        <StatCard icon={Users}       label="Jami xodim"  value={loading ? '...' : filtered.length} color="#2563eb" bg="#eff6ff" />
        <StatCard icon={CheckCircle} label="O'z vaqtida" value={loading ? '...' : ontime}          color="#16a34a" bg="#dcfce7" />
        <StatCard icon={Clock}       label="Kech keldi"  value={loading ? '...' : late}            color="#d97706" bg="#fef3c7" />
        <StatCard icon={XCircle}     label="Kelmadi"     value={loading ? '...' : absent}          color="#dc2626" bg="#fee2e2" />
        <StatCard icon={Clock}       label="Erta ketdi"  value={loading ? '...' : earlyOut}        color="#9333ea" bg="#f3e8ff" />
      </div>

      {/* Table */}
      <div style={{ background:'#fff', borderRadius:'14px', border:'1px solid #e2e8f0', overflow:'hidden', boxShadow:'0 1px 3px #0f172a08' }}>
        <div style={{ padding:'14px 20px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', gap:'8px' }}>
          <Users size={16} color="#2563eb"/>
          <span style={{ fontWeight:600, fontSize:'14px', color:'#0f172a' }}>Xodimlar holati</span>
        </div>
        {loading ? (
          <div style={{ padding:'48px', textAlign:'center', color:'#94a3b8' }}>Yuklanmoqda...</div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#f8fafc' }}>
                {['Ism Familiya', ...(multiOrg?['Tashkilot']:[]), 'Keldi', 'Oxirgi o\'tish', 'Holat'].map(h => (
                  <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:'11px', color:'#94a3b8', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map(row => {
                const s = statusInfo[getStatus(row)]
                return (
                  <tr key={row.employee_id} style={{ borderTop:'1px solid #f1f5f9' }}>
                    <td style={{ padding:'11px 16px', fontSize:'14px', color:'#0f172a', fontWeight:500 }}>
                      <div>{row.name}</div>
                      {row.lavozim && <div style={{ fontSize:'11px', color:'#94a3b8' }}>{row.lavozim}</div>}
                    </td>
                    {multiOrg && (
                      <td style={{ padding:'11px 16px', fontSize:'13px', color:'#64748b' }}>
                        <span style={{ display:'inline-flex', alignItems:'center', gap:'4px' }}>
                          <Building2 size={12}/> {groupName(row.group_id)}
                        </span>
                      </td>
                    )}
                    <td style={{ padding:'11px 16px', fontSize:'14px', color:getEffectiveFirstIn(row)?'#16a34a':'#cbd5e1', fontWeight:600, fontFamily:'monospace' }}>{getEffectiveFirstIn(row) ? toHHMM(getEffectiveFirstIn(row)) : '—'}</td>
                    <td style={{ padding:'11px 16px', fontSize:'14px', color:row.last_out?'#475569':'#cbd5e1', fontFamily:'monospace' }}>{row.last_out ? toHHMM(row.last_out) : '—'}</td>
                    <td style={{ padding:'11px 16px' }}>
                      <div style={{ display:'flex', flexDirection:'column', gap:'4px', alignItems:'flex-start' }}>
                        <span style={{ padding:'4px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:600, background:s.bg, color:s.color }}>{s.label}</span>
                        {isEarlyOut(row) && <span style={{ padding:'3px 8px', borderRadius:'20px', fontSize:'11px', fontWeight:600, background:'#f3e8ff', color:'#9333ea' }}>Erta ketdi</span>}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {sorted.length === 0 && (
                <tr><td colSpan={multiOrg?5:4} style={{ padding:'40px', textAlign:'center', color:'#94a3b8' }}>Ma'lumot yo'q</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
