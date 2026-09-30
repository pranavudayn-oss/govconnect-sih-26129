import React from 'react'
import {
  LockKeyhole, ArrowRight, Plus, ClipboardList, Clock3,
  CheckCircle2, Bell, ShieldCheck, Database, Server,
  Globe2, FileText, ChevronRight, UserCheck, AlertTriangle,
  FolderCheck, ExternalLink
} from 'lucide-react'

export function CitizenView({
  apps,
  departments,
  notifications,
  currentUser,
  summary,
  setModal,
  setSelectedApp,
  setView
}) {
  const activeApps = apps.filter(a => !['Completed', 'Rejected'].includes(a.status))
  const actionRequiredApps = apps.filter(a => a.status === 'Action Required')
  const completedApps = apps.filter(a => a.status === 'Completed')
  const unreadNotifs = notifications.filter(n => !n.read)

  return (
    <>
      {/* Citizen Profile Card */}
      <div className="citizen-profile-banner">
        <div className="profile-main-col">
          <div className="profile-avatar-large">
            {currentUser?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'PS'}
          </div>
          <div className="profile-titles">
            <h3>
              {currentUser?.full_name || 'Priya Sharma'}
              <span className="badge green" title="Central e-KYC Verified">
                <UserCheck size={11} /> e-KYC Verified
              </span>
            </h3>
            <p className="mono" style={{ fontSize: '11.5px' }}>
              Citizen Ref: <b>{currentUser?.citizen_ref || 'CIT-DEMO-001'}</b> · Flat 402, Block B, Govt Colony, New Delhi
            </p>
          </div>
        </div>

        <div className="profile-meta-grid">
          <div className="profile-meta-item">
            <small>DPDP Consent</small>
            <b style={{ color: 'var(--green)' }}>Active & Purpose-Limited</b>
          </div>
          <div className="profile-meta-item">
            <small>Profile Completion</small>
            <b>95% Complete</b>
          </div>
          <div className="profile-meta-item">
            <small>Last Gateway Login</small>
            <b>Today, 20:15 IST</b>
          </div>
        </div>
      </div>

      {/* Hero Interoperability Banner */}
      <section className="hero">
        <div>
          <div className="hero-kicker">
            <LockKeyhole size={14} /> Single Sign-On · Purpose-Limited Data Sharing
          </div>
          <h2>
            One login. One tracking ID.<br />
            <span>Services across departments.</span>
          </h2>
          <p>
            Connect existing government systems without replacing them. Apply once with verified credentials
            and track your requests seamlessly across municipal, revenue, transport, and welfare departments.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => setModal('new')}>
              <Plus size={16} /> New Service Request
            </button>
            <button className="btn-outline" onClick={() => setView('services')}>
              Browse Government Catalog <ArrowRight size={15} />
            </button>
            <button className="btn-outline" onClick={() => setView('consent')}>
              <ShieldCheck size={15} /> Consent Center
            </button>
          </div>
        </div>

        {/* Visual Interoperability Diagram */}
        <div className="hero-diagram">
          <div className="diagram-hub">
            <ShieldCheck size={26} />
            <b>GovConnect Gateway</b>
            <span>Auth · Consent · Routing</span>
          </div>
          <div className="diagram-nodes">
            <div className="d-node n-rev"><Database size={14} /> Revenue (REST)</div>
            <div className="d-node n-muni"><Server size={14} /> Municipal (REST)</div>
            <div className="d-node n-trans"><FileText size={14} /> Transport (REST)</div>
            <div className="d-node n-soc"><Globe2 size={14} /> Welfare (SOAP)</div>
          </div>
        </div>
      </section>

      {/* Dashboard Summary Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><ClipboardList size={22} /></div>
          <div className="stat-content">
            <small>Active Applications</small>
            <strong>{activeApps.length}</strong>
            <span>Across departments</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange"><AlertTriangle size={22} /></div>
          <div className="stat-content">
            <small>Action Required</small>
            <strong>{actionRequiredApps.length}</strong>
            <span>Pending citizen review</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green"><CheckCircle2 size={22} /></div>
          <div className="stat-content">
            <small>Services Delivered</small>
            <strong>{completedApps.length}</strong>
            <span>Completed requests</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon teal"><Bell size={22} /></div>
          <div className="stat-content">
            <small>Unread Notifications</small>
            <strong>{unreadNotifs.length}</strong>
            <span>Recent status updates</span>
          </div>
        </div>
      </div>

      {/* Unified Application Tracking Panel */}
      <section className="panel" id="tracking">
        <div className="panel-head">
          <div>
            <h3>My Service Applications</h3>
            <p>Unified real-time tracking across all connected government departments</p>
          </div>
          <div className="panel-actions">
            <span className="badge neutral">{apps.length} applications</span>
            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '11.5px' }} onClick={() => setModal('new')}>
              <Plus size={14} /> Apply for Service
            </button>
          </div>
        </div>

        <div className="application-list">
          {apps.length === 0 ? (
            <div className="empty-state">
              <ClipboardList size={36} />
              <b>No service requests found</b>
              <p>Start a new request to experience cross-department interoperability.</p>
              <button className="btn-primary" onClick={() => setModal('new')} style={{ marginTop: '10px' }}>
                <Plus size={14} /> Start Service Request
              </button>
            </div>
          ) : (
            apps.map(app => (
              <button
                key={app.tracking_id}
                className="application-row"
                onClick={() => setSelectedApp(app)}
                title="Click to view detailed case timeline and documents"
              >
                <div className="app-symbol">
                  <FileText size={20} />
                </div>
                <div className="app-main">
                  <b>{app.service_name}</b>
                  <span>{app.department_name} · <span className="mono" style={{ color: 'var(--blue)' }}>{app.tracking_id}</span></span>
                </div>
                <div className="app-stage">
                  <small>Current Stage</small>
                  <b>{app.stage}</b>
                </div>
                <div className="app-progress">
                  <div className="progress">
                    <span style={{ width: `${app.progress}%` }}></span>
                  </div>
                  <small>{app.progress}%</small>
                </div>
                <div>
                  <span className={`status ${app.status.toLowerCase().replaceAll(' ', '-')}`}>
                    {app.status}
                  </span>
                </div>
                <ChevronRight size={17} style={{ color: 'var(--muted)' }} />
              </button>
            ))
          )}
        </div>
      </section>

      {/* Two Column Section: Notifications and Connected Services */}
      <section className="two-col">
        {/* Latest Notifications */}
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Recent Notifications</h3>
              <p>Cross-department status events and alerts</p>
            </div>
            <button className="text-btn" onClick={() => setView('citizen')}>
              View all
            </button>
          </div>
          <div className="notification-list">
            {notifications.slice(0, 4).map(n => (
              <div className="notification" key={n.id}>
                <div className={`notif-icon ${n.severity || 'info'}`}>
                  <Bell size={16} />
                </div>
                <div className="notif-content">
                  <b>{n.title}</b>
                  <p>{n.message}</p>
                  <small className="mono">{n.tracking_id}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Connected Services Preview */}
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Federated Connectors</h3>
              <p>Live department integrations active in prototype</p>
            </div>
            <button className="text-btn" onClick={() => setView('integration')}>
              Control plane →
            </button>
          </div>
          <div className="connector-list">
            {departments.slice(0, 5).map(d => (
              <div className="connector-row" key={d.code}>
                <div className="connector-logo">{d.code.slice(0, 2)}</div>
                <div className="connector-info">
                  <b>{d.name}</b>
                  <span>{d.category} · {d.connector_type} Gateway</span>
                </div>
                <span className="connected-pill">
                  <span className="status-dot"></span>{d.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
