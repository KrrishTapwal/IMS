import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext.jsx'

const CATS = ['Electronics', 'Accessories', 'Clothing', 'Food', 'Stationery', 'Other']

export default function ProductModal({ open, onClose, editProduct }) {
  const { addProduct, updateProduct } = useApp()
  const [form, setForm] = useState({ name: '', vendorName: '', invoiceNumber: '', category: 'Electronics', sku: '', price: '', quantity: '', lowStockAt: '5' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editProduct) {
      setForm({ name: editProduct.name, vendorName: editProduct.vendorName || '', invoiceNumber: editProduct.invoiceNumber || '', category: editProduct.category, sku: editProduct.sku || '', price: String(editProduct.price), quantity: String(editProduct.quantity), lowStockAt: String(editProduct.lowStockAt) })
    } else {
      setForm({ name: '', vendorName: '', invoiceNumber: '', category: 'Electronics', sku: '', price: '', quantity: '', lowStockAt: '5' })
    }
  }, [editProduct, open])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  function handleSave() {
    if (!form.name || !form.price || !form.quantity) { alert('Name, Price, Qty required'); return }
    setLoading(true)
    setTimeout(() => {
      if (editProduct) updateProduct({ id: editProduct.id, ...form })
      else addProduct(form)
      setLoading(false)
      onClose()
    }, 300)
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
          <div className="fg"><label>Product Name *</label><input value={form.name} onChange={set('name')} placeholder="e.g. Laptop Pro X" /></div>
          <div className="g2f">
            <div className="fg"><label>Vendor Name</label><input value={form.vendorName} onChange={set('vendorName')} placeholder="Vendor Co." /></div>
            <div className="fg"><label>Vendor Invoice No.</label><input value={form.invoiceNumber} onChange={set('invoiceNumber')} placeholder="INV-V001" /></div>
          </div>
          <div className="g2f">
            <div className="fg"><label>Category</label>
              <select value={form.category} onChange={set('category')}>
                {CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="fg"><label>SKU (blank = auto)</label><input value={form.sku} onChange={set('sku')} placeholder="Auto-generated" /></div>
          </div>
          <div className="g3f">
            <div className="fg"><label>Price ₹ *</label><input type="number" value={form.price} onChange={set('price')} placeholder="0" /></div>
            <div className="fg"><label>Quantity *</label><input type="number" value={form.quantity} onChange={set('quantity')} placeholder="0" /></div>
            <div className="fg"><label>Low Alert</label><input type="number" value={form.lowStockAt} onChange={set('lowStockAt')} /></div>
          </div>
          <div className="mft">
            <button className="btn bp" onClick={handleSave} disabled={loading}>
              {loading ? <span className="sp" style={{ borderTopColor: '#0F1117' }} /> : (editProduct ? 'Update' : 'Add')}
            </button>
            <button className="btn bss" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}
