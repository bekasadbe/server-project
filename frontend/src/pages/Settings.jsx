import { useState, useRef } from 'react'
import { Settings2, Eye, EyeOff, Clock, Key, Save } from 'lucide-react'

export default function Settings({ group, onUpdateGroup }) {
  const [login, setLogin]           = useState(group?.login || '')
  const [pass, setPass]             = useState(group?.password || '')
  const [showPass, setShowPass]     = useState(false)
  const [workStart, setWorkStart]   = useState(group?.work_start || '09:00')
  const [workBegin, setWorkBegin]   = useState(group?.work_begin || '06:00')
  const timeRef  = useRef(null)
  const beginRef = useRef(null)
  const [saved, setSaved]           = useState(false)
  const [error, setError]           = useState('')

  const handleSave = () => {
    if (!login.trim()) return setError('Login kiriting')
    if (!pass.trim())  return setError('Parol kiriting')
    onUpdateGroup(group.id, { login: login.trim(), password: pass.trim(), work_start: workStart, work_begin: workBegin })
    setError('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px',
    background: '#fff', border: '1px solid #e2e8f0',
    borderRadius: '8px', color: '#0f172a', fontSize: '14px',
    outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Settings2 size={22} color="#2563eb" /> Sozlamalar
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>{group?.name}</p>
      </div>

      <div style={{ maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Kelish hisobi boshlanishi */}
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Clock size={17} color="#7c3aed" />
            <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>Kelish hisobi boshlanadi</span>
          </div>
          <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#64748b' }}>
            Shu vaqtdan <strong>oldin</strong> kelgan eventlar hisoblanmaydi — kechasi kech ketganlar bugun keldi deb ko'rinmasin
          </p>
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <button onClick={() => beginRef.current?.showPicker()} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '9px 18px', background: '#f5f3ff', border: '1px solid #ddd6fe',
              borderRadius: '9px', color: '#7c3aed', fontSize: '16px', fontWeight: 700,
              cursor: 'pointer', letterSpacing: '1px',
            }}>
              <Clock size={16} /> {workBegin}
            </button>
            <input ref={beginRef} type="time" value={workBegin} onChange={e => setWorkBegin(e.target.value)}
              style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: '1px', height: '1px' }} />
          </div>
        </div>

        {/* Ish vaqti */}
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Clock size={17} color="#2563eb" />
            <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>Ish boshlanish vaqti</span>
          </div>
          <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#64748b' }}>
            Xodim shu vaqtdan keyin kelsa — <strong style={{ color: '#d97706' }}>Kech keldi</strong> deb hisoblanadi
          </p>
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <button onClick={() => timeRef.current?.showPicker()} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '9px 18px', background: '#eff6ff', border: '1px solid #bfdbfe',
              borderRadius: '9px', color: '#2563eb', fontSize: '16px', fontWeight: 700,
              cursor: 'pointer', letterSpacing: '1px',
            }}>
              <Clock size={16} /> {workStart}
            </button>
            <input ref={timeRef} type="time" value={workStart} onChange={e => setWorkStart(e.target.value)}
              style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: '1px', height: '1px' }} />
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
              <input value={login} onChange={e => { setLogin(e.target.value); setError('') }} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '5px', fontWeight: 600 }}>Parol</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} value={pass}
                  onChange={e => { setPass(e.target.value); setError('') }}
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
          padding: '12px', background: '#2563eb', border: 'none', borderRadius: '10px',
          color: 'white', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
          boxShadow: '0 2px 8px #2563eb30',
        }}>
          <Save size={17} /> Saqlash
        </button>
      </div>
    </div>
  )
}
