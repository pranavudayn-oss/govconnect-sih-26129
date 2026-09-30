import React, { useState, useEffect } from 'react'
import {
  X, CheckCircle2, CircleDot, Clock, ShieldCheck,
  FileText, Send, AlertTriangle, ArrowRight, UserCheck,
  Check, FileCheck, CornerUpRight, PauseCircle, Ban, History
} from 'lucide-react'

export function ApplicationDetailDrawer({
  appSummary,
  departments,
  currentUser,
  close,
  api,
  onUpdateSuccess
}) {
  const [activeTab, setActiveTab] = useState('overview')
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState(null)

  // Officer form state
  const [officerNote, setOfficerNote] = useState('')
  const [selectedForwardDept, setSelectedForwardDept] = useState(departments[0]?.code || 'MUNI')

  const trackingId = appSummary.tracking_id

  async function loadDetail() {
    setLoading(true)
    try {
      const res = await api(`/api/applications/${trackingId}`)
      setDetail(res)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDetail()
  }, [trackingId])

  async function handleOfficerAction(targetStatus, targetStage, defaultProgress, note) {
    setBusy(true)
    setActionError(null)
    try {
      const payload = {
        status: targetStatus,
        stage: targetStage,
        progress: defaultProgress,
        note: note || officerNote || `Officer updated application status to ${targetStatus}`,
        officer_notes: officerNote || undefined,
        actor_name: currentUser?.full_name || 'Senior Verification Officer'
      }

      await api(`/api/applications/${trackingId}/status`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      })

      setOfficerNote('')
      await loadDetail()
      onUpdateSuccess()
    } catch (err) {
      setActionError(err.message || 'Action failed')
    } finally {
      setBusy(false)
    }
  }

  async function handleForward() {
    if (!selectedForwardDept) return
    setBusy(true)
    setActionError(null)
    try {
      const payload = {
        status: 'Forwarded',
        stage: 'Cross-Department Dispatch',
        progress: 60,
        note: `Application dispatched to ${selectedForwardDept} connector for inter-departmental clearance.`,
        forward_to_department_code: selectedForwardDept,
        officer_notes: officerNote || 'Dispatched for cross-verification',
        actor_name: currentUser?.full_name || 'Senior Verification Officer'
      }

      await api(`/api/applications/${trackingId}/status`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      })

      setOfficerNote('')
      await loadDetail()
      onUpdateSuccess()
    } catch (err) {
      setActionError(err.message || 'Forwarding failed')
    } finally {
      setBusy(false)
    }
  }

  const app = detail || appSummary

  return (
    <div className="drawer-backdrop" onMouseDown={e => e.target === e.currentTarget && close()}>
      <aside className="drawer" style={{ width: '640px' }}>
        {/* Drawer Header */}
        <div className="drawer-head">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="mono" style={{ fontSize: '13px', fontWeight: 800, color: 'var(--blue)' }}>
                {app.tracking_id}
              </span>
              <span className={`status ${app.status.toLowerCase().replaceAll(' ', '-')}`}>
                {app.status}
              </span>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, marginTop: '3px' }}>{app.service_name}</h2>
            <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
              Assigned: {app.department_name} ({app.department_code})
            </p>
          </div>
          <button className="icon-btn" onClick={close}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="drawer-tabs">
          <button className={`drawer-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            Overview
          </button>
          <button className={`drawer-tab ${activeTab === 'applicant' ? 'active' : ''}`} onClick={() => setActiveTab('applicant')}>
            Applicant
          </button>
          <button className={`drawer-tab ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')}>
            Documents ({detail?.documents?.length || 0})
          </button>
          <button className={`drawer-tab ${activeTab === 'workflow' ? 'active' : ''}`} onClick={() => setActiveTab('workflow')}>
            Workflow & Actions
          </button>
          <button className={`drawer-tab ${activeTab === 'timeline' ? 'active' : ''}`} onClick={() => setActiveTab('timeline')}>
            Timeline ({detail?.events?.length || 0})
          </button>
        </div>

        {/* Drawer Body */}
        <div className="drawer-body">
          {actionError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-sm)', padding: '10px 14px', color: '#b91c1c', fontSize: '12px', marginBottom: '16px' }}>
              {actionError}
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              {/* Status Meter */}
              <div style={{ background: 'var(--surface-alt)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Current Stage</span>
                  <b style={{ fontSize: '13px', color: 'var(--ink)' }}>{app.stage}</b>
                </div>
                <div className="progress" style={{ width: '100%', height: '8px' }}>
                  <span style={{ width: `${app.progress}%` }}></span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: 'var(--muted)' }}>
                  <span>Progress: {app.progress}%</span>
                  <span>SLA Deadline: {app.sla_deadline_days || 7} Days</span>
                </div>
              </div>

              {/* Quick Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px', marginBottom: '20px' }}>
                <div style={{ background: '#fff', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: 'var(--muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Submitted By</span>
                  <b style={{ color: 'var(--ink)', fontSize: '13px' }}>{app.applicant_name}</b>
                </div>
                <div style={{ background: '#fff', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: 'var(--muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Priority</span>
                  <b className={`prio-${(app.priority || 'Normal').toLowerCase()}`} style={{ fontSize: '13px' }}>{app.priority || 'Normal'}</b>
                </div>
                <div style={{ background: '#fff', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: 'var(--muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Submission Date</span>
                  <b style={{ color: 'var(--ink)' }}>{new Date(app.created_at).toLocaleDateString()}</b>
                </div>
                <div style={{ background: '#fff', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: 'var(--muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Last Updated</span>
                  <b style={{ color: 'var(--ink)' }}>{new Date(app.updated_at).toLocaleDateString()}</b>
                </div>
              </div>

              {/* Purpose-limited consent notice */}
              <div className="consent-panel" style={{ margin: '0 0 20px 0' }}>
                <ShieldCheck size={22} />
                <div>
                  <b>DPDP Purpose-Limited Sharing Active</b>
                  <p>Permitted data fields: {app.shared_fields?.join(', ')}. No unsolicited data sharing permitted.</p>
                </div>
              </div>

              {/* Officer Notes if any */}
              {app.officer_notes && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-sm)', padding: '12px 14px', marginBottom: '20px' }}>
                  <b style={{ fontSize: '11px', color: '#92400e', textTransform: 'uppercase', display: 'block' }}>Officer Internal Notes</b>
                  <p style={{ fontSize: '12px', color: '#78350f', marginTop: '3px' }}>{app.officer_notes}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: APPLICANT MASTER RECORD */}
          {activeTab === 'applicant' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12.5px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label>Full Name</label>
                  <div className="form-control" style={{ background: 'var(--surface-alt)' }}>{app.applicant_name}</div>
                </div>
                <div className="form-group">
                  <label>Citizen Reference ID</label>
                  <div className="form-control mono" style={{ background: 'var(--surface-alt)' }}>{app.citizen_ref}</div>
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <div className="form-control" style={{ background: 'var(--surface-alt)' }}>{app.applicant_email}</div>
                </div>
                <div className="form-group">
                  <label>Contact Phone</label>
                  <div className="form-control" style={{ background: 'var(--surface-alt)' }}>{app.applicant_phone}</div>
                </div>
              </div>

              <div className="form-group">
                <label>Verified Address</label>
                <div className="form-control" style={{ background: 'var(--surface-alt)' }}>{app.applicant_address}</div>
              </div>

              <div style={{ background: 'var(--surface-alt)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: '14px', fontSize: '11.5px', color: 'var(--muted)' }}>
                <b>Federated Master Data Sync:</b> Citizen demographic hash matched with Central Gateway Registry.
              </div>
            </div>
          )}

          {/* TAB 3: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div>
              {detail?.documents?.length === 0 && (
                <div className="empty-state">
                  <FileText size={32} />
                  <b>No documents attached</b>
                  <p>No supporting documents have been uploaded for this request.</p>
                </div>
              )}

              {detail?.documents?.map(doc => (
                <div
                  key={doc.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--surface-alt)',
                    border: '1px solid var(--line)',
                    marginBottom: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={20} style={{ color: 'var(--blue)' }} />
                    <div>
                      <b style={{ fontSize: '12.5px', color: 'var(--ink)' }}>{doc.file_name}</b>
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--muted)' }}>
                        {doc.category} · {doc.file_size_kb} KB · {new Date(doc.uploaded_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span className={`status ${doc.verification_status === 'Verified' ? 'approved' : 'under-verification'}`}>
                    {doc.verification_status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: WORKFLOW & OFFICER ACTIONS */}
          {activeTab === 'workflow' && (
            <div>
              {/* Internal Officer Notes Input */}
              <div className="form-group">
                <label>Officer Internal Notes / Transition Justification</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Add notes for audit trail and applicant notification..."
                  value={officerNote}
                  onChange={e => setOfficerNote(e.target.value)}
                />
              </div>

              {/* State Machine Transition Actions */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                  OFFICER WORKFLOW ACTIONS
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    className="btn-secondary"
                    style={{ justifyContent: 'flex-start', color: 'var(--blue)' }}
                    onClick={() => handleOfficerAction('Under Verification', 'Document Verification', 40, 'Officer initiated document and identity verification.')}
                    disabled={busy}
                  >
                    <FileCheck size={15} /> Verify Documents
                  </button>

                  <button
                    className="btn-secondary"
                    style={{ justifyContent: 'flex-start', color: 'var(--orange)' }}
                    onClick={() => handleOfficerAction('Action Required', 'Document Verification', 35, 'Incomplete supporting document scan. Action required by citizen.')}
                    disabled={busy}
                  >
                    <AlertTriangle size={15} /> Request Citizen Action
                  </button>

                  <button
                    className="btn-secondary"
                    style={{ justifyContent: 'flex-start', color: '#475569' }}
                    onClick={() => handleOfficerAction('On Hold', 'Department Processing', 50, 'Case placed on hold pending external department verification.')}
                    disabled={busy}
                  >
                    <PauseCircle size={15} /> Put on Hold
                  </button>

                  <button
                    className="btn-secondary"
                    style={{ justifyContent: 'flex-start', color: 'var(--green)' }}
                    onClick={() => handleOfficerAction('Approved', 'Final Approval', 85, 'All statutory documents and eligibility requirements verified. Approved.')}
                    disabled={busy}
                  >
                    <CheckCircle2 size={15} /> Approve Application
                  </button>

                  <button
                    className="btn-secondary"
                    style={{ justifyContent: 'flex-start', color: 'var(--green)', gridColumn: 'span 2' }}
                    onClick={() => handleOfficerAction('Completed', 'Service Delivered', 100, 'Service delivered. Digital certificate generated and delivered to Citizen Locker.')}
                    disabled={busy}
                  >
                    <CheckCircle2 size={15} /> Deliver Final Service / Certificate
                  </button>

                  <button
                    className="btn-secondary"
                    style={{ justifyContent: 'flex-start', color: 'var(--red)', gridColumn: 'span 2' }}
                    onClick={() => {
                      if (!officerNote.trim()) {
                        setActionError('A rejection reason must be entered in the Officer Internal Notes above.')
                        return
                      }
                      handleOfficerAction('Rejected', app.stage, 0, officerNote)
                    }}
                    disabled={busy}
                  >
                    <Ban size={15} /> Reject Application (Requires Reason)
                  </button>
                </div>
              </div>

              {/* Cross-Department Interoperability Forwarding */}
              <div style={{ background: 'var(--surface-alt)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                <b style={{ fontSize: '12.5px', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CornerUpRight size={15} style={{ color: 'var(--blue)' }} /> Cross-Department Interoperability Dispatch
                </b>
                <p style={{ fontSize: '11.5px', color: 'var(--muted)', margin: '4px 0 10px' }}>
                  Dispatch transaction packet across the interoperability gateway to another department connector.
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select
                    className="form-control"
                    style={{ flex: 1 }}
                    value={selectedForwardDept}
                    onChange={e => setSelectedForwardDept(e.target.value)}
                  >
                    {departments.map(d => (
                      <option key={d.code} value={d.code}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                  <button className="btn-primary" onClick={handleForward} disabled={busy}>
                    Forward Packet
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="timeline">
              {detail?.events?.map(ev => (
                <div key={ev.id} className="timeline-item done">
                  <div className="timeline-dot">
                    <CheckCircle2 size={13} />
                  </div>
                  <div className="timeline-content">
                    <b>{ev.stage} · {ev.status}</b>
                    <span>{ev.message}</span>
                    <small>{ev.actor} · {new Date(ev.created_at).toLocaleString()}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
