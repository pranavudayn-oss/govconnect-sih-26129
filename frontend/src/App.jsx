import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { Topbar } from './components/Topbar'
import { Sidebar } from './components/Sidebar'
import { GlobalSearchModal } from './components/GlobalSearchModal'
import { NotificationsDrawer } from './components/NotificationsDrawer'
import { NewApplicationWizard } from './components/NewApplicationWizard'
import { AcknowledgementModal } from './components/AcknowledgementModal'
import { ApplicationDetailDrawer } from './components/ApplicationDetailDrawer'

// Views
import { CitizenView } from './views/CitizenView'
import { ServicesView } from './views/ServicesView'
import { ConsentView } from './views/ConsentView'
import { DocumentsView } from './views/DocumentsView'
import { OfficerView } from './views/OfficerView'
import { IntegrationView } from './views/IntegrationView'
import { SecurityView } from './views/SecurityView'
import { AuditView } from './views/AuditView'
import { AdminView } from './views/AdminView'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function App() {
  const [view, setView] = useState('citizen')
  const [apps, setApps] = useState([])
  const [departments, setDepartments] = useState([])
  const [services, setServices] = useState([])
  const [summary, setSummary] = useState({})
  const [notifications, setNotifications] = useState([])
  const [audit, setAudit] = useState([])
  const [demoUsers, setDemoUsers] = useState([])
  const [currentUser, setCurrentUser] = useState({
    email: 'citizen@govconnect.demo',
    full_name: 'Priya Sharma',
    role: 'CITIZEN',
    citizen_ref: 'CIT-DEMO-001',
    designation: 'Citizen Applicant'
  })

  // UI state
  const [search, setSearch] = useState('')
  const [selectedApp, setSelectedApp] = useState(null)
  const [modal, setModal] = useState(null)
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false)
  const [acknowledgementApp, setAcknowledgementApp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [apiOnline, setApiOnline] = useState(false)
  const [latency, setLatency] = useState(115)

  // Centralized API client with automatic role headers & error handling
  const api = useCallback(async (path, options = {}) => {
    const start = performance.now()
    try {
      const headers = {
        'Content-Type': 'application/json',
        'X-User-Role': currentUser.role,
        'X-User-Email': currentUser.email,
        ...(options.headers || {})
      }

      const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
      const duration = Math.round(performance.now() - start)
      setLatency(duration)

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        const message = body.detail || `Request failed with HTTP status ${res.status}`
        throw new Error(message)
      }
      return await res.json()
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setApiOnline(false)
        throw new Error('Unable to connect to GovConnect Gateway API. Please verify backend is running on port 8000.')
      }
      throw err
    }
  }, [currentUser])

  // Load all primary data
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [a, d, s, sum, n, au, u] = await Promise.all([
        api(`/api/applications?search=${encodeURIComponent(search)}`),
        api('/api/departments'),
        api('/api/services'),
        api('/api/dashboard/summary'),
        api('/api/notifications'),
        api('/api/audit'),
        api('/api/auth/demo-users')
      ])

      setApps(a)
      setDepartments(d)
      setServices(s)
      setSummary(sum)
      setNotifications(n)
      setAudit(au)
      setDemoUsers(u)
      setApiOnline(true)
    } catch (e) {
      console.warn('API sync notice:', e.message)
      setApiOnline(false)
    } finally {
      setLoading(false)
    }
  }, [api, search])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Handle Ctrl+K shortcut for Global Search
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchModalOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Switch demo persona
  const switchUser = useCallback((user) => {
    setCurrentUser(user)
    // If switching to officer, switch to officer view automatically
    if (user.role === 'OFFICER') setView('officer')
    else if (user.role === 'SYSTEM_ADMIN') setView('admin')
    else if (user.role === 'DEPARTMENT_ADMIN') setView('integration')
    else setView('citizen')
  }, [])

  // Actions
  async function handleCreateApplication(payload) {
    const newApp = await api('/api/applications', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
    await loadData()
    return newApp
  }

  async function handleMarkNotifRead(id) {
    await api(`/api/notifications/${id}/read`, { method: 'POST' })
    await loadData()
  }

  async function handleMarkAllNotifsRead() {
    await api('/api/notifications/read-all', { method: 'POST' })
    await loadData()
  }

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications])
  const pendingCitizenApps = useMemo(() => apps.filter(a => a.status === 'Action Required').length, [apps])

  // View title
  const viewTitles = {
    citizen: 'Citizen Service Hub',
    services: 'Government Services Catalog',
    consent: 'Consent Management Center',
    documents: 'Citizen Document Locker',
    officer: 'Officer Command Center',
    integration: 'Interoperability Control Center',
    security: 'Security & Trust Center',
    audit: 'Audit & Accountability Trail',
    admin: 'Platform Administration'
  }

  return (
    <div className="app-shell">
      {/* Sidebar Navigation */}
      <Sidebar
        view={view}
        setView={setView}
        currentUser={currentUser}
        unreadNotifs={unreadCount}
        pendingCitizenApps={pendingCitizenApps}
      />

      {/* Main Content Workspace */}
      <main className="main">
        {/* Topbar Navigation */}
        <Topbar
          view={view}
          title={viewTitles[view] || 'GovConnect Hub'}
          currentUser={currentUser}
          demoUsers={demoUsers}
          switchUser={switchUser}
          apiOnline={apiOnline}
          latency={latency}
          onRefresh={loadData}
          unreadCount={unreadCount}
          openNotifications={() => setNotifDrawerOpen(true)}
          openSearch={() => setSearchModalOpen(true)}
        />

        {/* Dynamic View Rendering */}
        {view === 'citizen' && (
          <CitizenView
            apps={apps}
            departments={departments}
            notifications={notifications}
            currentUser={currentUser}
            summary={summary}
            setModal={setModal}
            setSelectedApp={setSelectedApp}
            setView={setView}
          />
        )}

        {view === 'services' && (
          <ServicesView
            services={services}
            onApplyService={(srv) => {
              setModal('new')
            }}
          />
        )}

        {view === 'consent' && (
          <ConsentView
            currentUser={currentUser}
            api={api}
            onRefresh={loadData}
          />
        )}

        {view === 'documents' && (
          <DocumentsView
            currentUser={currentUser}
            api={api}
          />
        )}

        {view === 'officer' && (
          <OfficerView
            apps={apps}
            departments={departments}
            summary={summary}
            search={search}
            setSearch={setSearch}
            setSelectedApp={setSelectedApp}
            setModal={setModal}
          />
        )}

        {view === 'integration' && (
          <IntegrationView
            departments={departments}
            audit={audit}
            summary={summary}
            api={api}
            onRefresh={loadData}
          />
        )}

        {view === 'security' && (
          <SecurityView
            api={api}
          />
        )}

        {view === 'audit' && (
          <AuditView
            api={api}
          />
        )}

        {view === 'admin' && (
          <AdminView
            departments={departments}
            summary={summary}
            api={api}
            onRefresh={loadData}
          />
        )}
      </main>

      {/* Global Search Modal (Ctrl+K) */}
      {searchModalOpen && (
        <GlobalSearchModal
          close={() => setSearchModalOpen(false)}
          api={api}
          onSelectApplication={(trId) => {
            const match = apps.find(a => a.tracking_id === trId)
            if (match) setSelectedApp(match)
          }}
          onSelectService={(srv) => {
            setView('services')
          }}
          onSelectDepartment={(dept) => {
            setView('integration')
          }}
        />
      )}

      {/* Notifications Drawer */}
      {notifDrawerOpen && (
        <NotificationsDrawer
          notifications={notifications}
          close={() => setNotifDrawerOpen(false)}
          onMarkRead={handleMarkNotifRead}
          onMarkAllRead={handleMarkAllNotifsRead}
          onSelectApplication={(trId) => {
            const match = apps.find(a => a.tracking_id === trId)
            if (match) setSelectedApp(match)
          }}
        />
      )}

      {/* New Application Wizard Modal (6 Steps) */}
      {modal === 'new' && (
        <NewApplicationWizard
          departments={departments}
          services={services}
          currentUser={currentUser}
          close={() => setModal(null)}
          createApplication={handleCreateApplication}
          onOpenAcknowledgement={(newApp) => {
            setAcknowledgementApp(newApp)
          }}
        />
      )}

      {/* Acknowledgement / Printable Slip Modal */}
      {acknowledgementApp && (
        <AcknowledgementModal
          app={acknowledgementApp}
          close={() => setAcknowledgementApp(null)}
          onTrack={(trId) => {
            const match = apps.find(a => a.tracking_id === trId) || acknowledgementApp
            setSelectedApp(match)
          }}
        />
      )}

      {/* Application Case Processing Drawer */}
      {selectedApp && (
        <ApplicationDetailDrawer
          appSummary={selectedApp}
          departments={departments}
          currentUser={currentUser}
          close={() => setSelectedApp(null)}
          api={api}
          onUpdateSuccess={loadData}
        />
      )}
    </div>
  )
}

export default App
