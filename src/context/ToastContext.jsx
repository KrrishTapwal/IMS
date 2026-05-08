import { createContext, useContext, useState, useCallback } from 'react'

const ToastCtx = createContext(null)
let tid = 0

const ICONS = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' }
const CLS   = { success: 'tst-s', error: 'tst-e', warning: 'tst-w', info: 'tst-i' }

function ToastList({ toasts, dismiss }) {
  if (!toasts.length) return null
  return (
    <div className="tc">
      {toasts.map(t => (
        <div key={t.id} className={`tst ${CLS[t.type] || 'tst-i'}`}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>{ICONS[t.type]}</span>
          <span style={{ flex: 1, lineHeight: 1.4 }}>{t.msg}</span>
          <button onClick={() => dismiss(t.id)}>✕</button>
        </div>
      ))}
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((msg, type = 'success') => {
    const id = ++tid
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }, [])

  const dismiss = useCallback(id => setToasts(t => t.filter(x => x.id !== id)), [])

  return (
    <ToastCtx.Provider value={{ showToast }}>
      {children}
      <ToastList toasts={toasts} dismiss={dismiss} />
    </ToastCtx.Provider>
  )
}

export const useToast = () => useContext(ToastCtx)
