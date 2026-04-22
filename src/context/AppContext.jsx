import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext(null)

const USERS = [
  { email: 'admin@store.com', password: 'admin123', name: 'Admin', role: 'Admin' },
  { email: 'user@store.com',  password: 'user123',  name: 'User',  role: 'User'  },
]

function load(key, def) {
  try { return JSON.parse(localStorage.getItem(key)) ?? def } catch { return def }
}
function save(key, val) {
  localStorage.setItem(key, JSON.stringify(val))
}

function genId(prefix) {
  return prefix + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase()
}
function genSKU() {
  return 'SKU-' + Math.random().toString(36).slice(2, 8).toUpperCase()
}

export function AppProvider({ children }) {
  const [auth, setAuth]             = useState(null)
  const [products, setProducts]     = useState(() => load('sm_products', []))
  const [transactions, setTxns]     = useState(() => load('sm_transactions', []))
  const [invoices, setInvoices]     = useState(() => load('sm_invoices', []))

  useEffect(() => { save('sm_products',     products)     }, [products])
  useEffect(() => { save('sm_transactions', transactions) }, [transactions])
  useEffect(() => { save('sm_invoices',     invoices)     }, [invoices])

  function login(email, password) {
    const user = USERS.find(u => u.email === email && u.password === password)
    if (!user) throw new Error('Invalid email or password')
    setAuth(user)
    return user
  }

  function logout() { setAuth(null) }

  function addProduct(data) {
    const p = {
      id: genId('PROD'),
      name: data.name,
      vendorName: data.vendorName || '',
      invoiceNumber: data.invoiceNumber || '',
      category: data.category || 'Other',
      sku: data.sku || genSKU(),
      price: parseFloat(data.price) || 0,
      quantity: parseInt(data.quantity) || 0,
      lowStockAt: parseInt(data.lowStockAt) || 5,
    }
    setProducts(prev => [...prev, p])
    return p
  }

  function updateProduct(data) {
    setProducts(prev => prev.map(p => p.id === data.id ? {
      ...p,
      name: data.name,
      vendorName: data.vendorName || '',
      invoiceNumber: data.invoiceNumber || '',
      category: data.category || p.category,
      sku: data.sku || p.sku,
      price: parseFloat(data.price) || p.price,
      quantity: parseInt(data.quantity) ?? p.quantity,
      lowStockAt: parseInt(data.lowStockAt) ?? p.lowStockAt,
    } : p))
  }

  function deleteProduct(id) {
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  function addTransaction(type, productId, qty, note) {
    const prod = products.find(p => p.id === productId)
    if (!prod) throw new Error('Product not found')
    const q = parseInt(qty)
    if (type === 'OUT' && prod.quantity < q) throw new Error('Insufficient stock')
    const txn = {
      id: genId('TXN'),
      type,
      productId,
      productName: prod.name,
      qty: q,
      note: note || '',
      date: new Date().toISOString(),
    }
    setTxns(prev => [...prev, txn])
    setProducts(prev => prev.map(p => p.id === productId
      ? { ...p, quantity: p.quantity + (type === 'IN' ? q : -q) }
      : p))
    return txn
  }

  function addInvoice(data) {
    const inv = {
      id: genId('INV'),
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      issueTo: data.issueTo,
      remarks: data.remarks || '',
      items: data.items,
      discount: parseFloat(data.discount) || 0,
      gst: parseFloat(data.gst) || 0,
      status: 'Issued',
    }
    data.items.forEach(item => {
      addTransaction('OUT', item.productId, item.qty, 'Invoice ' + inv.id)
    })
    setInvoices(prev => [...prev, inv])
    return inv
  }

  const stats = {
    totalStock: products.reduce((s, p) => s + p.quantity, 0),
    lowStock: products.filter(p => p.quantity <= p.lowStockAt).length,
    totalSales: invoices.reduce((s, inv) => {
      const sub = inv.items.reduce((a, i) => a + i.qty * i.price, 0)
      const d = sub * (inv.discount / 100)
      const t = sub - d
      return s + t + t * (inv.gst / 100)
    }, 0),
    stockIn:  transactions.filter(t => t.type === 'IN').reduce((s, t) => s + t.qty, 0),
    stockOut: transactions.filter(t => t.type === 'OUT').reduce((s, t) => s + t.qty, 0),
  }

  return (
    <AppContext.Provider value={{
      auth, login, logout,
      products, transactions, invoices, stats,
      addProduct, updateProduct, deleteProduct,
      addTransaction, addInvoice,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
