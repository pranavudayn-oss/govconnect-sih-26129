import React, { useState, useEffect } from 'react'
import {
  LockKeyhole, ShieldCheck, AlertTriangle, CheckCircle2,
  XCircle, Clock, FileText, Ban, RefreshCw, Eye, X
} from 'lucide-react'

export function ConsentView({ currentUser, api, onRefresh }) {
  const [consents, setConsents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedConsent, setSelectedConsent] = useState(null)
  const [revokingId, setRevokingId] = useState(null)

  async function loadConsents() {
    setLoading(true)
    try {
      const res = await api('/api/consent')
      setConsents(res)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConsents()
  }, [])

  async function handleRevoke(id) {
    if (!window.confirm('Are you sure you want to revoke this consent? Connected departments will immediately lose access to your shared fields for this service request.')) {
      return
    }
    setRevokingId(id)
    try {
      await api(`/api/consent/${id}/revoke`, { method: 'POST' })
      await loadConsents()
      if (onRefresh) onRefresh()
    } catch (err) {
      alert(err.message)
    } finally {
      setRevokingId(null)
    }
  }

  const activeCount = consents.filter(c => c.status === 'ACTIVE').length

  return (
    <>
      {/* Consent Center Hero */}
      <div className="panel" style={{ padding: '24px 28px', marginBottom: '24px', background: 'linear-gradient(135deg, #064e3b, #0f766e)', color: '#fff' }}>
        <div style={{ maxWidth: '750px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 700, marginBottom: '10px' }}>
            <ShieldCheck size={14} /> Digital Personal Data Protection (DPDP) Act 2023 Aligned
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0 10px', color: '#fff' }}>
            Citizen Consent & Purpose Limitation Manager
          </h2>
          <p style={{ fontSize: '13px', color: '#ccfbf1', lineHeight: 1.55 }}>
            <b>"Your information is shared only for the selected purpose."</b><br />
            GovConnect adheres strictly to purpose-limited data sharing. No department receives citizen records
            outside their explicitly authorized operational mandate. You hold continuous sovereign control to inspect
            and revoke permissions at any time.
          </p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon green"><ShieldCheck size={22} /></div>
          <div className="stat-content">
            <small>Active Consents</small>
            <strong>{activeCount}</strong>
            <span>Authorized transfers</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><Ban size={22} /></div>
          <div className="stat-content">
            <small>Revoked Consents</small>
            <strong>{consents.filter(c => c.status === 'REVOKED').length}</strong>
            <span>Access terminated</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><Clock size={22} /></div>
          <div className="stat-content">
            <small>Consent Validity</small>
            <strong>90 Days</strong>
            <span>Standard DPDP lifecycle</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon teal"><FileText size={22} /></div>
          <div className="stat-content">
            <small>Audit Trail Logged</small>
            <strong>100% Traceable</strong>
            <span>Append-only ledger</span>
          </div>
        </div>
      </div>

      {/* Consents Table Panel */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Active & Historical Consent Authorizations</h3>
            <p>Purpose-bound authorizations registered through the Interoperability Gateway</p>
          </div>
          <button className="icon-btn" onClick={loadConsents} title="Refresh consents">
            <RefreshCw size={16} />
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Department</th>
                <th>Service Purpose</th>
                <th>Permitted Data Fields</th>
                <th>Granted Date</th>
                <th>Expires Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {consents.map(c => (
                <tr key={c.id}>
                  <td>
                    <b>{c.department_name}</b>
                    <span className="mono" style={{ fontSize: '10.5px', color: 'var(--muted)' }}>{c.department_code}</span>
                  </td>
                  <td>
                    <b>{c.purpose}</b>
                    {c.tracking_id && (
                      <span className="mono" style={{ color: 'var(--blue)', fontSize: '11px' }}>
                        Ref: {c.tracking_id}
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {c.data_requested.map(field => (
                        <span key={field} className="chip" style={{ fontSize: '10px' }}>{field}</span>
                      ))}
                    </div>
                  </td>
                  <td>{new Date(c.created_at).toLocaleDateString()}</td>
                  <td>{new Date(c.expires_at).toLocaleDateString()}</td>
                  <td>
                    <span className={`status ${c.status === 'ACTIVE' ? 'approved' : 'rejected'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                        onClick={() => setSelectedConsent(c)}
                      >
                        <Eye size={12} /> View
                      </button>
                      {c.status === 'ACTIVE' && (
                        <button
                          className="btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--red)' }}
                          onClick={() => handleRevoke(c.id)}
                          disabled={revokingId === c.id}
                        >
                          <Ban size={12} /> Revoke
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {consents.length === 0 && !loading && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--muted)' }}>
                    No consent records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Consent Detail Modal */}
      {selectedConsent && (
        <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setSelectedConsent(null)}>
          <div className="modal" style={{ width: '560px' }}>
            <div className="modal-head">
              <div>
                <span className={`status ${selectedConsent.status === 'ACTIVE' ? 'approved' : 'rejected'}`}>
                  {selectedConsent.status}
                </span>
                <h2 style={{ marginTop: '6px' }}>Consent Specification</h2>
                <p>Purpose-bound authorization ledger entry</p>
              </div>
              <button className="icon-btn" onClick={() => setSelectedConsent(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12.5px', marginBottom: '16px' }}>
              <div style={{ background: 'var(--surface-alt)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--muted)', fontSize: '10px', textTransform: 'uppercase', display: 'block' }}>Department</span>
                <b>{selectedConsent.department_name} ({selectedConsent.department_code})</b>
              </div>
              <div style={{ background: 'var(--surface-alt)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--muted)', fontSize: '10px', textTransform: 'uppercase', display: 'block' }}>Scope</span>
                <b>{selectedConsent.scope}</b>
              </div>
              <div style={{ background: 'var(--surface-alt)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--muted)', fontSize: '10px', textTransform: 'uppercase', display: 'block' }}>Citizen Reference</span>
                <b className="mono">{selectedConsent.citizen_ref}</b>
              </div>
              <div style={{ background: 'var(--surface-alt)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--muted)', fontSize: '10px', textTransform: 'uppercase', display: 'block' }}>Expires On</span>
                <b>{new Date(selectedConsent.expires_at).toLocaleString()}</b>
              </div>
            </div>

            <div style={{ background: 'var(--surface-alt)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
              <span style={{ color: 'var(--muted)', fontSize: '10.5px', textTransform: 'uppercase', display: 'block' }}>Authorized Purpose</span>
              <b style={{ color: 'var(--ink)', fontSize: '13px' }}>{selectedConsent.purpose}</b>
            </div>

            <div style={{ background: 'var(--surface-alt)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '20px' }}>
              <span style={{ color: 'var(--muted)', fontSize: '10.5px', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Permitted Data Fields Shared</span>
              <div className="shared-chips">
                {selectedConsent.data_requested.map(field => (
                  <span key={field} className="chip">{field}</span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="btn-secondary" onClick={() => setSelectedConsent(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
