import React, { useState } from 'react'
import {
  Bell, RefreshCw, Search, ShieldCheck, UserCheck,
  ChevronDown, ExternalLink, Activity, Info
} from 'lucide-react'

export function Topbar({
  view,
  title,
  currentUser,
  demoUsers,
  switchUser,
  apiOnline,
  latency,
  onRefresh,
  unreadCount,
  openNotifications,
  openSearch
}) {
  const [showUserDropdown, setShowUserDropdown] = useState(false)

  return (
    <>
      {/* Demo & Compliance Banner */}
      <div className="demo-banner">
        <div className="demo-banner-content">
          <span className="demo-pill">DEMO / PROTOTYPE SIMULATION</span>
          <span>
            <b>SIH 2026 Problem Statement 26129</b> · Federated Government Service Interoperability Framework
          </span>
        </div>
        <div className="demo-banner-links">
          <span title="Digital Personal Data Protection Act 2023 Compliant Simulation">
            DPDP Act 2023 Aligned
          </span>
          <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer">
            Swagger API Docs <ExternalLink size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
          </a>
        </div>
      </div>

      {/* Main Topbar */}
      <header className="topbar">
        <div className="topbar-left">
          <div className="eyebrow">GOVCONNECT · FEDERATED GATEWAY · TEAM TECHX TITANSX</div>
          <h1>{title}</h1>
        </div>

        <div className="top-actions">
          {/* Global Search Button */}
          <button className="search-trigger" onClick={openSearch} title="Global search (Ctrl+K)">
            <Search size={15} />
            <span>Search applications, services...</span>
            <kbd>Ctrl+K</kbd>
          </button>

          {/* API Health & Latency */}
          <div className={`api-status ${apiOnline ? 'online' : 'offline'}`} title="Real-time Interoperability Gateway health">
            <span className={`status-dot ${apiOnline ? 'pulse' : ''}`}></span>
            <span>{apiOnline ? `Gateway Active (${latency}ms)` : 'Gateway Offline'}</span>
          </div>

          {/* Refresh Button */}
          <button className="icon-btn" onClick={onRefresh} title="Sync data">
            <RefreshCw size={17} />
          </button>

          {/* Notifications Button */}
          <button className="icon-btn" onClick={openNotifications} title="Notifications">
            <Bell size={17} />
            {unreadCount > 0 && <span className="btn-badge">{unreadCount}</span>}
          </button>

          {/* Demo Persona Switcher */}
          <div style={{ position: 'relative' }}>
            <button
              className="persona-switcher"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              title="Switch demo persona for live judging"
            >
              <div className="persona-avatar">
                {currentUser?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'DC'}
              </div>
              <div style={{ textAlign: 'left' }}>
                <b style={{ display: 'block', fontSize: '11px', color: 'var(--ink)' }}>{currentUser?.full_name || 'Demo Citizen'}</b>
                <small style={{ display: 'block', fontSize: '9px', color: 'var(--muted)' }}>
                  {currentUser?.role || 'CITIZEN'} {currentUser?.department_code ? `· ${currentUser.department_code}` : ''}
                </small>
              </div>
              <ChevronDown size={14} style={{ color: 'var(--muted)' }} />
            </button>

            {showUserDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  width: '280px',
                  background: '#ffffff',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 40,
                  padding: '8px',
                }}
              >
                <div style={{ padding: '6px 8px', fontSize: '10.5px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>
                  SELECT DEMO PERSONA
                </div>
                {demoUsers.map(u => (
                  <button
                    key={u.role}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      textAlign: 'left',
                      background: currentUser?.role === u.role ? 'var(--blue-subtle)' : 'transparent',
                    }}
                    onClick={() => {
                      switchUser(u)
                      setShowUserDropdown(false)
                    }}
                  >
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '4px',
                        background: currentUser?.role === u.role ? 'var(--blue)' : 'var(--surface-alt)',
                        color: currentUser?.role === u.role ? '#fff' : 'var(--ink-secondary)',
                        fontSize: '10px',
                        fontWeight: 700,
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      {u.role.slice(0, 2)}
                    </div>
                    <div>
                      <b style={{ display: 'block', fontSize: '11.5px', color: 'var(--ink)' }}>{u.full_name}</b>
                      <span style={{ display: 'block', fontSize: '9.5px', color: 'var(--muted)' }}>
                        {u.role} {u.department_code ? `(${u.department_code})` : ''} · {u.designation}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  )
}
