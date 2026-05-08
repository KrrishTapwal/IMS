import { useState } from 'react'
import { useApp } from '../../context/AppContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

export default function StockModal({ open, onClose, stockTarget }) {
  const { addTransaction } = useApp()
  const { showToast }      = useToast()
  const [qty, setQty]       = useState('')
  const [note, setNote]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const type = stockTarget?.type || 'IN'
  const name = stockTarget?.name || ''
  const isIn = type === 'IN'

  async function handleSave() {
    setError('')
    if (!qty || +qty <= 0) { setError('Enter a valid quantity'); return }
    setLoading(true)
    try {
      await addTransaction(type, stockTarget.productId, qty, note)
      showToast(`Stock ${type === 'IN' ? 'added' : 'removed'}: ${qty} units of ${name}`, 'success')
      setQty(''); setNote('')
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
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
          <div className={`al ${isIn ? 'as' : 'ae'}`}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round">
              {isIn ? <path d="M12 19V5m-7 7 7-7 7 7"/> : <path d="M12 5v14m-7-7 7 7 7-7"/>}
            </svg>
            {isIn ? 'Adding stock to inventory' : 'Removing stock from inventory'}
          </div>
          {error && <div className="al ae">{error}</div>}
          <div className="fg">
            <label>Quantity *</label>
            <input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="Enter quantity" min="1" autoFocus />
          </div>
          <div className="fg">
            <label>Note</label>
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="Optional reason..." />
          </div>
          <div className="mft">
            <button className="btn bp" onClick={handleSave} disabled={loading}>
              {loading ? <span className="sp" /> : 'Confirm'}
            </button>
            <button className="btn bss" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}
