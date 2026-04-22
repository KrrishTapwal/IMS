import { useState } from 'react'
import { useApp } from './context/AppContext.jsx'
import Login from './components/Login.jsx'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './components/Dashboard.jsx'
import Inventory from './components/Inventory.jsx'
import Sales from './components/Sales.jsx'
import Reports from './components/Reports.jsx'

export default function App() {
  const { auth, loading } = useApp()
  const [page, setPage] = useState('dashboard')
  const [collapsed, setCollapsed] = useState(false)

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)', color: 'var(--mu)', fontSize: 15 }}>
      Connecting to database...
    </div>
  )

  if (!auth) return <Login />

  const pages = { dashboard: Dashboard, inventory: Inventory, sales: Sales, reports: Reports }
  const PageComp = pages[page] || Dashboard
  const titles = { dashboard: 'Dashboard', inventory: 'Inventory', sales: 'Sales / Issue', reports: 'Reports' }

  return (
    <div className="app">
      <Sidebar page={page} setPage={setPage} collapsed={collapsed} />
      <div className="mn">
        <div className="hd">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="mb2" onClick={() => setCollapsed(c => !c)}>
              <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <span className="ht">{titles[page]}</span>
          </div>
          <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 18, border: '1px solid var(--bd)', color: 'var(--mu)' }}>
            {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
        <div className="ctt">
          <PageComp setPage={setPage} />
        </div>
      </div>
    </div>
  )
}
