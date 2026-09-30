import React, { useState, useEffect } from 'react'
import {
  FileText, Search, Download, Filter, RefreshCw,
  ShieldCheck, AlertCircle, CheckCircle2, ChevronRight
} from 'lucide-react'

export function AuditView({ api }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('All')
  const [role, setRole] = useState('All')
  const [search, setSearch] = useState('')

  const categories = [
    'All',
    'LOGIN',
    'APPLICATION_CREATED',
    'DOCUMENT_UPLOADED',
    'CONSENT_GRANTED',
    'CONSENT_REVOKED',
    'STATUS_CHANGED',
    'APPLICATION_FORWARDED',
    'APPLICATION_APPROVED',
    'APPLICATION_REJECTED',
    'CONNECTOR_REQUEST',
    'SECURITY_EVENT'
  ]

  const roles = ['All', 'CITIZEN', 'OFFICER', 'DEPARTMENT_ADMIN', 'SYSTEM_ADMIN', 'SYSTEM']

  async function loadAudit() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category !== 'All') params.append('category', category)
      if (role !== 'All') params.append('role', role)
      if (search) params.append('search', search)

      const res = await api(`/api/audit?${params.toString()}`)
      setLogs(res)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAudit()
  }, [category, role])

  function handleExportCsv() {
    window.open('http://localhost:8000/api/audit/export', '_blank')
  }

  return (
    <>
      {/* Header Panel */}
      <div className="panel" style={{ padding: '24px 28px', marginBottom: '24px', background: 'linear-gradient(135deg, #111827, #1f2937)', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.12)', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 700, marginBottom: '8px' }}>
              <ShieldCheck size={14} style={{ color: '#22c55e' }} /> Immutable Compliance Trail
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>
              Enterprise Audit & Accountability Ledger
            </h2>
            <p style={{ fontSize: '13px', color: '#9ca3af', maxWidth: '700px', marginTop: '4px' }}>
              Every authentication, consent grant, document upload, status transition, and inter-departmental
              connector packet is recorded immutably with actor, role, timestamp, and IP provenance.
            </p>
          </div>
          <button className="btn-primary" onClick={handleExportCsv} style={{ background: '#3b82f6', color: '#fff' }}>
            <Download size={15} /> Export Audit Log (CSV)
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="panel" style={{ marginBottom: '20px' }}>
        <div className="filter-bar">
          <div className="search-input-wrap">
            <Search size={15} style={{ color: 'var(--muted)' }} />
            <input
              type="text"
              placeholder="Search audit actions, tracking IDs, actors, details..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && loadAudit()}
            />
          </div>

          <select className="filter-select" value={category} onChange={e => setCategory(e.target.value)}>
            {categories.map(c => (
              <option key={c} value={c}>{c === 'All' ? 'All Event Categories' : c}</option>
            ))}
          </select>

          <select className="filter-select" value={role} onChange={e => setRole(e.target.value)}>
            {roles.map(r => (
              <option key={r} value={r}>{r === 'All' ? 'All Actor Roles' : r}</option>
            ))}
          </select>

          <button className="icon-btn" onClick={loadAudit} title="Refresh audit log">
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Audit Log Table */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Role</th>
                <th>Action & Category</th>
                <th>Department</th>
                <th>Target Resource</th>
                <th>Provenance / IP</th>
                <th>Result</th>
                <th>Transaction Detail</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td className="mono" style={{ fontSize: '11px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td>
                    <b>{log.actor}</b>
                  </td>
                  <td>
                    <span className="badge neutral" style={{ fontSize: '10px' }}>{log.role}</span>
                  </td>
                  <td>
                    <b style={{ fontSize: '12px', color: 'var(--ink)' }}>{log.action}</b>
                    <span style={{ display: 'block', fontSize: '10px', color: 'var(--muted)' }}>{log.category}</span>
                  </td>
                  <td>
                    <b>{log.department_code || 'GATEWAY'}</b>
                  </td>
                  <td className="mono" style={{ fontSize: '11px', color: 'var(--blue)' }}>
                    {log.resource}
                  </td>
                  <td className="mono" style={{ fontSize: '10.5px', color: 'var(--muted)' }}>
                    {log.ip_address}
                  </td>
                  <td>
                    <span className={`status ${log.result === 'SUCCESS' ? 'approved' : 'rejected'}`} style={{ fontSize: '10px' }}>
                      {log.result}
                    </span>
                  </td>
                  <td style={{ fontSize: '11.5px', color: 'var(--ink-secondary)', maxWidth: '320px' }}>
                    {log.detail}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && !loading && (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: 'var(--muted)' }}>
                    No audit records match your query.
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
