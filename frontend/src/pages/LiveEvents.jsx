import { useState, useEffect, useRef } from 'react'
import { LogIn, LogOut, Wifi, WifiOff } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.5.127:8000'
const TOKEN   = 'Dav0mat@API#2026!'

export default function LiveEvents({ groups = [] }) {
  const [events, setEvents]       = useState([])
  const [connected, setConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)
  const lastIdRef = useRef(0)

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_URL}/events/live?limit=100`, {
        headers: { 'X-API-Token': TOKEN }
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      const newEvents = data.events || []
      if (newEvents.length > 0) lastIdRef.current = newEvents[0].id
      setEvents(newEvents)
      setConnected(true)
      setLastUpdate(new Date().toLocaleTimeString('uz-UZ'))
    } catch {
      setConnected(false)
    }
  }

  useEffect(() => {
    fetchEvents()
    const iv = setInterval(fetchEvents, 5000)
    return () => clearInterval(iv)
  }, [])

  const groupName = (gid) => groups.find(g => g.id === gid)?.name || '—'

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
        <div>
          <h2 style={{ fontSize:'20px', fontWeight:700, color:'#0f172a', margin:0 }}>Jonli lenta</h2>
          <p style={{ fontSize:'12px', color:'#64748b', margin:'2px 0 0' }}>Har 5 soniyada yangilanadi</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'6px', padding:'6px 14px', borderRadius:'20px',
          background: connected ? '#dcfce7' : '#fee2e2', color: connected ? '#16a34a' : '#dc2626',
          fontSize:'12px', fontWeight:600 }}>
          {connected ? <><Wifi size={13}/> Ulangan {lastUpdate && `· ${lastUpdate}`}</> : <><WifiOff size={13}/> Ulanmadi</>}
        </div>
      </div>

      <div style={{ background:'#fff', borderRadius:'12px', border:'1px solid #e2e8f0', overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:'#f8fafc', borderBottom:'1px solid #e2e8f0' }}>
              {['Vaqt','ID','Xodim','Tashkilot','Holat','Kamera'].map(h => (
                <th key={h} style={{ padding:'7px 10px', textAlign:'left',
                  fontSize:'10px', fontWeight:700, color:'#94a3b8',
                  textTransform:'uppercase', letterSpacing:'0.5px', whiteSpace:'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr><td colSpan={6} style={{ padding:'32px', textAlign:'center', color:'#94a3b8', fontSize:'13px' }}>
                Hali event kelmadi...
              </td></tr>
            ) : events.map((e, i) => (
              <tr key={e.id} style={{
                borderBottom:'1px solid #f1f5f9',
                background: i === 0 ? '#f0fdf4' : i % 2 === 0 ? '#fafafa' : '#fff',
              }}>
                <td style={{ padding:'5px 10px', fontSize:'12px', fontWeight:600, color:'#0f172a', fontFamily:'monospace', whiteSpace:'nowrap' }}>
                  {e.time_short || e.event_time?.slice(11,16) || '—'}
                </td>
                <td style={{ padding:'5px 10px', fontSize:'11px', color:'#94a3b8', fontFamily:'monospace' }}>
                  {e.employee_id}
                </td>
                <td style={{ padding:'5px 10px', fontSize:'12px', fontWeight:500, color:'#0f172a' }}>
                  {e.name || '—'}
                </td>
                <td style={{ padding:'5px 10px', fontSize:'11px', color:'#64748b' }}>
                  {groupName(e.group_id)}
                </td>
                <td style={{ padding:'5px 10px' }}>
                  {e.direction === 'in' ? (
                    <span style={{ display:'inline-flex', alignItems:'center', gap:'3px',
                      padding:'2px 8px', borderRadius:'20px',
                      background:'#dcfce7', color:'#16a34a', fontSize:'11px', fontWeight:600 }}>
                      <LogIn size={10}/> Kirdi
                    </span>
                  ) : (
                    <span style={{ display:'inline-flex', alignItems:'center', gap:'3px',
                      padding:'2px 8px', borderRadius:'20px',
                      background:'#fef3c7', color:'#d97706', fontSize:'11px', fontWeight:600 }}>
                      <LogOut size={10}/> Chiqdi
                    </span>
                  )}
                </td>
                <td style={{ padding:'5px 10px', fontSize:'11px', color:'#94a3b8', fontFamily:'monospace' }}>
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
