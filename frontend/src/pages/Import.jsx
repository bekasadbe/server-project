import { useState, useRef } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { API_URL, TOKEN } from '../config'

export default function Import() {
  const [file, setFile]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  const handleFile = (f) => {
    if (!f) return
    setFile(f)
    setResult(null)
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true); setResult(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const res  = await fetch(`${API_URL}/import/csv`, {
        method: 'POST',
        headers: { 'X-API-Token': TOKEN },
        body: form,
      })
      const data = await res.json()
      setResult(data)
    } catch (e) {
      setResult({ ok: false, error: 'Serverga ulanishda xatolik' })
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-[19px] font-bold text-slate-900 m-0">Ma'lumot import</h1>
        <p className="text-[13px] text-slate-400 mt-1 mb-0">Hikvision CSV hisobotidan davomat ma'lumotlarini bazaga yuklash</p>
      </div>

      {/* Instruction */}
      <div className="flex gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl mb-5">
        <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-[13px] text-blue-700 leading-relaxed">
          <div className="font-semibold mb-1">CSV fayl talablari:</div>
          <div>Hikvision → Hisobot → First/Last Access Records → Export qilingan CSV fayl</div>
          <div className="mt-1 text-blue-500">Kerakli ustunlar: <code className="bg-blue-100 px-1 rounded">Person ID</code>, <code className="bg-blue-100 px-1 rounded">Date</code>, <code className="bg-blue-100 px-1 rounded">First-In</code>, <code className="bg-blue-100 px-1 rounded">Last-Out</code></div>
          <div className="mt-1 text-blue-500">⚠ Faqat bazada mavjud xodimlar (Person ID) import qilinadi</div>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${dragOver ? 'border-brand-400 bg-brand-50' : file ? 'border-green-300 bg-green-50' : 'border-slate-200 bg-slate-50 hover:border-brand-300 hover:bg-brand-50/50'}`}
      >
        <input ref={inputRef} type="file" accept=".csv,.txt" className="hidden" onChange={e => handleFile(e.target.files[0])} />
        {file ? (
          <>
            <FileText size={32} className="mx-auto mb-3 text-green-500" />
            <div className="text-[15px] font-semibold text-green-700">{file.name}</div>
            <div className="text-[12px] text-green-500 mt-1">{(file.size / 1024).toFixed(1)} KB — faylni almashtirish uchun bosing</div>
          </>
        ) : (
          <>
            <Upload size={32} className="mx-auto mb-3 text-slate-400" />
            <div className="text-[15px] font-semibold text-slate-600">CSV faylni bu yerga tashlang</div>
            <div className="text-[13px] text-slate-400 mt-1">yoki bosib tanlang</div>
          </>
        )}
      </div>

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="mt-4 w-full py-3 bg-brand-600 border-none rounded-xl text-white text-[15px] font-semibold cursor-pointer hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? 'Yuklanmoqda…' : 'Bazaga import qilish'}
      </button>

      {/* Result */}
      {result && (
        <div className={`mt-5 p-5 rounded-2xl border ${result.ok ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          {result.ok ? (
            <>
              <div className="flex items-center gap-2 text-green-700 font-semibold text-[15px] mb-3">
                <CheckCircle size={18} /> Import muvaffaqiyatli yakunlandi
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">{result.inserted}</div>
                  <div className="text-[12px] text-slate-500 mt-0.5">Yozuv qo'shildi</div>
                </div>
                <div className="bg-white rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-slate-400">{result.skipped}</div>
                  <div className="text-[12px] text-slate-500 mt-0.5">O'tkazib yuborildi</div>
                </div>
              </div>
              {result.errors?.length > 0 && (
                <div className="mt-3">
                  <div className="text-[12px] font-semibold text-amber-600 mb-1.5">Ogohlantirishlar:</div>
                  {result.errors.map((e, i) => (
                    <div key={i} className="text-[12px] text-amber-700 py-0.5">{e}</div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle size={16} /> {result.error || 'Xatolik yuz berdi'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
