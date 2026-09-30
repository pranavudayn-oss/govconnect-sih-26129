import React, { useState, useMemo } from 'react'
import {
  Gauge, Search, Filter, AlertTriangle, CheckCircle2,
  Clock3, ClipboardList, Activity, ArrowRight, XCircle,
  Building, Check, PauseCircle, ChevronRight, CornerUpRight
} from 'lucide-react'

export function OfficerView({
  apps,
  departments,
  summary,
  search,
  setSearch,
  setSelectedApp,
  setModal
}) {
  const [selectedDept, setSelectedDept] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [selectedPriority, setSelectedPriority] = useState('All')
  const [slaRiskOnly, setSlaRiskOnly] = useState(false)

  // Status values
  const statuses = [
    'All', 'Submitted', 'Under Verification', 'In Review',
    'Forwarded', 'Action Required', 'Approved', 'Completed', 'On Hold', 'Rejected'
  ]

  // Filter logic
  const filteredApps = useMemo(() => {
    return apps.filter(a => {
      const matchSearch = !search ||
        a.tracking_id.toLowerCase().includes(search.toLowerCase()) ||
        a.service_name.toLowerCase().includes(search.toLowerCase()) ||
        a.applicant_name.toLowerCase().includes(search.toLowerCase()) ||
        a.citizen_ref.toLowerCase().includes(search.toLowerCase())

      const matchDept = selectedDept === 'All' || String(a.department_id) === String(selectedDept) || a.department_code === selectedDept
      const matchStatus = selectedStatus === 'All' || a.status.toLowerCase() === selectedStatus.toLowerCase()
      const matchPrio = selectedPriority === 'All' || a.priority === selectedPriority
      const matchSla = !slaRiskOnly || a.sla_risk === true

      return matchSearch && matchDept && matchStatus && matchPrio && matchSla
    })
  }, [apps, search, selectedDept, selectedStatus, selectedPriority, slaRiskOnly])

  // Aggregate stats for charts
  const deptCounts = useMemo(() => {
    const counts = {}
    departments.forEach(d => { counts[d.name] = 0 })
    apps.forEach(a => {
      counts[a.department_name] = (counts[a.department_name] || 0) + 1
    })
    return counts
  }, [apps, departments])

  return (
    <>
      {/* Officer Command KPIs */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: '22px' }}>
        <div className="stat-card">
          <div className="stat-icon blue"><ClipboardList size={22} /></div>
          <div className="stat-content">
            <small>Total In Queue</small>
            <strong>{summary.total_applications || apps.length}</strong>
            <span>Active docket</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber"><Clock3 size={22} /></div>
          <div className="stat-content">
            <small>Under Verification</small>
            <strong>{apps.filter(a => ['Submitted', 'Under Verification'].includes(a.status)).length}</strong>
            <span>Initial review</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange"><Activity size={22} /></div>
          <div className="stat-content">
            <small>In Processing</small>
            <strong>{apps.filter(a => ['In Review', 'Forwarded'].includes(a.status)).length}</strong>
            <span>Active workflows</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green"><CheckCircle2 size={22} /></div>
          <div className="stat-content">
            <small>Completed</small>
            <strong>{apps.filter(a => a.status === 'Completed').length}</strong>
            <span>Services delivered</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red"><AlertTriangle size={22} /></div>
          <div className="stat-content">
            <small>SLA Risk Alerts</small>
            <strong>{apps.filter(a => a.sla_risk).length}</strong>
            <span>Action overdue (&gt;48h)</span>
          </div>
        </div>
      </div>

      {/* Analytical Visualizations (Department Workload + Status Distribution) */}
      <div className="two-col" style={{ marginBottom: '22px' }}>
        {/* Department Workload Distribution */}
        <div className="panel" style={{ padding: '18px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 800 }}>Workload Distribution by Department</h4>
            <span className="badge neutral">Federated</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.entries(deptCounts).slice(0, 5).map(([dept, count]) => {
              const pct = apps.length ? Math.round((count / apps.length) * 100) : 0
              return (
                <div key={dept}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '3px' }}>
                    <b style={{ color: 'var(--ink)' }}>{dept}</b>
                    <span style={{ color: 'var(--muted)' }}>{count} cases ({pct}%)</span>
                  </div>
                  <div className="progress" style={{ width: '100%', height: '7px' }}>
                    <span style={{ width: `${pct}%`, background: '#2563eb' }}></span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Processing Status Breakdown */}
        <div className="panel" style={{ padding: '18px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 800 }}>Pipeline Health & SLA Compliance</h4>
            <span className="badge green">99.2% on SLA</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '10px' }}>
            <div style={{ background: 'var(--surface-alt)', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <span style={{ fontSize: '10.5px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700 }}>Avg Turnaround</span>
              <strong style={{ display: 'block', fontSize: '18px', color: 'var(--ink)', margin: '4px 0' }}>3.2 Days</strong>
              <small style={{ color: 'var(--green)', fontSize: '10px' }}>Target: 7 Days</small>
            </div>
            <div style={{ background: 'var(--surface-alt)', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <span style={{ fontSize: '10.5px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700 }}>Auto-Dispatched</span>
              <strong style={{ display: 'block', fontSize: '18px', color: 'var(--blue)', margin: '4px 0' }}>82%</strong>
              <small style={{ color: 'var(--muted)', fontSize: '10px' }}>Connector routing</small>
            </div>
            <div style={{ background: 'var(--surface-alt)', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <span style={{ fontSize: '10.5px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700 }}>Grievance Rate</span>
              <strong style={{ display: 'block', fontSize: '18px', color: 'var(--green)', margin: '4px 0' }}>0.4%</strong>
              <small style={{ color: 'var(--muted)', fontSize: '10px' }}>Below 1% ceiling</small>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Department Application Queue Table */}
      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>Cross-Department Unified Queue</h3>
            <p>Single dashboard for verification, cross-department forwarding, and statutory approvals</p>
          </div>
          <span className="badge neutral">{filteredApps.length} applications matching filters</span>
        </div>

        {/* Filter and Search Bar */}
        <div className="filter-bar">
          <div className="search-input-wrap">
            <Search size={15} style={{ color: 'var(--muted)' }} />
            <input
              type="text"
              placeholder="Filter tracking ID, applicant, or citizen ref..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="filter-select" value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>
            <option value="All">All Departments</option>
            {departments.map(d => (
              <option key={d.code} value={d.id}>{d.name} ({d.code})</option>
            ))}
          </select>

          <select className="filter-select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
            {statuses.map(s => (
              <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
            ))}
          </select>

          <select className="filter-select" value={selectedPriority} onChange={e => setSelectedPriority(e.target.value)}>
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Normal">Normal</option>
            <option value="Low">Low</option>
          </select>

          <button
            className={`filter-pill ${slaRiskOnly ? 'active' : ''}`}
            onClick={() => setSlaRiskOnly(!slaRiskOnly)}
            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <AlertTriangle size={13} /> SLA Risk Only
          </button>
        </div>

        {/* Applications Table */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tracking ID</th>
                <th>Applicant / Citizen Ref</th>
                <th>Service Name</th>
                <th>Department</th>
                <th>Workflow Stage</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Progress</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map(app => (
                <tr key={app.tracking_id}>
                  <td>
                    <b className="mono" style={{ color: 'var(--blue)' }}>{app.tracking_id}</b>
                    <small style={{ color: 'var(--muted)', fontSize: '10px' }}>{new Date(app.created_at).toLocaleDateString()}</small>
                  </td>
                  <td>
                    <b>{app.applicant_name}</b>
                    <span className="mono" style={{ fontSize: '10.5px', color: 'var(--muted)' }}>{app.citizen_ref}</span>
                  </td>
                  <td>
                    <b>{app.service_name}</b>
                    <span style={{ fontSize: '10.5px', color: 'var(--muted)' }}>{app.category}</span>
                  </td>
                  <td>
                    <b>{app.department_name}</b>
                    <span style={{ fontSize: '10.5px', color: 'var(--muted)' }}>{app.department_code}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '11.5px', color: 'var(--ink)' }}>{app.stage}</span>
                  </td>
                  <td>
                    <span className={`status ${app.status.toLowerCase().replaceAll(' ', '-')}`}>
                      {app.status}
                    </span>
                  </td>
                  <td>
                    <span className={`prio-${(app.priority || 'Normal').toLowerCase()}`}>
                      {app.priority || 'Normal'}
                    </span>
                    {app.sla_risk && (
                      <span title="SLA Risk Alert" style={{ marginLeft: '4px', color: 'var(--red)', fontWeight: 800 }}>!</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div className="progress" style={{ width: '50px' }}>
                        <span style={{ width: `${app.progress}%` }}></span>
                      </div>
                      <small style={{ fontSize: '10.5px', color: 'var(--muted)' }}>{app.progress}%</small>
                    </div>
                  </td>
                  <td>
                    <button
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '11.5px', fontWeight: 700, color: 'var(--blue)' }}
                      onClick={() => setSelectedApp(app)}
                    >
                      Process Case →
                    </button>
                  </td>
                </tr>
              ))}
              {filteredApps.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: 'var(--muted)' }}>
                    No applications matched your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
