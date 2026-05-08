import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

function SupplierModal({ open, onClose, editSupplier }) {
  const { addSupplier, updateSupplier } = useApp()
  const { showToast } = useToast()
  const blank = { name:'', contactPerson:'', phone:'', email:'', address:'', notes:'' }
  const [form, setForm]     = useState(editSupplier ? { ...editSupplier } : blank)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSave() {
    if (!form.name.trim()) { setError('Supplier name is required'); return }
    setLoading(true); setError('')
    try {
      if (editSupplier) await updateSupplier({ ...form, _id: editSupplier._id })
      else              await addSupplier(form)
      showToast(editSupplier ? `"${form.name}" updated` : `"${form.name}" added`, 'success')
      onClose()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="mo open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mdl">
        <div className="mh">
          <span className="mtt">{editSupplier ? 'Edit Supplier' : 'Add Supplier'}</span>
          <button className="ib" onClick={onClose}>✕</button>
        </div>
        <div className="mbd">
          {error && <div className="al ae">{error}</div>}
          <div className="fg"><label>Supplier Name *</label><input value={form.name} onChange={set('name')} placeholder="e.g. ABC Traders" autoFocus /></div>
          <div className="g2f">
            <div className="fg"><label>Contact Person</label><input value={form.contactPerson} onChange={set('contactPerson')} placeholder="Mr. Sharma" /></div>
            <div className="fg"><label>Phone</label><input value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" /></div>
          </div>
          <div className="g2f">
            <div className="fg"><label>Email</label><input type="email" value={form.email} onChange={set('email')} placeholder="contact@supplier.com" /></div>
            <div className="fg"><label>City / Address</label><input value={form.address} onChange={set('address')} placeholder="Mumbai, Maharashtra" /></div>
          </div>
          <div className="fg"><label>Notes</label><input value={form.notes} onChange={set('notes')} placeholder="Optional notes..." /></div>
          <div className="mft">
            <button className="btn bp" onClick={handleSave} disabled={loading}>
              {loading ? <span className="sp" /> : (editSupplier ? 'Update' : 'Add Supplier')}
            </button>
            <button className="btn bss" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Suppliers() {
  const { suppliers, deleteSupplier, auth } = useApp()
  const { showToast } = useToast()
  const [modal, setModal]   = useState(false)
  const [edit, setEdit]     = useState(null)
  const [search, setSearch] = useState('')
  const isAdmin = auth?.role === 'Admin'

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.contactPerson || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.phone || '').includes(search) ||
    (s.email || '').toLowerCase().includes(search.toLowerCase())
  )

  function openAdd()  { setEdit(null); setModal(true) }
  function openEdit(s){ setEdit(s);    setModal(true) }

  async function handleDelete(s) {
    if (!confirm(`Delete supplier "${s.name}"?`)) return
    try {
      await deleteSupplier(s._id)
      showToast(`"${s.name}" deleted`, 'success')
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  return (
    <>
      <div className="tb">
        <div className="sw2">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input className="si2" type="text" placeholder="Search suppliers..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <span style={{ fontSize:12, color:'var(--mu)' }}>{filtered.length} supplier{filtered.length !== 1 ? 's' : ''}</span>
        {isAdmin && <button className="btn bp" onClick={openAdd}>+ Supplier</button>}
      </div>

      <div className="tw">
        <table>
          <thead>
            <tr>
              <th>Supplier Name</th>
              <th>Contact Person</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Location</th>
              {isAdmin && <th></th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0
              ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} style={{ padding:0 }}>
                    <div className="empty">
                      <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                      <p>{search ? 'No suppliers match your search' : 'No suppliers added yet'}</p>
                    </div>
                  </td>
                </tr>
              )
              : filtered.map(s => (
                <tr key={String(s._id)}>
                  <td>
                    <strong>{s.name}</strong>
                    {s.notes && <div style={{ fontSize:10, color:'var(--mu)', marginTop:2 }}>{s.notes}</div>}
                  </td>
                  <td style={{ color:'var(--mu)', fontSize:12 }}>{s.contactPerson || '-'}</td>
                  <td style={{ fontFamily:'monospace', fontSize:12 }}>{s.phone || '-'}</td>
                  <td style={{ fontSize:12 }}>{s.email || '-'}</td>
                  <td style={{ color:'var(--mu)', fontSize:12 }}>{s.address || '-'}</td>
                  {isAdmin && (
                    <td style={{ whiteSpace:'nowrap' }}>
                      <button className="ib" title="Edit" onClick={() => openEdit(s)}>
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button className="ib" title="Delete" onClick={() => handleDelete(s)}>
                        <svg width="13" height="13" fill="none" stroke="#DC2626" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                    </td>
                  )}
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      <SupplierModal open={modal} onClose={() => setModal(false)} editSupplier={edit} key={edit?._id || 'new'} />
    </>
  )
}
