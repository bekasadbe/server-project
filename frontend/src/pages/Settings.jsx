import { useState, useRef, useEffect } from 'react'
import { Settings2, Eye, EyeOff, Clock, Key, Save, CalendarDays } from 'lucide-react'

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
  const [login, setLogin]           = useState(group?.login || '')
  const [pass, setPass]             = useState(group?.password || '')
  const [showPass, setShowPass]     = useState(false)
  const [workStart, setWorkStart]   = useState(group?.work_start  || '09:00')
  const [workFinish, setWorkFinish] = useState(group?.work_finish || '18:00')
  const [workBegin, setWorkBegin]   = useState(group?.work_begin  || '06:00')
  const [workDays, setWorkDays]     = useState(
    (group?.work_days || '1,2,3,4,5,6').split(',').filter(Boolean)
  )
  const [dirty, setDirty] = useState(false)

  const markDirty = (setter) => (val) => {
    setter(val)
    setDirty(true)
    onDirtyChange?.(true)
  }

  useEffect(() => {
    if (group) {
      setLogin(group.login || '')
      setPass(group.password || '')
      setWorkStart(group.work_start   || '09:00')
      setWorkFinish(group.work_finish || '18:00')
      setWorkBegin(group.work_begin   || '06:00')
      setWorkDays((group.work_days || '1,2,3,4,5,6').split(',').filter(Boolean))
      setDirty(false)
      onDirtyChange?.(false)
    }
  }, [group?.id, group?.login, group?.password, group?.work_start, group?.work_finish, group?.work_begin, group?.work_days])

  const timeRef   = useRef(null)
  const finishRef = useRef(null)
  const beginRef  = useRef(null)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

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

  const setLoginD    = markDirty(setLogin)
  const setPassD     = markDirty(setPass)
  const setBeginD    = markDirty(setWorkBegin)
  const setStartD    = markDirty(setWorkStart)
  const setFinishD   = markDirty(setWorkFinish)

  const TimeBtn = ({ refEl, value, onChange, color, bg, border }) => (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button onClick={() => refEl.current?.showPicker()} style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '9px 18px', background: bg, border: `1px solid ${border}`,
        borderRadius: '9px', color, fontSize: '16px', fontWeight: 700,
        cursor: 'pointer', letterSpacing: '1px',
      }}>
        <Clock size={16} /> {value}
      </button>
      <input ref={refEl} type="time" value={value} onChange={e => onChange(e.target.value)}
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: '1px', height: '1px' }} />
    </div>
  )

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Settings2 size={22} color="#2563eb" /> Sozlamalar
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>{group?.name}</p>
      </div>

      <div style={{ maxWidth: '560px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Kelish hisobi boshlanishi */}
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Clock size={17} color="#7c3aed" />
            <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>Kelish hisobi boshlanadi</span>
          </div>
          <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#64748b' }}>
            Shu vaqtdan <strong>oldin</strong> kelgan eventlar hisoblanmaydi — kechasi kech ketganlar bugun keldi deb ko'rinmasin
          </p>
          <TimeBtn refEl={beginRef} value={workBegin} onChange={setBeginD} color="#7c3aed" bg="#f5f3ff" border="#ddd6fe" />
        </div>

        {/* Ish vaqti: boshlanish + tugash */}
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Clock size={17} color="#2563eb" />
            <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>Ish vaqti</span>
          </div>
          <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b' }}>
            Boshlanishdan keyin kelsa — <strong style={{ color: '#d97706' }}>Kech keldi</strong>
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, marginBottom: '6px' }}>BOSHLANISH</div>
              <TimeBtn refEl={timeRef} value={workStart} onChange={setStartD} color="#2563eb" bg="#eff6ff" border="#bfdbfe" />
            </div>
            <div style={{ fontSize: '18px', color: '#cbd5e1', marginTop: '18px' }}>→</div>
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, marginBottom: '6px' }}>TUGASH</div>
              <TimeBtn refEl={finishRef} value={workFinish} onChange={setFinishD} color="#059669" bg="#f0fdf4" border="#bbf7d0" />
            </div>
          </div>
        </div>

        {/* Ish kunlari */}
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <CalendarDays size={17} color="#2563eb" />
            <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>Ish kunlari</span>
          </div>
          <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b' }}>
            Belgilangan kunlar ish kuni hisoblanadi — statistikada dam olish kunlari chiqarib tashlanadi
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {DAY_LABELS.map(({ val, label }) => {
              const active = workDays.includes(val)
              return (
                <button key={val} onClick={() => toggleDay(val)} style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  border: `2px solid ${active ? '#2563eb' : '#e2e8f0'}`,
                  background: active ? '#2563eb' : '#f8fafc',
                  color: active ? '#fff' : '#64748b',
                  fontSize: '13px', fontWeight: active ? 700 : 500,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Login / Parol */}
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Key size={17} color="#2563eb" />
            <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>Login va parol</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '5px', fontWeight: 600 }}>Login</label>
              <input value={login} onChange={e => { setLoginD(e.target.value); setError('') }} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '5px', fontWeight: 600 }}>Parol</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} value={pass}
                  onChange={e => { setPassD(e.target.value); setError('') }}
                  style={{ ...inputStyle, paddingRight: '40px' }} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>
        </div>

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
          padding: '12px', background: dirty ? '#16a34a' : '#2563eb', border: 'none', borderRadius: '10px',
          color: 'white', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
          boxShadow: dirty ? '0 2px 8px #16a34a40' : '0 2px 8px #2563eb30',
          transition: 'all 0.2s',
        }}>
          <Save size={17} /> {dirty ? "O'zgarishlarni saqlash" : 'Saqlash'}
        </button>
      </div>
    </div>
  )
}
