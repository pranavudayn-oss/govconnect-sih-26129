import React, { useState } from 'react'
import {
  ClipboardList, Search, Clock, FileCheck, ArrowRight,
  ShieldCheck, Info, CheckCircle2, ChevronRight, X
} from 'lucide-react'

export function ServicesView({ services, onApplyService }) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [viewingService, setViewingService] = useState(null)

  const categories = [
    'All',
    'Revenue',
    'Municipal Services',
    'Social Welfare',
    'Transport',
    'Education',
    'Health',
    'Certificates',
    'Public Utilities'
  ]

  const filtered = services.filter(s => {
    const matchesCat = selectedCategory === 'All' || s.category.toLowerCase().includes(selectedCategory.toLowerCase()) || selectedCategory.toLowerCase().includes(s.category.toLowerCase())
    const matchesSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase())
    return matchesCat && matchesSearch
  })

  return (
    <>
      {/* Catalog Header */}
      <div className="panel" style={{ padding: '24px 28px', marginBottom: '24px', background: 'linear-gradient(135deg, #0e2038, #19385c)', color: '#fff' }}>
        <div style={{ maxWidth: '700px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '1px' }}>
            FEDERATED GOVERNMENT SERVICES REPOSITORY
          </span>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '6px 0 10px', color: '#fff' }}>
            Unified Public Services Catalog
          </h2>
          <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.5 }}>
            Access certified public services from Revenue, Municipal, Transport, Social Welfare, and Education
            authorities through a single interoperable gateway. No repeated documentation required.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap' }}>
        <div className="search-input-wrap" style={{ flex: '1', minWidth: '280px' }}>
          <Search size={16} style={{ color: 'var(--muted)' }} />
          <input
            type="text"
            placeholder="Search government services, certificates, permits..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="catalog-filters">
        {categories.map(cat => (
          <button
            key={cat}
            className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="service-grid">
        {filtered.map(srv => (
          <div className="service-card" key={srv.id}>
            <div className="service-card-top">
              <span className="service-dept-badge">
                {srv.department_name} ({srv.department_code})
              </span>
              <span className="badge neutral">{srv.category}</span>
            </div>

            <h4>{srv.name}</h4>
            <p>{srv.description}</p>

            <div className="service-requirements">
              <b>Required Documents:</b>
              <span>{srv.required_documents?.join(', ') || 'Standard Identity Proof'}</span>
            </div>

            <div className="service-meta-row">
              <div>
                <span>Est. Processing:</span> <b>{srv.estimated_processing_days} Days</b>
              </div>
              <div>
                <span>Fee:</span> <b>{srv.fee === 0 ? 'Free' : `₹${srv.fee}`}</b>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button
                className="btn-secondary"
                style={{ flex: 1, padding: '8px 10px', fontSize: '11.5px' }}
                onClick={() => setViewingService(srv)}
              >
                Requirements
              </button>
              <button
                className="btn-primary"
                style={{ flex: 1, padding: '8px 10px', fontSize: '11.5px' }}
                onClick={() => onApplyService(srv)}
              >
                Apply Now <ArrowRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <ClipboardList size={36} />
          <b>No services matched your query</b>
          <p>Try switching category or clearing the search bar.</p>
        </div>
      )}

      {/* Service Details Modal */}
      {viewingService && (
        <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setViewingService(null)}>
          <div className="modal" style={{ width: '600px' }}>
            <div className="modal-head">
              <div>
                <span className="badge blue">{viewingService.category}</span>
                <h2 style={{ marginTop: '4px' }}>{viewingService.name}</h2>
                <p>{viewingService.department_name} · SLA: {viewingService.estimated_processing_days} Working Days</p>
              </div>
              <button className="icon-btn" onClick={() => setViewingService(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ fontSize: '12.5px', color: 'var(--ink-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
              {viewingService.description}
            </div>

            <div style={{ background: 'var(--surface-alt)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '16px' }}>
              <b style={{ fontSize: '12.5px', color: 'var(--ink)', display: 'block', marginBottom: '6px' }}>Eligibility Criteria</b>
              <p style={{ fontSize: '12px', color: 'var(--ink-secondary)' }}>{viewingService.eligibility}</p>
            </div>

            <div style={{ background: 'var(--surface-alt)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '20px' }}>
              <b style={{ fontSize: '12.5px', color: 'var(--ink)', display: 'block', marginBottom: '6px' }}>Required Supporting Documents</b>
              <ul style={{ paddingLeft: '18px', fontSize: '12px', color: 'var(--ink-secondary)' }}>
                {viewingService.required_documents?.map(doc => (
                  <li key={doc} style={{ marginBottom: '4px' }}>{doc}</li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn-secondary" onClick={() => setViewingService(null)}>
                Close
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  const s = viewingService
                  setViewingService(null)
                  onApplyService(s)
                }}
              >
                Proceed to Application <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
