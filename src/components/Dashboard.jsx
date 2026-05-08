import { useRef, useEffect } from 'react'
import { Chart, registerables } from 'chart.js'
import { useApp } from '../context/AppContext.jsx'

Chart.register(...registerables)

const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })

function StatCard({ color, value, label, sub, icon }) {
  return (
    <div className="sc">
      <div className="si" style={{ background: color + '18' }}>
        <svg width="20" height="20" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
          {icon}
        </svg>
      </div>
      <div className="sv">{value}</div>
      <div className="sl">{label}</div>
      {sub && <div style={{ fontSize:10, color:'var(--mu2)', marginTop:3 }}>{sub}</div>}
    </div>
  )
}

function BarChart({ transactions }) {
  const ref = useRef(null)
  const chart = useRef(null)
  useEffect(() => {
    if (!ref.current) return
    if (chart.current) chart.current.destroy()
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
    const inData = Array(7).fill(0), outData = Array(7).fill(0)
    transactions.forEach(t => {
      const d = new Date(t.date).getDay(), i = d === 0 ? 6 : d - 1
      if (t.type === 'IN') inData[i] += t.qty; else outData[i] += t.qty
    })
    chart.current = new Chart(ref.current, {
      type: 'bar',
      data: { labels: days, datasets: [
        { label:'Stock In',  data:inData,  backgroundColor:'#6EE7B7', borderRadius:5 },
        { label:'Stock Out', data:outData, backgroundColor:'#FCA5A5', borderRadius:5 },
      ]},
      options: { responsive:true, plugins:{ legend:{ labels:{ color:'#94A3B8', font:{ size:11 }, padding:12 } } }, scales: {
        x:{ ticks:{ color:'#9CA3AF', font:{ size:10 } }, grid:{ color:'rgba(0,0,0,.04)' } },
        y:{ ticks:{ color:'#9CA3AF', font:{ size:10 } }, grid:{ color:'rgba(0,0,0,.04)' } },
      }},
    })
    return () => chart.current?.destroy()
  }, [transactions])
  return <canvas ref={ref} />
}

function DonutChart({ products }) {
  const ref = useRef(null)
  const chart = useRef(null)
  useEffect(() => {
    if (!ref.current) return
    if (chart.current) chart.current.destroy()
    const cats = {}
    products.forEach(p => { cats[p.category] = (cats[p.category] || 0) + p.quantity })
    if (!Object.keys(cats).length) return
    chart.current = new Chart(ref.current, {
      type: 'doughnut',
      data: { labels: Object.keys(cats), datasets: [{ data: Object.values(cats), backgroundColor: ['#6EE7B7','#60A5FA','#A78BFA','#FBBF24','#F87171','#34D399'], borderWidth:0, hoverOffset:6 }] },
      options: { responsive:true, cutout:'65%', plugins:{ legend:{ position:'bottom', labels:{ color:'#6B7280', font:{ size:10 }, padding:14, boxWidth:10 } } } },
    })
    return () => chart.current?.destroy()
  }, [products])
  return <canvas ref={ref} />
}

export default function Dashboard({ setPage }) {
  const { products, transactions, stats } = useApp()
  const low    = products.filter(p => +p.quantity <= +p.lowStockAt)
  const recent = transactions.slice(0, 8)
  const stockValue = products.reduce((s, p) => s + (+(p.purchasePrice ?? 0)) * (+p.quantity), 0)

  return (
    <>
      <div className="g4">
        <StatCard color="#6EE7B7" value={stats.totalStock.toLocaleString()} label="Total Stock" sub="Units across all products"
          icon={<><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>}
        />
        <StatCard color="#F87171" value={stats.lowStock} label="Low Stock Items" sub={stats.lowStock > 0 ? 'Needs reorder' : 'All stocked up'}
          icon={<><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>}
        />
        <StatCard color="#60A5FA" value={fmt(stats.totalSales)} label="Total Sales" sub="All invoices combined"
          icon={<><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>}
        />
        <StatCard color="#A78BFA" value={fmt(stockValue)} label="Stock Value" sub="At purchase cost"
          icon={<><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>}
        />
      </div>

      {low.length > 0 && (
        <div className="al aw" style={{ marginBottom:16, flexWrap:'wrap', gap:6 }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" style={{ flexShrink:0, marginTop:1 }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <strong>Low Stock:</strong>
          {low.map(p => <span key={p.id} className="bge byw" style={{ margin:2 }}>{p.name} ({p.quantity})</span>)}
        </div>
      )}

      <div className="g31" style={{ marginBottom:16 }}>
        <div className="card">
          <div className="ctit">Stock Movement — This Week</div>
          <BarChart transactions={transactions} />
        </div>
        <div className="card">
          <div className="ctit">Stock by Category</div>
          <DonutChart products={products} />
        </div>
      </div>

      <div className="card">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <span className="ctit" style={{ margin:0 }}>Recent Activity</span>
          <button className="bgh" style={{ fontSize:11 }} onClick={() => setPage('transactions')}>View All →</button>
        </div>
        {recent.length === 0
          ? <div className="empty">
              <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
              <p>No transactions yet</p>
            </div>
          : recent.map(t => (
              <div key={t._id || t.id} className="ti">
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:34, height:34, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background: t.type === 'IN' ? 'rgba(110,231,183,.15)' : 'rgba(252,165,165,.15)' }}>
                    <svg width="14" height="14" fill="none" stroke={t.type === 'IN' ? '#16A34A' : '#DC2626'} strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round">
                      {t.type === 'IN' ? <path d="M12 19V5m-7 7 7-7 7 7"/> : <path d="M12 5v14m-7-7 7 7 7-7"/>}
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600 }}>{t.productName}</div>
                    <div style={{ fontSize:10, color:'var(--mu)', marginTop:1 }}>
                      {t.note || (t.type === 'IN' ? 'Stock added' : 'Stock removed')} · {new Date(t.date).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                    </div>
                  </div>
                </div>
                <span className={`bge ${t.type === 'IN' ? 'bgr' : 'brd'}`} style={{ flexShrink:0 }}>
                  {t.type === 'IN' ? '+' : '-'}{t.qty}
                </span>
              </div>
            ))
        }
      </div>
    </>
  )
}
