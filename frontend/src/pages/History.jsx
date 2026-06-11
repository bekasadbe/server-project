import { useState, useEffect, useRef } from 'react'
import { Clock, Search, Building2, Download, Calendar, Printer } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

import { API_URL, TOKEN } from '../config'

export default function History({ groups = [] }) {
  const [rows, setRows]       = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch]   = useState('')
  const [date, setDate]       = useState(new Date().toISOString().slice(0, 10))

  const dateRef    = useRef(null)
  const multiOrg   = groups.length > 1
  const visibleGroupIds = groups.map(g => g.id)
  const isToday    = date === new Date().toISOString().slice(0, 10)
  const lastColLabel = isToday ? "Oxirgi o'tish" : 'Ketdi'

  const getWorkStart = (group_id) => {
    const g = groups.find(g => g.id === group_id)
    return g?.work_start || '09:00'
  }

  const getWorkBegin = (group_id) => {
    const g = groups.find(g => g.id === group_id)
    return g?.work_begin || '06:00'
  }

  // first_in work_begin dan oldin bo'lsa — kechagi event, hisoblanmaydi
  const getEffectiveFirstIn = (first_in, group_id) => {
    if (!first_in) return null
    return first_in >= getWorkBegin(group_id) ? first_in : null
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

  const filtered = rows
    .filter(r => !search || (r.name || '').toLowerCase().includes(search.toLowerCase()) || r.employee_id.includes(search))
    .sort((a, b) => {
      const ea = getEffectiveFirstIn(a.first_in, a.group_id)
      const eb = getEffectiveFirstIn(b.first_in, b.group_id)
      if (ea && eb) return ea.localeCompare(eb)   // ikkalasi kelgan — vaqt bo'yicha
      if (ea) return -1                            // a kelgan, b kelmagan — a oldin
      if (eb) return 1                             // b kelgan, a kelmagan — b oldin
      return (a.name || '').localeCompare(b.name || '') // ikkalasi kelmagan — ism bo'yicha
    })

  const getLate = (first_in, group_id) => {
    const eff = getEffectiveFirstIn(first_in, group_id)
    if (!eff) return null
    const workStart = getWorkStart(group_id)
    const [wh, wm] = workStart.split(':').map(Number)
    const [h, m]   = eff.split(':').map(Number)
    const mins = (h - wh) * 60 + (m - wm)
    return mins > 0 ? mins : 0
  }

  const getStatus = (r) => {
    const eff = getEffectiveFirstIn(r.first_in, r.group_id)
    if (!eff) return { label: 'Kelmadi',     color: '#dc2626', bg: '#fee2e2' }
    const late = getLate(r.first_in, r.group_id)
    return late > 0
      ? { label: 'Kech keldi',  color: '#d97706', bg: '#fef3c7' }
      : { label: "O'z vaqtida", color: '#16a34a', bg: '#dcfce7' }
  }

  const buildTableData = () => {
    const dateFormatted = date.split('-').reverse().join('.')
    const orgName = multiOrg ? 'Barcha tashkilotlar' : (groups[0]?.name || '')
    const ontime  = filtered.filter(r => r.first_in && getLate(r.first_in, r.group_id) === 0).length
    const late    = filtered.filter(r => r.first_in && getLate(r.first_in, r.group_id) > 0).length
    const absent  = filtered.filter(r => !r.first_in).length
    const head    = multiOrg
      ? [['#', 'Ism Familiya', 'Tashkilot', 'Keldi', lastColLabel, 'Kechikish', 'Holat']]
      : [['#', 'Ism Familiya', 'Keldi', lastColLabel, 'Kechikish', 'Holat']]
    const body = filtered.map((r, i) => {
      const eff = getEffectiveFirstIn(r.first_in, r.group_id)
      const lm  = getLate(r.first_in, r.group_id)
      const st  = getStatus(r)
      const row = [i+1, r.name || '—', ...(multiOrg ? [groupName(r.group_id)] : []),
        eff || '—', r.last_out || '—', lm > 0 ? `${lm} daq.` : '—', st.label]
      return row
    })
    return { dateFormatted, orgName, ontime, late, absent, head, body }
  }

  const handleDownloadPDF = () => {
    const { dateFormatted, orgName, ontime, late, absent, head, body } = buildTableData()
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pw  = doc.internal.pageSize.getWidth()

    // ── BREND (o'ng yuqori burchak) ───────────────────────
    const bw = 38, bh = 14, bx = pw - 52, by = 8
    doc.setFillColor(239, 246, 255)
    doc.roundedRect(bx, by, bw, bh, 2.5, 2.5, 'F')
    doc.setDrawColor(37, 99, 235)
    doc.setLineWidth(0.45)
    doc.circle(bx + 6, by + 6, 3, 'S')
    doc.setLineWidth(0.55)
    doc.line(bx + 4.5, by + 6,   bx + 5.6, by + 7.2)
    doc.line(bx + 5.6, by + 7.2, bx + 7.8, by + 4.9)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(37, 99, 235)
    doc.text('Davomatlar.uz', bx + 13, by + 6)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184)
    doc.text('Boshqaruv tizimi', bx + 13, by + 11)
    doc.setTextColor(0)
    doc.link(bx, by, bw, bh, { url: 'https://davomatlar.uz' })

    // ── SARLAVHA ──────────────────────────────────────────
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.setTextColor(15, 23, 42)
    doc.text(`Davomat hisoboti — ${dateFormatted}`, 14, 18)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(100, 116, 139)
    doc.text(orgName, 14, 25)

    // ── STATISTIKA QUTILARI ───────────────────────────────
    const stats = [
      { label: 'Jami',        val: filtered.length, c: [37,99,235]  },
      { label: "O'z vaqtida", val: ontime,           c: [22,163,74]  },
      { label: 'Kech keldi',  val: late,             c: [217,119,6]  },
      { label: 'Kelmadi',     val: absent,           c: [220,38,38]  },
    ]
    const boxH = 18, boxW = 42, boxY = 30
    stats.forEach((s, i) => {
      const x = 14 + i * (boxW + 2)
      doc.setFillColor(248, 250, 252)
      doc.roundedRect(x, boxY, boxW, boxH, 2, 2, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(...s.c)
      doc.text(String(s.val), x + boxW / 2, boxY + 9, { align: 'center' })
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(100, 116, 139)
      doc.text(s.label, x + boxW / 2, boxY + 15, { align: 'center' })
    })

    doc.setTextColor(0)
    autoTable(doc, {
      head, body,
      startY: 54,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === (multiOrg ? 6 : 5)) {
          const v = data.cell.raw
          if (v === 'Kelmadi')         data.cell.styles.textColor = [220, 38, 38]
          else if (v === 'Kech keldi') data.cell.styles.textColor = [217, 119, 6]
          else                         data.cell.styles.textColor = [22, 163, 74]
        }
      },
      didDrawPage: (data) => {
        // Faqat pastki qism (har sahifada)
        const ph = doc.internal.pageSize.getHeight()
        const pw = doc.internal.pageSize.getWidth()
        doc.setFontSize(7)
        doc.setTextColor(203, 213, 225)
        doc.text('davomatlar.uz', pw / 2, ph - 6, { align: 'center' })
      }
    })
    doc.save(`davomat_${date}.pdf`)
  }

  const handlePrint = () => {
    // PDF ni yaratib, avtomatik print dialogini ochamiz
    const { head, body, dateFormatted, orgName, ontime, late, absent } = buildTableData()
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pw  = doc.internal.pageSize.getWidth()

    // Brend
    const bw = 38, bh = 14, bx = pw - 52, by = 8
    doc.setFillColor(239, 246, 255)
    doc.roundedRect(bx, by, bw, bh, 2.5, 2.5, 'F')
    doc.setDrawColor(37, 99, 235); doc.setLineWidth(0.45)
    doc.circle(bx + 6, by + 6, 3, 'S')
    doc.setLineWidth(0.55)
    doc.line(bx + 4.5, by + 6, bx + 5.6, by + 7.2)
    doc.line(bx + 5.6, by + 7.2, bx + 7.8, by + 4.9)
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(37, 99, 235)
    doc.text('Davomatlar.uz', bx + 13, by + 6)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(148, 163, 184)
    doc.text('Boshqaruv tizimi', bx + 13, by + 11)
    doc.setTextColor(0)
    doc.link(bx, by, bw, bh, { url: 'https://davomatlar.uz' })

    // Sarlavha
    doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor(15, 23, 42)
    doc.text(`Davomat hisoboti — ${dateFormatted}`, 14, 18)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(100, 116, 139)
    doc.text(orgName, 14, 25)

    // Statistika
    const stats = [
      { label: 'Jami',        val: filtered.length, c: [37,99,235]  },
      { label: "O'z vaqtida", val: ontime,           c: [22,163,74]  },
      { label: 'Kech keldi',  val: late,             c: [217,119,6]  },
      { label: 'Kelmadi',     val: absent,           c: [220,38,38]  },
    ]
    stats.forEach((s, i) => {
      const x = 14 + i * 44
      doc.setFillColor(248, 250, 252); doc.roundedRect(x, 30, 42, 18, 2, 2, 'F')
      doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(...s.c)
      doc.text(String(s.val), x + 21, 39, { align: 'center' })
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(100, 116, 139)
      doc.text(s.label, x + 21, 45, { align: 'center' })
    })
    doc.setTextColor(0)

    autoTable(doc, {
      head, body, startY: 54,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === (multiOrg ? 6 : 5)) {
          const v = data.cell.raw
          if (v === 'Kelmadi')         data.cell.styles.textColor = [220, 38, 38]
          else if (v === 'Kech keldi') data.cell.styles.textColor = [217, 119, 6]
          else                         data.cell.styles.textColor = [22, 163, 74]
        }
      },
      didDrawPage: () => {
        const ph = doc.internal.pageSize.getHeight()
        doc.setFontSize(7); doc.setTextColor(203, 213, 225)
        doc.text('davomatlar.uz', pw / 2, ph - 6, { align: 'center' })
      }
    })

    // Print dialogini ochish
    doc.autoPrint()
    window.open(doc.output('bloburl'), '_blank')
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
        <div style={{ display:'flex', gap:'8px' }}>
          <button onClick={handlePrint} style={{
            display:'flex', alignItems:'center', gap:'7px',
            padding:'9px 16px', background:'#fff', border:'1px solid #e2e8f0',
            borderRadius:'9px', color:'#475569', fontSize:'13px',
            fontWeight:600, cursor:'pointer',
          }}>
            <Printer size={15}/> Chop etish
          </button>
          <button onClick={handleDownloadPDF} style={{
            display:'flex', alignItems:'center', gap:'7px',
            padding:'9px 18px', background:'#2563eb', border:'none',
            borderRadius:'9px', color:'white', fontSize:'13px',
            fontWeight:600, cursor:'pointer', boxShadow:'0 2px 8px #2563eb30'
          }}>
            <Download size={15}/> PDF yuklash
          </button>
        </div>
      </div>

      <div style={{ display:'flex', gap:'10px', marginBottom:'20px', flexWrap:'wrap' }}>
        <div style={{ position:'relative' }}>
          <button onClick={() => dateRef.current?.showPicker()} style={{
            display:'flex', alignItems:'center', gap:'8px',
            padding:'9px 16px', background:'#eff6ff', border:'1px solid #bfdbfe',
            borderRadius:'9px', color:'#2563eb', fontSize:'14px', fontWeight:600,
            cursor:'pointer', whiteSpace:'nowrap',
          }}>
            <Calendar size={15}/> {date.split('-').reverse().join('.')}
          </button>
          <input ref={dateRef} type="date" value={date} onChange={e => setDate(e.target.value)}
            style={{ position:'absolute', opacity:0, pointerEvents:'none', width:'1px', height:'1px', top:0, left:0 }}/>
        </div>
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
              {['Ism Familiya', ...(multiOrg?['Tashkilot']:[]), 'Keldi', lastColLabel, 'Kechikish', 'Holat'].map(h => (
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
                  <td style={{ padding:'11px 16px', fontFamily:'monospace', fontSize:'14px', color:getEffectiveFirstIn(r.first_in,r.group_id)?'#16a34a':'#cbd5e1', fontWeight:600 }}>{getEffectiveFirstIn(r.first_in,r.group_id) || '—'}</td>
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
