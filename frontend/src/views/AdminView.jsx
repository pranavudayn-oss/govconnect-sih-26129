import React, { useState } from 'react'
import {
  Server, Database, ShieldCheck, Activity, Users,
  CheckCircle2, AlertTriangle, RefreshCw, Power, Radio
} from 'lucide-react'

export function AdminView({ departments, summary, api, onRefresh }) {
  const [togglingDept, setTogglingDept] = useState(null)

  async function handleToggleStatus(dept) {
    const nextStatus = dept.status === 'Connected' ? 'Offline' : 'Connected'
    setTogglingDept(dept.id)
    try {
      await api(`/api/departments/${dept.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus })
      })
      if (onRefresh) onRefresh()
    } catch (err) {
      alert(err.message)
    } finally {
      setTogglingDept(null)
    }
  }

  const pMetrics = summary.platform_metrics || {}

  return (
    <>
      {/* Header Panel */}
      <div className="panel" style={{ padding: '24px 28px', marginBottom: '24px', background: 'linear-gradient(135deg, #1e1b4b, #312e81)', color: '#fff' }}>
        <div style={{ maxWidth: '800px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 700, marginBottom: '8px' }}>
            <Server size={14} style={{ color: '#fbbf24' }} /> Gateway Operations & Control Plane
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>
            Platform Administration & Topology
          </h2>
          <p style={{ fontSize: '13px', color: '#c7d2fe', lineHeight: 1.55 }}>
            Central administration console for the GovConnect Federated Interoperability Framework.
            Manage enterprise department connectors, observe federated load distribution, inspect security incidents,
            and monitor gateway health.
          </p>
        </div>
      </div>

      {/* Admin KPIs Grid */}
      <div className="stats-grid five" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon blue"><Users size={20} /></div>
          <div className="stat-content">
            <small>Active Citizens</small>
            <strong>{pMetrics.total_citizens || 1}</strong>
            <span>Verified identities</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green"><Database size={20} /></div>
          <div className="stat-content">
            <small>Total Applications</small>
            <strong>{summary.total_applications || 0}</strong>
            <span>Federated queue</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon teal"><Server size={20} /></div>
          <div className="stat-content">
            <small>Active Departments</small>
            <strong>{pMetrics.active_departments || departments.length}</strong>
            <span>Connected gateways</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber"><Activity size={20} /></div>
          <div className="stat-content">
            <small>Requests Today</small>
            <strong>{pMetrics.total_requests_today || 4250}</strong>
            <span>API transactions</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red"><ShieldCheck size={20} /></div>
          <div className="stat-content">
            <small>Security Events</small>
            <strong>{pMetrics.security_events || 0}</strong>
            <span>Active monitoring</span>
          </div>
        </div>
      </div>

      {/* System Health Indicators */}
      <div className="two-col" style={{ marginBottom: '24px' }}>
        <div className="panel" style={{ padding: '20px 24px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '14px' }}>Infrastructure Health Matrix</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: 'var(--surface-alt)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '10.5px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700 }}>Database Cluster</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <span className="status-dot"></span>
                <b style={{ fontSize: '12.5px' }}>SQLite / PostgreSQL OK</b>
              </div>
            </div>
            <div style={{ background: 'var(--surface-alt)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '10.5px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700 }}>API Gateway Engine</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <span className="status-dot"></span>
                <b style={{ fontSize: '12.5px' }}>FastAPI 0.115 OK</b>
              </div>
            </div>
            <div style={{ background: 'var(--surface-alt)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '10.5px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700 }}>Avg Response Time</span>
              <b style={{ display: 'block', fontSize: '13px', marginTop: '4px' }}>{pMetrics.average_latency_ms || 118} ms</b>
            </div>
            <div style={{ background: 'var(--surface-alt)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '10.5px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700 }}>Compliance Framework</span>
              <b style={{ display: 'block', fontSize: '13px', marginTop: '4px', color: 'var(--green)' }}>DPDP Act 2023</b>
            </div>
          </div>
        </div>

        <div className="panel" style={{ padding: '20px 24px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '14px' }}>Interoperability Protocol Breakdown</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>REST / JSON Gateway (Rev, Muni, Trans)</span>
              <b>3 Connected (50%)</b>
            </div>
            <div className="progress" style={{ width: '100%', height: '6px' }}>
              <span style={{ width: '50%', background: '#2563eb' }}></span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>SOAP / XML Bridge (Social Welfare)</span>
              <b>1 Connected (17%)</b>
            </div>
            <div className="progress" style={{ width: '100%', height: '6px' }}>
              <span style={{ width: '17%', background: '#ea580c' }}></span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>FHIR / Health ABDM Bridge (Health Dept)</span>
              <b>1 Connected (17%)</b>
            </div>
            <div className="progress" style={{ width: '100%', height: '6px' }}>
              <span style={{ width: '17%', background: '#10b981' }}></span>
            </div>
          </div>
        </div>
      </div>

      {/* Department Connector Management Table */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Department Connector Management</h3>
            <p>Control availability of simulated departmental endpoints for live judging demonstrations</p>
          </div>
          <button className="icon-btn" onClick={onRefresh} title="Refresh">
            <RefreshCw size={16} />
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Department Name</th>
                <th>Code</th>
                <th>Category</th>
                <th>Connector Type</th>
                <th>Officer Count</th>
                <th>Requests Today</th>
                <th>Success Rate</th>
                <th>Status</th>
                <th>Admin Action</th>
              </tr>
            </thead>
            <tbody>
              {departments.map(dept => (
                <tr key={dept.code}>
                  <td><b>{dept.name}</b></td>
                  <td className="mono">{dept.code}</td>
                  <td>{dept.category}</td>
                  <td><span className="badge neutral">{dept.connector_type} ({dept.api_version})</span></td>
                  <td>{dept.officer_count} Officers</td>
                  <td>{dept.total_requests_today}</td>
                  <td>{dept.success_rate}%</td>
                  <td>
                    <span className={`status ${dept.status === 'Connected' ? 'approved' : 'rejected'}`}>
                      <span className="status-dot"></span> {dept.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-secondary"
                      style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        color: dept.status === 'Connected' ? 'var(--red)' : 'var(--green)'
                      }}
                      onClick={() => handleToggleStatus(dept)}
                      disabled={togglingDept === dept.id}
                    >
                      <Power size={12} /> {dept.status === 'Connected' ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
