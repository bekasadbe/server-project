import { useState } from 'react'
import { loginAsync } from '../auth'
import { Eye, EyeOff, CheckCircle2, Clock, Users, BarChart3, ShieldCheck } from 'lucide-react'

const FEATURES = [
  { icon: Clock,       text: 'Kelish-ketish vaqtini real vaqtda kuzatish' },
  { icon: Users,       text: "50+ xodimni bir tashkilotda boshqarish" },
  { icon: BarChart3,   text: 'Oylik statistika va reytinglar' },
  { icon: ShieldCheck, text: 'Face ID kamera integratsiyasi' },
]

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const user = await loginAsync(username, password)
    if (user) { onLogin(user) }
    else { setError("Login yoki parol noto'g'ri"); setLoading(false) }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">

      {/* Chap panel — brand */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] p-12 relative overflow-hidden" style={{ background: 'linear-gradient(145deg, #1a56db 0%, #1e429f 40%, #1a365d 100%)' }}>
        {/* Fon doiralari */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-30" style={{ background: '#3b82f6' }}/>
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-50" style={{ background: '#0f2460' }}/>
        <div className="absolute top-1/2 -right-16 w-64 h-64 rounded-full opacity-25" style={{ background: '#60a5fa' }}/>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl border flex items-center justify-center" style={{ background: 'rgba(96,165,250,0.3)', borderColor: 'rgba(147,197,253,0.5)' }}>
            <CheckCircle2 size={22} className="text-white"/>
          </div>
          <div>
            <div className="text-white font-bold text-[18px] leading-none">Davomatlar.uz</div>
            <div className="text-white/50 text-[12px] mt-0.5">Boshqaruv tizimi</div>
          </div>
        </div>

        {/* Hero matn */}
        <div className="relative z-10">
          <h1 className="text-white font-extrabold text-[38px] leading-tight mb-4">
            Xodimlar davomatini<br/>
            <span className="text-blue-300">nazorat qiling</span>
          </h1>
          <p className="text-blue-200/80 text-[15px] leading-relaxed mb-10 max-w-sm">
            Face ID qurilmalar bilan integratsiya, real vaqt hisobotlar va tashkilotlar bo'yicha boshqaruv.
          </p>

          <div className="flex flex-col gap-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(96,165,250,0.25)', border: '1px solid rgba(147,197,253,0.3)' }}>
                  <Icon size={15} className="text-blue-200"/>
                </div>
                <span className="text-blue-100 text-[14px]">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center gap-2 text-blue-300/50 text-[12px]">
          <CheckCircle2 size={12}/>
          davomatlar.uz · 2026
        </div>
      </div>

      {/* O'ng panel — login form */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 bg-slate-50">

        {/* Mobil logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
            <CheckCircle2 size={20} className="text-white"/>
          </div>
          <span className="font-bold text-[17px] text-slate-900">Davomatlar.uz</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-[26px] font-bold text-slate-900 mb-1">Kirish</h2>
            <p className="text-slate-400 text-[14px]">Login va parolni kiriting</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-[12px] text-slate-500 font-semibold block mb-1.5">Login</label>
              <input
                value={username}
                onChange={e => { setUsername(e.target.value); setError('') }}
                placeholder="admin"
                autoComplete="username"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-[14px] outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
              />
            </div>

            <div>
              <label className="text-[12px] text-slate-500 font-semibold block mb-1.5">Parol</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-11 bg-white border border-slate-200 rounded-xl text-slate-900 text-[14px] outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer flex">
                  {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-[13px]">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className={`w-full py-3 rounded-xl text-white text-[15px] font-bold border-none transition-all mt-1 ${loading ? 'bg-brand-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700 cursor-pointer'}`}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block"/>
                  Kirish...
                </span>
              ) : 'Kirish →'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-[12px] mt-8">
            Muammo bo'lsa —{' '}
            <a href="https://t.me/acsham" target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">@acsham</a>
          </p>
        </div>
      </div>
    </div>
  )
}
