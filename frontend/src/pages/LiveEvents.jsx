import { useState, useEffect, useRef } from 'react'
import { Wifi, WifiOff, Radio } from 'lucide-react'
import { API_URL, TOKEN } from '../config'

export default function LiveEvents({ groups = [] }) {
  const [events, setEvents]         = useState([])
  const [connected, setConnected]   = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)
  const lastIdRef = useRef(0)

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_URL}/events/live?limit=100`, { headers: { 'X-API-Token': TOKEN } })
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="flex items-center gap-2.5 text-[22px] font-bold text-slate-900 m-0">
            <Radio size={20} className="text-brand-600"/> Jonli lenta
          </h1>
          <p className="text-[13px] text-slate-400 mt-1 mb-0">Har 5 soniyada yangilanadi</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[13px] font-semibold ${connected ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
          {connected
            ? <><Wifi size={14}/> Ulangan {lastUpdate && <span className="font-normal text-green-600 ml-1">{lastUpdate}</span>}</>
            : <><WifiOff size={14}/> Ulanmadi</>}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50">
              {['Vaqt', 'ID', 'Xodim', 'Tashkilot', 'Holat', 'Kamera'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-[12px] text-slate-400 font-normal whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-slate-400 text-[13px]">Hali event kelmadi…</td>
              </tr>
            ) : events.map((e, i) => (
              <tr key={e.id} className={`border-t border-slate-50 transition-colors ${i === 0 ? 'bg-green-50/60' : 'hover:bg-slate-50/50'}`}>
                <td className="px-4 py-2.5">
                  <span className="font-mono font-bold text-[13px] text-slate-900">{e.time_short || e.event_time?.slice(11,16) || '—'}</span>
                  <span className="font-mono text-[11px] text-slate-400 ml-2">{e.event_time?.slice(0,10) || ''}</span>
                </td>
                <td className="px-4 py-2.5 font-mono text-[11px] text-slate-400">{e.employee_id}</td>
                <td className="px-4 py-2.5 text-[13px] font-medium text-slate-800">{e.name || '—'}</td>
                <td className="px-4 py-2.5 text-[12px] text-slate-500">{groupName(e.group_id)}</td>
                <td className="px-4 py-2.5">
                  {e.direction === 'in'
                    ? <span className="inline-flex px-2.5 py-1 rounded-full text-[12px] font-semibold bg-green-100 text-green-700">Kirdi ↑</span>
                    : <span className="inline-flex px-2.5 py-1 rounded-full text-[12px] font-semibold bg-amber-100 text-amber-700">Chiqdi ↓</span>}
                </td>
                <td className="px-4 py-2.5 font-mono text-[11px] text-slate-400">{e.device_ip || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
