import { useState, useRef, useEffect } from 'react'
import { Settings2, Eye, EyeOff, Clock, Key, Save, CalendarDays, AlertCircle } from 'lucide-react'

const GRACE_STEPS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]

function GracePicker({ value, onChange, workStart }) {
  const v   = Number(value)
  const idx = GRACE_STEPS.indexOf(v)

  const prev = () => { if (idx > 0) onChange(GRACE_STEPS[idx - 1]) }
  const next = () => { if (idx < GRACE_STEPS.length - 1) onChange(GRACE_STEPS[idx + 1]) }

  const onWheel = (e) => {
    e.preventDefault()
    if (e.deltaY > 0) next(); else prev()
  }

  const addMin = (t, min) => {
    const [h, m] = t.split(':').map(Number)
    const total = h * 60 + m + min
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
  }

  const lateTime = v > 0 ? addMin(workStart, v) : null

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
      {/* Pill — xuddi vaqt tugmasi kabi */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button onClick={prev} disabled={idx === 0} style={{
          width: 32, height: 40, borderRadius: '9px', border: '1px solid #e2e8f0',
          background: '#f8fafc', cursor: idx === 0 ? 'not-allowed' : 'pointer',
          color: idx === 0 ? '#cbd5e1' : '#64748b', fontSize: '16px', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>‹</button>

        <div onWheel={onWheel} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 20px', background: '#eff6ff', border: '1.5px solid #bfdbfe',
          borderRadius: '10px', color: '#2563eb', fontSize: '17px', fontWeight: 700,
          letterSpacing: '0.5px', minWidth: '100px', justifyContent: 'center',
          userSelect: 'none', cursor: 'ns-resize',
        }}>
          <Clock size={16} />
          {v === 0 ? "Yo'q" : `+${v} min`}
        </div>

        <button onClick={next} disabled={idx === GRACE_STEPS.length - 1} style={{
          width: 32, height: 40, borderRadius: '9px', border: '1px solid #e2e8f0',
          background: '#f8fafc', cursor: idx === GRACE_STEPS.length - 1 ? 'not-allowed' : 'pointer',
          color: idx === GRACE_STEPS.length - 1 ? '#cbd5e1' : '#64748b', fontSize: '16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>›</button>
      </div>

      {/* Natija */}
      {lateTime ? (
        <div style={{ fontSize: '13px', color: '#64748b' }}>
          → <strong style={{ color: '#2563eb', fontSize: '15px' }}>{lateTime}</strong> gacha kelganlar{' '}
          <strong style={{ color: '#16a34a' }}>O'z vaqtida</strong>
        </div>
      ) : (
        <div style={{ fontSize: '13px', color: '#94a3b8' }}>Muhdat yo'q</div>
      )}
    </div>
  )
}

const DAY_LABELS = [
  { val: '1', label: 'Du' },
  { val: '2', label: 'Se' },
  { val: '3', label: 'Cho' },
  { val: '4', label: 'Pa' },
  { val: '5', label: 'Ju' },
  { val: '6', label: 'Sha' },
  { val: '0', label: 'Yak' },
]

export default function Settings({ group, onUpdateGroup, onDirtyChange }) {
  const [login, setLogin]           = useState(group?.login       || '')
  const [pass, setPass]             = useState(group?.password    || '')
  const [showPass, setShowPass]     = useState(false)
  const [workStart, setWorkStart]   = useState(group?.work_start  || '09:00')
  const [workFinish, setWorkFinish] = useState(group?.work_finish || '18:00')
  const [workBegin, setWorkBegin]   = useState(group?.work_begin  || '06:00')
  const [workDays, setWorkDays]     = useState(
    (group?.work_days || '1,2,3,4,5,6').split(',').filter(Boolean)
  )
  const [grace, setGrace] = useState(group?.grace_minutes ?? 0)
  const [dirty, setDirty] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const startRef  = useRef(null)
  const finishRef = useRef(null)
  const beginRef  = useRef(null)

  const mark = (setter) => (val) => {
    setter(val)
    setDirty(true)
    onDirtyChange?.(true)
  }

  useEffect(() => {
    if (group) {
      setLogin(group.login       || '')
      setPass(group.password     || '')
      setWorkStart(group.work_start   || '09:00')
      setWorkFinish(group.work_finish || '18:00')
      setWorkBegin(group.work_begin   || '06:00')
      setWorkDays((group.work_days || '1,2,3,4,5,6').split(',').filter(Boolean))
      setGrace(group.grace_minutes ?? 0)
      setDirty(false)
      onDirtyChange?.(false)
    }
  }, [group?.id, group?.work_start, group?.work_finish, group?.work_begin, group?.work_days, group?.login, group?.password])

  const toggleDay = (val) => {
    setWorkDays(prev => {
      const next = prev.includes(val) ? prev.filter(d => d !== val) : [...prev, val]
      setDirty(true); onDirtyChange?.(true)
      return next
    })
  }

  const handleSave = () => {
    if (!login.trim()) return setError('Login kiriting')
    if (!pass.trim())  return setError('Parol kiriting')
    if (workDays.length === 0) return setError('Kamida 1 ish kuni tanlang')
    onUpdateGroup(group.id, {
      login: login.trim(), password: pass.trim(),
      work_start: workStart, work_finish: workFinish,
      work_begin: workBegin, work_days: workDays.join(','),
      grace_minutes: grace,
    })
    setError('')
    setDirty(false)
    onDirtyChange?.(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px',
    background: '#fff', border: '1px solid #e2e8f0',
    borderRadius: '8px', color: '#0f172a', fontSize: '14px',
    outline: 'none', boxSizing: 'border-box',
  }

  const TimeBtn = ({ refEl, value, onChange, color, bg, border }) => (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button onClick={() => refEl.current?.showPicker()} style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '10px 20px', background: bg, border: `1.5px solid ${border}`,
        borderRadius: '10px', color, fontSize: '17px', fontWeight: 700,
        cursor: 'pointer', letterSpacing: '1px',
      }}>
        <Clock size={16} /> {value}
      </button>
      <input ref={refEl} type="time" value={value} onChange={e => onChange(e.target.value)}
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: '1px', height: '1px' }} />
    </div>
  )

  const Card = ({ icon, iconColor, title, children }) => (
    <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px #0f172a06' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        {icon}
        <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>{title}</span>
      </div>
      {children}
    </div>
  )

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings2 size={22} color="#2563eb" /> Sozlamalar
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>{group?.name}</p>
        </div>
        {dirty && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: '#fefce8', border: '1px solid #fde047', borderRadius: '8px', fontSize: '13px', color: '#854d0e', fontWeight: 500 }}>
            <AlertCircle size={14} /> Saqlanmagan o'zgarishlar
          </div>
        )}
      </div>

      <div style={{ maxWidth: '560px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* 1. Ish vaqti */}
        <Card icon={<Clock size={17} color="#2563eb" />} title="Ish vaqti">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '8px' }}>BOSHLANISH</div>
              <TimeBtn refEl={startRef} value={workStart} onChange={mark(setWorkStart)} color="#2563eb" bg="#eff6ff" border="#bfdbfe" />
            </div>
            <div style={{ color: '#cbd5e1', fontSize: '20px', marginTop: '20px' }}>→</div>
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '8px' }}>TUGASH</div>
              <TimeBtn refEl={finishRef} value={workFinish} onChange={mark(setWorkFinish)} color="#059669" bg="#f0fdf4" border="#bbf7d0" />
            </div>
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>
              <strong style={{ color: '#0f172a' }}>Kechikish muhlati</strong> — boshlanishdan keyin shu daqiqagacha kelganlar <strong style={{ color: '#16a34a' }}>O'z vaqtida</strong> hisoblanadi
            </div>
            <GracePicker value={grace} onChange={v => mark(setGrace)(v)} workStart={workStart} />
          </div>
        </Card>

        {/* 2. Kelish hisobi boshlanadi */}
        <Card icon={<Clock size={17} color="#7c3aed" />} title="Kelish hisobi boshlanadi">
          <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b' }}>
            Shu vaqtdan <strong>oldin</strong> kelgan eventlar hisoblanmaydi —
            kechasi kech qolganlar ertasi kuni keldi deb ko'rinmasin
          </p>
          <TimeBtn refEl={beginRef} value={workBegin} onChange={mark(setWorkBegin)} color="#7c3aed" bg="#f5f3ff" border="#ddd6fe" />
        </Card>

        {/* 3. Ish kunlari */}
        <Card icon={<CalendarDays size={17} color="#2563eb" />} title="Ish kunlari">
          <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b' }}>
            Belgilangan kunlar ish kuni hisoblanadi. Dam olish kunlari statistikada chiqarib tashlanadi
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {DAY_LABELS.map(({ val, label }) => {
              const active = workDays.includes(val)
              return (
                <button key={val} onClick={() => toggleDay(val)} style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  border: `2px solid ${active ? '#2563eb' : '#e2e8f0'}`,
                  background: active ? '#2563eb' : '#f8fafc',
                  color: active ? '#fff' : '#94a3b8',
                  fontSize: '13px', fontWeight: active ? 700 : 500,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  {label}
                </button>
              )
            })}
          </div>
          <div style={{ marginTop: '12px', fontSize: '12px', color: '#94a3b8' }}>
            {workDays.length} kun tanlangan
          </div>
        </Card>

        {/* 4. Login va parol */}
        <Card icon={<Key size={17} color="#2563eb" />} title="Login va parol">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '5px', fontWeight: 600 }}>Login</label>
              <input value={login} onChange={e => { mark(setLogin)(e.target.value); setError('') }} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '5px', fontWeight: 600 }}>Parol</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} value={pass}
                  onChange={e => { mark(setPass)(e.target.value); setError('') }}
                  style={{ ...inputStyle, paddingRight: '40px' }} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>
        </Card>

        {error && (
          <div style={{ padding: '10px 14px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '8px', color: '#e11d48', fontSize: '13px' }}>
            ⚠️ {error}
          </div>
        )}

        {saved && (
          <div style={{ padding: '10px 14px', background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#16a34a', fontSize: '13px', fontWeight: 600 }}>
            ✅ Saqlandi!
          </div>
        )}

        <button onClick={handleSave} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          padding: '13px', background: dirty ? '#16a34a' : '#2563eb',
          border: 'none', borderRadius: '10px', color: 'white',
          fontSize: '15px', fontWeight: 600, cursor: 'pointer',
          boxShadow: dirty ? '0 2px 8px #16a34a40' : '0 2px 8px #2563eb30',
          transition: 'all 0.2s',
        }}>
          <Save size={17} /> {dirty ? "O'zgarishlarni saqlash" : 'Saqlash'}
        </button>

      </div>
    </div>
  )
}
