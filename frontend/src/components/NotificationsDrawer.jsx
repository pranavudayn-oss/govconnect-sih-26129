import React, { useState } from 'react'
import { Bell, X, CheckCheck, FileText, ArrowRight, ShieldCheck } from 'lucide-react'

export function NotificationsDrawer({ notifications, close, onMarkRead, onMarkAllRead, onSelectApplication }) {
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications

  return (
    <div className="drawer-backdrop" onMouseDown={e => e.target === e.currentTarget && close()}>
      <aside className="drawer" style={{ width: '460px' }}>
        <div className="drawer-head">
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Notification Center</h2>
            <p style={{ fontSize: '12px', color: 'var(--muted)' }}>Interoperability alerts & status updates</p>
          </div>
          <button className="icon-btn" onClick={close}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderBottom: '1px solid var(--line)', background: 'var(--surface-alt)' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              className={`filter-pill ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
              style={{ padding: '4px 12px', fontSize: '11.5px' }}
            >
              All ({notifications.length})
            </button>
            <button
              className={`filter-pill ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
              style={{ padding: '4px 12px', fontSize: '11.5px' }}
            >
              Unread ({notifications.filter(n => !n.read).length})
            </button>
          </div>
          <button
            className="text-btn"
            style={{ fontSize: '11.5px', color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}
            onClick={onMarkAllRead}
          >
            <CheckCheck size={14} /> Mark all read
          </button>
        </div>

        <div className="drawer-body" style={{ padding: '12px 20px' }}>
          {filtered.length === 0 && (
            <div className="empty-state">
              <Bell size={36} />
              <b>No notifications</b>
              <p>You have caught up with all cross-department service updates.</p>
            </div>
          )}

          {filtered.map(n => (
            <div
              key={n.id}
              style={{
                display: 'flex',
                gap: '12px',
                padding: '14px 12px',
                borderRadius: 'var(--radius-md)',
                background: n.read ? 'transparent' : 'var(--blue-subtle)',
                borderBottom: '1px solid var(--line)',
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
              onClick={() => {
                if (!n.read) onMarkRead(n.id)
                if (n.tracking_id) {
                  onSelectApplication(n.tracking_id)
                  close()
                }
              }}
            >
              <div className={`notif-icon ${n.severity || 'info'}`} style={{ width: '32px', height: '32px' }}>
                <Bell size={15} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <b style={{ fontSize: '12.5px', color: 'var(--ink)' }}>{n.title}</b>
                  <span style={{ fontSize: '10px', color: 'var(--muted)' }}>
                    {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p style={{ fontSize: '11.5px', color: 'var(--ink-secondary)', margin: '4px 0 6px', lineHeight: 1.45 }}>
                  {n.message}
                </p>
                {n.tracking_id && (
                  <span className="mono" style={{ fontSize: '10.5px', color: 'var(--blue)', fontWeight: 600 }}>
                    {n.tracking_id} →
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}
