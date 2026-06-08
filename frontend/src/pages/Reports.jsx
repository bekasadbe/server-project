import { FileBarChart2, Download, Calendar } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const monthData = [
  { day:'1', keldi:40 }, { day:'2', keldi:38 }, { day:'3', keldi:42 },
  { day:'4', keldi:35 }, { day:'5', keldi:44 }, { day:'6', keldi:41 },
  { day:'7', keldi:39 }, { day:'8', keldi:43 }, { day:'9', keldi:37 },
  { day:'10', keldi:45 },
]

const topLate = [
  { name:'Maxamatov Xamidulla', count:8, avg:'42 daq.' },
  { name:"Ne'matov Asadbek",    count:5, avg:'12 daq.' },
  { name:'Baxtiyor Islomov',    count:4, avg:'18 daq.' },
  { name:'Toshmatov Shoxruh',   count:3, avg:'9 daq.'  },
]

export default function Reports() {
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
        <div>
          <h1 style={{ margin:0, fontSize:'22px', fontWeight:700, color:'#0f172a', display:'flex', alignItems:'center', gap:'10px' }}>
            <FileBarChart2 size={22} color="#2563eb" /> Hisobotlar
          </h1>
          <p style={{ margin:'4px 0 0', fontSize:'13px', color:'#94a3b8' }}>Oylik va haftalik tahlil</p>
        </div>
        <button style={{
          display:'flex', alignItems:'center', gap:'8px',
          padding:'9px 18px', borderRadius:'9px',
          background:'#ffffff', border:'1px solid #e2e8f0',
          color:'#2563eb', fontSize:'14px', fontWeight:600, cursor:'pointer',
          boxShadow:'0 1px 3px #0f172a08',
        }}>
          <Download size={16} /> PDF yuklab olish
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
        {/* Chiziqli grafik */}
        <div style={{ background:'#ffffff', borderRadius:'14px', border:'1px solid #e2e8f0', padding:'20px', boxShadow:'0 1px 3px #0f172a08' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'20px' }}>
            <Calendar size={16} color="#2563eb" />
            <span style={{ fontWeight:600, fontSize:'14px', color:'#0f172a' }}>Iyun oyi — kunlik kelganlar</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" stroke="#e2e8f0" tick={{ fill:'#94a3b8', fontSize:12 }} />
              <YAxis stroke="#e2e8f0" tick={{ fill:'#94a3b8', fontSize:12 }} />
              <Tooltip contentStyle={{ background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:'8px', color:'#0f172a', boxShadow:'0 4px 12px #0f172a10' }} />
              <Line type="monotone" dataKey="keldi" stroke="#2563eb" strokeWidth={2} dot={{ fill:'#2563eb', r:4 }} name="Keldi" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Ko'p kechikkanlar */}
        <div style={{ background:'#ffffff', borderRadius:'14px', border:'1px solid #e2e8f0', padding:'20px', boxShadow:'0 1px 3px #0f172a08' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'20px' }}>
            <span style={{ fontWeight:600, fontSize:'14px', color:'#0f172a' }}>Ko'p kechikkanlar (iyun)</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {topLate.map((emp, i) => (
              <div key={i} style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'12px 16px', background:'#f8fafc', borderRadius:'10px',
                border:'1px solid #f1f5f9'
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                  <div style={{
                    width:'32px', height:'32px', borderRadius:'8px',
                    background: i===0 ? '#fee2e2' : '#fef3c7',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'14px', fontWeight:700,
                    color: i===0 ? '#dc2626' : '#d97706'
                  }}>{i+1}</div>
                  <span style={{ fontSize:'14px', color:'#0f172a' }}>{emp.name}</span>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:'13px', fontWeight:600, color:'#d97706' }}>{emp.count} marta</div>
                  <div style={{ fontSize:'12px', color:'#94a3b8' }}>o'rtacha {emp.avg}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tashkilot solishtiruv */}
        <div style={{ background:'#ffffff', borderRadius:'14px', border:'1px solid #e2e8f0', padding:'20px', gridColumn:'1/-1', boxShadow:'0 1px 3px #0f172a08' }}>
          <div style={{ fontWeight:600, fontSize:'14px', color:'#0f172a', marginBottom:'16px' }}>Tashkilotlar bo'yicha taqqoslash</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            {[
              { org:'Inno Texnopark', color:'#2563eb', bg:'#eff6ff', keldi:26, kelmadi:4, kech:5 },
              { org:'Milliy Offis',   color:'#0891b2', bg:'#ecfeff', keldi:20, kelmadi:4, kech:3 },
            ].map(o => (
              <div key={o.org} style={{ padding:'16px', background:o.bg, borderRadius:'10px', border:`1px solid ${o.color}20` }}>
                <div style={{ fontSize:'14px', fontWeight:700, color:o.color, marginBottom:'12px' }}>{o.org}</div>
                <div style={{ display:'flex', gap:'16px' }}>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:'24px', fontWeight:700, color:'#16a34a' }}>{o.keldi}</div>
                    <div style={{ fontSize:'12px', color:'#64748b' }}>Keldi</div>
                  </div>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:'24px', fontWeight:700, color:'#d97706' }}>{o.kech}</div>
                    <div style={{ fontSize:'12px', color:'#64748b' }}>Kech</div>
                  </div>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:'24px', fontWeight:700, color:'#dc2626' }}>{o.kelmadi}</div>
                    <div style={{ fontSize:'12px', color:'#64748b' }}>Kelmadi</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
