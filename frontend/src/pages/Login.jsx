import { useState } from 'react'
import { login } from '../auth'
import { Eye, EyeOff, CheckCircle, Clock, Users, TrendingUp, X, Mail, Send, Phone, Camera, MapPin } from 'lucide-react'

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
    await new Promise(r => setTimeout(r, 600))
    const user = login(username, password)
    if (user) { onLogin(user) }
    else { setError("Login yoki parol noto'g'ri"); setLoading(false) }
  }

  const openModal = () => {
    setError(''); setUsername(''); setPassword('')
    setShowModal(true)
  }

  return (
    <div style={{
      width:'100vw', height:'100vh', overflow:'hidden', position:'relative',
      background:'linear-gradient(145deg, #bdd9ff 0%, #5a9ef5 20%, #2d6fe0 45%, #1a52cc 65%, #0f3aaa 100%)',
      display:'flex', flexDirection:'column',
    }}>
      {/* Fon effektlari */}
      <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
        <div style={{ position:'absolute', top:'-10%', left:'-5%', width:'700px', height:'600px', borderRadius:'50%', background:'rgba(255,255,255,0.25)', filter:'blur(90px)' }}/>
        <div style={{ position:'absolute', top:'5%', right:'10%', width:'350px', height:'350px', borderRadius:'50%', background:'rgba(255,255,255,0.2)', filter:'blur(60px)' }}/>
        <div style={{ position:'absolute', bottom:'-5%', right:'-5%', width:'500px', height:'400px', borderRadius:'50%', background:'rgba(10,30,150,0.5)', filter:'blur(80px)' }}/>
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize:'60px 60px' }}/>
        {/* Suzuvchi zarrachalar */}
        {Array.from({length:22}).map((_,i) => {
          const size   = 4 + (i*7)%14
          const left   = (i*47 + 3)%100
          const delay  = (i*1.3)%8
          const dur    = 10 + (i*2.7)%14
          const op     = 0.12 + (i%5)*0.05
          return (
            <div key={i} style={{
              position:'absolute',
              left:`${left}%`,
              bottom:'-5%',
              width:`${size}px`,
              height:`${size}px`,
              borderRadius:'50%',
              background:'rgba(255,255,255,0.9)',
              opacity:op,
              animation:`floatUp ${dur}s ${delay}s linear infinite`,
            }}/>
          )
        })}
      </div>

      {/* Header */}
      <header style={{ position:'relative', zIndex:10, display:'flex', justifyContent:'center', alignItems:'center', padding:'16px 48px', background:'rgba(255,255,255,0.07)', backdropFilter:'blur(14px)', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
        {/* Logo — markazda */}
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:'rgba(255,255,255,0.15)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <CheckCircle size={22} color="white"/>
          </div>
          <span style={{ fontSize:'20px', fontWeight:700, color:'white', letterSpacing:'-0.5px' }}>Davomatlar</span>
        </div>

        {/* Kirish tugmasi — o'ng tomonda absolute */}
        <button onClick={openModal} style={{ position:'absolute', right:'48px',
          display:'flex', alignItems:'center', gap:'8px',
          background:'rgba(255,255,255,0.12)', backdropFilter:'blur(12px)',
          border:'1px solid rgba(255,255,255,0.2)', borderRadius:'50px',
          padding:'10px 24px', color:'white', fontSize:'15px', fontWeight:600,
          cursor:'pointer', transition:'all 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.12)'}
        >
          Kirish →
        </button>
      </header>

      {/* Hero — markazda */}
      <main style={{ flex:1, position:'relative', zIndex:10, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'0 24px' }}>

        <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(255,255,255,0.1)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'50px', padding:'6px 18px', marginBottom:'28px' }}>
          <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#4ade80', boxShadow:'0 0 8px #4ade80' }}/>
          <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.9)', fontWeight:500 }}>Real vaqt davomat tizimi</span>
        </div>

        <h1 style={{ margin:'0 0 20px', fontSize:'62px', fontWeight:800, color:'white', lineHeight:1.1, letterSpacing:'-2.5px', maxWidth:'700px' }}>
          Xodimlar davomatini<br/>
          <span style={{ color:'#93c5fd' }}>kuzating</span>
        </h1>

        <p style={{ margin:'0 0 44px', fontSize:'18px', color:'rgba(255,255,255,0.6)', lineHeight:1.7, maxWidth:'480px' }}>
          Face ID qurilmalar bilan integratsiya, real vaqt hisobotlar va tashkilotlar bo'yicha boshqaruv tizimi.
        </p>

        {/* Feature kartochkalari */}
        <div style={{ display:'flex', gap:'16px', flexWrap:'wrap', justifyContent:'center', maxWidth:'900px' }}>
          {[
            { icon: Clock,       color:'#f87171', grad:'#f87171,#fb923c', title:'Kelish-ketish vaqti',  desc:"Aniq kirish va chiqish vaqtini avtomatik qayd etish" },
            { icon: TrendingUp,  color:'#a78bfa', grad:'#a78bfa,#818cf8', title:'Ish soatlari hisobi',  desc:'Kunlik, haftalik, oylik grafiklar va tahlil' },
            { icon: Users,       color:'#38bdf8', grad:'#38bdf8,#60a5fa', title:'Tanaffus nazorati',    desc:'Daqiqagacha aniq tanaffus vaqtini kuzatish' },
            { icon: CheckCircle, color:'#4ade80', grad:'#4ade80,#34d399', title:'Face ID integratsiya', desc:"Parolsiz, qurilmalar bilan to'liq sinxronizatsiya" },
          ].map(({ icon: Icon, color, grad, title, desc }, i) => (
            <div key={title} style={{
              position:'relative', overflow:'hidden',
              background:'rgba(255,255,255,0.06)',
              backdropFilter:'blur(20px)',
              border:'1px solid rgba(255,255,255,0.1)',
              borderRadius:'22px',
              padding:'22px 20px 20px',
              width:'188px', textAlign:'left',
              boxShadow:`0 0 0 0 ${color}`,
              transition:'transform 0.2s, box-shadow 0.2s',
              animation:`cardIn 0.5s ${i*0.1}s both`,
              cursor:'default',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow=`0 8px 32px ${color}44` }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)';    e.currentTarget.style.boxShadow='none' }}
            >
              {/* Yuqori gradient chiziq */}
              <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:`linear-gradient(90deg,${grad})`, borderRadius:'22px 22px 0 0' }}/>
              {/* Fon icon */}
              <div style={{ position:'absolute', right:'-8px', bottom:'-8px', opacity:0.07 }}>
                <Icon size={80} color={color}/>
              </div>
              {/* Icon */}
              <div style={{ width:'40px', height:'40px', borderRadius:'14px', background:`linear-gradient(135deg,${grad})`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'14px', boxShadow:`0 4px 14px ${color}55` }}>
                <Icon size={20} color="white"/>
              </div>
              <div style={{ fontSize:'17px', fontWeight:700, color:'white', marginBottom:'8px', lineHeight:1.3 }}>{title}</div>
              <div style={{ fontSize:'13.5px', color:'rgba(255,255,255,0.5)', lineHeight:1.65 }}>{desc}</div>
            </div>
          ))}
        </div>
      </main>


      {/* Login Modal */}
      {showModal && (
        <div style={{
          position:'fixed', inset:0, zIndex:100,
          background:'rgba(0,0,0,0.5)', backdropFilter:'blur(8px)',
          display:'flex', alignItems:'center', justifyContent:'center',
          animation:'fadeIn 0.2s ease',
        }} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={{
            width:'420px', background:'rgba(15,31,92,0.85)', backdropFilter:'blur(32px)',
            border:'1px solid rgba(255,255,255,0.15)', borderRadius:'28px',
            padding:'40px', boxShadow:'0 40px 80px rgba(0,0,0,0.5)',
            animation:'slideUp 0.25s ease',
          }}>
            {/* Yopish */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'28px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <CheckCircle size={22} color="white"/>
                </div>
                <div>
                  <div style={{ fontSize:'17px', fontWeight:700, color:'white' }}>Xush kelibsiz</div>
                  <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)' }}>Tizimga kiring</div>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', color:'rgba(255,255,255,0.5)', width:'36px', height:'36px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <X size={16}/>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom:'14px' }}>
                <label style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', display:'block', marginBottom:'7px', fontWeight:500 }}>Login</label>
                <input value={username} onChange={e => { setUsername(e.target.value); setError('') }}
                  placeholder="admin"
                  style={{ width:'100%', padding:'12px 14px', boxSizing:'border-box', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'11px', color:'white', fontSize:'14px', outline:'none' }}
                  onFocus={e => e.target.style.borderColor='rgba(147,197,253,0.5)'}
                  onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.12)'}
                />
              </div>
              <div style={{ marginBottom:'22px' }}>
                <label style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', display:'block', marginBottom:'7px', fontWeight:500 }}>Parol</label>
                <div style={{ position:'relative' }}>
                  <input type={showPass?'text':'password'} value={password} onChange={e => { setPassword(e.target.value); setError('') }}
                    placeholder="••••••••"
                    style={{ width:'100%', padding:'12px 40px 12px 14px', boxSizing:'border-box', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'11px', color:'white', fontSize:'14px', outline:'none' }}
                    onFocus={e => e.target.style.borderColor='rgba(147,197,253,0.5)'}
                    onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.12)'}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.35)', display:'flex' }}>
                    {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>
              {error && (
                <div style={{ marginBottom:'14px', padding:'10px 14px', background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'9px', color:'#fca5a5', fontSize:'13px' }}>
                  ⚠️ {error}
                </div>
              )}
              <button type="submit" disabled={loading} style={{
                width:'100%', padding:'13px', background:'white', border:'none', borderRadius:'11px',
                color:'#1e40af', fontSize:'15px', fontWeight:700, cursor: loading?'not-allowed':'pointer',
                opacity: loading ? 0.7 : 1, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
              }}>
                {loading ? (
                  <><div style={{ width:'15px', height:'15px', border:'2px solid #93c5fd', borderTopColor:'#1e40af', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/> Kirish...</>
                ) : 'Kirish →'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer contact bar */}
      <footer style={{ position:'relative', zIndex:10 }}>
        <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'6px', padding:'12px 24px 28px' }}>
          {[
            { icon: Mail,      text:'info@davomatlar.uz',           href:'mailto:info@davomatlar.uz' },
            { icon: Send,      text:'@davomatlar.uz',               href:'https://t.me/davomatlar' },
            { icon: Phone,     text:'+998 90-873-89-63',            href:'tel:+998908738963' },
            { icon: Camera,    text:'@davomatlar.uz',               href:'https://instagram.com/davomatlar.uz' },
            { icon: MapPin,    text:"Toshkent sh, Olmazor Qamarniso 13", href:null },
          ].map(({ icon: Icon, text, href }) => {
            const inner = (
              <div style={{ display:'flex', alignItems:'center', gap:'7px', padding:'7px 14px', borderRadius:'50px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', fontSize:'13px', color:'rgba(255,255,255,0.8)', whiteSpace:'nowrap', transition:'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.14)'}
                onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.07)'}
              >
                <Icon size={13} color="rgba(255,255,255,0.6)"/>
                {text}
              </div>
            )
            return href
              ? <a key={text} href={href} target="_blank" rel="noreferrer" style={{ textDecoration:'none' }}>{inner}</a>
              : <div key={text}>{inner}</div>
          })}
        </div>
      </footer>

      <style>{`
        @keyframes spin     { to { transform: rotate(360deg) } }
        @keyframes floatCard{ 0%,100%{ transform:translateY(0) } 50%{ transform:translateY(-12px) } }
        @keyframes fadeIn   { from{ opacity:0 } to{ opacity:1 } }
        @keyframes slideUp  { from{ opacity:0; transform:translateY(20px) } to{ opacity:1; transform:translateY(0) } }
        @keyframes cardIn   { from{ opacity:0; transform:translateY(16px) } to{ opacity:1; transform:translateY(0) } }
        @keyframes floatUp  { 0%{ transform:translateY(0) translateX(0); opacity:0 } 10%{ opacity:1 } 90%{ opacity:0.6 } 100%{ transform:translateY(-110vh) translateX(30px); opacity:0 } }
        input::placeholder  { color: rgba(255,255,255,0.2) }
      `}</style>
    </div>
  )
}
