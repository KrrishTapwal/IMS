import { useState } from 'react'
import { useApp } from '../../context/AppContext.jsx'

export default function StockModal({ open, onClose, stockTarget }) {
  const { addTransaction } = useApp()
  const [qty, setQty]     = useState('')
  const [note, setNote]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const type = stockTarget?.type || 'IN'
  const name = stockTarget?.name || ''

  function handleSave() {
    setError('')
    if (!qty || +qty <= 0) { setError('Enter a valid quantity'); return }
    setLoading(true)
    setTimeout(() => {
      try {
        addTransaction(type, stockTarget.productId, qty, note)
        setQty(''); setNote('')
        setLoading(false)
        onClose()
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }, 300)
  }

  if (!open) return null

  return (
    <div className="mo open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mdl">
        <div className="mh">
          <span className="mtt">Stock {type} — {name}</span>
          <button className="ib" onClick={onClose}>✕</button>
        </div>
        <div className="mbd">
          <div className={`al ${type === 'IN' ? 'as' : 'ae'}`}>
            {type === 'IN' ? '📦 Adding Stock' : '🛒 Removing Stock'}
          </div>
          {error && <div className="al ae">{error}</div>}
          <div className="fg"><label>Quantity *</label>
            <input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="Enter quantity" min="1" />
          </div>
          <div className="fg"><label>Note</label>
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="Optional..." />
          </div>
          <div className="mft">
            <button className="btn bp" onClick={handleSave} disabled={loading}>
              {loading ? <span className="sp" style={{ borderTopColor: '#0F1117' }} /> : 'Confirm'}
            </button>
            <button className="btn bss" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}
