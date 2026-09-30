import React, { useState } from 'react'
import {
  Network, Link2, Database, ShieldCheck, Activity,
  Server, Globe2, RefreshCw, Radio, CheckCircle2,
  AlertTriangle, Play, Cpu, ArrowUpRight
} from 'lucide-react'

export function IntegrationView({ departments, audit, summary, api, onRefresh }) {
  const [pingingDept, setPingingDept] = useState(null)
  const [pingResults, setPingResults] = useState({})

  async function handlePing(dept) {
    setPingingDept(dept.id)
    try {
      const res = await api(`/api/departments/${dept.id}/ping`, { method: 'POST' })
      setPingResults(prev => ({ ...prev, [dept.id]: res }))
      if (onRefresh) onRefresh()
    } catch (err) {
      alert(err.message)
    } finally {
      setPingingDept(null)
    }
  }

  // Simulated gateway transactions feed
  const gatewayEvents = [
    { method: 'POST', endpoint: '/api/v2/packets/forward', dept: 'REV', status: 200, latency: '112ms', time: '1m ago' },
    { method: 'GET', endpoint: '/api/v1/consents/validate', dept: 'GATEWAY', status: 200, latency: '24ms', time: '2m ago' },
    { method: 'POST', endpoint: '/sarathi/licensing/sync', dept: 'TRANS', status: 200, latency: '105ms', time: '3m ago' },
    { method: 'POST', endpoint: '/municipal/tax/verify', dept: 'MUNI', status: 200, latency: '145ms', time: '4m ago' },
    { method: 'POST', endpoint: '/welfare/pension/dbt-bridge', dept: 'SOC', status: 200, latency: '210ms', time: '6m ago' },
    { method: 'GET', endpoint: '/abdm/fhir/r4/coverage', dept: 'HEALTH', status: 200, latency: '160ms', time: '8m ago' }
  ]

  return (
    <>
      {/* Control Plane Hero */}
      <div className="panel" style={{ padding: '24px 28px', marginBottom: '24px', background: 'linear-gradient(135deg, #09192d, #14355a)', color: '#fff' }}>
        <div style={{ maxWidth: '800px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.12)', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 700, marginBottom: '8px' }}>
            <Radio size={12} style={{ color: '#22c55e' }} /> Federated Service Bus · SIH 2026 Core Innovation
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0 10px', color: '#fff' }}>
            Interoperability Control Plane & Gateway Monitor
          </h2>
          <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.55 }}>
            GovConnect operates as a lightweight, federated middleware orchestration plane.
            Instead of replacing legacy departmental IT silos, reusable enterprise connectors expose
            standardized REST, SOAP, and FHIR endpoints to provide seamless cross-department transaction execution.
          </p>
        </div>
      </div>

      {/* Control Plane KPIs */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon blue"><Link2 size={22} /></div>
          <div className="stat-content">
            <small>Connected Connectors</small>
            <strong>{departments.filter(d => d.status === 'Connected').length} / {departments.length}</strong>
            <span>Active endpoints</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Activity size={22} /></div>
          <div className="stat-content">
            <small>Gateway Success Rate</small>
            <strong>99.2%</strong>
            <span>Zero drop guarantee</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><Cpu size={22} /></div>
          <div className="stat-content">
            <small>Average Latency</small>
            <strong>124 ms</strong>
            <span>Federated roundtrip</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon teal"><ShieldCheck size={22} /></div>
          <div className="stat-content">
            <small>DPDP Consent Bus</small>
            <strong>Active</strong>
            <span>Zero unauthorized transfer</span>
          </div>
        </div>
      </div>

      {/* Connectors Grid */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Department Reusable Connectors</h3>
            <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
              Standardized connector adapters interfacing with legacy and modern government databases
            </p>
          </div>
          <span className="badge neutral">Prototype Simulation Mode</span>
        </div>

        <div className="integration-grid">
          {departments.map(dept => {
            const lastPing = pingResults[dept.id]
            return (
              <div className="connector-card" key={dept.code}>
                <div className="connector-card-head">
                  <div className="connector-logo">{dept.code}</div>
                  <span className={`status ${dept.status === 'Connected' ? 'approved' : 'rejected'}`}>
                    <span className="status-dot"></span> {dept.status}
                  </span>
                </div>

                <h4>{dept.name}</h4>
                <p>{dept.category} · Adapter: <b>{dept.connector_type}</b> ({dept.api_version})</p>

                <div className="connector-stats-row">
                  <div>
                    <small>Requests</small>
                    <b>{dept.total_requests_today}</b>
                  </div>
                  <div>
                    <small>Success</small>
                    <b>{dept.success_rate}%</b>
                  </div>
                  <div>
                    <small>Latency</small>
                    <b>{lastPing ? `${lastPing.latency_ms} ms` : `${dept.average_latency_ms} ms`}</b>
                  </div>
                </div>

                <div className="connector-endpoint">
                  <span><code>{dept.endpoint}</code></span>
                </div>

                <div className="connector-actions">
                  <button
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}
                    onClick={() => handlePing(dept)}
                    disabled={pingingDept === dept.id}
                  >
                    <Play size={12} style={{ color: 'var(--green)' }} />
                    {pingingDept === dept.id ? 'Pinging Gateway...' : 'Ping Test'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* API Gateway Live Monitoring Feed */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>API Gateway Live Transactions Stream</h3>
            <p>Real-time simulated interoperability requests dispatched through the gateway</p>
          </div>
          <span className="badge green">Live Ingestion Active</span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>HTTP Method</th>
                <th>Gateway Endpoint</th>
                <th>Target Department</th>
                <th>Response Status</th>
                <th>Latency</th>
                <th>Dispatched</th>
              </tr>
            </thead>
            <tbody>
              {gatewayEvents.map((ev, i) => (
                <tr key={i}>
                  <td>
                    <b className="mono" style={{ color: ev.method === 'POST' ? 'var(--blue)' : 'var(--green)', fontSize: '11.5px' }}>
                      {ev.method}
                    </b>
                  </td>
                  <td className="mono" style={{ fontSize: '12px' }}>{ev.endpoint}</td>
                  <td><b>{ev.dept} Connector</b></td>
                  <td>
                    <span className="status approved" style={{ fontSize: '10px' }}>
                      {ev.status} OK
                    </span>
                  </td>
                  <td className="mono" style={{ fontSize: '11.5px' }}>{ev.latency}</td>
                  <td style={{ color: 'var(--muted)', fontSize: '11.5px' }}>{ev.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
