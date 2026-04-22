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
        <div className="li">RB</div>
        <div className="ltt">
          Red Bean IMS
          <span>Inventory Management</span>
        </div>
      </div>

      <nav>
        <NavItem id="dashboard" label="Dashboard" page={page} setPage={setPage}>
          <svg className="ni" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
          </svg>
        </NavItem>

        <NavItem id="inventory" label="Inventory" page={page} setPage={setPage} badge={lowCount}>
          <svg className="ni" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
        </NavItem>

        <NavItem id="sales" label="Sales / Issue" page={page} setPage={setPage}>
          <svg className="ni" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
          </svg>
        </NavItem>

        <NavItem id="reports" label="Reports" page={page} setPage={setPage}>
          <svg className="ni" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/><polyline points="4 20 20 20"/>
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
          <button className="lo" onClick={logout} title="Logout">
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Exit</span>
          </button>
        </div>
        <div className="credits">
          created by ankush<br />
          designed by krrish &amp; ritesh
        </div>
      </div>
    </aside>
  )
}
