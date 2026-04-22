import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext.jsx'

const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })

function calcTotal(inv) {
  const sub = (inv.items || []).reduce((a, i) => a + i.qty * i.price, 0)
  const d = sub * (inv.discount / 100)
  const t = sub - d
  return t + t * (inv.gst / 100)
}

/* ─── Invoice List ─── */
function InvoiceList({ invoices, onNew, onView }) {
  return (
    <div>
      <div className="tb">
        <span style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>Sales / Issue Register</span>
        <button className="btn bp" onClick={onNew}>+ New Issue</button>
      </div>
      <div className="card">
        <div className="tw">
          <table>
            <thead>
              <tr><th>Invoice #</th><th>Date</th><th>Issue To</th><th>Items</th><th>Total</th><th>Remarks</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {invoices.length === 0
                ? <tr><td colSpan="8" style={{ textAlign: 'center', padding: 30, color: 'var(--mu)' }}>No invoices yet</td></tr>
                : [...invoices].reverse().map(inv => (
                  <tr key={inv.id}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--ac)', fontSize: 11 }}>{inv.id}</td>
                    <td style={{ color: 'var(--mu)', fontSize: 11 }}>{inv.date}</td>
                    <td style={{ fontWeight: 500 }}>{inv.issueTo || '-'}</td>
                    <td style={{ color: 'var(--mu)' }}>{inv.items.length}</td>
                    <td><strong>{fmt(calcTotal(inv))}</strong></td>
                    <td style={{ color: 'var(--mu)', fontSize: 11 }}>{inv.remarks || '-'}</td>
                    <td><span className="bge bgr">{inv.status}</span></td>
                    <td><button className="bgh" onClick={() => onView(inv.id)}>View</button></td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ─── New Invoice Form ─── */
function NewInvoice({ products, onBack, onCreated }) {
  const { addInvoice } = useApp()
  const [issueTo, setIssueTo]   = useState('')
  const [remarks, setRemarks]   = useState('')
  const [discount, setDiscount] = useState('0')
  const [gst, setGst]           = useState('0')
  const [items, setItems]       = useState([])
  const [selProd, setSelProd]   = useState('')
  const [qty, setQty]           = useState('1')
  const [rate, setRate]         = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const available = useMemo(() => products.filter(p => +p.quantity > 0), [products])

  const sub  = items.reduce((a, i) => a + i.qty * i.price, 0)
  const disc = sub * (+discount / 100)
  const taxable = sub - disc
  const tax  = taxable * (+gst / 100)
  const total = taxable + tax

  function getSalePrice(prod) {
    return prod.salePrice ?? prod.price ?? 0
  }

  function addItem() {
    const prod = available.find(p => p.id === selProd)
    if (!prod) { alert('Select a product'); return }
    const q = +qty || 1
    const r = +rate || getSalePrice(prod)
    setItems(prev => {
      const ex = prev.findIndex(i => i.productId === prod.id)
      if (ex >= 0) { const n = [...prev]; n[ex] = { ...n[ex], qty: n[ex].qty + q }; return n }
      return [...prev, { productId: prod.id, name: prod.name, qty: q, price: r }]
    })
    setSelProd(''); setQty('1'); setRate('')
  }

  function removeItem(i) { setItems(prev => prev.filter((_, idx) => idx !== i)) }

  function handleCreate() {
    setError('')
    if (!issueTo.trim())  { setError('Issue To is required'); return }
    if (!items.length)    { setError('Add at least one item'); return }
    setLoading(true)
    setTimeout(() => {
      try {
        const inv = addInvoice({ issueTo, remarks, items, discount, gst })
        setLoading(false)
        onCreated(inv.id)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }, 300)
  }

  return (
    <div>
      <div className="tb">
        <button className="bgh" onClick={onBack}>← Back</button>
        <span style={{ fontSize: 14, fontWeight: 700 }}>New Issue / Invoice</span>
      </div>
      {error && <div className="al ae">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 14 }}>
        <div>
          <div className="card" style={{ marginBottom: 12 }}>
            <div className="g2f">
              <div className="fg" style={{ margin: 0 }}><label>Issue To *</label><input value={issueTo} onChange={e => setIssueTo(e.target.value)} placeholder="Name / Department" /></div>
              <div className="fg" style={{ margin: 0 }}><label>Remarks</label><input value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Optional..." /></div>
            </div>
          </div>

          <div className="card">
            <div className="ctit">Add Items</div>
            <div style={{ display: 'flex', gap: 7, marginBottom: 12, flexWrap: 'wrap' }}>
              <select value={selProd} onChange={e => {
                  setSelProd(e.target.value)
                  const prod = available.find(p => p.id === e.target.value)
                  if (prod) setRate(String(getSalePrice(prod)))
                }} style={{ flex: 2, minWidth: 140 }}>
                <option value="">Select product...</option>
                {available.map(p => <option key={p.id} value={p.id}>{p.name} (Qty:{p.quantity})</option>)}
              </select>
              <input type="number" value={qty}  onChange={e => setQty(e.target.value)}  min="1" style={{ width: 60 }} />
              <input type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="Sale ₹" style={{ width: 90 }} />
              <button className="btn bp bsm" onClick={addItem}>+ Add</button>
            </div>

            {items.length === 0
              ? <div style={{ textAlign: 'center', padding: 14, color: 'var(--mu)', fontSize: 12 }}>No items added</div>
              : items.map((x, i) => (
                <div key={i} className="ir">
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>{x.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--mu)' }}>{x.qty} × {fmt(x.price)} = <strong>{fmt(x.qty * x.price)}</strong></div>
                  </div>
                  <button className="ib" style={{ color: 'var(--dn)' }} onClick={() => removeItem(i)}>✕</button>
                </div>
              ))
            }
          </div>
        </div>

        <div>
          <div className="card" style={{ position: 'sticky', top: 0 }}>
            <div className="ctit">Summary</div>
            <div className="g2f" style={{ marginBottom: 8 }}>
              <div className="fg" style={{ margin: 0 }}><label>Discount %</label><input type="number" value={discount} onChange={e => setDiscount(e.target.value)} min="0" /></div>
              <div className="fg" style={{ margin: 0 }}><label>GST %</label><input type="number" value={gst} onChange={e => setGst(e.target.value)} min="0" /></div>
            </div>
            <div style={{ borderTop: '1px solid var(--bd)', paddingTop: 12, fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ color: 'var(--mu)' }}>Subtotal</span><span>{fmt(sub)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ color: 'var(--mu)' }}>Discount</span><span>-{fmt(disc)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}><span style={{ color: 'var(--mu)' }}>GST</span><span>+{fmt(tax)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 800, borderTop: '1px solid var(--bd)', paddingTop: 10 }}>
                <span>Total</span><span style={{ color: 'var(--ac)' }}>{fmt(total)}</span>
              </div>
            </div>
            <button className="btn bp" style={{ width: '100%', justifyContent: 'center', marginTop: 14 }} onClick={handleCreate} disabled={loading}>
              {loading ? <span className="sp" style={{ borderTopColor: '#0F1117' }} /> : 'Issue Invoice'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Invoice Detail ─── */
function InvoiceDetail({ inv, onBack }) {
  const sub = (inv.items || []).reduce((a, i) => a + i.qty * i.price, 0)
  const d = sub * (inv.discount / 100), t = sub - d, g = t * (inv.gst / 100), tot = t + g

  return (
    <div>
      <div className="tb">
        <button className="bgh" onClick={onBack}>← Back</button>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>Invoice</span>
        <button className="btn bss bsm" onClick={() => window.print()}>🖨️ Print</button>
      </div>
      <div className="card" style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#DC2626' }}>Red Bean IMS</div>
            <div style={{ fontSize: 11, color: 'var(--mu)', marginTop: 2 }}>Inventory Management</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--ac)' }}>{inv.id}</div>
            <div style={{ fontSize: 11, color: 'var(--mu)' }}>Date: {inv.date}</div>
            <span className="bge bgr" style={{ marginTop: 4 }}>{inv.status}</span>
          </div>
        </div>

        <div style={{ padding: '11px 13px', borderRadius: 10, background: 'var(--bg)', marginBottom: 18 }}>
          <div style={{ fontSize: 10, color: 'var(--mu)' }}>Issue To</div>
          <div style={{ fontWeight: 600, marginTop: 2 }}>{inv.issueTo || '-'}</div>
          {inv.remarks && <div style={{ fontSize: 11, color: 'var(--mu)', marginTop: 5 }}>Remarks: {inv.remarks}</div>}
        </div>

        <table style={{ marginBottom: 18 }}>
          <thead><tr><th style={{ padding: '8px 0' }}>Product</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
          <tbody>
            {(inv.items || []).map((x, i) => (
              <tr key={i}>
                <td style={{ padding: '8px 0' }}>{x.name}</td>
                <td style={{ color: 'var(--mu)' }}>{x.qty}</td>
                <td style={{ color: 'var(--mu)' }}>{fmt(x.price)}</td>
                <td><strong>{fmt(x.qty * x.price)}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: 220, fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}><span style={{ color: 'var(--mu)' }}>Subtotal</span><span>{fmt(sub)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}><span style={{ color: 'var(--mu)' }}>Discount ({inv.discount}%)</span><span>-{fmt(d)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}><span style={{ color: 'var(--mu)' }}>GST ({inv.gst}%)</span><span>+{fmt(g)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 800, borderTop: '1px solid var(--bd)', paddingTop: 10 }}>
              <span>Total</span><span style={{ color: 'var(--ac)' }}>{fmt(tot)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Sales Component ─── */
export default function Sales() {
  const { products, invoices } = useApp()
  const [view, setView]       = useState('list')
  const [viewId, setViewId]   = useState(null)

  function onView(id)    { setViewId(id);     setView('detail') }
  function onCreated(id) { setViewId(id);     setView('detail') }
  function onBack()      { setViewId(null);   setView('list')   }

  const currentInv = invoices.find(i => i.id === viewId)

  if (view === 'new')                         return <NewInvoice products={products} onBack={onBack} onCreated={onCreated} />
  if (view === 'detail' && currentInv)        return <InvoiceDetail inv={currentInv} onBack={onBack} />
  return <InvoiceList invoices={invoices} onNew={() => setView('new')} onView={onView} />
}
