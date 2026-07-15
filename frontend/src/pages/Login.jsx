import { useState, useEffect, useRef } from 'react'
import { loginAsync } from '../auth'
import { Eye, EyeOff, CheckCircle, CheckCircle2, Clock, Users, TrendingUp, Phone, MapPin, Send, BarChart3, ShieldCheck, ArrowLeft, Zap, Star, Building2, Check, Factory, GraduationCap, Stethoscope, ShoppingCart, Landmark } from 'lucide-react'

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

  const [activeFeature, setActiveFeature] = useState(0)

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
      <main className="landing-main" style={{ minHeight:'78vh', position:'relative', zIndex:10, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'60px 40px 60px' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(255,255,255,0.1)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'50px', padding:'6px 18px', marginBottom:'24px' }}>
          <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#4ade80', boxShadow:'0 0 8px #4ade80', flexShrink:0 }}/>
          <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.9)', fontWeight:500 }}>Real vaqt davomat tizimi</span>
        </div>

        <h1 className="hero-title" style={{ margin:'0 0 16px', fontWeight:800, color:'white', lineHeight:1.15, letterSpacing:'-0.8px', maxWidth:'700px' }}>
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

      {/* Platforma haqida — interaktiv */}
      <section style={{ position:'relative', zIndex:10, background:'#fff', padding:'64px 40px 84px' }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', maxWidth:'700px', margin:'0 auto 40px' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:'50px', padding:'6px 18px', marginBottom:'20px' }}>
              <span style={{ fontSize:'13px', color:'#2563eb', fontWeight:600 }}>Platforma haqida</span>
            </div>
            <h2 style={{ margin:'0 0 16px', fontSize:'32px', fontWeight:800, color:'#0f172a', letterSpacing:'-0.8px' }}>
              Davomatlar.uz <span style={{ color:'#2563eb' }}>nima qiladi?</span>
            </h2>
            <p style={{ margin:0, fontSize:'15px', color:'#64748b', lineHeight:1.75 }}>
              Face ID kamera xodimni tanib oladi, vaqt serverga yoziladi, siz esa hammasini bitta ekranda — real vaqtda ko'rasiz. Quyidagi bo'limlarni bosib har biri qanday ishlashini ko'ring.
            </p>
          </div>

          <div className="feature-showcase" style={{ display:'grid', gridTemplateColumns:'340px 1fr', gap:'0', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:'24px', overflow:'hidden', minHeight:'380px' }}>
            {/* Tab ro'yxati */}
            <div style={{ borderRight:'1px solid #e2e8f0', padding:'12px' }}>
              {[
                { icon: Clock,       title:'Kelish-ketish vaqti',   short:'Aniq vaqtni avtomatik qayd etadi' },
                { icon: ShieldCheck, title:'Face ID aniqlash',      short:"Aldash imkonsiz, faqat o'zi kirsin" },
                { icon: BarChart3,   title:'Real vaqt dashboard',   short:"Kim keldi, kim yo'q — bir ekranda" },
                { icon: CheckCircle, title:'Hisobotlar va PDF',     short:'Kunlik, oylik — bir tugmada tayyor' },
                { icon: Send,        title:'Telegram xabarnoma',    short:'Kelmaganlar ro\'yxati avtomatik keladi' },
                { icon: Building2,   title:"Ko'p filial boshqaruvi", short:"Barcha tashkilotlar bitta joydan" },
              ].map(({ icon:Icon, title, short }, i) => (
                <button key={title} onClick={() => setActiveFeature(i)}
                  style={{
                    display:'flex', alignItems:'center', gap:'14px', width:'100%', textAlign:'left',
                    padding:'16px 18px', borderRadius:'14px', border:'none', cursor:'pointer',
                    background: activeFeature===i ? '#eff6ff' : 'transparent',
                    transition:'background 0.2s', marginBottom:'2px',
                  }}
                  onMouseEnter={e=>{ if(activeFeature!==i) e.currentTarget.style.background='#f1f5f9' }}
                  onMouseLeave={e=>{ if(activeFeature!==i) e.currentTarget.style.background='transparent' }}
                >
                  <div style={{ width:'38px', height:'38px', borderRadius:'11px', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                    background: activeFeature===i ? '#2563eb' : '#e2e8f0' }}>
                    <Icon size={17} color={activeFeature===i ? '#fff' : '#64748b'} strokeWidth={2}/>
                  </div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:'14px', fontWeight:600, color: activeFeature===i ? '#0f172a' : '#334155', marginBottom:'2px' }}>{title}</div>
                    <div style={{ fontSize:'12px', color:'#94a3b8', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{short}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Tafsilot paneli */}
            <div style={{ position:'relative', padding:'44px 48px', display:'flex', flexDirection:'column', justifyContent:'center', background:'#fff', overflow:'hidden' }}>
              <img className="detail-img" src="/png.jpg" alt="" style={{ position:'absolute', bottom:0, right:0, maxHeight:'110%', width:'auto', pointerEvents:'none', userSelect:'none' }}/>
              {(() => {
                const details = [
                  { badge:'01 · Kelish-ketish', title:'Kelish-ketish vaqti aniq qayd etiladi', color:'#dc2626', bg:'#fef2f2',
                    text:"Xodim kirish joyidan o'tganda tizim daqiqasigacha aniq vaqtni qayd etadi. Kim qachon keldi, qachon ketdi — hammasi avtomatik, qog'oz jurnal kerak emas.",
                    points:['0.3 soniyada aniqlanadi', "Kechikish avtomatik hisoblanadi", "Ish boshlanish vaqti sozlanadi"] },
                  { badge:'02 · Xavfsizlik', title:"Face ID — aldash imkonsiz", color:'#ea580c', bg:'#fff7ed',
                    text:"Boshqa birovning kartasini yoki parolini ishlatib bo'lmaydi. Kamera aynan xodimning yuzini taniydi — shuning uchun har bir yozuv 100% ishonchli.",
                    points:['Karta yoki kod talab qilinmaydi', "Ko'zoynak, shapka bilan ham ishlaydi", "Har bir xodim faqat o'zi uchun"] },
                  { badge:'03 · Dashboard', title:'Real vaqt boshqaruv paneli', color:'#2563eb', bg:'#eff6ff',
                    text:"Kadrlar va rahbar bir ekranda bugun kim keldi, kim kelmadi, kim kechikdi — hammasini ko'radi. Filtrlash va qidiruv bilan har qanday xodimni tez topasiz.",
                    points:['Jonli yangilanadi', 'Tashkilot bo\'yicha filtrlash', 'Kechikkanlar alohida ko\'rinadi'] },
                  { badge:'04 · Hisobotlar', title:'Bir tugmada tayyor hisobot', color:'#059669', bg:'#f0fdf4',
                    text:"Kunlik, haftalik, oylik hisobotlar avtomatik shakllanadi. PDF formatda yuklab olish yoki chop etish — ish haqi hisob-kitobi uchun tayyor ma'lumot.",
                    points:['PDF eksport', 'Oylik statistika va reytinglar', "Ta'til va kasallik hisobga olinadi"] },
                  { badge:'05 · Telegram', title:'Telegram orqali avtomatik xabar', color:'#0284c7', bg:'#ecfeff',
                    text:"Har kuni ertalab kelmagan xodimlar ro'yxati Telegram ga avtomatik yuboriladi. Bot orqali istalgan joydan platformaga bir bosishda kirasiz.",
                    points:['Kunlik kelmaganlar ro\'yxati', "Bot orqali to'g'ridan-to'g'ri kirish", 'Parolsiz avtomatik login'] },
                  { badge:'06 · Ko\'p filial', title:"Barcha tashkilotlar — bitta joydan", color:'#9333ea', bg:'#faf5ff',
                    text:"Bir nechta filial yoki tashkilotingiz bo'lsa, har biri o'z ma'lumotini ko'radi, siz esa bitta akkauntdan hammasini nazorat qilasiz.",
                    points:['Filiallar aralashmaydi', "Har bir login o'ziga tegishlisini ko'radi", 'Markazlashgan boshqaruv'] },
                ][activeFeature]
                return (
                  <div key={activeFeature} className="detail-content" style={{ position:'relative', zIndex:1, animation:'fadeSlide 0.35s ease' }}>
                    <div style={{ display:'inline-block', maxWidth:'340px', background:details.bg, borderRadius:'50px', padding:'5px 14px', fontSize:'12px', fontWeight:700, color:details.color, marginBottom:'18px' }}>
                      {details.badge}
                    </div>
                    <h3 style={{ margin:'0 0 14px', fontSize:'24px', fontWeight:800, color:'#0f172a', letterSpacing:'-0.4px', maxWidth:'340px' }}>{details.title}</h3>
                    <p style={{ margin:'0 0 24px', fontSize:'14.5px', color:'#64748b', lineHeight:1.75, maxWidth:'340px' }}>{details.text}</p>
                    <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                      {details.points.map(p => (
                        <div key={p} style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                          <div style={{ width:'18px', height:'18px', borderRadius:'50%', background:details.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            <Check size={10} color={details.color} strokeWidth={3}/>
                          </div>
                          <span style={{ fontSize:'13.5px', color:'#334155', fontWeight:500 }}>{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      </section>

      {/* Kimlar uchun */}
      <section style={{ position:'relative', zIndex:10, background:'#f8fafc', padding:'72px 40px 64px', textAlign:'center' }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:'50px', padding:'6px 18px', marginBottom:'20px' }}>
            <span style={{ fontSize:'13px', color:'#2563eb', fontWeight:600 }}>Maqsadli mijozlar</span>
          </div>
          <h2 style={{ margin:'0 0 10px', fontSize:'32px', fontWeight:800, color:'#0f172a', letterSpacing:'-0.8px' }}>Kimlar uchun mos?</h2>
          <p style={{ margin:'0 auto 44px', fontSize:'15px', color:'#64748b', maxWidth:'440px', lineHeight:1.7 }}>Har qanday tashkilot xodimlar davomatini nazorat qilishi kerak</p>
          <div className="who-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px' }}>
            {[
              { Icon: Building2,      color:'#2563eb', bg:'#eff6ff', title:'Ofis va kompaniyalar', desc:"Kechikish nazorati, moslashuvchan jadval, ish soatlari asosida ish haqi hisoblash" },
              { Icon: Factory,        color:'#ea580c', bg:'#fff7ed', title:'Ishlab chiqarish', desc:"Smenali jadval, ko'p kirish nuqtasi, ko'p xodimni bir vaqtda nazorat" },
              { Icon: GraduationCap,  color:'#7c3aed', bg:'#f5f3ff', title:"Maktab va o'quv markazlari", desc:"O'quvchilar va o'qituvchilar davomati, sinflar bo'yicha hisobot" },
              { Icon: Stethoscope,    color:'#dc2626', bg:'#fef2f2', title:'Klinika va tibbiyot', desc:"Navbatchi shifokorlar, smena jadvali, aniq ish soatlari hisoblash" },
              { Icon: ShoppingCart,   color:'#059669', bg:'#f0fdf4', title:'Savdo tarmoqlari', desc:"Ko'p filial — har biri o'z jamoasini ko'radi, markaz hammasini ko'radi" },
              { Icon: Landmark,       color:'#0891b2', bg:'#ecfeff', title:"Davlat tashkilotlari", desc:"To'liq mahalliy server, ma'lumotlar tashqariga chiqmaydi, internet bo'lmasa ham ishlaydi" },
            ].map(({ Icon, color, bg, title, desc }) => (
              <div key={title} style={{ background:'#fff', borderRadius:'16px', padding:'24px 22px', textAlign:'left', border:'1px solid #e2e8f0', transition:'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow=`0 12px 32px ${color}18` }}
                onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none' }}
              >
                <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:bg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'14px' }}>
                  <Icon size={20} color={color} strokeWidth={1.8}/>
                </div>
                <div style={{ fontSize:'15px', fontWeight:700, color:'#0f172a', marginBottom:'6px' }}>{title}</div>
                <div style={{ fontSize:'13px', color:'#64748b', lineHeight:1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Tariflar */}
      <section ref={pricingRef} style={{
        position:'relative', zIndex:10, padding:'72px 40px 60px', textAlign:'center',
        background:'#f8fafc',
      }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'#fff3e0', border:'1px solid #fed7aa', borderRadius:'50px', padding:'6px 18px', marginBottom:'20px' }}>
          <Zap size={13} color="#f97316"/>
          <span style={{ fontSize:'13px', color:'#ea580c', fontWeight:600 }}>Qulay narxlar</span>
        </div>
        <h2 style={{ margin:'0 0 10px', fontSize:'32px', fontWeight:800, color:'#0f172a', letterSpacing:'-0.8px' }}>
          Biznesingizga mos tarif
        </h2>
        <p className="pricing-sub" style={{ margin:'0 auto 44px', fontSize:'15px', color:'#64748b', maxWidth:'520px', lineHeight:1.7, whiteSpace:'nowrap' }}>
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
            const cardShadow = isBlue ? '0 8px 24px rgba(37,99,235,0.18)' : isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.06)'
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

        {/* Face ID izohi */}
        <div style={{ maxWidth:'860px', margin:'40px auto 0', background:'#fff', border:'1px solid #e2e8f0', borderRadius:'18px', padding:'28px 30px', textAlign:'left' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
            <div style={{ width:'34px', height:'34px', borderRadius:'10px', background:'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <ShieldCheck size={17} color="#2563eb"/>
            </div>
            <span style={{ fontSize:'15px', fontWeight:700, color:'#0f172a' }}>Platformaga ulanish uchun Face ID qurilmasi kerak</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:'18px' }}>
            <div style={{ display:'flex', gap:'10px' }}>
              <Check size={15} color="#2563eb" strokeWidth={2.5} style={{ flexShrink:0, marginTop:'2px' }}/>
              <span style={{ fontSize:'13.5px', color:'#475569', lineHeight:1.65 }}>Tizim ishlashi uchun Face ID qurilma zarur — u orqali xodimlar avtomatik aniqlanadi.</span>
            </div>
            <div style={{ display:'flex', gap:'10px' }}>
              <Check size={15} color="#2563eb" strokeWidth={2.5} style={{ flexShrink:0, marginTop:'2px' }}/>
              <span style={{ fontSize:'13.5px', color:'#475569', lineHeight:1.65 }}>Qurilmangiz yo'q bo'lsa — muammo emas. Qo'shimcha to'lov evaziga o'rnatib, sozlab, platformaga ulab beramiz.</span>
            </div>
            <div style={{ display:'flex', gap:'10px' }}>
              <Check size={15} color="#2563eb" strokeWidth={2.5} style={{ flexShrink:0, marginTop:'2px' }}/>
              <span style={{ fontSize:'13.5px', color:'#475569', lineHeight:1.65 }}><strong style={{ color:'#0f172a' }}>Faqat Ultra tarifda</strong> — 6 oylik shartnoma bilan Face ID qurilmasi bepul beriladi.</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ position:'relative', zIndex:10, background:'#fff', padding:'64px 40px', textAlign:'center' }}>
        <div style={{ maxWidth:'600px', margin:'0 auto' }}>
          <div style={{ fontSize:'40px', marginBottom:'16px' }}>🚀</div>
          <h2 style={{ margin:'0 0 12px', fontSize:'32px', fontWeight:800, color:'#0f172a', letterSpacing:'-0.8px' }}>Bepul konsultatsiya oling</h2>
          <p style={{ margin:'0 0 28px', fontSize:'15px', color:'#64748b', lineHeight:1.7 }}>
            Tashkilotingiz uchun qaysi tarif mos ekanini birgalikda aniqlaymiz. Basic paket 3-7 kunda ishga tushadi.
          </p>
          <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
            <a href="https://t.me/acsham" target="_blank" rel="noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'13px 28px', borderRadius:'13px', background:'#2563eb', color:'#fff', fontSize:'15px', fontWeight:600, textDecoration:'none', transition:'opacity 0.2s' }}
              onMouseEnter={e=>e.currentTarget.style.opacity='0.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
              <Send size={16}/> Telegram orqali yozish
            </a>
            <a href="tel:+998908738963" style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'13px 28px', borderRadius:'13px', background:'#f1f5f9', border:'1px solid #e2e8f0', color:'#0f172a', fontSize:'15px', fontWeight:600, textDecoration:'none', transition:'opacity 0.2s' }}
              onMouseEnter={e=>e.currentTarget.style.opacity='0.8'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
              <Phone size={16}/> +998 90-873-89-63
            </a>
          </div>
        </div>
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
        @keyframes fadeSlide { from{ opacity:0; transform:translateX(10px) } to{ opacity:1; transform:translateX(0) } }
        input::placeholder { color: #cbd5e1 }
        .cards-grid { grid-template-columns: repeat(4, 1fr); }
        .hero-title  { font-size: 48px; }
        @media (max-width: 768px) {
          .cards-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .hero-title  { font-size: 38px !important; letter-spacing: -1px !important; }
          html, body { overflow-y: auto !important; height: auto !important; }
          .landing-main { padding-top: 40px !important; padding-bottom: 40px !important; }
          .feature-showcase { grid-template-columns: 1fr !important; }
          .detail-img { position: static !important; display: block !important; max-height: none !important; width: 130% !important; max-width: none !important; margin: 24px 0 0 -15% !important; right: auto !important; bottom: auto !important; order: 2; }
          .detail-content { order: 1; }
          .feature-showcase > div:last-child { overflow: visible !important; }
          .feature-showcase { overflow: visible !important; }
          .pricing-sub { white-space: normal !important; max-width: 400px !important; }
          .who-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .cards-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .hero-title  { font-size: 32px !important; }
          .who-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
