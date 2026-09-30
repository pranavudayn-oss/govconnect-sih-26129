import React, { useState } from 'react'
import {
  X, CheckCircle2, CircleDot, ArrowRight, ArrowLeft, Upload,
  ShieldCheck, FileText, AlertCircle, Copy, Check, FileCheck
} from 'lucide-react'

export function NewApplicationWizard({
  departments,
  services,
  currentUser,
  close,
  createApplication,
  onOpenAcknowledgement
}) {
  const [step, setStep] = useState(1)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  // Step 1: Service & Department
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '')
  const selectedService = services.find(s => String(s.id) === String(selectedServiceId)) || services[0]
  const [selectedDeptId, setSelectedDeptId] = useState(selectedService?.department_id || departments[0]?.id || '')

  // Step 2: Applicant Info
  const [applicantName, setApplicantName] = useState(currentUser?.full_name || 'Priya Sharma')
  const [applicantEmail, setApplicantEmail] = useState(currentUser?.email || 'citizen@govconnect.demo')
  const [applicantPhone, setApplicantPhone] = useState('+91 98765 43210')
  const [citizenRef, setCitizenRef] = useState(currentUser?.citizen_ref || 'CIT-DEMO-001')
  const [applicantAddress, setApplicantAddress] = useState('Flat 402, Block B, Govt Colony, New Delhi')

  // Step 3: Eligibility & Category
  const [category, setCategory] = useState('General')
  const [incomeSlab, setIncomeSlab] = useState('Below 2.5 Lakhs')
  const [remarks, setRemarks] = useState('')

  // Step 4: Documents (Demo Upload Simulation)
  const [uploadedDocs, setUploadedDocs] = useState([
    { category: 'Identity Proof', file_name: 'Aadhaar_Reference_Copy.pdf', file_type: 'application/pdf', file_size_kb: 240 },
    { category: 'Address Proof', file_name: 'Electricity_Bill_Latest.pdf', file_type: 'application/pdf', file_size_kb: 310 }
  ])

  // Step 5: Purpose-Limited Consent
  const [consent, setConsent] = useState(true)
  const [sharedFields, setSharedFields] = useState(['name', 'email', 'citizen_ref', 'address', 'income'])

  // Step 6: Confirmation result
  const [submittedApp, setSubmittedApp] = useState(null)
  const [copied, setCopied] = useState(false)

  // Validation per step
  function validateStep(curStep) {
    setError(null)
    if (curStep === 1) {
      if (!selectedServiceId) {
        setError('Please select a government service.')
        return false
      }
    }
    if (curStep === 2) {
      if (!applicantName.trim()) { setError('Applicant name is required.'); return false }
      if (!applicantEmail.trim() || !applicantEmail.includes('@')) { setError('A valid email address is required.'); return false }
      if (!applicantPhone.trim() || applicantPhone.length < 8) { setError('A valid phone number is required.'); return false }
      if (!applicantAddress.trim()) { setError('Residential address is required.'); return false }
    }
    if (curStep === 5) {
      if (!consent) {
        setError('You must grant purpose-limited consent to allow cross-department service processing under the DPDP Act.')
        return false
      }
    }
    return true
  }

  function handleNext() {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  function handleBack() {
    setError(null)
    setStep(step - 1)
  }

  // Handle demo file upload
  function handleDemoFileUpload(e, docCategory) {
    const file = e.target.files?.[0]
    if (!file) return

    // File validation
    const validExts = ['.pdf', '.png', '.jpg', '.jpeg']
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
    if (!validExts.includes(ext)) {
      setError(`Unsupported file format. Allowed formats: ${validExts.join(', ')}`)
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds maximum allowed 5MB limit.')
      return
    }

    const cleanName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_')
    const newDoc = {
      category: docCategory,
      file_name: cleanName,
      file_type: file.type || 'application/pdf',
      file_size_kb: Math.max(1, Math.round(file.size / 1024))
    }

    setUploadedDocs(prev => [...prev.filter(d => d.category !== docCategory), newDoc])
    setError(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validateStep(5)) return

    setBusy(true)
    setError(null)

    try {
      const payload = {
        service_name: selectedService?.name || 'Government Service',
        applicant_name: applicantName,
        applicant_email: applicantEmail,
        applicant_phone: applicantPhone,
        applicant_address: applicantAddress,
        citizen_ref: citizenRef,
        department_id: Number(selectedDeptId || selectedService?.department_id),
        category,
        priority: 'Normal',
        consent,
        shared_fields: sharedFields,
        notes: remarks,
        uploaded_documents: uploadedDocs
      }

      const res = await createApplication(payload)
      setSubmittedApp(res)
      setStep(7) // Confirmation screen
    } catch (err) {
      setError(err.message || 'Submission failed. Please check inputs.')
    } finally {
      setBusy(false)
    }
  }

  function copyTrackingId() {
    if (submittedApp?.tracking_id) {
      navigator.clipboard.writeText(submittedApp.tracking_id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const stepsList = [
    { num: 1, label: 'Service' },
    { num: 2, label: 'Details' },
    { num: 3, label: 'Eligibility' },
    { num: 4, label: 'Documents' },
    { num: 5, label: 'Consent' },
    { num: 6, label: 'Review' }
  ]

  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && close()}>
      <div className="modal" style={{ width: '640px' }}>
        {/* Modal Header */}
        <div className="modal-head">
          <div>
            <div className="eyebrow">UNIFIED SERVICE GATEWAY</div>
            <h2>{step === 7 ? 'Service Request Confirmed' : 'New Service Request'}</h2>
            <p>Federated application submission across connected departments</p>
          </div>
          <button type="button" className="icon-btn" onClick={close}>
            <X size={18} />
          </button>
        </div>

        {/* Step Progress Indicator (Steps 1 to 6) */}
        {step < 7 && (
          <div className="wizard-steps">
            {stepsList.map(s => {
              const isActive = step === s.num
              const isCompleted = step > s.num
              return (
                <div
                  key={s.num}
                  className={`wizard-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                >
                  <div className="step-num">
                    {isCompleted ? <Check size={12} /> : s.num}
                  </div>
                  <span>{s.label}</span>
                </div>
              )
            })}
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-sm)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px', color: '#b91c1c', fontSize: '12px', marginBottom: '16px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Select Service & Department */}
        {step === 1 && (
          <div>
            <div className="form-group">
              <label>Select Government Service</label>
              <select
                className="form-control"
                value={selectedServiceId}
                onChange={e => {
                  setSelectedServiceId(e.target.value)
                  const s = services.find(x => String(x.id) === e.target.value)
                  if (s) setSelectedDeptId(s.department_id)
                }}
              >
                {services.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.category} · {s.department_name})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Target Department Connector</label>
              <select
                className="form-control"
                value={selectedDeptId}
                onChange={e => setSelectedDeptId(e.target.value)}
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code} · {d.connector_type} Gateway)
                  </option>
                ))}
              </select>
            </div>

            {selectedService && (
              <div style={{ background: 'var(--surface-alt)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: '14px 16px', marginTop: '14px' }}>
                <b style={{ fontSize: '13px', color: 'var(--ink)' }}>{selectedService.name}</b>
                <p style={{ fontSize: '11.5px', color: 'var(--muted)', margin: '4px 0 10px', lineHeight: 1.45 }}>
                  {selectedService.description}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '11px' }}>
                  <div>
                    <span style={{ color: 'var(--muted)', display: 'block' }}>Estimated SLA:</span>
                    <b>{selectedService.estimated_processing_days} Working Days</b>
                  </div>
                  <div>
                    <span style={{ color: 'var(--muted)', display: 'block' }}>Fee:</span>
                    <b>₹{selectedService.fee} (Demo)</b>
                  </div>
                  <div>
                    <span style={{ color: 'var(--muted)', display: 'block' }}>Mode:</span>
                    <b>{selectedService.digital_availability}</b>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Applicant Information */}
        {step === 2 && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Applicant Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={applicantName}
                  onChange={e => setApplicantName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                />
              </div>
              <div className="form-group">
                <label>Citizen ID / Reference *</label>
                <input
                  type="text"
                  className="form-control mono"
                  value={citizenRef}
                  onChange={e => setCitizenRef(e.target.value)}
                  readOnly
                  style={{ background: 'var(--surface-alt)' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  className="form-control"
                  value={applicantEmail}
                  onChange={e => setApplicantEmail(e.target.value)}
                  placeholder="citizen@govconnect.demo"
                />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="text"
                  className="form-control"
                  value={applicantPhone}
                  onChange={e => setApplicantPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Residential Address *</label>
              <textarea
                className="form-control"
                rows="2"
                value={applicantAddress}
                onChange={e => setApplicantAddress(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 3: Eligibility & Category */}
        {step === 3 && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Applicant Category</label>
                <select
                  className="form-control"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  <option>General</option>
                  <option>OBC</option>
                  <option>SC</option>
                  <option>ST</option>
                  <option>EWS</option>
                </select>
              </div>
              <div className="form-group">
                <label>Annual Income Slab</label>
                <select
                  className="form-control"
                  value={incomeSlab}
                  onChange={e => setIncomeSlab(e.target.value)}
                >
                  <option>Below 1.5 Lakhs</option>
                  <option>1.5 Lakhs - 2.5 Lakhs</option>
                  <option>2.5 Lakhs - 5.0 Lakhs</option>
                  <option>Above 5.0 Lakhs</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Application Purpose & Remarks (Optional)</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="State your reason or purpose (e.g. Higher education scholarship application, municipal property tax NOC)"
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 4: Documents Checklist & Upload */}
        {step === 4 && (
          <div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '12px' }}>
              Upload demo supporting documents (.pdf, .png, .jpg under 5MB). Simulated verification is active.
            </div>

            {['Identity Proof', 'Address Proof', 'Income Proof / Other'].map(cat => {
              const uploaded = uploadedDocs.find(d => d.category === cat)
              return (
                <div
                  key={cat}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: uploaded ? 'var(--green-subtle)' : 'var(--surface-alt)',
                    border: `1px solid ${uploaded ? '#bbf7d0' : 'var(--line)'}`,
                    marginBottom: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={18} style={{ color: uploaded ? 'var(--green)' : 'var(--muted)' }} />
                    <div>
                      <b style={{ fontSize: '12px', color: 'var(--ink)' }}>{cat}</b>
                      {uploaded ? (
                        <div style={{ fontSize: '11px', color: 'var(--green)' }}>
                          {uploaded.file_name} ({uploaded.file_size_kb} KB) · Attached
                        </div>
                      ) : (
                        <div style={{ fontSize: '10.5px', color: 'var(--muted)' }}>
                          Required for processing
                        </div>
                      )}
                    </div>
                  </div>

                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: '#fff',
                      border: '1px solid var(--line)',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      color: 'var(--blue)'
                    }}
                  >
                    <Upload size={12} />
                    {uploaded ? 'Replace' : 'Upload'}
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      style={{ display: 'none' }}
                      onChange={e => handleDemoFileUpload(e, cat)}
                    />
                  </label>
                </div>
              )
            })}
          </div>
        )}

        {/* Step 5: Purpose-Limited Consent */}
        {step === 5 && (
          <div>
            <div className="consent-panel">
              <ShieldCheck size={26} />
              <div>
                <b>Purpose-Limited Consent (DPDP Act 2023 Compliance)</b>
                <p>
                  I explicitly authorize the <b>{selectedService?.department_name}</b> to access only the necessary demographic
                  and supporting data fields below, strictly for the purpose of fulfilling <b>{selectedService?.name}</b>.
                  Data minimization applies and this consent can be revoked at any time from the Consent Center.
                </p>
                <div className="shared-chips">
                  {sharedFields.map(f => (
                    <span key={f} className="chip">{f}</span>
                  ))}
                </div>
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px', fontWeight: 600, color: 'var(--ink)', cursor: 'pointer', marginTop: '14px' }}>
              <input
                type="checkbox"
                checked={consent}
                onChange={e => setConsent(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--green)' }}
              />
              <span>I confirm that all provided information is accurate and grant explicit service consent.</span>
            </label>
          </div>
        )}

        {/* Step 6: Review Summary */}
        {step === 6 && (
          <div>
            <div style={{ background: 'var(--surface-alt)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 800, marginBottom: '10px' }}>Application Summary</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                <div><span style={{ color: 'var(--muted)' }}>Service:</span> <b>{selectedService?.name}</b></div>
                <div><span style={{ color: 'var(--muted)' }}>Department:</span> <b>{selectedService?.department_name}</b></div>
                <div><span style={{ color: 'var(--muted)' }}>Applicant:</span> <b>{applicantName}</b></div>
                <div><span style={{ color: 'var(--muted)' }}>Citizen ID:</span> <b className="mono">{citizenRef}</b></div>
                <div><span style={{ color: 'var(--muted)' }}>Email:</span> <b>{applicantEmail}</b></div>
                <div><span style={{ color: 'var(--muted)' }}>Phone:</span> <b>{applicantPhone}</b></div>
              </div>
            </div>

            <div style={{ background: 'var(--green-subtle)', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', padding: '12px 16px', fontSize: '12px', color: '#166534' }}>
              ✓ Purpose-limited consent active. <b>{uploadedDocs.length} documents</b> attached for gateway dispatch.
            </div>
          </div>
        )}

        {/* Step 7: Confirmation Screen */}
        {step === 7 && submittedApp && (
          <div style={{ textAlign: 'center', padding: '16px 8px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--green-subtle)', color: 'var(--green)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
              <CheckCircle2 size={34} />
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ink)' }}>
              Application Successfully Submitted
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '4px' }}>
              Your request has been registered on the GovConnect Gateway and routed to {submittedApp.department_name}.
            </p>

            <div style={{ background: 'var(--blue-subtle)', border: '1.5px solid #bfdbfe', borderRadius: 'var(--radius-md)', padding: '16px', margin: '20px auto', maxWidth: '420px', textAlign: 'center' }}>
              <div style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--blue)', textTransform: 'uppercase' }}>
                UNIFIED TRACKING IDENTIFIER
              </div>
              <div className="mono" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--navy)', margin: '6px 0' }}>
                {submittedApp.tracking_id}
              </div>
              <button
                onClick={copyTrackingId}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: '#fff',
                  border: '1px solid #bfdbfe',
                  color: 'var(--blue)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '11px',
                  fontWeight: 700
                }}
              >
                {copied ? <Check size={13} style={{ color: 'var(--green)' }} /> : <Copy size={13} />}
                {copied ? 'Copied to Clipboard' : 'Copy Tracking ID'}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
              <button
                className="btn-secondary"
                onClick={() => {
                  close()
                  onOpenAcknowledgement(submittedApp)
                }}
              >
                <FileCheck size={14} /> Download Acknowledgement
              </button>
              <button
                className="btn-primary"
                onClick={close}
              >
                Done / Return to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Modal Wizard Navigation Actions (Steps 1-6) */}
        {step < 7 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
            {step > 1 ? (
              <button type="button" className="btn-secondary" onClick={handleBack} disabled={busy}>
                <ArrowLeft size={14} /> Back
              </button>
            ) : <div />}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="btn-secondary" onClick={close} disabled={busy}>
                Cancel
              </button>

              {step < 6 ? (
                <button type="button" className="btn-primary" onClick={handleNext}>
                  Next <ArrowRight size={14} />
                </button>
              ) : (
                <button type="button" className="btn-primary" onClick={handleSubmit} disabled={busy}>
                  {busy ? 'Submitting to Gateway...' : 'Submit Service Request'} <CheckCircle2 size={15} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
