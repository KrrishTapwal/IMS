import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'

export default function Login() {
  const { login } = useApp()
  const [email, setEmail]   = useState('admin@store.com')
  const [pass, setPass]     = useState('admin123')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    setTimeout(() => {
      try {
        login(email, pass)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }, 400)
  }

  return (
    <div className="lp">
      <div className="lc">
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg,var(--ac),var(--in))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 10 }}>📦</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 800, color: 'var(--tx)' }}>StockMaster</div>
          <div style={{ fontSize: 12, color: 'var(--mu)', marginTop: 3 }}>Inventory Management</div>
        </div>

        {error && <div className="al ae" style={{ marginBottom: 14 }}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="fg"><label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required />
          </div>
          <div className="fg"><label>Password</label>
            <input type="password" value={pass} onChange={e => setPass(e.target.value)} autoComplete="current-password" required />
          </div>
          <button className="btn bp" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: 12, marginTop: 4 }}>
            {loading ? <span className="sp" style={{ borderTopColor: '#0F1117', margin: '0 auto' }} /> : 'Sign In →'}
          </button>
        </form>

        <div className="db">
          <strong style={{ color: 'var(--ac)' }}>Demo:</strong><br />
          Admin: admin@store.com / admin123<br />
          User: user@store.com / user123
        </div>
      </div>
    </div>
  )
}
