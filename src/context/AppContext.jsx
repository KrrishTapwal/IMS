import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext(null)

const USERS = [
  { email: 'admin@store.com', password: 'admin123', name: 'Admin', role: 'Admin' },
  { email: 'user@store.com',  password: 'user123',  name: 'User',  role: 'User'  },
]

function genId(prefix) {
  return prefix + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase()
}
function genSKU() {
  return 'SKU-' + Math.random().toString(36).slice(2, 8).toUpperCase()
}

const BASE_URL = 'https://redbean-ims-server.onrender.com'

async function api(path, method = 'GET', body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `API ${method} ${path} failed: ${res.status}`)
  }
  return res.json()
}

export function AppProvider({ children }) {
  const [auth, setAuth]             = useState(null)
  const [products, setProducts]     = useState([])
  const [transactions, setTxns]     = useState([])
  const [invoices, setInvoices]     = useState([])
  const [categories, setCategories] = useState(['Electronics', 'Accessories', 'Clothing', 'Food', 'Stationery', 'Other'])
  const [loading, setLoading]       = useState(true)
  const [apiError, setApiError]     = useState(null)

  useEffect(() => {
    Promise.all([
      api('/api/products'),
      api('/api/transactions'),
      api('/api/invoices'),
      api('/api/categories'),
    ]).then(([prods, txns, invs, cats]) => {
      setProducts(prods)
      setTxns(txns)
      setInvoices(invs)
      setCategories(cats)
      setLoading(false)
    }).catch(err => {
      setApiError(err.message)
      setLoading(false)
    })
  }, [])

  function login(email, password) {
    const user = USERS.find(u => u.email === email && u.password === password)
    if (!user) throw new Error('Invalid email or password')
    setAuth(user)
    return user
  }

  function logout() { setAuth(null) }

  async function addCategory(name) {
    await api('/api/categories', 'POST', { name })
    setCategories(prev => prev.includes(name) ? prev : [...prev, name])
  }

  async function addProduct(data) {
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
    const saved = await api('/api/products', 'POST', p)
    setProducts(prev => [...prev, saved])
    return saved
  }

  async function updateProduct(data) {
    const existing = products.find(p => p.id === data.id)
    const updated = {
      ...existing,
      name: data.name,
      vendorName: data.vendorName || '',
      invoiceNumber: data.invoiceNumber || '',
      category: data.category,
      sku: data.sku,
      price: parseFloat(data.price),
      quantity: parseInt(data.quantity),
      lowStockAt: parseInt(data.lowStockAt),
    }
    await api('/api/products', 'PUT', updated)
    setProducts(prev => prev.map(p => p.id === data.id ? updated : p))
  }

  async function deleteProduct(id) {
    const prod = products.find(p => p.id === id)
    await api('/api/products', 'DELETE', { _id: prod._id })
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  async function addTransaction(type, productId, qty, note) {
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
    const saved = await api('/api/transactions', 'POST', txn)
    setTxns(prev => [saved, ...prev])
    const updatedProd = { ...prod, quantity: prod.quantity + (type === 'IN' ? q : -q) }
    await api('/api/products', 'PUT', updatedProd)
    setProducts(prev => prev.map(p => p.id === productId ? updatedProd : p))
    return saved
  }

  async function addInvoice(data) {
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
    for (const item of data.items) {
      await addTransaction('OUT', item.productId, item.qty, 'Invoice ' + inv.id)
    }
    const saved = await api('/api/invoices', 'POST', inv)
    setInvoices(prev => [saved, ...prev])
    return saved
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
      auth, login, logout, loading, apiError,
      products, transactions, invoices, categories, stats,
      addProduct, updateProduct, deleteProduct,
      addTransaction, addInvoice, addCategory,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
