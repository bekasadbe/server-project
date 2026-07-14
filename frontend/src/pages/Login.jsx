import { useState, useEffect, useRef } from 'react'
import { loginAsync } from '../auth'
import { Eye, EyeOff, CheckCircle, CheckCircle2, Clock, Users, TrendingUp, Phone, MapPin, Send, BarChart3, ShieldCheck, ArrowLeft, Zap, Star, Building2, Check } from 'lucide-react'

const LOGIN_FEATURES = [
  { icon: Clock,       text: 'Kelish-ketish vaqtini real vaqtda kuzatish' },
  { icon: Users,       text: "50+ xodimni bir tashkilotda boshqarish" },
  { icon: BarChart3,   text: 'Oylik statistika va reytinglar' },
  { icon: ShieldCheck, text: 'Face ID kamera integratsiyasi' },
]

export default function Login({ onLogin }) {
  // Telegram bot orqali kelganda to'g'ridan login formasi
  const fromTelegram = new URLSearchParams(window.location.search).get('tg') === '1'
    || typeof window.Telegram?.WebApp?.initData === 'string' && window.Telegram.WebApp.initData.length > 0
  const [showLogin, setShowLogin] = useState(fromTelegram)
  const [username, setUsername]   = useState('')
  const [password, setPassword]   = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [failCount, setFailCount] = useState(0)
  const [cooldown, setCooldown]   = useState(0)
  const [remaining, setRemaining] = useState(null)

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (cooldown > 0) return
    setError('')
    setLoading(true)
    try {
      const res = await loginAsync(username, password)
      if (res?.user) {
        setFailCount(0); onLogin(res.user)
      } else {
        const newFail = failCount + 1
        setFailCount(newFail)
        if (res?.remaining !== null && res?.remaining !== undefined) setRemaining(res.remaining)
        if (res?.blocked) {
          setError("Juda ko'p urinish. 5 daqiqa kuting.")
          setCooldown(300)
        } else {
          setError(res?.error || "Login yoki parol noto'g'ri")
          // Progressive delay: 1s, 2s, 4s, 8s
          if (newFail >= 2) setCooldown(Math.min(Math.pow(2, newFail - 2), 30))
        }
      }
    } catch {
      setError("Serverga ulanishda xatolik")
    } finally {
      setLoading(false)
    }
  }

  const openLogin = () => {
    setError(''); setUsername(''); setPassword(''); setFailCount(0); setCooldown(0); setRemaining(null)
    setShowLogin(true)
  }

  const pricingRef = useRef(null)
  const [pricingVisible, setPricingVisible] = useState(false)
  useEffect(() => {
    const el = pricingRef.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setPricingVisible(true); obs.disconnect() } }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

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
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-[13px]">
                <div>{error}</div>
                {remaining !== null && remaining > 0 && !cooldown && (
                  <div className="mt-1 text-red-400 text-[12px]">⚠️ {remaining} ta urinish qoldi</div>
                )}
                {cooldown > 0 && (
                  <div className="mt-1 text-red-500 text-[12px] font-semibold">⏱ {cooldown} soniyadan keyin qayta urinib ko'ring</div>
                )}
              </div>
            )}
            <button type="submit" disabled={loading || cooldown > 0}
              className={`w-full py-3 rounded-xl text-white text-[15px] font-bold border-none mt-1 transition-all ${loading || cooldown > 0 ? 'bg-brand-300 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700 cursor-pointer'}`}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block"/>
                  Tekshirilmoqda...
                </span>
              ) : cooldown > 0 ? `Kuting ${cooldown}s...` : 'Kirish →'}
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
      <main className="landing-main" style={{ position:'relative', zIndex:10, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'80px 40px 70px' }}>
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

        <div className="cards-grid" style={{ display:'grid', gap:'16px', width:'100%', maxWidth:'1200px' }}>
          {[
            { icon: Clock,       color:'#f87171', grad:'#f87171,#fb923c', title:'Kelish-ketish vaqti',  desc:"Aniq kirish va chiqish vaqtini avtomatik qayd etish" },
            { icon: TrendingUp,  color:'#a78bfa', grad:'#a78bfa,#818cf8', title:'Ish soatlari hisobi',  desc:'Kunlik, haftalik, oylik grafiklar va tahlil' },
            { icon: Users,       color:'#38bdf8', grad:'#38bdf8,#60a5fa', title:'Tanaffus nazorati',    desc:'Daqiqagacha aniq tanaffus vaqtini kuzatish' },
            { icon: CheckCircle, color:'#4ade80', grad:'#4ade80,#34d399', title:'Face ID integratsiya', desc:"Parolsiz, qurilmalar bilan to'liq sinxronizatsiya" },
          ].map(({ icon: Icon, color, grad, title, desc }, i) => (
            <div key={title} style={{
              position:'relative', overflow:'hidden',
              background:'rgba(255,255,255,0.08)', backdropFilter:'blur(20px)',
              border:'1px solid rgba(255,255,255,0.12)', borderRadius:'22px',
              padding:'26px 22px 22px', textAlign:'left',
              transition:'transform 0.2s, box-shadow 0.2s',
              animation:`cardIn 0.5s ${i*0.1}s both`, cursor:'default',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-5px)'; e.currentTarget.style.boxShadow=`0 12px 40px ${color}44` }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)';    e.currentTarget.style.boxShadow='none' }}
            >
              <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background:`linear-gradient(90deg,${grad})`, borderRadius:'22px 22px 0 0' }}/>
              <div style={{ position:'absolute', right:'-10px', bottom:'-10px', opacity:0.07 }}><Icon size={90} color={color}/></div>
              <div style={{ width:'48px', height:'48px', borderRadius:'14px', background:`linear-gradient(135deg,${grad})`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'16px', boxShadow:`0 4px 16px ${color}55` }}>
                <Icon size={24} color="white"/>
              </div>
              <div style={{ fontSize:'17px', fontWeight:700, color:'white', marginBottom:'8px', lineHeight:1.3 }}>{title}</div>
              <div style={{ fontSize:'14px', color:'rgba(255,255,255,0.55)', lineHeight:1.65 }}>{desc}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Tariflar */}
      <section ref={pricingRef} style={{
        position:'relative', zIndex:10, padding:'72px 40px 60px', textAlign:'center',
        background:'#f8fafc',
        opacity: pricingVisible ? 1 : 0, transform: pricingVisible ? 'translateY(0)' : 'translateY(40px)',
        transition:'opacity 0.7s ease, transform 0.7s ease',
      }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'#fff3e0', border:'1px solid #fed7aa', borderRadius:'50px', padding:'6px 18px', marginBottom:'20px' }}>
          <Zap size={13} color="#f97316"/>
          <span style={{ fontSize:'13px', color:'#ea580c', fontWeight:600 }}>Qulay narxlar</span>
        </div>
        <h2 style={{ margin:'0 0 10px', fontSize:'36px', fontWeight:800, color:'#0f172a', letterSpacing:'-1px' }}>
          Biznesingizga mos tarif
        </h2>
        <p style={{ margin:'0 auto 44px', fontSize:'15px', color:'#64748b', maxWidth:'400px', lineHeight:1.7 }}>
          Xodimlar soniga qarab eng qulay tarifni tanlang. Har oyda bekor qilish mumkin.
        </p>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(290px,1fr))', gap:'20px', maxWidth:'1200px', margin:'0 auto' }}>
          {[
            {
              icon: Zap, badge: null, name:'Plus', desc:'Kichik jamoa uchun ideal',
              price:'$35', limit:'12 tagacha xodim',
              theme:'light', accentColor:'#f97316',
              btnBg:'#2563eb', btnColor:'#fff',
              features:['12 tagacha xodim','1 ta tashkilot','1 ta foydalanuvchi (login)','Face ID kamera integratsiya','Real vaqt kuzatuv','Kunlik hisobot (PDF siz)','Xodimlar bazasi (kadrlar)','Kechikish nazorati'],
              gift: null,
            },
            {
              icon: Star, badge:'⭐ Eng mashhur', name:'Pro', desc:"O'rta tashkilotlar uchun",
              price:'$99', limit:'35 tagacha xodim',
              theme:'blue', accentColor:'rgba(255,255,255,0.9)',
              btnBg:'rgba(255,255,255,0.18)', btnColor:'#fff',
              features:['35 tagacha xodim','3 tagacha tashkilot','3 ta foydalanuvchi (login)','Face ID kamera integratsiya','Real vaqt kuzatuv','Kunlik + oylik hisobotlar & PDF','Xodimlar bazasi (kadrlar)',"Ta'til va kasallik hisobi","Haftalik jadval ko'rinishi",'Statistika va reytinglar','Kechikish nazorati','Telegram xabarnomalar'],
              gift: null,
            },
            {
              icon: Building2, badge:"🎁 Sovg'a bor", name:'Ultra', desc:'Yirik tashkilotlar uchun',
              price:'$250', limit:'80 tagacha xodim',
              theme:'dark', accentColor:'rgba(255,255,255,0.85)',
              btnBg:'#2563eb', btnColor:'#fff',
              features:['80 tagacha xodim','5 tagacha tashkilot','5 ta foydalanuvchi (login)','Face ID kamera — sotib olish shart emas','Real vaqt kuzatuv',"To'liq hisobotlar paketi & PDF",'Xodimlar bazasi (kadrlar)',"Ta'til va kasallik hisobi","Haftalik jadval ko'rinishi",'Statistika va reytinglar','Kechikish nazorati','Telegram xabarnomalar','Ustuvor texnik yordam'],
              gift: true,
            },
          ].map(({ icon:Icon, badge, name, desc, price, limit, theme, accentColor, btnBg, btnColor, features, gift }, i) => {
            const isBlue = theme === 'blue'
            const isDark = theme === 'dark'
            const cardBg = isBlue ? 'linear-gradient(145deg,#2563eb,#1e40af)' : isDark ? '#1e293b' : '#ffffff'
            const titleColor = (isBlue || isDark) ? '#ffffff' : '#0f172a'
            const subColor = isBlue ? 'rgba(255,255,255,0.65)' : isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8'
            const priceColor = (isBlue || isDark) ? '#ffffff' : '#0f172a'
            const featColor = isBlue ? 'rgba(255,255,255,0.82)' : isDark ? 'rgba(255,255,255,0.7)' : '#475569'
            const dividerColor = isBlue ? 'rgba(255,255,255,0.15)' : isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9'
            const checkBg = isBlue ? 'rgba(255,255,255,0.18)' : isDark ? 'rgba(255,255,255,0.12)' : '#f1f5f9'
            const checkColor = isBlue ? '#93c5fd' : isDark ? '#60a5fa' : '#2563eb'
            const iconBg = isBlue ? 'rgba(255,255,255,0.18)' : isDark ? 'rgba(255,255,255,0.1)' : '#eff6ff'
            const iconColor = isBlue ? '#fff' : isDark ? '#93c5fd' : '#2563eb'
            const badgeBg = isBlue ? 'rgba(255,255,255,0.2)' : isDark ? 'rgba(255,255,255,0.12)' : '#fff3e0'
            const badgeColor = isBlue ? '#fff' : isDark ? '#fbbf24' : '#f97316'
            const limitBg = isBlue ? 'rgba(255,255,255,0.18)' : isDark ? 'rgba(255,255,255,0.1)' : '#eff6ff'
            const limitColor = isBlue ? '#fff' : isDark ? '#93c5fd' : '#2563eb'
            const cardShadow = isBlue ? '0 20px 60px rgba(37,99,235,0.5)' : isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.06)'
            const borderStyle = isBlue ? 'none' : isDark ? '1.5px solid rgba(255,255,255,0.1)' : '1.5px solid #e2e8f0'

            return (
            <div key={name} style={{
              position:'relative', overflow:'hidden',
              background: cardBg,
              border: borderStyle,
              borderRadius:'22px', padding:'26px 22px 22px',
              textAlign:'left', display:'flex', flexDirection:'column',
              boxShadow: cardShadow,
              transition:'transform 0.25s, box-shadow 0.25s',
              animation:`cardIn 0.5s ${i*0.12}s both`,
            }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-6px)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)'}}
            >
              {/* Badge + Icon row */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'18px' }}>
                <div style={{ width:'46px', height:'46px', borderRadius:'13px', background:iconBg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon size={21} color={iconColor}/>
                </div>
                {badge && <div style={{ background:badgeBg, borderRadius:'50px', padding:'5px 12px', fontSize:'12px', color:badgeColor, fontWeight:500, letterSpacing:'0.01em' }}>{badge}</div>}
              </div>

              <div style={{ fontSize:'19px', fontWeight:700, color:titleColor, marginBottom:'4px', letterSpacing:'-0.3px' }}>{name}</div>
              <div style={{ fontSize:'13px', color:subColor, marginBottom:'16px', fontWeight:400, lineHeight:1.5 }}>{desc}</div>

              {/* Dotted divider */}
              <div style={{ borderTop:`1.5px dashed ${dividerColor}`, marginBottom:'16px' }}/>

              <div style={{ marginBottom:'16px' }}>
                <div style={{ display:'flex', alignItems:'baseline', gap:'4px', marginBottom:'10px' }}>
                  <span style={{ fontSize:'30px', fontWeight:700, color:priceColor, letterSpacing:'-1px' }}>{price}</span>
                  <span style={{ fontSize:'13px', color:subColor, fontWeight:400 }}>/oy</span>
                </div>
                <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', background:limitBg, borderRadius:'50px', padding:'4px 12px' }}>
                  <Users size={12} color={limitColor}/>
                  <span style={{ fontSize:'12px', color:limitColor, fontWeight:500 }}>{limit}</span>
                </div>
              </div>

              {/* Dotted divider */}
              <div style={{ borderTop:`1.5px dashed ${dividerColor}`, marginBottom:'16px' }}/>

              <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'9px', marginBottom:'18px' }}>
                {features.map(f => (
                  <div key={f} style={{ display:'flex', alignItems:'flex-start', gap:'9px' }}>
                    <div style={{ marginTop:'2px', width:'16px', height:'16px', borderRadius:'50%', background:checkBg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Check size={9} color={checkColor} strokeWidth={2.5}/>
                    </div>
                    <span style={{ fontSize:'13px', color:featColor, lineHeight:1.55, fontWeight:400 }}>{f}</span>
                  </div>
                ))}
              </div>

              {gift && (
                <div style={{ marginBottom:'14px', padding:'11px 13px', borderRadius:'13px', background:'rgba(255,255,255,0.08)', border:'1.5px solid rgba(255,255,255,0.15)', display:'flex', alignItems:'flex-start', gap:'9px' }}>
                  <span style={{ fontSize:'18px', lineHeight:1, flexShrink:0 }}>🎁</span>
                  <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.75)', lineHeight:1.5 }}>
                    6 oylik shartnoma tuzganda — Face ID qurilmasi <strong style={{ color:'#4ade80' }}>bepul beriladi</strong>
                  </div>
                </div>
              )}

              <a href="https://t.me/davomatlaruz" target="_blank" rel="noreferrer" style={{
                display:'block', width:'100%', padding:'13px', borderRadius:'13px', border: isBlue ? '1.5px solid rgba(255,255,255,0.3)' : 'none',
                background: btnBg, color: btnColor, textAlign:'center',
                fontSize:'14px', fontWeight:400, cursor:'pointer', textDecoration:'none',
                backdropFilter: 'none',
                boxShadow: isBlue ? 'none' : isDark ? '0 4px 16px rgba(37,99,235,0.5)' : '0 4px 16px rgba(37,99,235,0.3)',
                transition:'opacity 0.2s',
              }}
                onMouseEnter={e=>e.currentTarget.style.opacity='0.85'}
                onMouseLeave={e=>e.currentTarget.style.opacity='1'}
              >Sotib olish →</a>
            </div>
          )})}
        </div>
        <p style={{ marginTop:'28px', fontSize:'12px', color:'#94a3b8' }}>
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
        @keyframes cardIn  { from{ opacity:0; transform:translateY(16px) } to{ opacity:1; transform:translateY(0) } }
        @keyframes floatUp { 0%{ transform:translateY(0) translateX(0); opacity:0 } 10%{ opacity:1 } 90%{ opacity:0.6 } 100%{ transform:translateY(-110vh) translateX(30px); opacity:0 } }
        input::placeholder { color: #cbd5e1 }
        .cards-grid { grid-template-columns: repeat(4, 1fr); }
        .hero-title  { font-size: 58px; }
        @media (max-width: 768px) {
          .cards-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .hero-title  { font-size: 38px !important; letter-spacing: -1px !important; }
          html, body { overflow-y: auto !important; height: auto !important; }
          .landing-main { padding-top: 40px !important; padding-bottom: 40px !important; }
        }
        @media (max-width: 480px) {
          .cards-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .hero-title  { font-size: 32px !important; }
        }
      `}</style>
    </div>
  )
}
