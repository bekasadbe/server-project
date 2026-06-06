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
          <h1 style={{ margin:0, fontSize:'22px', fontWeight:700, color:'#f1f5f9', display:'flex', alignItems:'center', gap:'10px' }}>
            <FileBarChart2 size={22} color="#6366f1" /> Hisobotlar
          </h1>
          <p style={{ margin:'4px 0 0', fontSize:'13px', color:'#64748b' }}>Oylik va haftalik tahlil</p>
        </div>
        <button style={{
          display:'flex', alignItems:'center', gap:'8px',
          padding:'9px 18px', borderRadius:'9px',
          background:'#161b27', border:'1px solid #1e2535',
          color:'#a5b4fc', fontSize:'14px', fontWeight:600, cursor:'pointer'
        }}>
          <Download size={16} /> PDF yuklab olish
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
        {/* Chiziqli grafik */}
        <div style={{ background:'#161b27', borderRadius:'14px', border:'1px solid #1e2535', padding:'20px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'20px' }}>
            <Calendar size={16} color="#6366f1" />
            <span style={{ fontWeight:600, fontSize:'14px', color:'#f1f5f9' }}>Iyun oyi — kunlik kelganlar</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" />
              <XAxis dataKey="day" stroke="#334155" tick={{ fill:'#64748b', fontSize:12 }} />
              <YAxis stroke="#334155" tick={{ fill:'#64748b', fontSize:12 }} />
              <Tooltip contentStyle={{ background:'#1e2535', border:'1px solid #334155', borderRadius:'8px', color:'#f1f5f9' }} />
              <Line type="monotone" dataKey="keldi" stroke="#6366f1" strokeWidth={2} dot={{ fill:'#6366f1', r:4 }} name="Keldi" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Ko'p kechikkanlar */}
        <div style={{ background:'#161b27', borderRadius:'14px', border:'1px solid #1e2535', padding:'20px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'20px' }}>
            <span style={{ fontWeight:600, fontSize:'14px', color:'#f1f5f9' }}>⚠️ Ko'p kechikkanlar (iyun)</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {topLate.map((emp, i) => (
              <div key={i} style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'12px 16px', background:'#0f1117', borderRadius:'10px',
                border:'1px solid #1e2535'
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                  <div style={{
                    width:'32px', height:'32px', borderRadius:'8px',
                    background: i===0 ? '#ef444420' : '#f59e0b18',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'14px', fontWeight:700,
                    color: i===0 ? '#ef4444' : '#f59e0b'
                  }}>{i+1}</div>
                  <span style={{ fontSize:'14px', color:'#e2e8f0' }}>{emp.name}</span>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:'13px', fontWeight:600, color:'#f59e0b' }}>{emp.count} marta</div>
                  <div style={{ fontSize:'12px', color:'#475569' }}>o'rtacha {emp.avg}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tashkilot solishtiruv */}
        <div style={{ background:'#161b27', borderRadius:'14px', border:'1px solid #1e2535', padding:'20px', gridColumn:'1/-1' }}>
          <div style={{ fontWeight:600, fontSize:'14px', color:'#f1f5f9', marginBottom:'16px' }}>📊 Tashkilotlar bo'yicha taqqoslash</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            {[
              { org:'Inno Texnopark', color:'#6366f1', keldi:26, kelmadi:4, kech:5 },
              { org:'Milliy Offis',   color:'#06b6d4', keldi:20, kelmadi:4, kech:3 },
            ].map(o => (
              <div key={o.org} style={{ padding:'16px', background:'#0f1117', borderRadius:'10px', border:`1px solid ${o.color}30` }}>
                <div style={{ fontSize:'14px', fontWeight:700, color:o.color, marginBottom:'12px' }}>{o.org}</div>
                <div style={{ display:'flex', gap:'16px' }}>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:'24px', fontWeight:700, color:'#22c55e' }}>{o.keldi}</div>
                    <div style={{ fontSize:'12px', color:'#64748b' }}>Keldi</div>
                  </div>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:'24px', fontWeight:700, color:'#f59e0b' }}>{o.kech}</div>
                    <div style={{ fontSize:'12px', color:'#64748b' }}>Kech</div>
                  </div>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:'24px', fontWeight:700, color:'#ef4444' }}>{o.kelmadi}</div>
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
