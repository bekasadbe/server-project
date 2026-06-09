import { useState, useEffect, useRef } from 'react'
import { LogIn, LogOut, Wifi, WifiOff } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.5.127:8000'
const TOKEN   = 'Dav0mat@API#2026!'

export default function LiveEvents({ groups = [] }) {
  const [events, setEvents]     = useState([])
  const [connected, setConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)
  const lastIdRef = useRef(0)

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_URL}/events/live?limit=50`, {
        headers: { 'X-API-Token': TOKEN }
      })
      if (!res.ok) throw new Error('API xatosi')
      const data = await res.json()
      const newEvents = data.events || []

      if (newEvents.length > 0) {
        const maxId = newEvents[0].id
        if (maxId > lastIdRef.current) {
          lastIdRef.current = maxId
        }
      }

      setEvents(newEvents)
      setConnected(true)
      setLastUpdate(new Date().toLocaleTimeString('uz-UZ'))
    } catch {
      setConnected(false)
    }
  }

  useEffect(() => {
    fetchEvents()
    const interval = setInterval(fetchEvents, 5000)
    return () => clearInterval(interval)
  }, [])

  const groupName = (gid) => groups.find(g => g.id === gid)?.name || gid || '—'

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px' }}>
        <div>
          <h2 style={{ fontSize:'22px', fontWeight:700, color:'#0f172a', margin:0 }}>Jonli lenta</h2>
          <p style={{ fontSize:'13px', color:'#64748b', margin:'4px 0 0' }}>
            Har 5 soniyada yangilanadi
          </p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'8px',
          padding:'8px 16px', borderRadius:'20px',
          background: connected ? '#dcfce7' : '#fee2e2',
          color: connected ? '#16a34a' : '#dc2626',
          fontSize:'13px', fontWeight:600 }}>
          {connected
            ? <><Wifi size={15}/> Ulangan {lastUpdate && `· ${lastUpdate}`}</>
            : <><WifiOff size={15}/> Ulanmadi</>}
        </div>
      </div>

      {/* Events jadval */}
      <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid #e2e8f0', overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:'#f8fafc', borderBottom:'1px solid #e2e8f0' }}>
              {['Vaqt','Xodim','Tashkilot','Holat','Kamera IP'].map(h => (
                <th key={h} style={{ padding:'12px 16px', textAlign:'left',
                  fontSize:'12px', fontWeight:600, color:'#64748b',
                  textTransform:'uppercase', letterSpacing:'0.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding:'48px', textAlign:'center', color:'#94a3b8' }}>
                  Hali event kelmadi...
                </td>
              </tr>
            ) : events.map((e, i) => (
              <tr key={e.id} style={{
                borderBottom:'1px solid #f1f5f9',
                background: i === 0 ? '#f0fdf4' : 'transparent',
                transition:'background 0.3s'
              }}>
                <td style={{ padding:'12px 16px', fontWeight:600, color:'#0f172a', fontFamily:'monospace' }}>
                  {e.time_short || e.event_time?.slice(11,16) || '—'}
                </td>
                <td style={{ padding:'12px 16px' }}>
                  <div style={{ fontWeight:500, color:'#0f172a' }}>{e.name || '—'}</div>
                  <div style={{ fontSize:'12px', color:'#94a3b8' }}>{e.employee_id}</div>
                </td>
                <td style={{ padding:'12px 16px', fontSize:'13px', color:'#475569' }}>
                  {groupName(e.group_id)}
                </td>
                <td style={{ padding:'12px 16px' }}>
                  {e.direction === 'in' ? (
                    <span style={{ display:'inline-flex', alignItems:'center', gap:'4px',
                      padding:'4px 10px', borderRadius:'20px',
                      background:'#dcfce7', color:'#16a34a', fontSize:'12px', fontWeight:600 }}>
                      <LogIn size={12}/> Kirdi
                    </span>
                  ) : (
                    <span style={{ display:'inline-flex', alignItems:'center', gap:'4px',
                      padding:'4px 10px', borderRadius:'20px',
                      background:'#fef3c7', color:'#d97706', fontSize:'12px', fontWeight:600 }}>
                      <LogOut size={12}/> Chiqdi
                    </span>
                  )}
                </td>
                <td style={{ padding:'12px 16px', fontSize:'12px', color:'#94a3b8', fontFamily:'monospace' }}>
                  {e.device_ip || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
