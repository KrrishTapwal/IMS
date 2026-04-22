import { useRef, useEffect } from 'react'
import { Chart, registerables } from 'chart.js'
import { useApp } from '../context/AppContext.jsx'

Chart.register(...registerables)

const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })

function calcTotal(inv) {
  const sub = (inv.items || []).reduce((a, i) => a + i.qty * i.price, 0)
  const d = sub * (inv.discount / 100), t = sub - d
  return t + t * (inv.gst / 100)
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="sc">
      <div className="si" style={{ background: color + '20' }}>{icon}</div>
      <div className="sv">{value}</div>
      <div className="sl">{label}</div>
    </div>
  )
}

function LineChart({ invoices }) {
  const ref   = useRef(null)
  const chart = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    if (chart.current) chart.current.destroy()
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i)
      const m = d.getMonth(), y = d.getFullYear()
      const sales = invoices
        .filter(inv => { const dd = new Date(inv.date); return dd.getMonth() === m && dd.getFullYear() === y })
        .reduce((s, inv) => s + calcTotal(inv), 0)
      months.push({ label: d.toLocaleString('default', { month: 'short' }), sales })
    }
    chart.current = new Chart(ref.current, {
      type: 'line',
      data: {
        labels: months.map(m => m.label),
        datasets: [{ label: 'Sales', data: months.map(m => m.sales), borderColor: '#6EE7B7', backgroundColor: 'rgba(110,231,183,.1)', tension: 0.4, fill: true, pointBackgroundColor: '#6EE7B7', pointRadius: 4 }],
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: '#94A3B8', font: { size: 10 } } } },
        scales: {
          x: { ticks: { color: '#64748B' }, grid: { color: '#2A2D3E' } },
          y: { ticks: { color: '#64748B', callback: v => '₹' + Math.round(v / 1000) + 'k' }, grid: { color: '#2A2D3E' } },
        },
      },
    })
    return () => chart.current?.destroy()
  }, [invoices])

  return <canvas ref={ref} />
}

export default function Reports() {
  const { products, invoices } = useApp()

  const sv     = products.reduce((s, p) => s + +(p.purchasePrice ?? p.price ?? 0) * +p.quantity, 0)
  const totSal = invoices.reduce((s, i) => s + calcTotal(i), 0)

  function expCSV() {
    const rows = [['Product', 'Vendor', 'InvNo', 'SKU', 'Category', 'Purchase Price', 'Sale Price', 'Qty', 'Stock Value'],
      ...products.map(p => [p.name, p.vendorName || '', p.invoiceNumber || '', p.sku || '', p.category, p.purchasePrice ?? p.price ?? 0, p.salePrice ?? p.price ?? 0, p.quantity, +(p.purchasePrice ?? p.price ?? 0) * +p.quantity])]
    const csv = rows.map(r => r.map(v => '"' + String(v || '').replace(/"/g, '""') + '"').join(',')).join('\n')
    const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    a.download = 'stock.csv'; a.click()
  }

  function status(p) {
    if (+p.quantity === 0)            return ['brd', 'Out']
    if (+p.quantity <= +p.lowStockAt) return ['byw', 'Low']
    return ['bgr', 'OK']
  }

  return (
    <>
      <div className="tb">
        <span style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>Reports</span>
        <button className="btn bss bsm" onClick={expCSV}>⬇️ Export CSV</button>
      </div>

      <div className="g4" style={{ marginBottom: 16 }}>
        <StatCard icon="📦" label="Products"    value={products.length}  color="#6EE7B7" />
        <StatCard icon="💎" label="Stock Value" value={fmt(sv)}          color="#60A5FA" />
        <StatCard icon="🧾" label="Invoices"    value={invoices.length}  color="#A78BFA" />
        <StatCard icon="💰" label="Total Sales" value={fmt(totSal)}      color="#FBBF24" />
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="ctit">Monthly Sales</div>
        <LineChart invoices={invoices} />
      </div>

      <div className="card">
        <div className="ctit">Stock Report</div>
        <div className="tw">
          <table>
            <thead>
              <tr><th>Product</th><th>Vendor</th><th>Category</th><th>Purchase ₹</th><th>Sale ₹</th><th>Qty</th><th>Stock Value</th><th>Status</th></tr>
            </thead>
            <tbody>
              {products.length === 0
                ? <tr><td colSpan="7" style={{ textAlign: 'center', padding: 30, color: 'var(--mu)' }}>No products</td></tr>
                : products.map(p => {
                    const [cls, lbl] = status(p)
                    const low = +p.quantity <= +p.lowStockAt
                    return (
                      <tr key={p.id}>
                        <td><strong>{p.name}</strong></td>
                        <td style={{ fontSize: 11, color: 'var(--mu)' }}>{p.vendorName || '-'}</td>
                        <td><span className="bge bbl">{p.category}</span></td>
                        <td style={{ color: 'var(--mu)' }}>{fmt(p.purchasePrice ?? p.price ?? 0)}</td>
                        <td style={{ fontWeight: 600 }}>{fmt(p.salePrice ?? p.price ?? 0)}</td>
                        <td><strong style={{ color: low ? 'var(--dn)' : 'var(--tx)' }}>{p.quantity}</strong></td>
                        <td style={{ color: 'var(--ac)' }}>{fmt(+(p.purchasePrice ?? p.price ?? 0) * +p.quantity)}</td>
                        <td><span className={`bge ${cls}`}>{lbl}</span></td>
                      </tr>
                    )
                  })
              }
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
