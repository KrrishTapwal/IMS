import { useApp } from '../context/AppContext.jsx'

const NavItem = ({ id, label, page, setPage, children, badge }) => (
  <button className={`nb ${page === id ? 'act' : ''}`} onClick={() => setPage(id)}>
    {children}
    <span className="nl">{label}</span>
    {badge > 0 && <span className="bdot">{badge}</span>}
  </button>
)

export default function Sidebar({ page, setPage, collapsed }) {
  const { auth, logout, products } = useApp()
  const lowCount = products.filter(p => p.quantity <= p.lowStockAt).length

  return (
    <aside className={`sb ${collapsed ? 'col' : ''}`}>
      <div className="la">
        <div className="li">📦</div>
        <span className="ltt">StockMaster</span>
      </div>

      <nav>
        <NavItem id="dashboard" label="Dashboard" page={page} setPage={setPage}>
          <svg className="ni" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
        </NavItem>

        <NavItem id="inventory" label="Inventory" page={page} setPage={setPage} badge={lowCount}>
          <svg className="ni" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>
        </NavItem>

        <NavItem id="sales" label="Sales / Issue" page={page} setPage={setPage}>
          <svg className="ni" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </NavItem>

        <NavItem id="reports" label="Reports" page={page} setPage={setPage}>
          <svg className="ni" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
        </NavItem>
      </nav>

      <div className="ua">
        <div className="ur">
          <div className="av">{auth?.name?.[0] || 'U'}</div>
          <div className="ui">
            <div className="un">{auth?.name}</div>
            <div className="ur2">{auth?.role}</div>
          </div>
          <button className="lo" onClick={logout}>
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Exit</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
