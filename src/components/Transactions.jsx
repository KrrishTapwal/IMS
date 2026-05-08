import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext.jsx'

export default function Transactions() {
  const { transactions } = useApp()
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => transactions.filter(t => {
    if (filter !== 'ALL' && t.type !== filter) return false
    if (search && !t.productName.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }), [transactions, filter, search])

  const totalIn  = useMemo(() => filtered.filter(t => t.type === 'IN').reduce((s, t) => s + t.qty, 0), [filtered])
  const totalOut = useMemo(() => filtered.filter(t => t.type === 'OUT').reduce((s, t) => s + t.qty, 0), [filtered])

  return (
    <>
      <div className="tb">
        <div className="sw2">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input className="si2" type="text" placeholder="Search by product name..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display:'flex', gap:4 }}>
          {['ALL','IN','OUT'].map(f => (
            <button key={f} className={`btn bsm ${filter === f ? 'bp' : 'bss'}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
      </div>

      <div className="g3f" style={{ marginBottom:16 }}>
        <div className="sc">
          <div className="sl">Total Records</div>
          <div className="sv">{filtered.length}</div>
        </div>
        <div className="sc">
          <div className="sl" style={{ color:'var(--ok)' }}>Stock In (units)</div>
          <div className="sv" style={{ color:'var(--ok)' }}>+{totalIn.toLocaleString()}</div>
        </div>
        <div className="sc">
          <div className="sl" style={{ color:'var(--dn)' }}>Stock Out (units)</div>
          <div className="sv" style={{ color:'var(--dn)' }}>-{totalOut.toLocaleString()}</div>
        </div>
      </div>

      <div className="tw">
        <table>
          <thead>
            <tr>
              <th>Date &amp; Time</th>
              <th>Product</th>
              <th>Type</th>
              <th>Qty</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0
              ? (
                <tr>
                  <td colSpan="5" style={{ padding:0 }}>
                    <div className="empty">
                      <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                        <polyline points="17 6 23 6 23 12"/>
                      </svg>
                      <p>No transactions found</p>
                    </div>
                  </td>
                </tr>
              )
              : filtered.map(t => (
                <tr key={String(t._id || t.id)}>
                  <td style={{ color:'var(--mu)', fontSize:11, whiteSpace:'nowrap' }}>
                    {new Date(t.date).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                  </td>
                  <td><strong>{t.productName}</strong></td>
                  <td>
                    <span className={`bge ${t.type === 'IN' ? 'bgr' : 'brd'}`}>{t.type}</span>
                  </td>
                  <td>
                    <strong style={{ color: t.type === 'IN' ? 'var(--ok)' : 'var(--dn)' }}>
                      {t.type === 'IN' ? '+' : '-'}{t.qty}
                    </strong>
                  </td>
                  <td style={{ color:'var(--mu)', fontSize:12 }}>{t.note || '-'}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </>
  )
}
