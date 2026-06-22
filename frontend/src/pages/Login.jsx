import { useState } from 'react'
import { loginAsync } from '../auth'
import { Eye, EyeOff, CheckCircle, Clock, Users, TrendingUp, X, Phone, MapPin, Send } from 'lucide-react'

export default function Login({ onLogin }) {
  const [showModal, setShowModal] = useState(false)
  const [username, setUsername]   = useState('')
  const [password, setPassword]   = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const user = await loginAsync(username, password)
    if (user) { onLogin(user) }
    else { setError("Login yoki parol noto'g'ri"); setLoading(false) }
  }

  const openModal = () => {
    setError(''); setUsername(''); setPassword('')
    setShowModal(true)
  }

  return (
    <div style={{
      width:'100vw', minHeight:'100vh', overflowY:'auto', overflowX:'hidden', position:'relative',
      background:'linear-gradient(135deg, #60b8ff 0%, #1a7fe8 25%, #0a5fd4 50%, #0038b8 75%, #001e8a 100%)',
      display:'flex', flexDirection:'column',
    }}>
      {/* Fon effektlari */}
      <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
        <div style={{ position:'absolute', top:'-10%', left:'-5%', width:'700px', height:'600px', borderRadius:'50%', background:'rgba(255,255,255,0.25)', filter:'blur(90px)' }}/>
        <div style={{ position:'absolute', top:'5%', right:'10%', width:'350px', height:'350px', borderRadius:'50%', background:'rgba(255,255,255,0.2)', filter:'blur(60px)' }}/>
        <div style={{ position:'absolute', bottom:'-5%', right:'-5%', width:'500px', height:'400px', borderRadius:'50%', background:'rgba(10,30,150,0.5)', filter:'blur(80px)' }}/>
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize:'60px 60px' }}/>
        {Array.from({length:22}).map((_,i) => {
          const size  = 4 + (i*7)%14
          const left  = (i*47 + 3)%100
          const delay = (i*1.3)%8
          const dur   = 10 + (i*2.7)%14
          const op    = 0.12 + (i%5)*0.05
          return (
            <div key={i} style={{
              position:'absolute', left:`${left}%`, bottom:'-5%',
              width:`${size}px`, height:`${size}px`, borderRadius:'50%',
              background:'rgba(255,255,255,0.9)', opacity:op,
              animation:`floatUp ${dur}s ${delay}s linear infinite`,
            }}/>
          )
        })}
      </div>

      {/* Header */}
      <header style={{ position:'relative', zIndex:10, display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 20px', background:'rgba(255,255,255,0.07)', backdropFilter:'blur(14px)', borderBottom:'1px solid rgba(255,255,255,0.1)', flexShrink:0, width:'100%', boxSizing:'border-box' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:'rgba(255,255,255,0.25)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.5)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <CheckCircle size={20} color="white" strokeWidth={2.5}/>
          </div>
          <span style={{ fontSize:'18px', fontWeight:700, letterSpacing:'-0.5px', color:'#ffffff' }}>Davomatlar.uz</span>
        </div>
        <button onClick={openModal} style={{
          display:'flex', alignItems:'center', gap:'6px',
          background:'rgba(255,255,255,0.12)', backdropFilter:'blur(12px)',
          border:'1px solid rgba(255,255,255,0.2)', borderRadius:'50px',
          padding:'9px 20px', color:'white', fontSize:'14px', fontWeight:600,
          cursor:'pointer', transition:'all 0.2s', flexShrink:0,
        }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.12)'}
        >
          Kirish →
        </button>
      </header>

      {/* Hero */}
      <main className="landing-main" style={{ flex:1, position:'relative', zIndex:10, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'40px 20px 32px' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(255,255,255,0.1)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'50px', padding:'6px 18px', marginBottom:'24px' }}>
          <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#4ade80', boxShadow:'0 0 8px #4ade80', flexShrink:0 }}/>
          <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.9)', fontWeight:500 }}>Real vaqt davomat tizimi</span>
        </div>

        <h1 className="hero-title" style={{ margin:'0 0 16px', fontWeight:800, color:'white', lineHeight:1.1, letterSpacing:'-1.5px', maxWidth:'700px' }}>
          Xodimlar davomatini<br/>
          <span style={{ background:'linear-gradient(180deg, #ffffff 0%, #93c5fd 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>nazorat qiling</span>
        </h1>

        <p style={{ margin:'0 0 36px', fontSize:'16px', color:'rgba(255,255,255,0.6)', lineHeight:1.7, maxWidth:'420px' }}>
          Face ID qurilmalar bilan integratsiya, real vaqt hisobotlar va tashkilotlar bo'yicha boshqaruv tizimi.
        </p>

        <div className="cards-grid" style={{ display:'grid', gap:'12px', width:'100%', maxWidth:'860px' }}>
          {[
            { icon: Clock,       color:'#f87171', grad:'#f87171,#fb923c', title:'Kelish-ketish vaqti',  desc:"Aniq kirish va chiqish vaqtini avtomatik qayd etish" },
            { icon: TrendingUp,  color:'#a78bfa', grad:'#a78bfa,#818cf8', title:'Ish soatlari hisobi',  desc:'Kunlik, haftalik, oylik grafiklar va tahlil' },
            { icon: Users,       color:'#38bdf8', grad:'#38bdf8,#60a5fa', title:'Tanaffus nazorati',    desc:'Daqiqagacha aniq tanaffus vaqtini kuzatish' },
            { icon: CheckCircle, color:'#4ade80', grad:'#4ade80,#34d399', title:'Face ID integratsiya', desc:"Parolsiz, qurilmalar bilan to'liq sinxronizatsiya" },
          ].map(({ icon: Icon, color, grad, title, desc }, i) => (
            <div key={title} style={{
              position:'relative', overflow:'hidden',
              background:'rgba(255,255,255,0.06)', backdropFilter:'blur(20px)',
              border:'1px solid rgba(255,255,255,0.1)', borderRadius:'18px',
              padding:'18px 16px 16px', textAlign:'left',
              transition:'transform 0.2s, box-shadow 0.2s',
              animation:`cardIn 0.5s ${i*0.1}s both`, cursor:'default',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow=`0 8px 32px ${color}44` }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)';    e.currentTarget.style.boxShadow='none' }}
            >
              <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:`linear-gradient(90deg,${grad})`, borderRadius:'18px 18px 0 0' }}/>
              <div style={{ position:'absolute', right:'-8px', bottom:'-8px', opacity:0.07 }}><Icon size={70} color={color}/></div>
              <div style={{ width:'36px', height:'36px', borderRadius:'12px', background:`linear-gradient(135deg,${grad})`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'12px', boxShadow:`0 4px 14px ${color}55` }}>
                <Icon size={18} color="white"/>
              </div>
              <div style={{ fontSize:'15px', fontWeight:700, color:'white', marginBottom:'6px', lineHeight:1.3 }}>{title}</div>
              <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', lineHeight:1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Login Modal — yangi dizayn */}
      {showModal && (
        <div style={{
          position:'fixed', inset:0, zIndex:100,
          background:'rgba(0,0,0,0.45)', backdropFilter:'blur(10px)',
          display:'flex', alignItems:'center', justifyContent:'center',
          animation:'fadeIn 0.2s ease',
        }} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="login-modal" style={{
            width:'400px', background:'#ffffff', borderRadius:'24px',
            padding:'36px', boxShadow:'0 32px 80px rgba(0,0,0,0.35)',
            animation:'slideUp 0.25s ease',
          }}>
            {/* Header */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'28px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:'#EBF8FF', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <CheckCircle size={22} color="#2B6CB0"/>
                </div>
                <div>
                  <div style={{ fontSize:'17px', fontWeight:700, color:'#0f172a' }}>Xush kelibsiz</div>
                  <div style={{ fontSize:'12px', color:'#94a3b8' }}>Davomatlar.uz tizimiga kiring</div>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:'10px', color:'#94a3b8', width:'34px', height:'34px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <X size={15}/>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom:'14px' }}>
                <label style={{ fontSize:'12px', color:'#64748b', display:'block', marginBottom:'6px', fontWeight:600 }}>Login</label>
                <input value={username} onChange={e => { setUsername(e.target.value); setError('') }}
                  placeholder="admin" autoComplete="username"
                  style={{ width:'100%', padding:'11px 14px', boxSizing:'border-box', background:'#f8fafc', border:'1.5px solid #e2e8f0', borderRadius:'12px', color:'#0f172a', fontSize:'14px', outline:'none', transition:'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor='#4299E1'}
                  onBlur={e => e.target.style.borderColor='#e2e8f0'}
                />
              </div>
              <div style={{ marginBottom:'20px' }}>
                <label style={{ fontSize:'12px', color:'#64748b', display:'block', marginBottom:'6px', fontWeight:600 }}>Parol</label>
                <div style={{ position:'relative' }}>
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setError('') }}
                    placeholder="••••••••" autoComplete="current-password"
                    style={{ width:'100%', padding:'11px 40px 11px 14px', boxSizing:'border-box', background:'#f8fafc', border:'1.5px solid #e2e8f0', borderRadius:'12px', color:'#0f172a', fontSize:'14px', outline:'none', transition:'border-color 0.2s' }}
                    onFocus={e => e.target.style.borderColor='#4299E1'}
                    onBlur={e => e.target.style.borderColor='#e2e8f0'}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#94a3b8', display:'flex' }}>
                    {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>

              {error && (
                <div style={{ marginBottom:'14px', padding:'10px 14px', background:'#fff5f5', border:'1px solid #fed7d7', borderRadius:'10px', color:'#e53e3e', fontSize:'13px' }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} style={{
                width:'100%', padding:'13px', background: loading ? '#90CDF4' : '#2B6CB0',
                border:'none', borderRadius:'12px', color:'white', fontSize:'15px',
                fontWeight:700, cursor: loading ? 'not-allowed' : 'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                transition:'background 0.2s',
              }}
                onMouseEnter={e => { if(!loading) e.currentTarget.style.background='#2C5282' }}
                onMouseLeave={e => { if(!loading) e.currentTarget.style.background='#2B6CB0' }}
              >
                {loading ? (
                  <><div style={{ width:'15px', height:'15px', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/> Kirish...</>
                ) : 'Kirish →'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ position:'relative', zIndex:10 }}>
        <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'6px', padding:'12px 24px 28px' }}>
          {[
            { icon: Send,   text:'@acsham',                          href:'https://t.me/acsham' },
            { icon: Phone,  text:'+998 90-873-89-63',                href:'tel:+998908738963' },
            { icon: MapPin, text:"Toshkent sh, Olmazor Qamarniso 13", href:null },
          ].map(({ icon: Icon, text, href }) => {
            const inner = (
              <div style={{ display:'flex', alignItems:'center', gap:'7px', padding:'7px 14px', borderRadius:'50px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', fontSize:'13px', color:'rgba(255,255,255,0.8)', whiteSpace:'nowrap', transition:'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.14)'}
                onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.07)'}
              >
                <Icon size={13} color="rgba(255,255,255,0.6)"/>{text}
              </div>
            )
            return href
              ? <a key={text} href={href} target="_blank" rel="noreferrer" style={{ textDecoration:'none' }}>{inner}</a>
              : <div key={text}>{inner}</div>
          })}
        </div>
      </footer>

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes fadeIn  { from{ opacity:0 } to{ opacity:1 } }
        @keyframes slideUp { from{ opacity:0; transform:translateY(20px) } to{ opacity:1; transform:translateY(0) } }
        @keyframes cardIn  { from{ opacity:0; transform:translateY(16px) } to{ opacity:1; transform:translateY(0) } }
        @keyframes floatUp { 0%{ transform:translateY(0) translateX(0); opacity:0 } 10%{ opacity:1 } 90%{ opacity:0.6 } 100%{ transform:translateY(-110vh) translateX(30px); opacity:0 } }
        input::placeholder { color: #cbd5e1 }
        .cards-grid { grid-template-columns: repeat(4, 1fr); }
        .hero-title  { font-size: 58px; }
        @media (max-width: 768px) {
          .cards-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .hero-title  { font-size: 38px !important; letter-spacing: -1px !important; }
        }
        @media (max-width: 480px) {
          .cards-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .hero-title  { font-size: 32px !important; }
          .login-modal { width: calc(100vw - 32px) !important; padding: 24px 18px !important; }
        }
        @media (max-width: 768px) {
          html, body { overflow-y: auto !important; height: auto !important; }
          .landing-main { justify-content: flex-start !important; padding-top: 24px !important; }
        }
      `}</style>
    </div>
  )
}
