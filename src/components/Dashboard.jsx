import { useRef, useEffect } from 'react'
import { Chart, registerables } from 'chart.js'
import { useApp } from '../context/AppContext.jsx'

Chart.register(...registerables)

const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })

function StatCard({ icon, label, value, color }) {
  return (
    <div className="sc">
      <div className="si" style={{ background: color + '20' }}>{icon}</div>
      <div className="sv">{value}</div>
      <div className="sl">{label}</div>
    </div>
  )
}

function BarChart({ transactions }) {
  const ref = useRef(null)
  const chart = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    if (chart.current) chart.current.destroy()
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const inData  = Array(7).fill(0)
    const outData = Array(7).fill(0)
    transactions.forEach(t => {
      const d = new Date(t.date).getDay()
      const i = d === 0 ? 6 : d - 1
      if (t.type === 'IN')  inData[i]  += t.qty
      else                  outData[i] += t.qty
    })
    chart.current = new Chart(ref.current, {
      type: 'bar',
      data: {
        labels: days,
        datasets: [
          { label: 'In',  data: inData,  backgroundColor: '#6EE7B7', borderRadius: 4 },
          { label: 'Out', data: outData, backgroundColor: '#60A5FA', borderRadius: 4 },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: '#94A3B8', font: { size: 10 } } } },
        scales: {
          x: { ticks: { color: '#64748B' }, grid: { color: '#2A2D3E' } },
          y: { ticks: { color: '#64748B' }, grid: { color: '#2A2D3E' } },
        },
      },
    })
    return () => chart.current?.destroy()
  }, [transactions])

  return <canvas ref={ref} />
}

function PieChart({ products }) {
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
      data: {
        labels: Object.keys(cats),
        datasets: [{ data: Object.values(cats), backgroundColor: ['#6EE7B7', '#60A5FA', '#A78BFA', '#FBBF24', '#F87171'], borderWidth: 0 }],
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: '#94A3B8', font: { size: 10 } } } },
      },
    })
    return () => chart.current?.destroy()
  }, [products])

  return <canvas ref={ref} />
}

export default function Dashboard() {
  const { products, transactions, stats } = useApp()
  const low = products.filter(p => p.quantity <= p.lowStockAt)
  const recent = [...transactions].reverse().slice(0, 6)

  return (
    <>
      <div className="g4">
        <StatCard icon="📦" label="Total Stock" value={stats.totalStock.toLocaleString()} color="#6EE7B7" />
        <StatCard icon="🔔" label="Low Stock"   value={stats.lowStock}                   color="#F87171" />
        <StatCard icon="💰" label="Total Sales"  value={fmt(stats.totalSales)}            color="#60A5FA" />
        <StatCard icon="🔄" label="Out / In"     value={`${stats.stockOut}/${stats.stockIn}`} color="#A78BFA" />
      </div>

      {low.length > 0 && (
        <div className="al aw" style={{ marginBottom: 16, flexWrap: 'wrap' }}>
          🔔 <strong>Low Stock:</strong>{' '}
          {low.map(p => (
            <span key={p.id} className="bge byw" style={{ margin: 2 }}>{p.name} ({p.quantity})</span>
          ))}
        </div>
      )}

      <div className="g31" style={{ marginBottom: 16 }}>
        <div className="card"><div className="ctit">Stock In vs Out</div><BarChart transactions={transactions} /></div>
        <div className="card"><div className="ctit">By Category</div><PieChart products={products} /></div>
      </div>

      <div className="card">
        <div className="ctit">Recent Activity</div>
        {recent.length === 0
          ? <div style={{ textAlign: 'center', padding: 24, color: 'var(--mu)', fontSize: 12 }}>No transactions yet</div>
          : recent.map(t => (
            <div key={t.id} className="ti">
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.type === 'IN' ? 'rgba(110,231,183,.15)' : 'rgba(96,165,250,.15)' }}>
                  {t.type === 'IN' ? '⬆️' : '⬇️'}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{t.productName}</div>
                  <div style={{ fontSize: 10, color: 'var(--mu)' }}>{new Date(t.date).toLocaleString()}</div>
                </div>
              </div>
              <span className={`bge ${t.type === 'IN' ? 'bgr' : 'bbl'}`}>{t.type === 'IN' ? '+' : '-'}{t.qty}</span>
            </div>
          ))
        }
      </div>
    </>
  )
}
