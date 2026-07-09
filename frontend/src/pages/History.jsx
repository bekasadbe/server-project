import { useState, useEffect, useRef } from 'react'
import { Clock, Search, Building2, Download, Calendar, Printer, BarChart2 } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { API_URL, TOKEN } from '../config'

const MONTH_NAMES = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr']

export default function History({ groups = [] }) {
  const [tab, setTab] = useState('daily')

  // ── Daily ──────────────────────────────────────────────────
  const [rows, setRows]       = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch]   = useState('')
  const [date, setDate]       = useState(new Date().toISOString().slice(0, 10))
  const dateRef = useRef(null)

  // ── Range (oylik) ──────────────────────────────────────────
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10)
  })
  const [toDate, setToDate]   = useState(new Date().toISOString().slice(0, 10))
  const [rangeData, setRangeData] = useState(null)
  const [rangeLoading, setRangeLoading] = useState(false)
  const [rangeSearch, setRangeSearch]   = useState('')
  const fromRef = useRef(null)
  const toRef   = useRef(null)

  // ── Group helpers ──────────────────────────────────────────
  const multiOrg        = groups.length > 1
  const visibleGroupIds = groups.map(g => g.id)
  const isToday         = date === new Date().toISOString().slice(0, 10)
  const lastColLabel    = isToday ? "Oxirgi o'tish" : 'Ketdi'

  // Xodimning shaxsiy ish grafigi bo'lsa ustun turadi, bo'lmasa guruh sozlamasi (backend COALESCE qiladi)
  const getGroup     = (gid) => groups.find(g => g.id === gid)
  const getWorkStart = (row) => row.work_start    || getGroup(row.group_id)?.work_start    || '09:00'
  const getWorkBegin = (row) => row.work_begin    || getGroup(row.group_id)?.work_begin    || '06:00'
  const getGrace     = (row) => row.grace_minutes ?? getGroup(row.group_id)?.grace_minutes ?? 0
  const groupName    = (gid) => getGroup(gid)?.name || gid

  const addMinutes = (t, min) => {
    const [h, m] = t.split(':').map(Number)
    const total  = h * 60 + m + Number(min)
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
  }

  const getLateThreshold    = (row) => addMinutes(getWorkStart(row), getGrace(row))
  const getEffectiveFirstIn = (first_in, row) => {
    if (!first_in) return null
    return first_in >= getWorkBegin(row) ? first_in : null
  }

  const getLate = (first_in, row) => {
    const eff = getEffectiveFirstIn(first_in, row)
    if (!eff) return null
    const [wh, wm] = getLateThreshold(row).split(':').map(Number)
    const [h,  m]  = eff.split(':').map(Number)
    const mins = (h - wh) * 60 + (m - wm)
    return mins > 0 ? mins : 0
  }

  const getStatus = (r) => {
    const eff = getEffectiveFirstIn(r.first_in, r)
    if (!eff) return { label: 'Kelmadi', color: '#dc2626' }
    return getLate(r.first_in, r) > 0
      ? { label: 'Kech keldi', color: '#d97706' }
      : { label: "O'z vaqtida", color: '#16a34a' }
  }

  const calcWorked = (first_in, last_out, row) => {
    const eff = getEffectiveFirstIn(first_in, row)
    if (!eff || !last_out) return null
    const [h1, m1] = eff.split(':').map(Number)
    const [h2, m2] = last_out.split(':').map(Number)
    const mins = (h2 - h1) * 60 + (m2 - m1)
    if (mins <= 0) return null
    return `${Math.floor(mins / 60)}s ${mins % 60}d`
  }

  // ── Daily fetch ────────────────────────────────────────────
  const fetchDaily = async (d) => {
    setLoading(true)
    try {
      const res  = await fetch(`${API_URL}/attendance?date=${d}`, { headers: { 'X-API-Token': TOKEN } })
      const data = await res.json()
      setRows((data.attendance || []).filter(r => visibleGroupIds.includes(r.group_id)))
    } catch {}
    setLoading(false)
  }
  useEffect(() => { fetchDaily(date) }, [date])

  // ── Range fetch ────────────────────────────────────────────
  const fetchRange = async () => {
    setRangeLoading(true)
    try {
      const res  = await fetch(`${API_URL}/attendance/range?from=${fromDate}&to=${toDate}`, { headers: { 'X-API-Token': TOKEN } })
      const data = await res.json()
      const emps = (data.employees || []).filter(e => visibleGroupIds.includes(e.group_id))
      setRangeData({ ...data, employees: emps })
    } catch {}
    setRangeLoading(false)
  }
  useEffect(() => { if (tab === 'range') fetchRange() }, [tab])

  // ── Daily filtered ─────────────────────────────────────────
  const filtered = rows
    .filter(r => !search || (r.name||'').toLowerCase().includes(search.toLowerCase()) || r.employee_id.includes(search))
    .sort((a, b) => {
      const ea = getEffectiveFirstIn(a.first_in, a)
      const eb = getEffectiveFirstIn(b.first_in, b)
      if (ea && eb) return ea.localeCompare(eb)
      if (ea) return -1; if (eb) return 1
      return (a.name||'').localeCompare(b.name||'')
    })

  // ── Daily PDF ──────────────────────────────────────────────
  const buildDailyPDF = () => {
    const dateFormatted = date.split('-').reverse().join('.')
    const orgName = multiOrg ? 'Barcha tashkilotlar' : (groups[0]?.name || '')
    const ontime  = filtered.filter(r => r.first_in && getLate(r.first_in, r) === 0).length
    const late    = filtered.filter(r => r.first_in && getLate(r.first_in, r)  > 0).length
    const absent  = filtered.filter(r => !r.first_in).length
    const head    = multiOrg
      ? [['#', 'Ism Familiya', 'Tashkilot', 'Keldi', 'Kechikish', 'Holat']]
      : [['#', 'Ism Familiya', 'Keldi', 'Kechikish', 'Holat']]
    const body = filtered.map((r, i) => {
      const eff = getEffectiveFirstIn(r.first_in, r)
      const lm  = getLate(r.first_in, r)
      const st  = getStatus(r)
      return [i+1, r.name||'—', ...(multiOrg?[groupName(r.group_id)]:[]), eff||'—', lm>0?`${lm} daq.`:'—', st.label]
    })
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pw  = doc.internal.pageSize.getWidth()
    const bw=38,bh=14,bx=pw-52,by=8
    doc.setFillColor(239,246,255); doc.roundedRect(bx,by,bw,bh,2.5,2.5,'F')
    doc.setDrawColor(37,99,235); doc.setLineWidth(0.45); doc.circle(bx+6,by+6,3,'S')
    doc.setLineWidth(0.55); doc.line(bx+4.5,by+6,bx+5.6,by+7.2); doc.line(bx+5.6,by+7.2,bx+7.8,by+4.9)
    doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(37,99,235); doc.text('Davomatlar.uz',bx+13,by+6)
    doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(148,163,184); doc.text('Boshqaruv tizimi',bx+13,by+11)
    doc.link(bx,by,bw,bh,{url:'https://davomatlar.uz'})
    doc.setFont('helvetica','bold'); doc.setFontSize(16); doc.setTextColor(15,23,42); doc.text(`Davomat hisoboti — ${dateFormatted}`,14,18)
    doc.setFont('helvetica','normal'); doc.setFontSize(10); doc.setTextColor(100,116,139); doc.text(orgName,14,25)
    const stats=[{label:'Jami',val:filtered.length,c:[37,99,235]},{label:"O'z vaqtida",val:ontime,c:[22,163,74]},{label:'Kech keldi',val:late,c:[217,119,6]},{label:'Kelmadi',val:absent,c:[220,38,38]}]
    stats.forEach((s,i)=>{
      const x=14+i*44
      doc.setFillColor(248,250,252); doc.roundedRect(x,30,42,18,2,2,'F')
      doc.setFont('helvetica','bold'); doc.setFontSize(14); doc.setTextColor(...s.c); doc.text(String(s.val),x+21,39,{align:'center'})
      doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.setTextColor(100,116,139); doc.text(s.label,x+21,45,{align:'center'})
    })
    autoTable(doc,{head,body,startY:54,styles:{fontSize:9,cellPadding:3},headStyles:{fillColor:[37,99,235],textColor:255,fontStyle:'bold'},alternateRowStyles:{fillColor:[248,250,252]},
      didParseCell:(d)=>{if(d.section==='body'&&d.column.index===(multiOrg?5:4)){const v=String(d.cell.raw);if(v==='Kelmadi')d.cell.styles.textColor=[220,38,38];else if(v==='Kech keldi')d.cell.styles.textColor=[217,119,6];else d.cell.styles.textColor=[22,163,74]}},
      didDrawPage:()=>{const ph=doc.internal.pageSize.getHeight();doc.setFontSize(7);doc.setTextColor(203,213,225);doc.text('davomatlar.uz',pw/2,ph-6,{align:'center'})}
    })
    return doc
  }

  // ── Range PDF (vertikal — bir xodim bir kun = bir qator) ──
  const buildRangePDF = () => {
    if (!rangeData) return null
    const days    = rangeData.days || []
    const emps    = rangeFiltered
    const from_   = fromDate.split('-').reverse().join('.')
    const to_     = toDate.split('-').reverse().join('.')
    const orgName = multiOrg ? 'Barcha tashkilotlar' : (groups[0]?.name || '')

    // Flatten: har xodim × har kun = bir qator
    const flatRows = []
    emps.forEach(e => {
      days.forEach(d => {
        const day  = e.days[d]
        const late = day?.in ? getLate(day.in, e) : null
        flatRows.push({ e, d, day, late })
      })
    })

    const totalPresent = flatRows.filter(r => r.day?.in).length
    const totalAbsent  = flatRows.filter(r => !r.day?.in).length
    const totalLate    = flatRows.filter(r => r.late > 0).length

    const head = [['#', 'Ism Familiya', ...(multiOrg?['Tashkilot']:[]), 'Lavozim', 'Sana', 'Kun', 'Keldi', 'Ketdi', 'Kechikish', 'Ishladi']]

    const body = flatRows.map((r, i) => {
      const { e, d, day, late } = r
      const weekDay = fmtWeekDay(d)
      return [
        i + 1,
        e.name || '—',
        ...(multiOrg ? [groupName(e.group_id)] : []),
        e.lavozim || '—',
        fmtDate(d),
        weekDay,
        day?.in  || '—',
        day?.out || '—',
        late > 0 ? `+${late} daq.` : '—',
        day?.worked || '—',
      ]
    })

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pw  = doc.internal.pageSize.getWidth()
    const bw=38, bh=14, bx=pw-52, by=8
    doc.setFillColor(239,246,255); doc.roundedRect(bx,by,bw,bh,2.5,2.5,'F')
    doc.setDrawColor(37,99,235); doc.setLineWidth(0.45); doc.circle(bx+6,by+6,3,'S')
    doc.setLineWidth(0.55); doc.line(bx+4.5,by+6,bx+5.6,by+7.2); doc.line(bx+5.6,by+7.2,bx+7.8,by+4.9)
    doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(37,99,235); doc.text('Davomatlar.uz',bx+13,by+6)
    doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(148,163,184); doc.text('Boshqaruv tizimi',bx+13,by+11)
    doc.link(bx,by,bw,bh,{url:'https://davomatlar.uz'})
    doc.setFont('helvetica','bold'); doc.setFontSize(14); doc.setTextColor(15,23,42)
    doc.text(`Davomat hisoboti`, 14, 16)
    doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(100,116,139)
    doc.text(`${from_} — ${to_}   |   ${orgName}`, 14, 23)

    const stats = [
      {label:'Xodimlar',val:emps.length,c:[37,99,235]},
      {label:'Jami keldi',val:totalPresent,c:[22,163,74]},
      {label:'Kelmadi',val:totalAbsent,c:[220,38,38]},
      {label:'Kech keldi',val:totalLate,c:[217,119,6]}
    ]
    stats.forEach((s,i) => {
      const x = 14 + i*44
      doc.setFillColor(248,250,252); doc.roundedRect(x,28,42,15,2,2,'F')
      doc.setFont('helvetica','bold'); doc.setFontSize(13); doc.setTextColor(...s.c)
      doc.text(String(s.val), x+21, 36, {align:'center'})
      doc.setFont('helvetica','normal'); doc.setFontSize(6.5); doc.setTextColor(100,116,139)
      doc.text(s.label, x+21, 41, {align:'center'})
    })

    autoTable(doc, {
      head, body, startY: 49,
      styles: { fontSize: 7.5, cellPadding: 2 },
      headStyles: { fillColor:[37,99,235], textColor:255, fontStyle:'bold', fontSize:7.5 },
      alternateRowStyles: { fillColor:[248,250,252] },
      columnStyles: {
        0: { cellWidth:8,  halign:'center' },
        [multiOrg?6:5]: { halign:'center' },  // Keldi
        [multiOrg?7:6]: { halign:'center' },  // Ketdi
        [multiOrg?8:7]: { halign:'center', textColor:[217,119,6] },  // Kechikish
        [multiOrg?9:8]: { halign:'center', textColor:[37,99,235] },  // Ishladi
      },
      didParseCell: (d) => {
        if (d.section !== 'body') return
        const kechCol = multiOrg ? 8 : 7
        const ishlCol = multiOrg ? 9 : 8
        const keldiCol = multiOrg ? 6 : 5
        const val = String(d.cell.raw)
        if (d.column.index === kechCol && val !== '—') d.cell.styles.textColor = [217,119,6]
        if (d.column.index === ishlCol && val !== '—') d.cell.styles.textColor = [37,99,235]
        if (d.column.index === keldiCol && val !== '—') {
          // kech kelganlarda keldi vaqtini sariq qilish
          const rowIdx = d.row.index
          const kechVal = String(body[rowIdx]?.[kechCol])
          if (kechVal !== '—') d.cell.styles.textColor = [217,119,6]
          else d.cell.styles.textColor = [22,163,74]
        }
      },
      didDrawPage: () => {
        const ph = doc.internal.pageSize.getHeight()
        doc.setFontSize(7); doc.setTextColor(203,213,225)
        doc.text('davomatlar.uz', pw/2, ph-5, { align:'center' })
      }
    })
    return doc
  }

  // ── Range filtered ─────────────────────────────────────────
  const rangeFiltered = (rangeData?.employees || []).filter(e =>
    !rangeSearch || (e.name||'').toLowerCase().includes(rangeSearch.toLowerCase())
  )
  const rangeDays = rangeData?.days || []

  // ── Handlers ──────────────────────────────────────────────
  const handleDownloadDaily = () => buildDailyPDF().save(`davomat_${date}.pdf`)
  const handlePrintDaily    = () => { const d=buildDailyPDF(); d.autoPrint(); window.open(d.output('bloburl'),'_blank') }
  const handleDownloadRange = () => { const d=buildRangePDF(); if(d) d.save(`davomat_${fromDate}_${toDate}.pdf`) }
  const handlePrintRange    = () => { const d=buildRangePDF(); if(d){ d.autoPrint(); window.open(d.output('bloburl'),'_blank') } }

  // ── Date label helpers ─────────────────────────────────────
  const fmtDate    = (d) => d.split('-').reverse().join('.')
  const dayLabel   = (d) => { const [,mm,dd]=d.split('-'); return `${dd}.${parseInt(mm)}` }
  const WEEK_DAYS  = ['Yak.','Du.','Se.','Ch.','Pa.','Ju.','Sha.']
  const fmtWeekDay = (d) => { const dt = new Date(d+'T12:00:00'); return WEEK_DAYS[dt.getDay()] }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-[19px] font-bold text-slate-900 m-0">Hisobotlar</h1>
          <p className="text-[13px] text-slate-400 mt-0.5 mb-0">Davomat tarixi va hisobotlar</p>
        </div>
        <div className="flex gap-2">
          {tab === 'daily' ? (
            <>
              <button onClick={handlePrintDaily}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-[13px] font-medium cursor-pointer hover:border-slate-300 transition-colors">
                <Printer size={14}/> Chop etish
              </button>
              <button onClick={handleDownloadDaily}
                className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 border-none rounded-lg text-white text-[13px] font-semibold cursor-pointer hover:bg-brand-700 transition-colors">
                <Download size={14}/> PDF yuklash
              </button>
            </>
          ) : (
            <>
              <button onClick={handlePrintRange} disabled={!rangeData || rangeLoading}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-[13px] font-medium cursor-pointer hover:border-slate-300 transition-colors disabled:opacity-40">
                <Printer size={14}/> Chop etish
              </button>
              <button onClick={handleDownloadRange} disabled={!rangeData || rangeLoading}
                className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 border-none rounded-lg text-white text-[13px] font-semibold cursor-pointer hover:bg-brand-700 transition-colors disabled:opacity-40">
                <Download size={14}/> PDF yuklash
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-slate-100 p-1 rounded-lg w-fit">
        <button onClick={() => setTab('daily')}
          className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-all cursor-pointer border-none ${tab==='daily'?'bg-white text-brand-600 shadow-sm':'bg-transparent text-slate-500 hover:text-slate-700'}`}>
          <span className="flex items-center gap-1.5"><Calendar size={13}/> Kunlik</span>
        </button>
        <button onClick={() => setTab('range')}
          className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-all cursor-pointer border-none ${tab==='range'?'bg-white text-brand-600 shadow-sm':'bg-transparent text-slate-500 hover:text-slate-700'}`}>
          <span className="flex items-center gap-1.5"><BarChart2 size={13}/> Oraliq hisobot</span>
        </button>
      </div>

      {/* ── DAILY ── */}
      {tab === 'daily' && (
        <>
          <div className="flex gap-2.5 mb-4 flex-wrap">
            <div className="relative">
              <button onClick={() => dateRef.current?.showPicker()}
                className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-[13px] font-medium cursor-pointer whitespace-nowrap hover:border-slate-300 transition-colors">
                <Calendar size={14}/> {fmtDate(date)}
              </button>
              <input ref={dateRef} type="date" value={date} onChange={e=>setDate(e.target.value)}
                className="absolute opacity-0 pointer-events-none w-px h-px top-0 left-0"/>
            </div>
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input placeholder="Ism yoki ID bo'yicha qidirish..." value={search} onChange={e=>setSearch(e.target.value)}
                className="w-full py-2 pl-9 pr-3 bg-white border border-slate-200 rounded-lg text-slate-800 text-[13px] outline-none focus:border-brand-400 transition-colors"/>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{minWidth:640}}>
              <thead>
                <tr className="bg-slate-50">
                  {['Ism Familiya',...(multiOrg?['Tashkilot']:[]),'Grafik','Keldi',lastColLabel,'Kechikish',...(!isToday?['Ishladi']:[]),'Holat'].map(h=>(
                    <th key={h} className="px-4 py-2.5 text-left text-[12px] text-slate-400 font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={multiOrg?8:7} className="py-12 text-center text-slate-400 text-sm">Yuklanmoqda…</td></tr>
                ) : filtered.length===0 ? (
                  <tr><td colSpan={multiOrg?8:7} className="py-12 text-center text-slate-400 text-sm">Ma'lumot yo'q</td></tr>
                ) : filtered.map(r=>{
                  const eff=getEffectiveFirstIn(r.first_in,r)
                  const lateMin=getLate(r.first_in,r)
                  const st=getStatus(r)
                  return (
                    <tr key={r.employee_id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="text-[14px] font-medium text-slate-800">{r.name}</div>
                        {r.lavozim && <div className="text-[11px] text-slate-400 mt-0.5">{r.lavozim}</div>}
                      </td>
                      {multiOrg && (
                        <td className="px-4 py-2.5 text-[13px] text-slate-500">
                          <span className="flex items-center gap-1"><Building2 size={12}/> {groupName(r.group_id)}</span>
                        </td>
                      )}
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center gap-1 text-[12px] font-mono text-slate-500">
                          {r.has_custom_schedule && <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" title="Shaxsiy grafik"/>}
                          {getWorkStart(r)}–{r.work_finish || getGroup(r.group_id)?.work_finish || '18:00'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`text-[15px] font-medium ${eff?(lateMin>0?'text-orange-500':'text-green-600'):'text-slate-300'}`}>{eff||'—'}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`text-[15px] font-normal ${r.last_out?'text-slate-600':'text-slate-300'}`}>{r.last_out||'—'}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`text-[13px] font-medium ${lateMin>0?'text-orange-500':'text-slate-300'}`}>{lateMin>0?`+${lateMin} daq`:'—'}</span>
                      </td>
                      {!isToday && (
                        <td className="px-4 py-2.5">
                          {(()=>{ const w=calcWorked(r.first_in,r.last_out,r); return w?<span className="text-[13px] font-semibold text-brand-600">{w}</span>:<span className="text-slate-300 text-[13px]">—</span> })()}
                        </td>
                      )}
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium" style={{ color: st.color }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.color }}/> {st.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            </div>
          </div>
        </>
      )}

      {/* ── RANGE ── */}
      {tab === 'range' && (
        <>
          {/* Date range picker */}
          <div className="flex gap-2.5 mb-4 flex-wrap items-center">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
              <span className="text-[12px] text-slate-400">Dan:</span>
              <button onClick={() => fromRef.current?.showPicker()}
                className="text-[13px] font-semibold text-slate-700 cursor-pointer bg-transparent border-none p-0 hover:text-brand-600">
                {fmtDate(fromDate)}
              </button>
              <input ref={fromRef} type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)}
                className="absolute opacity-0 pointer-events-none w-px h-px"/>
              <span className="text-slate-300 mx-1">|</span>
              <span className="text-[12px] text-slate-400">Gacha:</span>
              <button onClick={() => toRef.current?.showPicker()}
                className="text-[13px] font-semibold text-slate-700 cursor-pointer bg-transparent border-none p-0 hover:text-brand-600">
                {fmtDate(toDate)}
              </button>
              <input ref={toRef} type="date" value={toDate} onChange={e=>setToDate(e.target.value)}
                className="absolute opacity-0 pointer-events-none w-px h-px"/>
            </div>
            <button onClick={fetchRange} disabled={rangeLoading}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 border-none rounded-lg text-white text-[13px] font-semibold cursor-pointer hover:bg-brand-700 transition-colors disabled:opacity-50">
              {rangeLoading ? 'Yuklanmoqda…' : 'Ko\'rish'}
            </button>
            <div className="relative flex-1 min-w-[180px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input placeholder="Ism bo'yicha qidirish..." value={rangeSearch} onChange={e=>setRangeSearch(e.target.value)}
                className="w-full py-2 pl-9 pr-3 bg-white border border-slate-200 rounded-lg text-slate-800 text-[13px] outline-none focus:border-brand-400 transition-colors"/>
            </div>
          </div>

          {/* Range table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{minWidth:760}}>
              <thead>
                <tr className="bg-slate-50">
                  {['#','Ism Familiya',...(multiOrg?['Tashkilot']:[]),'Lavozim','Grafik','Sana','Kun','Keldi','Ketdi','Kechikish','Ishladi'].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left text-[12px] text-slate-400 font-normal whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rangeLoading ? (
                  <tr><td colSpan={11} className="py-12 text-center text-slate-400 text-sm">Yuklanmoqda…</td></tr>
                ) : rangeFiltered.length===0 ? (
                  <tr><td colSpan={11} className="py-12 text-center text-slate-400 text-sm">Ma'lumot yo'q</td></tr>
                ) : rangeFiltered.flatMap((e, ei) =>
                  rangeDays.map((d, di) => {
                    const day  = e.days[d]
                    const late = day?.in ? getLate(day.in, e) : null
                    const rowNum = ei * rangeDays.length + di + 1
                    const isFirstDay = di === 0
                    return (
                      <tr key={e.id+d} className={`border-t transition-colors ${isFirstDay && ei>0 ? 'border-slate-200' : 'border-slate-50'} hover:bg-slate-50/50`}>
                        <td className="px-3 py-2.5 text-[12px] text-slate-400">{rowNum}</td>
                        <td className="px-3 py-2.5">
                          {isFirstDay
                            ? <div className="text-[13px] font-semibold text-slate-800">{e.name||'—'}</div>
                            : <div className="text-[12px] text-slate-400">{e.name||'—'}</div>
                          }
                        </td>
                        {multiOrg && (
                          <td className="px-3 py-2.5 text-[12px] text-slate-500 whitespace-nowrap">
                            {isFirstDay && <span className="flex items-center gap-1"><Building2 size={11}/>{groupName(e.group_id)}</span>}
                          </td>
                        )}
                        <td className="px-3 py-2.5 text-[12px] text-slate-400">{isFirstDay ? (e.lavozim||'—') : ''}</td>
                        <td className="px-3 py-2.5 text-[12px] font-mono text-slate-500 whitespace-nowrap">
                          {isFirstDay && (
                            <span className="inline-flex items-center gap-1">
                              {e.has_custom_schedule && <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" title="Shaxsiy grafik"/>}
                              {e.work_start}–{e.work_finish}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-[12px] text-slate-600 font-medium whitespace-nowrap">{fmtDate(d)}</td>
                        <td className="px-3 py-2.5 text-[12px] text-slate-400">{fmtWeekDay(d)}</td>
                        <td className="px-3 py-2.5">
                          {day?.in
                            ? <span className={`text-[13px] font-semibold ${late>0?'text-orange-500':'text-green-600'}`}>{day.in}</span>
                            : <span className="text-[13px] text-slate-300">—</span>}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`text-[13px] ${day?.out?'text-slate-600':'text-slate-300'}`}>{day?.out||'—'}</span>
                        </td>
                        <td className="px-3 py-2.5">
                          {late>0
                            ? <span className="text-[12px] font-semibold text-orange-500">+{late} daq.</span>
                            : <span className="text-[12px] text-slate-300">—</span>}
                        </td>
                        <td className="px-3 py-2.5">
                          {day?.worked
                            ? <span className="text-[12px] font-semibold text-brand-600">{day.worked}</span>
                            : <span className="text-[12px] text-slate-300">—</span>}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
