import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Stethoscope, Palmtree, Search, Calendar, X } from 'lucide-react'
import { apiFetch } from '../config'

const LEAVE_TYPES = [
  { key: 'sick',     label: 'Kasallik',  icon: Stethoscope, color: '#9333ea', bg: '#f3e8ff', border: '#d8b4fe' },
  { key: 'vacation', label: "Ta'til",    icon: Palmtree,    color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc' },
]

function typeInfo(t) {
  return LEAVE_TYPES.find(l => l.key === t) || LEAVE_TYPES[0]
}

export default function Leaves({ employees = [], groups = [] }) {
  const [leaves, setLeaves]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [showAdd, setShowAdd]     = useState(false)
  const [month, setMonth]         = useState(() => new Date().toISOString().slice(0, 7))

  // New leave form
  const [newEmp, setNewEmp]       = useState('')
  const [newType, setNewType]     = useState('sick')
  const [newStart, setNewStart]   = useState(new Date().toISOString().slice(0, 10))
  const [newEnd, setNewEnd]       = useState(new Date().toISOString().slice(0, 10))
  const [newNote, setNewNote]     = useState('')
  const [saving, setSaving]       = useState(false)
  const [empSearch, setEmpSearch] = useState('')

  const fromDate = `${month}-01`
  const toDate   = `${month}-31`

  const load = async () => {
    setLoading(true)
    try {
      const data = await apiFetch(`/leaves?from=${fromDate}&to=${toDate}`)
      const empIds = new Set(employees.map(e => e.id))
      setLeaves((data.leaves || []).filter(l => empIds.has(l.employee_id)))
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [month])

  const handleAdd = async () => {
    if (!newEmp || !newStart || !newEnd) return
    setSaving(true)
    try {
      await apiFetch('/leaves', {
        method: 'POST',
        body: JSON.stringify({ employee_id: newEmp, leave_type: newType, start_date: newStart, end_date: newEnd, note: newNote }),
      })
      setShowAdd(false)
      setNewEmp(''); setNewNote(''); setEmpSearch('')
      await load()
    } catch {}
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("O'chirishni tasdiqlaysizmi?")) return
    await apiFetch(`/leaves/${id}`, { method: 'DELETE' })
    load()
  }

  const getEmpName = (eid) => employees.find(e => e.id === eid)?.name || eid
  const getEmpLav  = (eid) => employees.find(e => e.id === eid)?.lavozim || ''
  const getGrpName = (eid) => {
    const gid = employees.find(e => e.id === eid)?.group_id
    return groups.find(g => g.id === gid)?.name || ''
  }

  const filtered = leaves.filter(l => {
    const name = getEmpName(l.employee_id).toLowerCase()
    return !search || name.includes(search.toLowerCase())
  })

  const filteredEmps = employees.filter(e => {
    if (!empSearch) return true
    return e.name.toLowerCase().includes(empSearch.toLowerCase())
  })

  // Summary
  const sickCount     = leaves.filter(l => l.leave_type === 'sick').length
  const vacationCount = leaves.filter(l => l.leave_type === 'vacation').length

  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - 2 + i)
    return d.toISOString().slice(0, 7)
  })

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Stethoscope size={22} color="#9333ea" /> Kasallik & Ta'tillar
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>Xodimlarni kasallik va ta'til davrlarini boshqarish</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{
          display: 'flex', alignItems: 'center', gap: '7px',
          padding: '10px 18px', background: '#9333ea', border: 'none',
          borderRadius: '10px', color: '#fff', fontSize: '14px',
          fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px #9333ea30',
        }}>
          <Plus size={16} /> Qo'shish
        </button>
      </div>

      {/* Summary + filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ padding: '8px 16px', background: '#f3e8ff', borderRadius: '10px', border: '1px solid #d8b4fe', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Stethoscope size={14} color="#9333ea" />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#9333ea' }}>{sickCount} kasallik</span>
          </div>
          <div style={{ padding: '8px 16px', background: '#ecfeff', borderRadius: '10px', border: '1px solid #a5f3fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Palmtree size={14} color="#0891b2" />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0891b2' }}>{vacationCount} ta'til</span>
          </div>
        </div>

        <select value={month} onChange={e => setMonth(e.target.value)} style={{
          padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px',
          background: '#fff', fontSize: '13px', color: '#0f172a', cursor: 'pointer',
        }}>
          {months.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input placeholder="Xodim nomi..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 32px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Xodim', 'Tashkilot', 'Turi', 'Boshlanish', 'Tugash', 'Kun', 'Izoh', ''].map(h => (
                <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>Yuklanmoqda...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>Ma'lumot yo'q</td></tr>
            ) : filtered.map((l, i) => {
              const ti = typeInfo(l.leave_type)
              const days = Math.round((new Date(l.end_date) - new Date(l.start_date)) / 86400000) + 1
              return (
                <tr key={l.id} style={{ borderTop: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '11px 16px' }}>
                    <div style={{ fontWeight: 500, color: '#0f172a', fontSize: '14px' }}>{getEmpName(l.employee_id)}</div>
                    {getEmpLav(l.employee_id) && <div style={{ fontSize: '11px', color: '#94a3b8' }}>{getEmpLav(l.employee_id)}</div>}
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: '12px', color: '#64748b' }}>{getGrpName(l.employee_id)}</td>
                  <td style={{ padding: '11px 16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '20px', background: ti.bg, color: ti.color, fontSize: '12px', fontWeight: 600, border: `1px solid ${ti.border}` }}>
                      <ti.icon size={12} /> {ti.label}
                    </span>
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: '13px', color: '#475569', fontFamily: 'monospace' }}>{l.start_date}</td>
                  <td style={{ padding: '11px 16px', fontSize: '13px', color: '#475569', fontFamily: 'monospace' }}>{l.end_date}</td>
                  <td style={{ padding: '11px 16px', fontSize: '13px', fontWeight: 700, color: ti.color }}>{days} kun</td>
                  <td style={{ padding: '11px 16px', fontSize: '12px', color: '#94a3b8' }}>{l.note || '—'}</td>
                  <td style={{ padding: '11px 16px' }}>
                    <button onClick={() => handleDelete(l.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', padding: '4px' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}>
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Add modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: '#00000060', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', width: '480px', maxWidth: '95vw', boxShadow: '0 20px 60px #0f172a30' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>Kasallik / Ta'til qo'shish</h2>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Type */}
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Turi</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {LEAVE_TYPES.map(t => (
                    <button key={t.key} onClick={() => setNewType(t.key)} style={{
                      flex: 1, padding: '10px', borderRadius: '10px', cursor: 'pointer',
                      border: `2px solid ${newType === t.key ? t.color : '#e2e8f0'}`,
                      background: newType === t.key ? t.bg : '#fff',
                      color: newType === t.key ? t.color : '#64748b',
                      fontWeight: newType === t.key ? 700 : 400, fontSize: '13px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    }}>
                      <t.icon size={15} /> {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Employee search */}
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Xodim</label>
                <input placeholder="Ism bo'yicha qidirish..." value={empSearch} onChange={e => setEmpSearch(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', marginBottom: '6px' }} />
                <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  {filteredEmps.slice(0, 30).map(e => (
                    <div key={e.id} onClick={() => { setNewEmp(e.id); setEmpSearch(e.name) }}
                      style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontSize: '13px',
                        background: newEmp === e.id ? '#eff6ff' : '#fff', color: newEmp === e.id ? '#2563eb' : '#0f172a',
                        fontWeight: newEmp === e.id ? 600 : 400 }}>
                      {e.name} {e.lavozim && <span style={{ color: '#94a3b8', fontSize: '11px' }}>— {e.lavozim}</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Date range */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Boshlanish</label>
                  <input type="date" value={newStart} onChange={e => setNewStart(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Tugash</label>
                  <input type="date" value={newEnd} onChange={e => setNewEnd(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>

              {/* Note */}
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Izoh (ixtiyoriy)</label>
                <input value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Masalan: shifoxona, rejalashtirilgan..."
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: '11px', border: '1px solid #e2e8f0', borderRadius: '10px', background: '#fff', color: '#64748b', fontSize: '14px', cursor: 'pointer' }}>
                Bekor qilish
              </button>
              <button onClick={handleAdd} disabled={!newEmp || saving} style={{
                flex: 2, padding: '11px', border: 'none', borderRadius: '10px',
                background: (!newEmp || saving) ? '#e2e8f0' : '#9333ea',
                color: (!newEmp || saving) ? '#94a3b8' : '#fff',
                fontSize: '14px', fontWeight: 600, cursor: (!newEmp || saving) ? 'not-allowed' : 'pointer',
              }}>
                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
