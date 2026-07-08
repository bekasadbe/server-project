import { useState, useRef, useEffect } from 'react'
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'

const GRACE_STEPS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]
const DAY_LABELS = [
  { val: '1', label: 'Du' }, { val: '2', label: 'Se' }, { val: '3', label: 'Cho' },
  { val: '4', label: 'Pa' }, { val: '5', label: 'Ju' }, { val: '6', label: 'Sha' },
  { val: '0', label: 'Yak' },
]

function addMin(t, min) {
  const [h, m] = t.split(':').map(Number)
  const total = h * 60 + m + min
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

/* Bir qator: chapda nom+izoh, o'ngda boshqaruv */
function Row({ label, hint, children, last }) {
  return (
    <div className={`flex items-center justify-between gap-6 py-4 px-5 ${!last ? 'border-b border-slate-100' : ''}`}>
      <div className="min-w-0">
        <div className="text-[13.5px] font-medium text-slate-700">{label}</div>
        {hint && <div className="text-[12px] text-slate-400 mt-0.5 leading-snug max-w-sm">{hint}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function GroupLabel({ children }) {
  return <div className="text-[11px] font-semibold text-slate-400 tracking-wide uppercase px-1 mb-2 mt-6 first:mt-0">{children}</div>
}

function TimeInput({ refEl, value, onChange }) {
  return (
    <div className="relative inline-flex">
      <button onClick={() => refEl.current?.showPicker()}
        className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 text-[13px] font-mono font-semibold cursor-pointer hover:bg-slate-200/70 transition-colors tabular-nums">
        {value}
      </button>
      <input ref={refEl} type="time" value={value} onChange={e => onChange(e.target.value)}
        className="absolute opacity-0 pointer-events-none w-px h-px"/>
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
  const [saved, setSaved]           = useState(false)
  const [error, setError]           = useState('')

  const startRef  = useRef(null)
  const finishRef = useRef(null)
  const beginRef  = useRef(null)

  // "Dirty" — joriy qiymatlar saqlangan qiymatlardan farqli bo'lsa (autofill kabi soxta triggerlardan himoya)
  const origLogin      = group?.login || ''
  const origPass       = group?.password || ''
  const origWorkStart  = group?.work_start || '09:00'
  const origWorkFinish = group?.work_finish || '18:00'
  const origWorkBegin  = group?.work_begin || '06:00'
  const origWorkDays   = (group?.work_days || '1,2,3,4,5,6').split(',').filter(Boolean).sort().join(',')
  const origGrace      = group?.grace_minutes ?? 0

  const dirty = !!group && (
    login !== origLogin ||
    pass !== origPass ||
    workStart !== origWorkStart ||
    workFinish !== origWorkFinish ||
    workBegin !== origWorkBegin ||
    [...workDays].sort().join(',') !== origWorkDays ||
    Number(grace) !== Number(origGrace)
  )

  useEffect(() => { onDirtyChange?.(dirty) }, [dirty])

  const resetForm = () => {
    if (!group) return
    setLogin(origLogin); setPass(origPass)
    setWorkStart(origWorkStart); setWorkFinish(origWorkFinish)
    setWorkBegin(origWorkBegin)
    setWorkDays(origWorkDays.split(',').filter(Boolean))
    setGrace(origGrace)
    setError('')
  }

  useEffect(() => {
    if (group) {
      setLogin(group.login || ''); setPass(group.password || '')
      setWorkStart(group.work_start || '09:00'); setWorkFinish(group.work_finish || '18:00')
      setWorkBegin(group.work_begin || '06:00')
      setWorkDays((group.work_days || '1,2,3,4,5,6').split(',').filter(Boolean))
      setGrace(group.grace_minutes ?? 0)
    }
  }, [group?.id])

  const toggleDay = (val) => {
    setWorkDays(prev => prev.includes(val) ? prev.filter(d => d !== val) : [...prev, val])
  }

  const cycleGrace = (dir) => {
    const idx = GRACE_STEPS.indexOf(Number(grace))
    const next = dir === 1 ? Math.min(idx + 1, GRACE_STEPS.length - 1) : Math.max(idx - 1, 0)
    setGrace(GRACE_STEPS[next])
  }

  const handleSave = () => {
    if (!login.trim()) return setError('Login kiriting')
    if (!pass.trim())  return setError('Parol kiriting')
    if (workDays.length === 0) return setError('Kamida 1 ish kuni tanlang')
    onUpdateGroup(group.id, { login: login.trim(), password: pass.trim(), work_start: workStart, work_finish: workFinish, work_begin: workBegin, work_days: workDays.join(','), grace_minutes: grace })
    setError(''); setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const inputCls = "w-52 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-[13px] outline-none focus:border-slate-400 focus:bg-white transition-colors"
  const lateTime = grace > 0 ? addMin(workStart, grace) : null

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-[19px] font-bold text-slate-900 m-0">Sozlamalar</h1>
          <p className="text-[13px] text-slate-400 mt-0.5 mb-0">{group?.name}</p>
        </div>
        {dirty && (
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-amber-600 font-medium">Saqlanmagan o'zgarishlar</span>
            <button onClick={resetForm}
              className="text-[12px] text-slate-400 underline decoration-dotted underline-offset-2 bg-transparent border-none cursor-pointer hover:text-slate-600">
              bekor qilish
            </button>
          </div>
        )}
      </div>

      <div className="max-w-2xl">

        <GroupLabel>Ish jadvali</GroupLabel>
        <div className="bg-white rounded-xl border border-slate-200">
          <Row label="Ish boshlanishi" hint="Xodimlar shu vaqtda ishga kelishi kerak">
            <TimeInput refEl={startRef} value={workStart} onChange={setWorkStart}/>
          </Row>
          <Row label="Ish tugashi">
            <TimeInput refEl={finishRef} value={workFinish} onChange={setWorkFinish}/>
          </Row>
          <Row label="Kechikish muhlati" hint={lateTime ? `${lateTime} gacha kelganlar o'z vaqtida hisoblanadi` : "Belgilanmagan — aniq vaqtdan keyin kechikish"}>
            <div className="flex items-center gap-0.5">
              <button onClick={() => cycleGrace(-1)} disabled={grace===0}
                className={`w-7 h-7 rounded-md border border-slate-200 bg-white flex items-center justify-center text-[13px] ${grace===0?'text-slate-200 cursor-not-allowed':'text-slate-500 cursor-pointer hover:bg-slate-50'}`}>−</button>
              <span className="w-16 text-center text-[13px] font-mono font-semibold text-slate-700 tabular-nums">
                {grace === 0 ? "yo'q" : `+${grace}d`}
              </span>
              <button onClick={() => cycleGrace(1)} disabled={grace===60}
                className={`w-7 h-7 rounded-md border border-slate-200 bg-white flex items-center justify-center text-[13px] ${grace===60?'text-slate-200 cursor-not-allowed':'text-slate-500 cursor-pointer hover:bg-slate-50'}`}>+</button>
            </div>
          </Row>
          <Row label="Kelish hisobi boshlanadi" hint="Bu vaqtdan oldingi kirishlar hisobga olinmaydi" last>
            <TimeInput refEl={beginRef} value={workBegin} onChange={setWorkBegin}/>
          </Row>
        </div>

        <GroupLabel>Ish kunlari</GroupLabel>
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex gap-1.5">
              {DAY_LABELS.map(({ val, label }) => {
                const active = workDays.includes(val)
                return (
                  <button key={val} onClick={() => toggleDay(val)}
                    className={`w-9 h-9 rounded-lg text-[12px] font-semibold cursor-pointer transition-colors border ${active ? 'bg-brand-50 border-brand-300 text-brand-600' : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'}`}>
                    {label}
                  </button>
                )
              })}
            </div>
            <span className="text-[12px] text-slate-400">{workDays.length}/7 kun</span>
          </div>
        </div>

        <GroupLabel>Kirish ma'lumotlari</GroupLabel>
        <div className="bg-white rounded-xl border border-slate-200">
          <Row label="Login">
            <input value={login} autoComplete="off" onChange={e => { setLogin(e.target.value); setError('') }} className={inputCls}/>
          </Row>
          <Row label="Parol" last>
            <div className="relative w-52">
              <input type={showPass ? 'text' : 'password'} value={pass} autoComplete="new-password"
                onChange={e => { setPass(e.target.value); setError('') }}
                className={`${inputCls} w-full pr-9`}/>
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-slate-400 hover:text-slate-600 flex transition-colors">
                {showPass ? <EyeOff size={14}/> : <Eye size={14}/>}
              </button>
            </div>
          </Row>
        </div>

        {error && (
          <div className="flex items-center gap-2 mt-4 px-4 py-2.5 bg-rose-50 rounded-lg text-rose-600 text-[13px] font-medium">
            <AlertCircle size={14}/> {error}
          </div>
        )}
        {saved && (
          <div className="flex items-center gap-2 mt-4 px-4 py-2.5 bg-emerald-50 rounded-lg text-emerald-700 text-[13px] font-medium">
            <CheckCircle2 size={14}/> Saqlandi
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6">
          {dirty && (
            <button onClick={resetForm}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-[13px] font-medium cursor-pointer hover:bg-slate-50 transition-colors">
              Bekor qilish
            </button>
          )}
          <button onClick={handleSave}
            className="px-5 py-2 bg-brand-600 border-none rounded-lg text-white text-[13px] font-semibold cursor-pointer hover:bg-brand-700 transition-colors">
            Saqlash
          </button>
        </div>
      </div>
    </div>
  )
}
