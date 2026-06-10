import { useState, useEffect } from 'react'
import { Clock, Search, Building2, Download } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const TOKEN   = 'Dav0mat@API#2026!'

export default function History({ groups = [] }) {
  const [rows, setRows]       = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch]   = useState('')
  const [date, setDate]       = useState(new Date().toISOString().slice(0, 10))

  const multiOrg = groups.length > 1
  const visibleGroupIds = groups.map(g => g.id)

  const getWorkStart = (group_id) => {
    const g = groups.find(g => g.id === group_id)
    return g?.work_start || '09:00'
  }

  const fetchData = async (d) => {
    setLoading(true)
    try {
      const res  = await fetch(`${API_URL}/attendance?date=${d}`, { headers: { 'X-API-Token': TOKEN } })
      const data = await res.json()
      setRows((data.attendance || []).filter(r => visibleGroupIds.includes(r.group_id)))
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchData(date) }, [date])

  const groupName = (gid) => groups.find(g => g.id === gid)?.name || gid

  const filtered = rows.filter(r =>
    !search || (r.name || '').toLowerCase().includes(search.toLowerCase()) || r.employee_id.includes(search)
  )

  const getLate = (first_in, group_id) => {
    if (!first_in) return null
    const workStart = getWorkStart(group_id)
    const [wh, wm] = workStart.split(':').map(Number)
    const [h, m]   = first_in.split(':').map(Number)
    const mins = (h - wh) * 60 + (m - wm)
    return mins > 0 ? mins : 0
  }

  const getStatus = (r) => {
    if (!r.first_in) return { label: 'Kelmadi',      color: '#dc2626', bg: '#fee2e2' }
    const late = getLate(r.first_in, r.group_id)
    return late > 0
      ? { label: 'Kech keldi',   color: '#d97706', bg: '#fef3c7' }
      : { label: "O'z vaqtida",  color: '#16a34a', bg: '#dcfce7' }
  }

  const handleDownloadPDF = () => {
    const dateFormatted = date.split('-').reverse().join('.')
    const orgName = multiOrg ? 'Barcha tashkilotlar' : (groups[0]?.name || '')
    const ontime  = filtered.filter(r => r.first_in && getLate(r.first_in, r.group_id) === 0).length
    const late    = filtered.filter(r => r.first_in && getLate(r.first_in, r.group_id) > 0).length
    const absent  = filtered.filter(r => !r.first_in).length

    const rows_html = filtered.map((r, i) => {
      const late_min = getLate(r.first_in, r.group_id)
      const st = getStatus(r)
      return `<tr style="background:${i%2===0?'#f9fafb':'#fff'}">
        <td>${i+1}</td>
        <td>${r.name || '—'}</td>
        ${multiOrg ? `<td>${groupName(r.group_id)}</td>` : ''}
        <td>${r.first_in || '—'}</td>
        <td>${r.last_out || '—'}</td>
        <td>${late_min > 0 ? late_min + ' daq.' : '—'}</td>
        <td><span style="color:${st.color};font-weight:600">${st.label}</span></td>
      </tr>`
    }).join('')

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>Davomat ${dateFormatted}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
      h2 { margin: 0 0 4px; font-size: 20px; }
      p  { margin: 0 0 16px; color: #64748b; font-size: 13px; }
      .stats { display: flex; gap: 16px; margin-bottom: 20px; }
      .stat  { background: #f8fafc; border-radius: 8px; padding: 10px 18px; font-size: 13px; }
      .stat b { font-size: 20px; display: block; }
      table { width: 100%; border-collapse: collapse; font-size: 13px; }
      th { background: #f1f5f9; padding: 8px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #64748b; }
      td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; }
      @media print { body { padding: 0; } }
    </style></head><body>
    <h2>Davomat hisoboti — ${dateFormatted}</h2>
    <p>${orgName}</p>
    <div class="stats">
      <div class="stat"><b>${filtered.length}</b>Jami xodim</div>
      <div class="stat" style="color:#16a34a"><b>${ontime}</b>O'z vaqtida</div>
      <div class="stat" style="color:#d97706"><b>${late}</b>Kech keldi</div>
      <div class="stat" style="color:#dc2626"><b>${absent}</b>Kelmadi</div>
    </div>
    <table>
      <thead><tr>
        <th>#</th><th>Ism Familiya</th>
        ${multiOrg ? '<th>Tashkilot</th>' : ''}
        <th>Keldi</th><th>Ketdi</th><th>Kechikish</th><th>Holat</th>
      </tr></thead>
      <tbody>${rows_html}</tbody>
    </table>
    <script>window.onload=()=>{window.print()}</script>
    </body></html>`

    const win = window.open('', '_blank')
    win.document.write(html)
    win.document.close()
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
        <div>
          <h1 style={{ margin:0, fontSize:'22px', fontWeight:700, color:'#0f172a', display:'flex', alignItems:'center', gap:'10px' }}>
            <Clock size={22} color="#2563eb" /> Keldi-ketdi tarixi
          </h1>
          <p style={{ margin:'4px 0 0', fontSize:'13px', color:'#94a3b8' }}>Sana bo'yicha davomat</p>
        </div>
        <button onClick={handleDownloadPDF} style={{
          display:'flex', alignItems:'center', gap:'7px',
          padding:'9px 18px', background:'#2563eb', border:'none',
          borderRadius:'9px', color:'white', fontSize:'13px',
          fontWeight:600, cursor:'pointer', boxShadow:'0 2px 8px #2563eb30'
        }}>
          <Download size={15}/> PDF yuklash
        </button>
      </div>

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
              const late_min = getLate(r.first_in, r.group_id)
              const st = getStatus(r)
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
                  <td style={{ padding:'11px 16px', fontSize:'13px', color: late_min > 0 ? '#d97706' : '#94a3b8' }}>
                    {late_min > 0 ? `${late_min} daq.` : '—'}
                  </td>
                  <td style={{ padding:'11px 16px' }}>
                    <span style={{ padding:'4px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:600, background:st.bg, color:st.color }}>{st.label}</span>
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
