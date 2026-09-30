import React from 'react'
import {
  Network, UserRound, Gauge, ShieldCheck, FileText,
  LockKeyhole, ClipboardList, Database, FolderCheck,
  Server, BarChart3, Radio
} from 'lucide-react'

export function Sidebar({ view, setView, currentUser, unreadNotifs, pendingCitizenApps }) {
  const item = (id, icon, label, badge = null) => (
    <button
      className={`nav-item ${view === id ? 'active' : ''}`}
      onClick={() => setView(id)}
    >
      {icon}
      <span>{label}</span>
      {badge !== null && badge > 0 && <span className="nav-badge">{badge}</span>}
    </button>
  )

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="brand">
        <div className="brand-mark">
          <Network size={24} />
        </div>
        <div className="brand-info">
          <b>GovConnect</b>
          <small>Interoperability Framework</small>
        </div>
      </div>

      {/* Active Persona Badge */}
      <div className="persona-badge">
        <div className="persona-avatar">
          {currentUser?.role?.slice(0, 2) || 'CI'}
        </div>
        <div className="persona-info">
          <div className="persona-name">{currentUser?.full_name || 'Demo Citizen'}</div>
          <div className="persona-role">
            <Radio size={10} style={{ color: '#22c55e' }} />
            <span>{currentUser?.role || 'CITIZEN'}</span>
          </div>
        </div>
      </div>

      {/* Workspaces Navigation */}
      <div className="nav-label">CITIZEN SERVICES</div>
      {item('citizen', <UserRound size={17} />, 'Citizen Portal', pendingCitizenApps)}
      {item('services', <ClipboardList size={17} />, 'Government Services')}
      {item('consent', <LockKeyhole size={17} />, 'Consent Center')}
      {item('documents', <FolderCheck size={17} />, 'Document Locker')}

      <div className="nav-label">GOVERNMENT & OPERATIONS</div>
      {item('officer', <Gauge size={17} />, 'Officer Command Center')}
      {item('integration', <Network size={17} />, 'Integration Center')}
      {item('audit', <FileText size={17} />, 'Audit Trail')}

      <div className="nav-label">GOVERNANCE & TRUST</div>
      {item('security', <ShieldCheck size={17} />, 'Security & Trust Center')}
      {item('admin', <Server size={17} />, 'Platform Administration')}

      {/* SIH 2026 Bottom Badge */}
      <div className="sidebar-bottom">
        <div className="sih-badge">
          <div className="sih-logo">SIH</div>
          <div className="sih-text">
            <b>Smart India Hackathon 2026</b>
            <span>Team TechX Titansx · PS 26129</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
