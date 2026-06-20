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

  const dateRef         = useRef(null)
  const multiOrg        = groups.length > 1
  const visibleGroupIds = groups.map(g => g.id)
  const isToday         = date === new Date().toISOString().slice(0, 10)
  const lastColLabel    = isToday ? "Oxirgi o'tish" : 'Ketdi'

  const getGroup     = (gid) => groups.find(g => g.id === gid)
  const getWorkStart = (gid) => getGroup(gid)?.work_start    || '09:00'
  const getWorkBegin = (gid) => getGroup(gid)?.work_begin    || '06:00'
  const getGrace     = (gid) => getGroup(gid)?.grace_minutes ?? 0

  const addMinutes = (t, min) => {
    const [h, m] = t.split(':').map(Number)
    const total  = h * 60 + m + Number(min)
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
  }

  const getLateThreshold    = (gid) => addMinutes(getWorkStart(gid), getGrace(gid))
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

  const getLate = (first_in, group_id) => {
    const eff = getEffectiveFirstIn(first_in, group_id)
    if (!eff) return null
    const [wh, wm] = getLateThreshold(group_id).split(':').map(Number)
    const [h,  m]  = eff.split(':').map(Number)
    const mins     = (h - wh) * 60 + (m - wm)
    return mins > 0 ? mins : 0
  }

  const getStatus = (r) => {
    const eff = getEffectiveFirstIn(r.first_in, r.group_id)
    if (!eff)              return { label: 'Kelmadi',     tw: 'bg-red-100 text-red-600'    }
    return getLate(r.first_in, r.group_id) > 0
      ? { label: 'Kech keldi',  tw: 'bg-amber-100 text-amber-700' }
      : { label: "O'z vaqtida", tw: 'bg-green-100 text-green-700' }
  }

  const filtered = rows
    .filter(r => !search || (r.name || '').toLowerCase().includes(search.toLowerCase()) || r.employee_id.includes(search))
    .sort((a, b) => {
      const ea = getEffectiveFirstIn(a.first_in, a.group_id)
      const eb = getEffectiveFirstIn(b.first_in, b.group_id)
      if (ea && eb) return ea.localeCompare(eb)
      if (ea) return -1
      if (eb) return 1
      return (a.name || '').localeCompare(b.name || '')
    })

  const buildTableData = () => {
    const dateFormatted = date.split('-').reverse().join('.')
    const orgName  = multiOrg ? 'Barcha tashkilotlar' : (groups[0]?.name || '')
    const ontime   = filtered.filter(r => r.first_in && getLate(r.first_in, r.group_id) === 0).length
    const late     = filtered.filter(r => r.first_in && getLate(r.first_in, r.group_id)  > 0).length
    const absent   = filtered.filter(r => !r.first_in).length
    const head     = multiOrg
      ? [['#', 'Ism Familiya', 'Tashkilot', 'Keldi', 'Kechikish', 'Holat']]
      : [['#', 'Ism Familiya', 'Keldi', 'Kechikish', 'Holat']]
    const body = filtered.map((r, i) => {
      const eff = getEffectiveFirstIn(r.first_in, r.group_id)
      const lm  = getLate(r.first_in, r.group_id)
      const st  = getStatus(r)
      return [i + 1, r.name || '—', ...(multiOrg ? [groupName(r.group_id)] : []), eff || '—', lm > 0 ? `${lm} daq.` : '—', st.label]
    })
    return { dateFormatted, orgName, ontime, late, absent, head, body }
  }

  const buildPDF = () => {
    const { dateFormatted, orgName, ontime, late, absent, head, body } = buildTableData()
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pw  = doc.internal.pageSize.getWidth()
    const bw = 38, bh = 14, bx = pw - 52, by = 8
    doc.setFillColor(239, 246, 255); doc.roundedRect(bx, by, bw, bh, 2.5, 2.5, 'F')
    doc.setDrawColor(37, 99, 235); doc.setLineWidth(0.45); doc.circle(bx + 6, by + 6, 3, 'S')
    doc.setLineWidth(0.55); doc.line(bx+4.5,by+6,bx+5.6,by+7.2); doc.line(bx+5.6,by+7.2,bx+7.8,by+4.9)
    doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(37,99,235); doc.text('Davomatlar.uz',bx+13,by+6)
    doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(148,163,184); doc.text('Boshqaruv tizimi',bx+13,by+11)
    doc.setTextColor(0); doc.link(bx,by,bw,bh,{url:'https://davomatlar.uz'})
    doc.setFont('helvetica','bold'); doc.setFontSize(16); doc.setTextColor(15,23,42); doc.text(`Davomat hisoboti — ${dateFormatted}`,14,18)
    doc.setFont('helvetica','normal'); doc.setFontSize(10); doc.setTextColor(100,116,139); doc.text(orgName,14,25)
    const stats = [{ label:'Jami',val:filtered.length,c:[37,99,235] },{ label:"O'z vaqtida",val:ontime,c:[22,163,74] },{ label:'Kech keldi',val:late,c:[217,119,6] },{ label:'Kelmadi',val:absent,c:[220,38,38] }]
    stats.forEach((s,i) => {
      const x = 14 + i * 44
      doc.setFillColor(248,250,252); doc.roundedRect(x,30,42,18,2,2,'F')
      doc.setFont('helvetica','bold'); doc.setFontSize(14); doc.setTextColor(...s.c); doc.text(String(s.val),x+21,39,{align:'center'})
      doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.setTextColor(100,116,139); doc.text(s.label,x+21,45,{align:'center'})
    })
    doc.setTextColor(0)
    autoTable(doc,{ head, body, startY:54, styles:{fontSize:9,cellPadding:3}, headStyles:{fillColor:[37,99,235],textColor:255,fontStyle:'bold'}, alternateRowStyles:{fillColor:[248,250,252]},
      didParseCell:(d) => { if(d.section==='body'&&d.column.index===(multiOrg?5:4)){ const v=String(d.cell.raw); if(v==='Kelmadi') d.cell.styles.textColor=[220,38,38]; else if(v==='Kech keldi') d.cell.styles.textColor=[217,119,6]; else d.cell.styles.textColor=[22,163,74] } },
      didDrawPage:() => { const ph=doc.internal.pageSize.getHeight(); doc.setFontSize(7); doc.setTextColor(203,213,225); doc.text('davomatlar.uz',pw/2,ph-6,{align:'center'}) }
    })
    return doc
  }

  const handleDownloadPDF = () => { buildPDF().save(`davomat_${date}.pdf`) }
  const handlePrint       = () => { const doc = buildPDF(); doc.autoPrint(); window.open(doc.output('bloburl'),'_blank') }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="flex items-center gap-2.5 text-[22px] font-bold text-slate-900 m-0">
            <Clock size={22} className="text-brand-600" /> Keldi-ketdi tarixi
          </h1>
          <p className="text-[13px] text-slate-400 mt-1 mb-0">Sana bo'yicha davomat</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 text-[13px] font-semibold cursor-pointer hover:border-slate-300 transition-colors">
            <Printer size={15}/> Chop etish
          </button>
          <button onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 border-none rounded-xl text-white text-[13px] font-semibold cursor-pointer hover:bg-brand-700 transition-colors shadow-sm">
            <Download size={15}/> PDF yuklash
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2.5 mb-5 flex-wrap">
        <div className="relative">
          <button onClick={() => dateRef.current?.showPicker()}
            className="flex items-center gap-2 px-4 py-2 bg-brand-50 border border-brand-200 rounded-xl text-brand-600 text-[14px] font-semibold cursor-pointer whitespace-nowrap hover:bg-brand-100 transition-colors">
            <Calendar size={15}/> {date.split('-').reverse().join('.')}
          </button>
          <input ref={dateRef} type="date" value={date} onChange={e => setDate(e.target.value)}
            className="absolute opacity-0 pointer-events-none w-px h-px top-0 left-0"/>
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input placeholder="Ism yoki ID bo'yicha qidirish..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full py-2 pl-9 pr-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-[14px] outline-none focus:border-brand-400 transition-colors"/>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50">
              {['Ism Familiya', ...(multiOrg ? ['Tashkilot'] : []), 'Keldi', lastColLabel, 'Kechikish', 'Holat'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-[12px] text-slate-400 font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={multiOrg?6:5} className="py-12 text-center text-slate-400 text-sm">Yuklanmoqda…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={multiOrg?6:5} className="py-12 text-center text-slate-400 text-sm">Ma'lumot yo'q</td></tr>
            ) : filtered.map(r => {
              const eff      = getEffectiveFirstIn(r.first_in, r.group_id)
              const lateMin  = getLate(r.first_in, r.group_id)
              const isLate   = lateMin > 0
              const st       = getStatus(r)
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
                    <span className={`text-[15px] font-medium ${eff ? (isLate ? 'text-orange-500' : 'text-green-600') : 'text-slate-300'}`}>
                      {eff || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`text-[15px] font-normal ${r.last_out ? 'text-slate-600' : 'text-slate-300'}`}>
                      {r.last_out || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`text-[13px] font-medium ${isLate ? 'text-orange-500' : 'text-slate-300'}`}>
                      {isLate ? `+${lateMin} daq` : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[12px] font-semibold ${st.tw}`}>{st.label}</span>
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
