import { useState, useMemo, useRef } from 'react'
import * as XLSX from 'xlsx'
import { useApp } from '../context/AppContext.jsx'
import ProductModal from './modals/ProductModal.jsx'
import StockModal from './modals/StockModal.jsx'

const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })
const sp = p => p.salePrice ?? p.price ?? 0
const pp = p => p.purchasePrice ?? p.price ?? 0

export default function Inventory() {
  const { auth, products, deleteProduct, addBulkProducts } = useApp()
  const [search, setSearch]         = useState('')
  const [cat, setCat]               = useState('')
  const [prodModal, setProdModal]   = useState(false)
  const [editProd, setEditProd]     = useState(null)
  const [stockModal, setStockModal] = useState(false)
  const [stockTarget, setStockTarget] = useState(null)
  const [uploading, setUploading]   = useState(false)
  const [uploadMsg, setUploadMsg]   = useState('')
  const fileRef = useRef()

  const isAdmin = auth?.role === 'Admin'
  const cats = useMemo(() => [...new Set(products.map(p => p.category))], [products])

  const filtered = useMemo(() => products.filter(p => {
    const q = search.toLowerCase()
    return (p.name.toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q)) && (!cat || p.category === cat)
  }), [products, search, cat])

  function openAdd()   { setEditProd(null); setProdModal(true) }
  function openEdit(p) { setEditProd(p);    setProdModal(true) }
  function openStock(type, p) { setStockTarget({ type, productId: p.id, name: p.name }); setStockModal(true) }

  function handleDelete(id) {
    if (!confirm('Delete this product?')) return
    deleteProduct(id)
  }

  function status(p) {
    if (+p.quantity === 0)            return ['brd', 'Out']
    if (+p.quantity <= +p.lowStockAt) return ['byw', 'Low']
    return ['bgr', 'OK']
  }

  function downloadTemplate() {
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([
      ['Name', 'Vendor Name', 'Vendor Invoice No', 'Category', 'SKU', 'Purchase Price', 'Sale Price', 'Quantity', 'Low Stock Alert'],
      ['Example Product', 'ABC Traders', 'INV-001', 'Electronics', 'SKU-001', 100, 150, 50, 10],
    ])
    ws['!cols'] = [20,16,18,14,12,14,12,10,16].map(w => ({ wch: w }))
    XLSX.utils.book_append_sheet(wb, ws, 'Products')
    XLSX.writeFile(wb, 'RedBean_Stock_Template.xlsx')
  }

  async function handleExcelUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true); setUploadMsg('')
    try {
      const data = await file.arrayBuffer()
      const wb   = XLSX.read(data)
      const ws   = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(ws)

      if (rows.length === 0) { setUploadMsg('Excel file is empty'); setUploading(false); return }

      const mapped = rows.map(r => ({
        name:          String(r['Name'] || r['name'] || '').trim(),
        vendorName:    String(r['Vendor Name'] || r['vendorName'] || '').trim(),
        invoiceNumber: String(r['Vendor Invoice No'] || r['invoiceNumber'] || '').trim(),
        category:      String(r['Category'] || r['category'] || 'Other').trim(),
        sku:           String(r['SKU'] || r['sku'] || '').trim(),
        purchasePrice: parseFloat(r['Purchase Price'] || r['purchasePrice'] || 0),
        salePrice:     parseFloat(r['Sale Price'] || r['salePrice'] || 0),
        quantity:      parseInt(r['Quantity'] || r['quantity'] || 0),
        lowStockAt:    parseInt(r['Low Stock Alert'] || r['lowStockAt'] || 5),
      })).filter(r => r.name)

      if (mapped.length === 0) { setUploadMsg('No valid rows found. Check column names.'); setUploading(false); return }

      await addBulkProducts(mapped)
      setUploadMsg(`✓ ${mapped.length} products imported successfully!`)
    } catch (err) {
      setUploadMsg('Error: ' + err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <>
      <div className="tb">
        <div className="sw2">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input className="si2" type="text" placeholder="Search by name or SKU..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={cat} onChange={e => setCat(e.target.value)} style={{ width: 'auto' }}>
          <option value="">All Categories</option>
          {cats.map(c => <option key={c}>{c}</option>)}
        </select>
        {isAdmin && (
          <>
            <button className="btn bss bsm" onClick={downloadTemplate} title="Download Excel template">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Template
            </button>
            <button className="btn bss bsm" onClick={() => fileRef.current.click()} disabled={uploading} title="Upload Excel file">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              {uploading ? 'Uploading...' : 'Import Excel'}
            </button>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleExcelUpload} />
            <button className="btn bp" onClick={openAdd}>+ Product</button>
          </>
        )}
      </div>

      {uploadMsg && (
        <div className={`al ${uploadMsg.startsWith('✓') ? 'as' : 'ae'}`} style={{ marginBottom: 12 }}>
          {uploadMsg}
          <button style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 14 }} onClick={() => setUploadMsg('')}>✕</button>
        </div>
      )}

      <div className="card">
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Product</th><th>Vendor</th><th>Inv. No</th><th>SKU</th>
                <th>Purchase ₹</th><th>Sale ₹</th><th>Stock</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan="9" style={{ textAlign: 'center', padding: 30, color: 'var(--mu)' }}>No products found</td></tr>
                : filtered.map(p => {
                    const [cls, lbl] = status(p)
                    const low = +p.quantity <= +p.lowStockAt
                    return (
                      <tr key={p.id}>
                        <td><strong>{p.name}</strong></td>
                        <td style={{ color: 'var(--mu)', fontSize: 11 }}>{p.vendorName || '-'}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--mu)' }}>{p.invoiceNumber || '-'}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--mu)' }}>{p.sku || '-'}</td>
                        <td style={{ color: 'var(--mu)' }}>{fmt(pp(p))}</td>
                        <td style={{ fontWeight: 600, color: 'var(--ac)' }}>{fmt(sp(p))}</td>
                        <td><strong style={{ color: low ? 'var(--dn)' : '#16A34A' }}>{p.quantity}</strong></td>
                        <td><span className={`bge ${cls}`}>{lbl}</span></td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <button className="ib" title="Stock In"  onClick={() => openStock('IN',  p)}>
                            <svg width="14" height="14" fill="none" stroke="#16A34A" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round"><path d="M12 19V5m-7 7 7-7 7 7"/></svg>
                          </button>
                          <button className="ib" title="Stock Out" onClick={() => openStock('OUT', p)}>
                            <svg width="14" height="14" fill="none" stroke="#DC2626" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round"><path d="M12 5v14m-7-7 7 7 7-7"/></svg>
                          </button>
                          {isAdmin && <>
                            <button className="ib" title="Edit" onClick={() => openEdit(p)}>
                              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button className="ib" title="Delete" style={{ color: 'var(--ac)' }} onClick={() => handleDelete(p.id)}>
                              <svg width="13" height="13" fill="none" stroke="#DC2626" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>
                            </button>
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
