import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext.jsx'

export default function ProductModal({ open, onClose, editProduct }) {
  const { addProduct, updateProduct, categories, addCategory } = useApp()
  const [form, setForm] = useState({ name: '', vendorName: '', invoiceNumber: '', category: 'Electronics', sku: '', purchasePrice: '', salePrice: '', quantity: '', lowStockAt: '5' })
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [newCat, setNewCat]     = useState('')
  const [showNewCat, setShowNewCat] = useState(false)

  useEffect(() => {
    if (editProduct) {
      setForm({
        name: editProduct.name,
        vendorName: editProduct.vendorName || '',
        invoiceNumber: editProduct.invoiceNumber || '',
        category: editProduct.category,
        sku: editProduct.sku || '',
        purchasePrice: String(editProduct.purchasePrice ?? editProduct.price ?? ''),
        salePrice: String(editProduct.salePrice ?? editProduct.price ?? ''),
        quantity: String(editProduct.quantity),
        lowStockAt: String(editProduct.lowStockAt),
      })
    } else {
      setForm({ name: '', vendorName: '', invoiceNumber: '', category: categories[0] || 'Electronics', sku: '', purchasePrice: '', salePrice: '', quantity: '', lowStockAt: '5' })
    }
    setError(''); setNewCat(''); setShowNewCat(false)
  }, [editProduct, open])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleAddCategory() {
    const name = newCat.trim()
    if (!name) return
    await addCategory(name)
    setForm(f => ({ ...f, category: name }))
    setNewCat(''); setShowNewCat(false)
  }

  async function handleSave() {
    if (!form.name || !form.purchasePrice || !form.salePrice || !form.quantity) {
      setError('Name, Purchase Price, Sale Price and Quantity are required'); return
    }
    setLoading(true); setError('')
    try {
      if (editProduct) await updateProduct({ id: editProduct.id, ...form })
      else await addProduct(form)
      onClose()
    } catch (e) {
      setError(e.message || 'Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="mo open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mdl">
        <div className="mh">
          <span className="mtt">{editProduct ? 'Edit Product' : 'Add Product'}</span>
          <button className="ib" onClick={onClose}>✕</button>
        </div>
        <div className="mbd">
          {error && <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 8, padding: '8px 12px', color: '#DC2626', fontSize: 13, marginBottom: 8 }}>{error}</div>}
          <div className="fg"><label>Product Name *</label><input value={form.name} onChange={set('name')} placeholder="e.g. Laptop Pro X" /></div>
          <div className="g2f">
            <div className="fg"><label>Vendor Name</label><input value={form.vendorName} onChange={set('vendorName')} placeholder="Vendor Co." /></div>
            <div className="fg"><label>Vendor Invoice No.</label><input value={form.invoiceNumber} onChange={set('invoiceNumber')} placeholder="INV-V001" /></div>
          </div>
          <div className="g2f">
            <div className="fg">
              <label>Category</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <select value={form.category} onChange={e => { if (e.target.value === '__new__') setShowNewCat(true); else setForm(f => ({ ...f, category: e.target.value })) }} style={{ flex: 1 }}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="__new__">+ Add new category</option>
                </select>
              </div>
              {showNewCat && (
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  <input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="New category name" onKeyDown={e => e.key === 'Enter' && handleAddCategory()} style={{ flex: 1 }} />
                  <button className="btn bp" style={{ padding: '0 12px' }} onClick={handleAddCategory}>Add</button>
                  <button className="btn bss" style={{ padding: '0 10px' }} onClick={() => setShowNewCat(false)}>✕</button>
                </div>
              )}
            </div>
            <div className="fg"><label>SKU (blank = auto)</label><input value={form.sku} onChange={set('sku')} placeholder="Auto-generated" /></div>
          </div>

          {/* Dual Pricing */}
          <div className="g2f">
            <div className="fg">
              <label>Purchase Price ₹ *</label>
              <input type="number" value={form.purchasePrice} onChange={set('purchasePrice')} placeholder="Cost price" />
              <span style={{ fontSize: 10, color: 'var(--mu)' }}>Internal only — not shown in invoices</span>
            </div>
            <div className="fg">
              <label>Sale Price ₹ *</label>
              <input type="number" value={form.salePrice} onChange={set('salePrice')} placeholder="Selling price" />
              <span style={{ fontSize: 10, color: 'var(--mu)' }}>Auto-filled in invoices</span>
            </div>
          </div>

          <div className="g2f">
            <div className="fg"><label>Quantity *</label><input type="number" value={form.quantity} onChange={set('quantity')} placeholder="0" /></div>
            <div className="fg"><label>Low Stock Alert</label><input type="number" value={form.lowStockAt} onChange={set('lowStockAt')} /></div>
          </div>

          <div className="mft">
            <button className="btn bp" onClick={handleSave} disabled={loading}>
              {loading ? <span className="sp" style={{ borderTopColor: '#fff' }} /> : (editProduct ? 'Update' : 'Add Product')}
            </button>
            <button className="btn bss" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}
