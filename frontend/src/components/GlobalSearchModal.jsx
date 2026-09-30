import React, { useState, useEffect } from 'react'
import { Search, X, FileText, ClipboardList, Building, ArrowRight } from 'lucide-react'

export function GlobalSearchModal({ close, api, onSelectApplication, onSelectService, onSelectDepartment }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null)
      return
    }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await api(`/api/dashboard/search?q=${encodeURIComponent(query.trim())}`)
        setResults(res)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }, 200)
    return () => clearTimeout(timer)
  }, [query])

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [close])

  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && close()}>
      <div className="modal" style={{ width: '640px', padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--line)', paddingBottom: '14px' }}>
          <Search size={18} style={{ color: 'var(--muted)' }} />
          <input
            autoFocus
            type="text"
            placeholder="Search tracking ID, applicant, service or department..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '15px',
              fontWeight: 600,
              color: 'var(--ink)'
            }}
          />
          <button className="icon-btn" onClick={close} style={{ width: '30px', height: '30px' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ marginTop: '16px', maxHeight: '420px', overflowY: 'auto' }}>
          {loading && <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>Searching across federated databases...</div>}

          {!loading && results && (
            <>
              {/* Applications Results */}
              {results.applications?.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                    APPLICATIONS ({results.applications.length})
                  </div>
                  {results.applications.map(app => (
                    <button
                      key={app.tracking_id}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--surface-alt)',
                        marginBottom: '6px',
                        textAlign: 'left'
                      }}
                      onClick={() => {
                        onSelectApplication(app.tracking_id)
                        close()
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="mono" style={{ fontWeight: 700, fontSize: '12px', color: 'var(--blue)' }}>{app.tracking_id}</span>
                          <span className={`status ${app.status.toLowerCase().replaceAll(' ', '-')}`}>{app.status}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--ink)', fontWeight: 600, marginTop: '2px' }}>
                          {app.service_name} · <span style={{ color: 'var(--muted)', fontWeight: 400 }}>{app.applicant_name}</span>
                        </div>
                      </div>
                      <ArrowRight size={14} style={{ color: 'var(--muted)' }} />
                    </button>
                  ))}
                </div>
              )}

              {/* Services Results */}
              {results.services?.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                    GOVERNMENT SERVICES ({results.services.length})
                  </div>
                  {results.services.map(srv => (
                    <button
                      key={srv.id}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--surface-alt)',
                        marginBottom: '6px',
                        textAlign: 'left'
                      }}
                      onClick={() => {
                        onSelectService(srv)
                        close()
                      }}
                    >
                      <div>
                        <b style={{ display: 'block', fontSize: '12.5px', color: 'var(--ink)' }}>{srv.name}</b>
                        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{srv.category} · {srv.department_name}</span>
                      </div>
                      <ArrowRight size={14} style={{ color: 'var(--muted)' }} />
                    </button>
                  ))}
                </div>
              )}

              {/* Departments Results */}
              {results.departments?.length > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                    CONNECTED DEPARTMENTS ({results.departments.length})
                  </div>
                  {results.departments.map(dept => (
                    <button
                      key={dept.id}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--surface-alt)',
                        marginBottom: '6px',
                        textAlign: 'left'
                      }}
                      onClick={() => {
                        onSelectDepartment(dept)
                        close()
                      }}
                    >
                      <div>
                        <b style={{ display: 'block', fontSize: '12.5px', color: 'var(--ink)' }}>{dept.name} ({dept.code})</b>
                        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Connector: {dept.connector_type} · Status: {dept.status}</span>
                      </div>
                      <span className="connected-pill"><span className="status-dot"></span>{dept.status}</span>
                    </button>
                  ))}
                </div>
              )}

              {(!results.applications?.length && !results.services?.length && !results.departments?.length) && (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
                  No matching records found for "{query}".
                </div>
              )}
            </>
          )}

          {!query && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>
              Tip: Search for tracking IDs (e.g., <code>GOV-26129-8421</code>), services (e.g. <code>Income</code>), or departments (e.g. <code>Revenue</code>).
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
