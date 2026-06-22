import { useState } from 'react'
import { loginAsync } from '../auth'
import { Eye, EyeOff, CheckCircle, CheckCircle2, Clock, Users, TrendingUp, X, Phone, MapPin, Send, BarChart3, ShieldCheck, ArrowLeft, Zap, Star, Building2, Check } from 'lucide-react'

const LOGIN_FEATURES = [
  { icon: Clock,       text: 'Kelish-ketish vaqtini real vaqtda kuzatish' },
  { icon: Users,       text: "50+ xodimni bir tashkilotda boshqarish" },
  { icon: BarChart3,   text: 'Oylik statistika va reytinglar' },
  { icon: ShieldCheck, text: 'Face ID kamera integratsiyasi' },
]

export default function Login({ onLogin }) {
  const [showLogin, setShowLogin] = useState(false)
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

  const openLogin = () => {
    setError(''); setUsername(''); setPassword('')
    setShowLogin(true)
  }

  // Split-screen login sahifasi
  if (showLogin) return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      {/* Chap panel */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] p-12 relative overflow-hidden" style={{ background:'linear-gradient(145deg,#1a56db 0%,#1e429f 40%,#1a365d 100%)' }}>
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-30" style={{ background:'#3b82f6' }}/>
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-50" style={{ background:'#0f2460' }}/>
        <div className="absolute top-1/2 -right-16 w-64 h-64 rounded-full opacity-25" style={{ background:'#60a5fa' }}/>
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl border flex items-center justify-center" style={{ background:'rgba(96,165,250,0.3)', borderColor:'rgba(147,197,253,0.5)' }}>
            <CheckCircle2 size={22} className="text-white"/>
          </div>
          <div>
            <div className="text-white font-bold text-[18px] leading-none">Davomatlar.uz</div>
            <div className="text-[12px] mt-0.5" style={{ color:'rgba(147,197,253,0.6)' }}>Boshqaruv tizimi</div>
          </div>
        </div>
        <div className="relative z-10">
          <h1 className="text-white font-extrabold text-[38px] leading-tight mb-4">
            Xodimlar davomatini<br/>
            <span className="text-blue-300">nazorat qiling</span>
          </h1>
          <p className="text-[15px] leading-relaxed mb-10 max-w-sm" style={{ color:'rgba(147,197,253,0.8)' }}>
            Face ID qurilmalar bilan integratsiya, real vaqt hisobotlar va tashkilotlar bo'yicha boshqaruv.
          </p>
          <div className="flex flex-col gap-4">
            {LOGIN_FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background:'rgba(96,165,250,0.25)', border:'1px solid rgba(147,197,253,0.3)' }}>
                  <Icon size={15} className="text-blue-200"/>
                </div>
                <span className="text-blue-100 text-[14px]">{text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-2 text-[12px]" style={{ color:'rgba(147,197,253,0.4)' }}>
          <CheckCircle2 size={12}/> davomatlar.uz · 2026
        </div>
      </div>

      {/* O'ng panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 bg-slate-50">
        <button onClick={() => setShowLogin(false)}
          className="absolute top-6 left-6 lg:hidden flex items-center gap-1.5 text-slate-500 text-[13px] bg-transparent border-none cursor-pointer">
          <ArrowLeft size={15}/> Orqaga
        </button>
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-[26px] font-bold text-slate-900 mb-1">Kirish</h2>
            <p className="text-slate-400 text-[14px]">Login va parolni kiriting</p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-[12px] text-slate-500 font-semibold block mb-1.5">Login</label>
              <input value={username} onChange={e => { setUsername(e.target.value); setError('') }}
                placeholder="admin" autoComplete="username"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-[14px] outline-none focus:border-brand-500 transition-all"
                style={{ boxSizing:'border-box' }}
              />
            </div>
            <div>
              <label className="text-[12px] text-slate-500 font-semibold block mb-1.5">Parol</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  placeholder="••••••••" autoComplete="current-password"
                  className="w-full px-4 py-3 pr-11 bg-white border border-slate-200 rounded-xl text-slate-900 text-[14px] outline-none focus:border-brand-500 transition-all"
                  style={{ boxSizing:'border-box' }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer flex">
                  {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-[13px]">{error}</div>
            )}
            <button type="submit" disabled={loading}
              className={`w-full py-3 rounded-xl text-white text-[15px] font-bold border-none mt-1 transition-all ${loading ? 'bg-brand-300 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700 cursor-pointer'}`}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block"/>
                  Kirish...
                </span>
              ) : 'Kirish →'}
            </button>
          </form>
          <button onClick={() => setShowLogin(false)}
            className="hidden lg:flex items-center gap-1.5 mx-auto mt-6 text-slate-400 text-[13px] bg-transparent border-none cursor-pointer hover:text-slate-600 transition-colors">
            <ArrowLeft size={14}/> Bosh sahifaga qaytish
          </button>
        </div>
      </div>
      <style>{`input::placeholder{color:#cbd5e1}`}</style>
    </div>
  )

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
        <button onClick={openLogin} style={{
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

      {/* Tariflar bo'limi */}
      <section style={{ position:'relative', zIndex:10, padding:'60px 20px 40px', textAlign:'center' }}>
        {/* Sarlavha */}
        <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(255,255,255,0.1)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'50px', padding:'6px 18px', marginBottom:'20px' }}>
          <Zap size={13} color="#fbbf24"/>
          <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.9)', fontWeight:500 }}>Qulay narxlar</span>
        </div>
        <h2 style={{ margin:'0 0 10px', fontSize:'40px', fontWeight:800, color:'white', letterSpacing:'-1px', lineHeight:1.15 }}>
          Biznesingizga mos tarif
        </h2>
        <p style={{ margin:'0 0 44px', fontSize:'15px', color:'rgba(255,255,255,0.55)', maxWidth:'400px', marginLeft:'auto', marginRight:'auto', lineHeight:1.7 }}>
          Xodimlar soniga qarab eng qulay tarifni tanlang.<br/>Har oyda bekor qilish mumkin.
        </p>

        {/* 3 ta karta */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'16px', maxWidth:'960px', margin:'0 auto' }}>
          {[
            {
              icon: Zap,
              label: null,
              name: "Boshlang'ich",
              desc: 'Kichik jamoa uchun ideal',
              price: '1 000 000',
              unit: "so'm / oy",
              color: '#60a5fa',
              grad: 'rgba(96,165,250,0.18)',
              border: 'rgba(96,165,250,0.3)',
              gift: null,
              features: [
                '10 tagacha xodim',
                '1 ta filial boshqaruvi',
                'Face ID kamera integratsiya',
                'Real vaqt kuzatuv',
                'Kunlik hisobotlar & PDF',
                'Xodimlar bazasi (kadrlar)',
                "Ta'til va kasallik hisobi",
                'Kechikish nazorati',
              ],
            },
            {
              icon: Star,
              label: 'Eng mashhur',
              name: 'Biznes',
              desc: "O'rta tashkilotlar uchun",
              price: '2 500 000',
              unit: "so'm / oy",
              color: '#fbbf24',
              grad: 'rgba(251,191,36,0.15)',
              border: 'rgba(251,191,36,0.45)',
              highlight: true,
              gift: null,
              features: [
                '40 tagacha xodim',
                '5 tagacha filial boshqaruvi',
                'Face ID kamera integratsiya',
                'Real vaqt kuzatuv',
                'Kunlik + oylik hisobotlar & PDF',
                'Xodimlar bazasi (kadrlar)',
                "Ta'til va kasallik hisobi",
                'Haftalik jadval ko\'rinishi',
                'Statistika va reytinglar',
                'Kechikish nazorati',
              ],
            },
            {
              icon: Building2,
              label: '🎁 Sovg\'a bor',
              name: 'Korporativ',
              desc: 'Yirik tashkilotlar uchun',
              price: '4 000 000',
              unit: "so'm / oy",
              color: '#a78bfa',
              grad: 'rgba(167,139,250,0.18)',
              border: 'rgba(167,139,250,0.35)',
              gift: 'Face ID qurilmasi sovg\'a! (6 oylik shartnomada)',
              features: [
                '100 tagacha xodim',
                'Cheksiz filiallar boshqaruvi',
                'Face ID kamera — sotib olish shart emas',
                'Real vaqt kuzatuv',
                "To'liq hisobotlar paketi & PDF",
                'Xodimlar bazasi (kadrlar)',
                "Ta'til va kasallik hisobi",
                'Haftalik jadval ko\'rinishi',
                'Statistika va reytinglar',
                'Kechikish nazorati',
                'Telegram xabarnomalar*',
                'Ustuvor texnik yordam',
              ],
            },
          ].map(({ icon: Icon, label, name, desc, price, unit, color, grad, border, highlight, gift, features }, i) => (
            <div key={name}
              style={{
                position:'relative', overflow:'hidden',
                background: highlight
                  ? 'rgba(255,255,255,0.13)'
                  : grad.replace('0.18','0.08').replace('0.15','0.06'),
                backdropFilter:'blur(20px)',
                border: `1.5px solid ${border}`,
                borderRadius:'24px',
                padding:'28px 24px',
                textAlign:'left',
                transition:'transform 0.25s, box-shadow 0.25s',
                animation:`cardIn 0.5s ${i*0.12}s both`,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.boxShadow=`0 20px 60px ${color}33` }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none' }}
            >
              {/* Top gradient bar */}
              <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background:`linear-gradient(90deg, ${color}, ${color}88)`, borderRadius:'24px 24px 0 0' }}/>

              {/* Mashhur badge */}
              {label && (
                <div style={{ position:'absolute', top:'20px', right:'20px', background:`${color}33`, border:`1px solid ${color}66`, borderRadius:'50px', padding:'3px 10px', fontSize:'11px', color, fontWeight:700 }}>
                  {label}
                </div>
              )}

              {/* Icon */}
              <div style={{ width:'44px', height:'44px', borderRadius:'14px', background:`${color}22`, border:`1.5px solid ${color}44`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'16px' }}>
                <Icon size={20} color={color}/>
              </div>

              {/* Name */}
              <div style={{ fontSize:'20px', fontWeight:800, color:'white', marginBottom:'4px' }}>{name}</div>
              <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.45)', marginBottom:'20px' }}>{desc}</div>

              {/* Price */}
              <div style={{ marginBottom:'6px' }}>
                <span style={{ fontSize:'34px', fontWeight:800, color:'white', letterSpacing:'-1px' }}>{price}</span>
                <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.4)', marginLeft:'6px' }}>{unit}</span>
              </div>
              <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', background:`${color}18`, border:`1px solid ${color}33`, borderRadius:'50px', padding:'4px 12px', marginBottom:'24px' }}>
                <Users size={12} color={color}/>
                <span style={{ fontSize:'12px', color, fontWeight:600 }}>{features[0]}</span>
              </div>

              {/* Features */}
              <div style={{ borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:'20px', display:'flex', flexDirection:'column', gap:'10px' }}>
                {features.map(f => (
                  <div key={f} style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <div style={{ width:'18px', height:'18px', borderRadius:'50%', background:`${color}22`, border:`1px solid ${color}44`, display:'flex', alignItems:'center', justifyContent:'center', shrink:0, flexShrink:0 }}>
                      <Check size={10} color={color} strokeWidth={3}/>
                    </div>
                    <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.7)', lineHeight:1.4 }}>{f}</span>
                  </div>
                ))}
              </div>

              {/* Gift banner */}
              {gift && (
                <div style={{ marginTop:'20px', padding:'12px 14px', borderRadius:'14px', background:'linear-gradient(135deg,rgba(251,191,36,0.18),rgba(167,139,250,0.18))', border:'1.5px solid rgba(251,191,36,0.4)', display:'flex', alignItems:'flex-start', gap:'10px' }}>
                  <span style={{ fontSize:'20px', lineHeight:1, flexShrink:0 }}>🎁</span>
                  <div>
                    <div style={{ fontSize:'13px', fontWeight:700, color:'#fbbf24', marginBottom:'2px' }}>Sovg'a!</div>
                    <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.65)', lineHeight:1.5 }}>Face ID qurilmasi <strong style={{ color:'white' }}>bepul beriladi</strong> — 6 oylik shartnoma tuzganda sotib olish shart emas!</div>
                  </div>
                </div>
              )}

              {/* CTA */}
              <button onClick={openLogin} style={{
                marginTop:'24px', width:'100%', padding:'13px', borderRadius:'14px',
                background: highlight ? color : `${color}22`,
                border: `1.5px solid ${highlight ? color : color+'44'}`,
                color: highlight ? '#000' : color,
                fontSize:'14px', fontWeight:700, cursor:'pointer',
                transition:'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = color; e.currentTarget.style.color='#000' }}
                onMouseLeave={e => { e.currentTarget.style.background = highlight ? color : `${color}22`; e.currentTarget.style.color = highlight ? '#000' : color }}
              >
                Boshlash →
              </button>
            </div>
          ))}
        </div>

        <p style={{ marginTop:'28px', fontSize:'12px', color:'rgba(255,255,255,0.25)' }}>
          * Telegram xabarnomalar — tez orada · Barcha narxlar QQS siz · Korporativ tarifda 6 oylik shartnoma talab qilinadi
        </p>
      </section>

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
          .pricing-grid { grid-template-columns: 1fr !important; }
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
