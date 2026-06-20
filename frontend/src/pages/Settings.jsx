import { useState, useRef, useEffect } from 'react'
import { Settings2, Eye, EyeOff, Clock, Key, Save, CalendarDays, AlertCircle } from 'lucide-react'

const GRACE_STEPS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]

function GracePicker({ value, onChange, workStart }) {
  const v   = Number(value)
  const idx = GRACE_STEPS.indexOf(v)
  const prev = () => { if (idx > 0) onChange(GRACE_STEPS[idx - 1]) }
  const next = () => { if (idx < GRACE_STEPS.length - 1) onChange(GRACE_STEPS[idx + 1]) }
  const onWheel = (e) => { e.preventDefault(); if (e.deltaY > 0) next(); else prev() }
  const addMin = (t, min) => {
    const [h, m] = t.split(':').map(Number)
    const total = h * 60 + m + min
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
  }
  const lateTime = v > 0 ? addMin(workStart, v) : null

  return (
    <div className="flex items-center gap-3.5 flex-wrap">
      <div className="flex items-center gap-1.5">
        <button onClick={prev} disabled={idx === 0}
          className={`w-8 h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-lg transition-colors ${idx === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 cursor-pointer hover:bg-slate-100'}`}>‹</button>
        <div onWheel={onWheel}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-50 border-2 border-brand-200 rounded-xl text-brand-600 text-[17px] font-bold min-w-[100px] justify-center select-none cursor-ns-resize">
          <Clock size={16}/> {v === 0 ? "Yo'q" : `+${v} min`}
        </div>
        <button onClick={next} disabled={idx === GRACE_STEPS.length - 1}
          className={`w-8 h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-lg transition-colors ${idx === GRACE_STEPS.length - 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 cursor-pointer hover:bg-slate-100'}`}>›</button>
      </div>
      {lateTime
        ? <p className="text-[13px] text-slate-500 m-0">→ <strong className="text-brand-600 text-[15px]">{lateTime}</strong> gacha kelganlar <strong className="text-green-600">O'z vaqtida</strong></p>
        : <p className="text-[13px] text-slate-400 m-0">Muhdat yo'q</p>}
    </div>
  )
}

const DAY_LABELS = [
  { val: '1', label: 'Du' }, { val: '2', label: 'Se' }, { val: '3', label: 'Cho' },
  { val: '4', label: 'Pa' }, { val: '5', label: 'Ju' }, { val: '6', label: 'Sha' },
  { val: '0', label: 'Yak' },
]

function Card({ icon, title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <span className="font-bold text-[15px] text-slate-900">{title}</span>
      </div>
      {children}
    </div>
  )
}

export default function Settings({ group, onUpdateGroup, onDirtyChange }) {
  const [login, setLogin]           = useState(group?.login       || '')
  const [pass, setPass]             = useState(group?.password    || '')
  const [showPass, setShowPass]     = useState(false)
  const [workStart, setWorkStart]   = useState(group?.work_start  || '09:00')
  const [workFinish, setWorkFinish] = useState(group?.work_finish || '18:00')
  const [workBegin, setWorkBegin]   = useState(group?.work_begin  || '06:00')
  const [workDays, setWorkDays]     = useState((group?.work_days || '1,2,3,4,5,6').split(',').filter(Boolean))
  const [grace, setGrace]           = useState(group?.grace_minutes ?? 0)
  const [dirty, setDirty]           = useState(false)
  const [saved, setSaved]           = useState(false)
  const [error, setError]           = useState('')

  const startRef  = useRef(null)
  const finishRef = useRef(null)
  const beginRef  = useRef(null)

  const mark = (setter) => (val) => { setter(val); setDirty(true); onDirtyChange?.(true) }

  useEffect(() => {
    if (group) {
      setLogin(group.login || ''); setPass(group.password || '')
      setWorkStart(group.work_start || '09:00'); setWorkFinish(group.work_finish || '18:00')
      setWorkBegin(group.work_begin || '06:00')
      setWorkDays((group.work_days || '1,2,3,4,5,6').split(',').filter(Boolean))
      setGrace(group.grace_minutes ?? 0); setDirty(false); onDirtyChange?.(false)
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
    onUpdateGroup(group.id, { login: login.trim(), password: pass.trim(), work_start: workStart, work_finish: workFinish, work_begin: workBegin, work_days: workDays.join(','), grace_minutes: grace })
    setError(''); setDirty(false); onDirtyChange?.(false); setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const TimeBtn = ({ refEl, value, onChange, colorClass, bgClass, borderClass }) => (
    <div className="relative inline-flex items-center">
      <button onClick={() => refEl.current?.showPicker()}
        className={`flex items-center gap-2 px-5 py-2.5 border-2 rounded-xl text-[17px] font-bold cursor-pointer tracking-wide ${colorClass} ${bgClass} ${borderClass} hover:opacity-90 transition-opacity`}>
        <Clock size={16}/> {value}
      </button>
      <input ref={refEl} type="time" value={value} onChange={e => onChange(e.target.value)}
        className="absolute opacity-0 pointer-events-none w-px h-px"/>
    </div>
  )

  const inputCls = "w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-[14px] outline-none focus:border-brand-400 transition-colors"

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="flex items-center gap-2.5 text-[22px] font-bold text-slate-900 m-0">
            <Settings2 size={22} className="text-brand-600"/> Sozlamalar
          </h1>
          <p className="text-[13px] text-slate-400 mt-1 mb-0">{group?.name}</p>
        </div>
        {dirty && (
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-yellow-50 border border-yellow-300 rounded-xl text-[13px] text-yellow-800 font-medium">
            <AlertCircle size={14}/> Saqlanmagan o'zgarishlar
          </div>
        )}
      </div>

      <div className="max-w-xl flex flex-col gap-4">

        {/* 1. Ish vaqti */}
        <Card icon={<Clock size={17} className="text-brand-600"/>} title="Ish vaqti">
          <div className="flex items-center gap-4 flex-wrap mb-5">
            <div>
              <p className="text-[11px] text-slate-400 font-bold tracking-wider uppercase mb-2 m-0">BOSHLANISH</p>
              <TimeBtn refEl={startRef} value={workStart} onChange={mark(setWorkStart)} colorClass="text-brand-600" bgClass="bg-brand-50" borderClass="border-brand-200"/>
            </div>
            <span className="text-slate-300 text-xl mt-5">→</span>
            <div>
              <p className="text-[11px] text-slate-400 font-bold tracking-wider uppercase mb-2 m-0">TUGASH</p>
              <TimeBtn refEl={finishRef} value={workFinish} onChange={mark(setWorkFinish)} colorClass="text-green-700" bgClass="bg-green-50" borderClass="border-green-200"/>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-4">
            <p className="text-[13px] text-slate-500 mb-3.5">
              <strong className="text-slate-800">Kechikish muhlati</strong> — boshlanishdan keyin shu daqiqagacha kelganlar <strong className="text-green-600">O'z vaqtida</strong> hisoblanadi
            </p>
            <GracePicker value={grace} onChange={v => mark(setGrace)(v)} workStart={workStart}/>
          </div>
        </Card>

        {/* 2. Kelish hisobi boshlanadi */}
        <Card icon={<Clock size={17} className="text-purple-600"/>} title="Kelish hisobi boshlanadi">
          <p className="text-[13px] text-slate-500 mb-4 m-0">
            Shu vaqtdan <strong>oldin</strong> kelgan eventlar hisoblanmaydi — kechasi kech qolganlar ertasi kuni keldi deb ko'rinmasin
          </p>
          <TimeBtn refEl={beginRef} value={workBegin} onChange={mark(setWorkBegin)} colorClass="text-purple-600" bgClass="bg-purple-50" borderClass="border-purple-200"/>
        </Card>

        {/* 3. Ish kunlari */}
        <Card icon={<CalendarDays size={17} className="text-brand-600"/>} title="Ish kunlari">
          <p className="text-[13px] text-slate-500 mb-4 m-0">Belgilangan kunlar ish kuni hisoblanadi. Dam olish kunlari statistikada chiqarib tashlanadi</p>
          <div className="flex gap-2 flex-wrap">
            {DAY_LABELS.map(({ val, label }) => {
              const active = workDays.includes(val)
              return (
                <button key={val} onClick={() => toggleDay(val)}
                  className={`w-12 h-12 rounded-xl border-2 text-[13px] font-medium cursor-pointer transition-all ${active ? 'border-brand-600 bg-brand-600 text-white font-bold' : 'border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-300'}`}>
                  {label}
                </button>
              )
            })}
          </div>
          <p className="text-[12px] text-slate-400 mt-3 mb-0">{workDays.length} kun tanlangan</p>
        </Card>

        {/* 4. Login va parol */}
        <Card icon={<Key size={17} className="text-brand-600"/>} title="Login va parol">
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-[12px] text-slate-500 font-semibold block mb-1.5">Login</label>
              <input value={login} onChange={e => { mark(setLogin)(e.target.value); setError('') }} className={inputCls}/>
            </div>
            <div>
              <label className="text-[12px] text-slate-500 font-semibold block mb-1.5">Parol</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={pass}
                  onChange={e => { mark(setPass)(e.target.value); setError('') }}
                  className={`${inputCls} pr-10`}/>
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-slate-400 flex">
                  {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>
          </div>
        </Card>

        {error && <div className="px-3.5 py-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-[13px]">⚠️ {error}</div>}
        {saved  && <div className="px-3.5 py-2.5 bg-green-50 border border-green-200 rounded-xl text-green-700 text-[13px] font-semibold">✅ Saqlandi!</div>}

        <button onClick={handleSave}
          className={`flex items-center justify-center gap-2 py-3.5 border-none rounded-xl text-white text-[15px] font-semibold cursor-pointer transition-all ${dirty ? 'bg-green-600 hover:bg-green-700' : 'bg-brand-600 hover:bg-brand-700'}`}>
          <Save size={17}/> {dirty ? "O'zgarishlarni saqlash" : 'Saqlash'}
        </button>
      </div>
    </div>
  )
}
