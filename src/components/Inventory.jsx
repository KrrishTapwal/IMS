import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext.jsx'
import ProductModal from './modals/ProductModal.jsx'
import StockModal from './modals/StockModal.jsx'

const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })

export default function Inventory() {
  const { auth, products, deleteProduct } = useApp()
  const [search, setSearch]       = useState('')
  const [cat, setCat]             = useState('')
  const [prodModal, setProdModal] = useState(false)
  const [editProd, setEditProd]   = useState(null)
  const [stockModal, setStockModal] = useState(false)
  const [stockTarget, setStockTarget] = useState(null)

  const isAdmin = auth?.role === 'Admin'

  const cats = useMemo(() => [...new Set(products.map(p => p.category))], [products])

  const filtered = useMemo(() => products.filter(p => {
    const q = search.toLowerCase()
    return (p.name.toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q)) && (!cat || p.category === cat)
  }), [products, search, cat])

  function openAdd()  { setEditProd(null);  setProdModal(true) }
  function openEdit(p){ setEditProd(p);     setProdModal(true) }
  function openStock(type, p) { setStockTarget({ type, productId: p.id, name: p.name }); setStockModal(true) }

  function handleDelete(id) {
    if (!confirm('Delete this product?')) return
    deleteProduct(id)
  }

  function status(p) {
    if (+p.quantity === 0)           return ['brd', 'Out']
    if (+p.quantity <= +p.lowStockAt) return ['byw', 'Low']
    return ['bgr', 'OK']
  }

  return (
    <>
      <div className="tb">
        <div className="sw2">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input className="si2" type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={cat} onChange={e => setCat(e.target.value)} style={{ width: 'auto' }}>
          <option value="">All</option>
          {cats.map(c => <option key={c}>{c}</option>)}
        </select>
        {isAdmin && <button className="btn bp" onClick={openAdd}>+ Product</button>}
      </div>

      <div className="card">
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Product</th><th>Vendor</th><th>Inv.No</th><th>SKU</th>
                <th>Price</th><th>Stock</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan="8" style={{ textAlign: 'center', padding: 30, color: 'var(--mu)' }}>No products</td></tr>
                : filtered.map(p => {
                    const [cls, lbl] = status(p)
                    const low = p.quantity <= p.lowStockAt
                    return (
                      <tr key={p.id}>
                        <td><strong>{p.name}</strong></td>
                        <td style={{ color: 'var(--mu)', fontSize: 11 }}>{p.vendorName || '-'}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--mu)' }}>{p.invoiceNumber || '-'}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--mu)' }}>{p.sku || '-'}</td>
                        <td>{fmt(p.price)}</td>
                        <td><strong style={{ color: low ? 'var(--dn)' : 'var(--ac)' }}>{p.quantity}</strong></td>
                        <td><span className={`bge ${cls}`}>{lbl}</span></td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <button className="ib" style={{ color: 'var(--ac)' }}  title="Stock In"  onClick={() => openStock('IN',  p)}>⬆️</button>
                          <button className="ib" style={{ color: 'var(--in)' }}  title="Stock Out" onClick={() => openStock('OUT', p)}>⬇️</button>
                          {isAdmin && <>
                            <button className="ib" style={{ color: 'var(--mu)' }} onClick={() => openEdit(p)}>✏️</button>
                            <button className="ib" style={{ color: 'var(--dn)' }} onClick={() => handleDelete(p.id)}>🗑️</button>
                          </>}
                        </td>
                      </tr>
                    )
                  })
              }
            </tbody>
          </table>
        </div>
      </div>

      <ProductModal open={prodModal} onClose={() => setProdModal(false)} editProduct={editProd} />
      <StockModal   open={stockModal} onClose={() => setStockModal(false)} stockTarget={stockTarget} />
    </>
  )
}
