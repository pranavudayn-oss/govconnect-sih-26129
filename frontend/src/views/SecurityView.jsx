import React, { useState, useEffect } from 'react'
import {
  ShieldCheck, Lock, Key, Server, AlertTriangle,
  CheckCircle2, RefreshCw, Radio, Terminal, FileText
} from 'lucide-react'

export function SecurityView({ api }) {
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [probeResult, setProbeResult] = useState(null)
  const [busy, setBusy] = useState(false)

  async function loadSecurity() {
    setLoading(true)
    try {
      const res = await api('/api/security/overview')
      setOverview(res)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSecurity()
  }, [])

  async function triggerSecurityProbe() {
    setBusy(true)
    try {
      const res = await api('/api/security/test-event', { method: 'POST' })
      setProbeResult(res)
      await loadSecurity()
    } catch (err) {
      alert(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      {/* Security Hero Panel */}
      <div className="panel" style={{ padding: '24px 28px', marginBottom: '24px', background: 'linear-gradient(135deg, #09131f, #11263d)', color: '#fff' }}>
        <div style={{ maxWidth: '780px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.12)', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 700, marginBottom: '8px' }}>
            <ShieldCheck size={14} style={{ color: '#22c55e' }} /> Hardened Prototype Security Architecture
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0 10px', color: '#fff' }}>
            Security, Identity & Trust Center
          </h2>
          <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.55 }}>
            GovConnect implements realistic enterprise security patterns for federated public infrastructure:
            strict Role-Based Access Control, DPDP 2023 purpose-bound consent enforcement, tamper-evident
            append-only audit logs, sanitized API responses, and strict input validation boundaries.
          </p>
        </div>
      </div>

      {/* Compliance Alignment Badges */}
      <div className="panel" style={{ padding: '16px 22px', marginBottom: '22px' }}>
        <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
          STATUTORY & ARCHITECTURAL COMPLIANCE
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {overview?.compliance_alignment?.map((comp, idx) => (
            <span key={idx} className="badge blue" style={{ padding: '6px 12px', fontSize: '11.5px' }}>
              <CheckCircle2 size={13} /> {comp}
            </span>
          ))}
        </div>
      </div>

      {/* Active Security Controls Grid */}
      <div className="panel" style={{ marginBottom: '24px' }}>
        <div className="panel-head">
          <div>
            <h3>Active Prototype Security Controls</h3>
            <p>Verified security safeguards operating across the frontend and FastAPI backend</p>
          </div>
          <button
            className="btn-primary"
            style={{ padding: '6px 14px', fontSize: '11.5px', background: 'var(--blue)' }}
            onClick={triggerSecurityProbe}
            disabled={busy}
          >
            <ShieldCheck size={14} /> {busy ? 'Probing...' : 'Run Security Integrity Check'}
          </button>
        </div>

        <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          {overview?.active_controls?.map((ctrl, i) => (
            <div
              key={i}
              style={{
                background: 'var(--surface-alt)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <b style={{ fontSize: '13px', color: 'var(--ink)' }}>{ctrl.name}</b>
                <span className={`status ${ctrl.status === 'ENFORCED' || ctrl.status === 'ACTIVE' ? 'approved' : 'neutral'}`} style={{ fontSize: '10px' }}>
                  {ctrl.status}
                </span>
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--muted)', lineHeight: 1.45 }}>
                {ctrl.details}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Security Audit Events Feed */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Recent Security & Authentication Events</h3>
            <p>Cryptographic hash verification, token renewals, and access boundary audits</p>
          </div>
          <button className="icon-btn" onClick={loadSecurity} title="Refresh">
            <RefreshCw size={16} />
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Security Action</th>
                <th>Target Resource</th>
                <th>Result</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {overview?.recent_security_events?.map(ev => (
                <tr key={ev.id}>
                  <td className="mono" style={{ fontSize: '11px', color: 'var(--muted)' }}>
                    {new Date(ev.created_at).toLocaleString()}
                  </td>
                  <td><b>{ev.actor}</b> ({ev.role})</td>
                  <td className="mono" style={{ color: 'var(--blue)', fontSize: '11.5px', fontWeight: 600 }}>{ev.action}</td>
                  <td className="mono" style={{ fontSize: '11.5px' }}>{ev.resource}</td>
                  <td><span className="status approved" style={{ fontSize: '10px' }}>{ev.result}</span></td>
                  <td style={{ fontSize: '11.5px', color: 'var(--ink-secondary)' }}>{ev.detail}</td>
                </tr>
              ))}
              {overview?.recent_security_events?.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--muted)' }}>
                    No security alerts recorded. Systems operating securely.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
