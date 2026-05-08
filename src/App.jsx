import { useState } from 'react'
import { useApp } from './context/AppContext.jsx'
import Login from './components/Login.jsx'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './components/Dashboard.jsx'
import Inventory from './components/Inventory.jsx'
import Sales from './components/Sales.jsx'
import Reports from './components/Reports.jsx'
import Suppliers from './components/Suppliers.jsx'
import Transactions from './components/Transactions.jsx'

const PAGES = { dashboard: Dashboard, inventory: Inventory, sales: Sales, reports: Reports, suppliers: Suppliers, transactions: Transactions }
const TITLES = { dashboard: 'Dashboard', inventory: 'Inventory', sales: 'Sales / Issue', reports: 'Reports', suppliers: 'Suppliers', transactions: 'Stock History' }

export default function App() {
  const { auth, loading, apiError } = useApp()
  const [page, setPage]           = useState('dashboard')
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  function navigate(p) { setPage(p); setMobileOpen(false) }

  function toggleSidebar() {
    if (window.innerWidth <= 768) setMobileOpen(o => !o)
    else setCollapsed(c => !c)
  }

  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', background:'#111827', gap:14 }}>
      <div style={{ width:48, height:48, borderRadius:12, background:'#DC2626', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:16, color:'#fff' }}>RB</div>
      <span style={{ fontSize:13, color:'rgba(255,255,255,.4)', fontWeight:500 }}>Connecting to database…</span>
    </div>
  )

  if (apiError) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', background:'#111827', gap:10 }}>
      <div style={{ width:48, height:48, borderRadius:12, background:'#DC2626', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:16, color:'#fff' }}>RB</div>
      <span style={{ fontSize:14, color:'#EF4444', fontWeight:600 }}>Database connection failed</span>
      <span style={{ fontSize:12, color:'rgba(255,255,255,.35)', maxWidth:380, textAlign:'center', lineHeight:1.7 }}>{apiError}</span>
    </div>
  )

  if (!auth) return <Login />

  const PageComp = PAGES[page] || Dashboard

  return (
    <div className="app">
      <div className={`ov ${mobileOpen ? 'show' : ''}`} onClick={() => setMobileOpen(false)} />
      <Sidebar page={page} setPage={navigate} collapsed={collapsed} mobileOpen={mobileOpen} />
      <div className="mn">
        <div className="hd">
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button className="mb2" onClick={toggleSidebar} aria-label="Toggle menu">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round">
                <line x1="3" y1="6"  x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <span className="ht">{TITLES[page]}</span>
          </div>
          <span style={{ fontSize:11, padding:'4px 10px', borderRadius:18, border:'1px solid var(--bd)', color:'var(--mu)', flexShrink:0 }}>
            {new Date().toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
          </span>
        </div>
        <div className="ctt">
          <PageComp setPage={navigate} />
        </div>
      </div>
    </div>
  )
}
