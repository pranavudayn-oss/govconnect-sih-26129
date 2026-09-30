import React, { useState } from 'react'
import { CheckCircle2, Copy, Check, Printer, X, Download, ShieldCheck, QrCode } from 'lucide-react'

export function AcknowledgementModal({ app, close, onTrack }) {
  const [copied, setCopied] = useState(false)

  function copyTrackingId() {
    navigator.clipboard.writeText(app.tracking_id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handlePrint() {
    window.print()
  }

  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && close()}>
      <div className="modal" style={{ width: '600px', padding: '0', overflow: 'hidden' }}>
        {/* Modal Top Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: 'var(--navy)', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} style={{ color: '#fbbf24' }} />
            <b style={{ fontSize: '13px' }}>GOVERNMENT SERVICE ACKNOWLEDGEMENT</b>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 700,
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <Printer size={13} /> Print
            </button>
            <button className="icon-btn" onClick={close} style={{ width: '28px', height: '28px', background: 'transparent', color: '#fff', border: 'none' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Official Slip */}
        <div style={{ padding: '28px 32px', background: '#fff' }}>
          <div style={{ textAlign: 'center', borderBottom: '2px dashed var(--line)', paddingBottom: '20px', marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)', letterSpacing: '1px' }}>
              GOVCONNECT INTEROPERABILITY GATEWAY
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--navy)', margin: '4px 0' }}>
              Service Request Receipt & Acknowledgement
            </h2>
            <div style={{ fontSize: '11.5px', color: 'var(--muted)' }}>
              SIH 2026 Problem Statement 26129 · Electronic Verification Token
            </div>
          </div>

          {/* Tracking ID Hero Box */}
          <div style={{ background: 'var(--blue-subtle)', border: '1.5px solid #bfdbfe', borderRadius: 'var(--radius-md)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
            <div>
              <span style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                UNIFIED TRACKING IDENTIFIER
              </span>
              <div className="mono" style={{ fontSize: '22px', fontWeight: 800, color: 'var(--navy)', marginTop: '2px' }}>
                {app.tracking_id}
              </div>
            </div>
            <button
              onClick={copyTrackingId}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#fff',
                border: '1px solid #bfdbfe',
                color: 'var(--blue)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
                fontSize: '11.5px'
              }}
            >
              {copied ? <Check size={14} style={{ color: 'var(--green)' }} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy ID'}
            </button>
          </div>

          {/* Data Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '12px', marginBottom: '22px' }}>
            <div style={{ background: 'var(--surface-alt)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ display: 'block', color: 'var(--muted)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>Service Requested</span>
              <b style={{ color: 'var(--ink)', fontSize: '13px' }}>{app.service_name}</b>
            </div>
            <div style={{ background: 'var(--surface-alt)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ display: 'block', color: 'var(--muted)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>Routing Department</span>
              <b style={{ color: 'var(--ink)', fontSize: '13px' }}>{app.department_name}</b>
            </div>
            <div style={{ background: 'var(--surface-alt)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ display: 'block', color: 'var(--muted)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>Applicant Name</span>
              <b style={{ color: 'var(--ink)' }}>{app.applicant_name}</b>
            </div>
            <div style={{ background: 'var(--surface-alt)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ display: 'block', color: 'var(--muted)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>Citizen Reference ID</span>
              <b className="mono" style={{ color: 'var(--ink)' }}>{app.citizen_ref}</b>
            </div>
            <div style={{ background: 'var(--surface-alt)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ display: 'block', color: 'var(--muted)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>Submission Date</span>
              <b style={{ color: 'var(--ink)' }}>{new Date(app.created_at).toLocaleString()}</b>
            </div>
            <div style={{ background: 'var(--surface-alt)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ display: 'block', color: 'var(--muted)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>Consent & Purpose Scope</span>
              <b style={{ color: 'var(--green)' }}>Verified & Purpose-Limited</b>
            </div>
          </div>

          {/* Barcode & Security Watermark simulation */}
          <div style={{ borderTop: '1px solid var(--line)', paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '10px', color: 'var(--muted)', lineHeight: 1.4 }}>
              <b>Note:</b> This is an official electronic acknowledgement generated by GovConnect.
              <br />No signature required. Use tracking ID to query status across any connected kiosk.
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="mono" style={{ fontSize: '9px', color: 'var(--muted)' }}>HASH: 26129-{app.tracking_id.slice(-4)}-VERIFIED</div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '14px 24px', background: 'var(--surface-alt)', borderTop: '1px solid var(--line)' }}>
          <button className="btn-secondary" onClick={close}>
            Close
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              close()
              onTrack(app.tracking_id)
            }}
          >
            Track Application Timeline →
          </button>
        </div>
      </div>
    </div>
  )
}
