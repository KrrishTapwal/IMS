import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'

export default function Login() {
  const { login } = useApp()
  const [email, setEmail]     = useState('admin@store.com')
  const [pass, setPass]       = useState('admin123')
  const [error, setError]     = useState('')
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
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div style={{ width: 60, height: 60, borderRadius: 14, background: '#DC2626', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, boxShadow: '0 4px 14px rgba(220,38,38,.4)' }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 18, letterSpacing: '-1px' }}>RB</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#111827', letterSpacing: '-.5px' }}>Red Bean IMS</div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4, fontWeight: 500 }}>Inventory Management System</div>
        </div>

        {error && <div className="al ae" style={{ marginBottom: 14 }}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="fg">
            <label>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required placeholder="Enter your email" />
          </div>
          <div className="fg">
            <label>Password</label>
            <input type="password" value={pass} onChange={e => setPass(e.target.value)} autoComplete="current-password" required placeholder="Enter your password" />
          </div>
          <button className="btn bp" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 6, fontSize: 14 }}>
            {loading ? <span className="sp" style={{ borderTopColor: '#fff' }} /> : 'Sign In →'}
          </button>
        </form>

        <div className="db">
          <strong style={{ color: '#DC2626' }}>Demo Credentials</strong><br />
          Admin — admin@store.com / admin123<br />
          User &nbsp;— user@store.com / user123
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 10, color: '#9CA3AF', lineHeight: 1.8 }}>
          created by ankush &nbsp;·&nbsp; designed by krrish &amp; ritesh
        </div>
      </div>
    </div>
  )
}
