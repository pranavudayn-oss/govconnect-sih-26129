import React, { useState, useEffect } from 'react'
import {
  FolderCheck, Upload, FileText, Trash2, CheckCircle2,
  AlertCircle, Eye, RefreshCw, X, ShieldCheck, FileCheck
} from 'lucide-react'

export function DocumentsView({ currentUser, api }) {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [previewDoc, setPreviewDoc] = useState(null)
  const [error, setError] = useState(null)

  // Upload Form
  const [category, setCategory] = useState('Identity Proof')
  const [fileName, setFileName] = useState('')
  const [fileType, setFileType] = useState('application/pdf')
  const [fileSizeKb, setFileSizeKb] = useState(250)
  const [uploadNotes, setUploadNotes] = useState('')

  async function loadDocs() {
    setLoading(true)
    try {
      const res = await api('/api/documents')
      setDocs(res)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDocs()
  }, [])

  function handleFileInput(e) {
    const file = e.target.files?.[0]
    if (!file) return

    const validExts = ['.pdf', '.png', '.jpg', '.jpeg']
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
    if (!validExts.includes(ext)) {
      setError(`Invalid format. Allowed: ${validExts.join(', ')}`)
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File exceeds 5MB size limit.')
      return
    }

    setError(null)
    setFileName(file.name.replace(/[^a-zA-Z0-9_.-]/g, '_'))
    setFileType(file.type || 'application/pdf')
    setFileSizeKb(Math.max(1, Math.round(file.size / 1024)))
  }

  async function handleUploadSubmit(e) {
    e.preventDefault()
    if (!fileName) {
      setError('Please select a file to upload.')
      return
    }

    try {
      await api('/api/documents/record', {
        method: 'POST',
        body: JSON.stringify({
          category,
          file_name: fileName,
          file_type: fileType,
          file_size_kb: fileSizeKb,
          notes: uploadNotes || 'Uploaded via Citizen Document Locker'
        })
      })

      setShowUploadModal(false)
      setFileName('')
      setUploadNotes('')
      await loadDocs()
    } catch (err) {
      setError(err.message || 'Upload failed')
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this document from your locker?')) return
    try {
      await api(`/api/documents/${id}`, { method: 'DELETE' })
      await loadDocs()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <>
      {/* Header Panel */}
      <div className="panel" style={{ padding: '24px 28px', marginBottom: '24px', background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 700, marginBottom: '8px' }}>
              <ShieldCheck size={14} /> Encrypted Digital Vault Simulation
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>
              Citizen Document Locker
            </h2>
            <p style={{ fontSize: '13px', color: '#bfdbfe', maxWidth: '650px', marginTop: '4px' }}>
              Store, verify, and reuse statutory identity, address, and property proofs across all connected
              government departments without physical submissions.
            </p>
          </div>
          <button className="btn-primary" onClick={() => setShowUploadModal(true)} style={{ background: '#f59e0b', color: '#0f172a' }}>
            <Upload size={16} /> Upload New Document
          </button>
        </div>
      </div>

      {/* Documents Table */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Registered Documents ({docs.length})</h3>
            <p>Verified proofs available for purpose-bound consent sharing</p>
          </div>
          <button className="icon-btn" onClick={loadDocs} title="Refresh">
            <RefreshCw size={16} />
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Category</th>
                <th>Format</th>
                <th>File Size</th>
                <th>Uploaded On</th>
                <th>Verification Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {docs.map(doc => (
                <tr key={doc.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FileText size={18} style={{ color: 'var(--blue)' }} />
                      <div>
                        <b>{doc.file_name}</b>
                        {doc.notes && <span style={{ fontSize: '10.5px', color: 'var(--muted)' }}>{doc.notes}</span>}
                      </div>
                    </div>
                  </td>
                  <td><span className="badge neutral">{doc.category}</span></td>
                  <td className="mono" style={{ fontSize: '11.5px' }}>{doc.file_type.split('/')[1]?.toUpperCase() || 'PDF'}</td>
                  <td>{doc.file_size_kb} KB</td>
                  <td>{new Date(doc.uploaded_at).toLocaleDateString()}</td>
                  <td>
                    <span className={`status ${doc.verification_status === 'Verified' ? 'approved' : 'under-verification'}`}>
                      {doc.verification_status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => setPreviewDoc(doc)}>
                        <Eye size={12} /> Metadata
                      </button>
                      <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--red)' }} onClick={() => handleDelete(doc.id)}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {docs.length === 0 && !loading && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--muted)' }}>
                    No documents uploaded yet. Upload a document to start reusing credentials.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setShowUploadModal(false)}>
          <form className="modal" onSubmit={handleUploadSubmit}>
            <div className="modal-head">
              <div>
                <h2>Upload Supporting Document</h2>
                <p>Attach statutory proof to your citizen locker (Max 5MB)</p>
              </div>
              <button type="button" className="icon-btn" onClick={() => setShowUploadModal(false)}>
                <X size={18} />
              </button>
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-sm)', padding: '10px 14px', color: '#b91c1c', fontSize: '12px', marginBottom: '14px' }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label>Document Category</label>
              <select className="form-control" value={category} onChange={e => setCategory(e.target.value)}>
                <option>Identity Proof</option>
                <option>Address Proof</option>
                <option>Income Proof</option>
                <option>Property Document</option>
                <option>Educational Certificate</option>
                <option>Other Statutory Proof</option>
              </select>
            </div>

            <div className="form-group">
              <label>Select File (.pdf, .png, .jpg, .jpeg)</label>
              <input
                type="file"
                className="form-control"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileInput}
              />
              {fileName && (
                <div style={{ fontSize: '11.5px', color: 'var(--green)', marginTop: '4px' }}>
                  ✓ Selected: {fileName} ({fileSizeKb} KB)
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Notes / Description (Optional)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Self-attested copy of electricity bill for 2026"
                value={uploadNotes}
                onChange={e => setUploadNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button type="button" className="btn-secondary" onClick={() => setShowUploadModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" type="submit">
                Upload & Register Proof
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Preview Metadata Modal */}
      {previewDoc && (
        <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setPreviewDoc(null)}>
          <div className="modal" style={{ width: '500px' }}>
            <div className="modal-head">
              <div>
                <h2>Document Metadata</h2>
                <p>Simulated security & verification envelope</p>
              </div>
              <button className="icon-btn" onClick={() => setPreviewDoc(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12.5px', marginBottom: '16px' }}>
              <div style={{ background: 'var(--surface-alt)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--muted)', fontSize: '10px', textTransform: 'uppercase', display: 'block' }}>Filename</span>
                <b>{previewDoc.file_name}</b>
              </div>
              <div style={{ background: 'var(--surface-alt)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--muted)', fontSize: '10px', textTransform: 'uppercase', display: 'block' }}>Category</span>
                <b>{previewDoc.category}</b>
              </div>
              <div style={{ background: 'var(--surface-alt)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--muted)', fontSize: '10px', textTransform: 'uppercase', display: 'block' }}>MIME Type</span>
                <b className="mono">{previewDoc.file_type}</b>
              </div>
              <div style={{ background: 'var(--surface-alt)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--muted)', fontSize: '10px', textTransform: 'uppercase', display: 'block' }}>File Size</span>
                <b>{previewDoc.file_size_kb} KB</b>
              </div>
              <div style={{ background: 'var(--surface-alt)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--muted)', fontSize: '10px', textTransform: 'uppercase', display: 'block' }}>Verification Status</span>
                <b style={{ color: 'var(--green)' }}>{previewDoc.verification_status}</b>
              </div>
              <div style={{ background: 'var(--surface-alt)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--muted)', fontSize: '10px', textTransform: 'uppercase', display: 'block' }}>Uploaded On</span>
                <b>{new Date(previewDoc.uploaded_at).toLocaleString()}</b>
              </div>
            </div>

            <div style={{ background: 'var(--surface-alt)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '18px', fontSize: '11px', color: 'var(--muted)' }}>
              <b>Security Verification:</b> SHA-256 signature verified against tamper-evident citizen locker store.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setPreviewDoc(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
