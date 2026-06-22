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

  const W = { maxWidth:'1100px', margin:'0 auto', width:'100%', padding:'0 24px', boxSizing:'border-box' }

  return (
    <div style={{
      width:'100vw', minHeight:'100vh', overflowY:'auto', overflowX:'hidden', position:'relative',
      background:'linear-gradient(135deg, #60b8ff 0%, #1a7fe8 25%, #0a5fd4 50%, #0038b8 75%, #001e8a 100%)',
      display:'flex', flexDirection:'column',
    }}>
      {/* Fon */}
      <div style={{ position:'fixed', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:0 }}>
        <div style={{ position:'absolute', top:'-10%', left:'-5%', width:'700px', height:'600px', borderRadius:'50%', background:'rgba(255,255,255,0.22)', filter:'blur(90px)' }}/>
        <div style={{ position:'absolute', top:'5%', right:'10%', width:'350px', height:'350px', borderRadius:'50%', background:'rgba(255,255,255,0.18)', filter:'blur(60px)' }}/>
        <div style={{ position:'absolute', bottom:'-5%', right:'-5%', width:'500px', height:'400px', borderRadius:'50%', background:'rgba(10,30,150,0.45)', filter:'blur(80px)' }}/>
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize:'60px 60px' }}/>
      </div>

      {/* ── HEADER ── */}
      <header style={{ position:'sticky', top:0, zIndex:100, background:'rgba(0,30,120,0.35)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.12)', boxSizing:'border-box', width:'100%' }}>
        <div style={{ ...W, display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 24px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:'rgba(255,255,255,0.2)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.4)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <CheckCircle size={20} color="white" strokeWidth={2.5}/>
            </div>
            <span style={{ fontSize:'18px', fontWeight:700, color:'#fff', letterSpacing:'-0.3px' }}>Davomatlar.uz</span>
          </div>
          <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
            <a href="#tariflar" style={{ fontSize:'14px', color:'rgba(255,255,255,0.6)', textDecoration:'none', padding:'8px 16px', borderRadius:'50px', transition:'color 0.2s' }}
              onMouseEnter={e=>e.currentTarget.style.color='#fff'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.6)'}>
              Tariflar
            </a>
            <button onClick={openLogin} style={{
              background:'rgba(255,255,255,0.12)', backdropFilter:'blur(12px)',
              border:'1px solid rgba(255,255,255,0.2)', borderRadius:'50px',
              padding:'10px 22px', color:'white', fontSize:'14px', fontWeight:600, cursor:'pointer', transition:'all 0.2s',
            }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.22)'}
              onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.12)'}
            >Kirish →</button>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ position:'relative', zIndex:1, padding:'90px 24px 80px', textAlign:'center' }}>
        <div style={W}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(74,222,128,0.12)', border:'1px solid rgba(74,222,128,0.3)', borderRadius:'50px', padding:'6px 16px', marginBottom:'28px' }}>
            <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#4ade80', boxShadow:'0 0 8px #4ade80' }}/>
            <span style={{ fontSize:'13px', color:'#86efac', fontWeight:500 }}>Real vaqt davomat tizimi</span>
          </div>
          <h1 style={{ margin:'0 0 20px', fontSize:'clamp(38px,6vw,72px)', fontWeight:900, color:'white', lineHeight:1.08, letterSpacing:'-2px' }}>
            Xodimlar davomatini<br/>
            <span style={{ background:'linear-gradient(90deg,#60a5fa,#a78bfa,#34d399)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
              nazorat qiling
            </span>
          </h1>
          <p style={{ margin:'0 auto 36px', fontSize:'18px', color:'rgba(255,255,255,0.5)', lineHeight:1.75, maxWidth:'500px' }}>
            Face ID qurilmalar orqali avtomatik davomat, real vaqt hisobotlar va filiallarni markazlashgan boshqaruv.
          </p>
          <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap', marginBottom:'64px' }}>
            <button onClick={openLogin} style={{
              background:'rgba(255,255,255,0.95)', border:'none', borderRadius:'14px',
              padding:'15px 32px', color:'#0a3fa8', fontSize:'16px', fontWeight:700, cursor:'pointer',
              boxShadow:'0 8px 32px rgba(0,0,0,0.2)', transition:'all 0.2s',
            }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 12px 40px rgba(0,0,0,0.3)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 8px 32px rgba(0,0,0,0.2)'}}
            >Bepul boshlash →</button>
            <a href="#tariflar" style={{
              display:'flex', alignItems:'center', gap:'8px',
              background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'14px',
              padding:'15px 28px', color:'white', fontSize:'16px', fontWeight:600, textDecoration:'none',
              backdropFilter:'blur(10px)', transition:'all 0.2s',
            }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.14)'}
              onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.08)'}
            >Tariflarni ko'rish</a>
          </div>

          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'1px', background:'rgba(255,255,255,0.12)', borderRadius:'20px', overflow:'hidden', border:'1px solid rgba(255,255,255,0.15)' }}>
            {[
              { val:'100+',  label:'Xodim kuzatilmoqda' },
              { val:'99.9%', label:'Ishlash barqarorligi' },
              { val:'24/7',  label:'Real vaqt monitoring' },
              { val:'3 daq', label:"O'rnatish vaqti" },
            ].map(s => (
              <div key={s.label} style={{ padding:'24px 16px', background:'rgba(255,255,255,0.07)', textAlign:'center' }}>
                <div style={{ fontSize:'28px', fontWeight:800, color:'white', letterSpacing:'-1px' }}>{s.val}</div>
                <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', marginTop:'4px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IMKONIYATLAR ── */}
      <section style={{ position:'relative', zIndex:1, padding:'80px 24px' }}>
        <div style={W}>
          <div style={{ textAlign:'center', marginBottom:'52px' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:'50px', padding:'6px 16px', marginBottom:'16px' }}>
              <Zap size={12} color="#a78bfa"/>
              <span style={{ fontSize:'13px', color:'#c4b5fd', fontWeight:500 }}>Asosiy imkoniyatlar</span>
            </div>
            <h2 style={{ margin:'0 0 12px', fontSize:'clamp(26px,4vw,40px)', fontWeight:800, color:'white', letterSpacing:'-1px' }}>
              Hamma narsa bir joyda
            </h2>
            <p style={{ margin:0, fontSize:'16px', color:'rgba(255,255,255,0.4)', maxWidth:'440px', marginLeft:'auto', marginRight:'auto', lineHeight:1.7 }}>
              Kichik jamoadan tortib yirik korporatsiyagacha — har biri uchun qulay
            </p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:'16px' }}>
            {[
              { icon:Clock,      color:'#f97316', bg:'rgba(249,115,22,0.12)', border:'rgba(249,115,22,0.25)',
                title:'Kelish-ketish vaqti', desc:"Xodim kamera oldidan o'tishi bilan tizim avtomatik qayd etadi. Sekund aniqligida." },
              { icon:BarChart3,  color:'#a78bfa', bg:'rgba(167,139,250,0.12)', border:'rgba(167,139,250,0.25)',
                title:'Hisobot va statistika', desc:'Kunlik, haftalik, oylik hisobotlar. PDF yuklab olish va chop etish imkoniyati.' },
              { icon:Users,      color:'#38bdf8', bg:'rgba(56,189,248,0.12)', border:'rgba(56,189,248,0.25)',
                title:'Filiallarni boshqarish', desc:"Bir panelda barcha filiallar. Har bir bo'limning davomati alohida ko'rinadi." },
              { icon:ShieldCheck,color:'#4ade80', bg:'rgba(74,222,128,0.12)', border:'rgba(74,222,128,0.25)',
                title:'Face ID integratsiya', desc:"Hikvision kameralari bilan to'liq sinxronizatsiya. Parol, kartasiz — faqat yuz." },
              { icon:TrendingUp, color:'#fbbf24', bg:'rgba(251,191,36,0.12)', border:'rgba(251,191,36,0.25)',
                title:"Reyting va tahlil", desc:"Kim eng erta keladi? Kim ko'p ishlaydi? Ohirgi 7 ish kuni bo'yicha reyting." },
              { icon:CheckCircle2,color:'#f472b6',bg:'rgba(244,114,182,0.12)', border:'rgba(244,114,182,0.25)',
                title:"Ta'til va kasallik", desc:"Xodim ta'tilda yoki kasallikda ekanligini belgilash. Statistikaga avtomatik kiritiladi." },
            ].map(({ icon:Icon, color, bg, border, title, desc }, i) => (
              <div key={title} style={{
                background:'rgba(255,255,255,0.08)', border:`1px solid ${border}`,
                borderRadius:'20px', padding:'28px 24px',
                transition:'transform 0.25s, box-shadow 0.25s',
                animation:`cardIn 0.5s ${i*0.08}s both`,
              }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-5px)';e.currentTarget.style.boxShadow=`0 16px 48px ${color}22`}}
                onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none'}}
              >
                <div style={{ width:'48px', height:'48px', borderRadius:'14px', background:bg, border:`1.5px solid ${border}`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'18px' }}>
                  <Icon size={22} color={color}/>
                </div>
                <div style={{ fontSize:'17px', fontWeight:700, color:'white', marginBottom:'8px' }}>{title}</div>
                <div style={{ fontSize:'14px', color:'rgba(255,255,255,0.45)', lineHeight:1.7 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QANDAY ISHLAYDI ── */}
      <section style={{ position:'relative', zIndex:1, padding:'80px 24px', background:'rgba(0,20,80,0.25)' }}>
        <div style={W}>
          <div style={{ textAlign:'center', marginBottom:'52px' }}>
            <h2 style={{ margin:'0 0 12px', fontSize:'clamp(26px,4vw,38px)', fontWeight:800, color:'white', letterSpacing:'-1px' }}>
              Qanday ishlaydi?
            </h2>
            <p style={{ margin:0, fontSize:'16px', color:'rgba(255,255,255,0.4)' }}>3 qadamda ishga tushirish</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:'16px' }}>
            {[
              { n:'01', color:'#60a5fa', title:'Kamerani ulang', desc:"Hikvision Face ID kamerangizni davomatlar.uz:6610 manziliga HTTP Push qilib sozlang" },
              { n:'02', color:'#a78bfa', title:'Xodimlarni qo\'shing', desc:"Admin paneldan xodimlar ro'yxatini kiriting. Filial va lavozimlarni belgilang" },
              { n:'03', color:'#34d399', title:'Avtomatik nazorat', desc:"Endi hamma narsa o'zi ishlaydi. Kunlik hisobotlar, kechikish ogohlantirishlari — hammasi tayyor" },
            ].map(({ n, color, title, desc }) => (
              <div key={n} style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'20px', padding:'32px 24px', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:'-10px', right:'-10px', fontSize:'80px', fontWeight:900, color, opacity:0.06, lineHeight:1 }}>{n}</div>
                <div style={{ fontSize:'13px', fontWeight:700, color, marginBottom:'14px', letterSpacing:'2px' }}>QADAM {n}</div>
                <div style={{ fontSize:'18px', fontWeight:700, color:'white', marginBottom:'10px' }}>{title}</div>
                <div style={{ fontSize:'14px', color:'rgba(255,255,255,0.45)', lineHeight:1.7 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TARIFLAR ── */}
      <section id="tariflar" style={{ position:'relative', zIndex:1, padding:'80px 24px 60px', textAlign:'center' }}>
        <div style={W}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(251,191,36,0.12)', border:'1px solid rgba(251,191,36,0.3)', borderRadius:'50px', padding:'6px 16px', marginBottom:'16px' }}>
          <Zap size={12} color="#fbbf24"/>
          <span style={{ fontSize:'13px', color:'#fde68a', fontWeight:500 }}>Qulay narxlar</span>
        </div>
        <h2 style={{ margin:'0 0 12px', fontSize:'clamp(26px,4vw,40px)', fontWeight:800, color:'white', letterSpacing:'-1px' }}>
          Biznesingizga mos tarif
        </h2>
        <p style={{ margin:'0 0 48px', fontSize:'16px', color:'rgba(255,255,255,0.4)', maxWidth:'400px', marginLeft:'auto', marginRight:'auto', lineHeight:1.7 }}>
          Xodimlar soniga qarab eng qulay tarifni tanlang. Har oyda bekor qilish mumkin.
        </p>

        {/* 3 ta karta */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(290px, 1fr))', gap:'20px' }}>
          {[
            {
              icon: Zap,
              badge: null,
              name: "Boshlang'ich",
              desc: 'Kichik jamoa uchun ideal',
              price: '1 000 000',
              color: '#38bdf8',
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
              badge: '⭐ Eng mashhur',
              name: 'Biznes',
              desc: "O'rta tashkilotlar uchun",
              price: '2 500 000',
              color: '#fbbf24',
              gift: null,
              features: [
                '40 tagacha xodim',
                '5 tagacha filial boshqaruvi',
                'Face ID kamera integratsiya',
                'Real vaqt kuzatuv',
                'Kunlik + oylik hisobotlar & PDF',
                'Xodimlar bazasi (kadrlar)',
                "Ta'til va kasallik hisobi",
                "Haftalik jadval ko'rinishi",
                'Statistika va reytinglar',
                'Kechikish nazorati',
              ],
            },
            {
              icon: Building2,
              badge: '🎁 Sovg\'a bor',
              name: 'Korporativ',
              desc: 'Yirik tashkilotlar uchun',
              price: '4 000 000',
              color: '#34d399',
              gift: true,
              features: [
                '100 tagacha xodim',
                'Cheksiz filiallar boshqaruvi',
                'Face ID kamera — sotib olish shart emas',
                'Real vaqt kuzatuv',
                "To'liq hisobotlar paketi & PDF",
                'Xodimlar bazasi (kadrlar)',
                "Ta'til va kasallik hisobi",
                "Haftalik jadval ko'rinishi",
                'Statistika va reytinglar',
                'Kechikish nazorati',
                'Telegram xabarnomalar*',
                'Ustuvor texnik yordam',
              ],
            },
          ].map(({ icon: Icon, badge, name, desc, price, color, gift, features }, i) => (
            <div key={name}
              style={{
                position:'relative', overflow:'hidden',
                background:'rgba(255,255,255,0.09)',
                backdropFilter:'blur(20px)',
                border:`1.5px solid ${color}55`,
                borderRadius:'24px',
                padding:'28px 24px 24px',
                textAlign:'left',
                transition:'transform 0.25s, box-shadow 0.25s',
                animation:`cardIn 0.5s ${i*0.12}s both`,
                display:'flex', flexDirection:'column',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.boxShadow=`0 24px 64px ${color}44` }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none' }}
            >
              {/* Top color bar */}
              <div style={{ position:'absolute', top:0, left:0, right:0, height:'4px', background:`linear-gradient(90deg,${color},${color}66)`, borderRadius:'24px 24px 0 0' }}/>

              {/* Fon glow */}
              <div style={{ position:'absolute', top:'-40px', right:'-40px', width:'160px', height:'160px', borderRadius:'50%', background:color, opacity:0.07, filter:'blur(40px)', pointerEvents:'none' }}/>

              {/* Badge + Icon row */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'18px' }}>
                <div style={{ width:'46px', height:'46px', borderRadius:'14px', background:`${color}20`, border:`1.5px solid ${color}55`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon size={22} color={color}/>
                </div>
                {badge && (
                  <div style={{ background:`${color}22`, border:`1px solid ${color}55`, borderRadius:'50px', padding:'4px 12px', fontSize:'12px', color, fontWeight:700, whiteSpace:'nowrap' }}>
                    {badge}
                  </div>
                )}
              </div>

              {/* Name & desc */}
              <div style={{ fontSize:'22px', fontWeight:800, color:'white', marginBottom:'4px' }}>{name}</div>
              <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.45)', marginBottom:'20px' }}>{desc}</div>

              {/* Price */}
              <div style={{ marginBottom:'20px', paddingBottom:'20px', borderBottom:`1px solid ${color}22` }}>
                <div style={{ display:'flex', alignItems:'baseline', gap:'6px' }}>
                  <span style={{ fontSize:'36px', fontWeight:800, color:'white', letterSpacing:'-1.5px', lineHeight:1 }}>{price}</span>
                  <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.35)' }}>so'm / oy</span>
                </div>
                <div style={{ marginTop:'10px', display:'inline-flex', alignItems:'center', gap:'6px', background:`${color}18`, border:`1px solid ${color}33`, borderRadius:'50px', padding:'4px 12px' }}>
                  <Users size={12} color={color}/>
                  <span style={{ fontSize:'12px', color, fontWeight:600 }}>{features[0]}</span>
                </div>
              </div>

              {/* Features */}
              <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'9px', marginBottom:'20px' }}>
                {features.map(f => (
                  <div key={f} style={{ display:'flex', alignItems:'flex-start', gap:'10px' }}>
                    <div style={{ marginTop:'1px', width:'18px', height:'18px', borderRadius:'50%', background:`${color}20`, border:`1px solid ${color}44`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Check size={10} color={color} strokeWidth={3}/>
                    </div>
                    <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.75)', lineHeight:1.45 }}>{f}</span>
                  </div>
                ))}
              </div>

              {/* Gift banner */}
              {gift && (
                <div style={{ marginBottom:'16px', padding:'12px 14px', borderRadius:'14px', background:'rgba(52,211,153,0.1)', border:'1.5px solid rgba(52,211,153,0.35)', display:'flex', alignItems:'flex-start', gap:'10px' }}>
                  <span style={{ fontSize:'20px', lineHeight:1, flexShrink:0 }}>🎁</span>
                  <div>
                    <div style={{ fontSize:'13px', fontWeight:700, color:'#34d399', marginBottom:'2px' }}>Sovg'a!</div>
                    <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.6)', lineHeight:1.5 }}>6 oylik shartnoma tuzganda — Face ID qurilmasi <strong style={{ color:'white' }}>bepul beriladi</strong></div>
                  </div>
                </div>
              )}

              {/* CTA */}
              <button onClick={openLogin} style={{
                width:'100%', padding:'13px', borderRadius:'14px',
                background: color,
                border:'none',
                color: name === 'Biznes' ? '#1a1a00' : '#fff',
                fontSize:'14px', fontWeight:700, cursor:'pointer',
                transition:'opacity 0.2s, transform 0.15s',
                boxShadow:`0 6px 24px ${color}44`,
              }}
                onMouseEnter={e => { e.currentTarget.style.opacity='0.88'; e.currentTarget.style.transform='scale(0.99)' }}
                onMouseLeave={e => { e.currentTarget.style.opacity='1'; e.currentTarget.style.transform='scale(1)' }}
              >
                Boshlash →
              </button>
            </div>
          ))}
        </div>

        <p style={{ marginTop:'32px', fontSize:'12px', color:'rgba(255,255,255,0.2)' }}>
          * Telegram xabarnomalar — tez orada · Barcha narxlar QQS siz · Korporativ tarifda 6 oylik shartnoma talab qilinadi
        </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ position:'relative', zIndex:1, padding:'80px 24px', textAlign:'center' }}>
        <div style={{ ...W, background:'rgba(255,255,255,0.09)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.18)', borderRadius:'28px', padding:'60px 40px' }}>
          <h2 style={{ margin:'0 0 14px', fontSize:'clamp(24px,4vw,38px)', fontWeight:800, color:'white', letterSpacing:'-1px' }}>
            Bugun boshlang — bepul sinab ko'ring
          </h2>
          <p style={{ margin:'0 0 32px', fontSize:'16px', color:'rgba(255,255,255,0.45)', lineHeight:1.7 }}>
            Sozlash 3 daqiqa. Kamera ulang, xodim qo'shing — tizim o'zi ishlaydi.
          </p>
          <button onClick={openLogin} style={{
            background:'rgba(255,255,255,0.95)', border:'none', borderRadius:'14px',
            padding:'16px 40px', color:'#0a3fa8', fontSize:'16px', fontWeight:700, cursor:'pointer',
            boxShadow:'0 8px 32px rgba(0,0,0,0.2)', transition:'all 0.2s',
          }}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 12px 40px rgba(0,0,0,0.3)'}}
            onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 8px 32px rgba(0,0,0,0.2)'}}
          >
            Tizimga kirish →
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ position:'relative', zIndex:1, borderTop:'1px solid rgba(255,255,255,0.12)', padding:'28px 24px', background:'rgba(0,20,80,0.2)' }}>
        <div style={{ ...W, display:'flex', flexWrap:'wrap', justifyContent:'space-between', alignItems:'center', gap:'16px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <CheckCircle size={16} color="#3b82f6"/>
            <span style={{ fontSize:'14px', fontWeight:600, color:'rgba(255,255,255,0.5)' }}>Davomatlar.uz</span>
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', justifyContent:'center' }}>
            {[
              { icon: Send,   text:'@acsham',                           href:'https://t.me/acsham' },
              { icon: Phone,  text:'+998 90-873-89-63',                 href:'tel:+998908738963' },
              { icon: MapPin, text:"Toshkent sh, Olmazor Qamarniso 13", href:null },
            ].map(({ icon: Icon, text, href }) => {
              const inner = (
                <div style={{ display:'flex', alignItems:'center', gap:'7px', padding:'7px 14px', borderRadius:'50px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', fontSize:'13px', color:'rgba(255,255,255,0.55)', whiteSpace:'nowrap', transition:'all 0.2s' }}
                  onMouseEnter={e => {e.currentTarget.style.background='rgba(255,255,255,0.1)'; e.currentTarget.style.color='rgba(255,255,255,0.85)'}}
                  onMouseLeave={e => {e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='rgba(255,255,255,0.55)'}}
                >
                  <Icon size={13}/>{text}
                </div>
              )
              return href
                ? <a key={text} href={href} target="_blank" rel="noreferrer" style={{ textDecoration:'none' }}>{inner}</a>
                : <div key={text}>{inner}</div>
            })}
          </div>
          <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.2)' }}>© 2026 Davomatlar.uz</div>
        </div>
      </footer>

      <style>{`
        @keyframes spin   { to { transform: rotate(360deg) } }
        @keyframes cardIn { from{ opacity:0; transform:translateY(20px) } to{ opacity:1; transform:translateY(0) } }
        input::placeholder { color: #94a3b8 }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  )
}
