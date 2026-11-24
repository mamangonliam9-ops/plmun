import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import plmunSeal from '../assets/plmun-logo.png'

type View = 'Home' | 'Concerns' | 'Updates' | 'Profile' | 'Admin' | 'Assistant'
type Status = 'Submitted' | 'Under Review' | 'In Progress' | 'Resolved'
type Role = 'student' | 'staff' | 'admin'
type Concern = { code: string; title: string; category: string; status: Status; updated: string; description: string; attachment?: string }
type UserProfile = {
  id?: number
  firstName: string
  lastName: string
  email: string
  role?: Role
  studentNumber?: string
  program?: string
  yearLevel?: string
  campus?: string
  phone?: string
}

const categories = [
  ['Academic', 'graduation', 'Academic Concerns'],
  ['Financial', 'wallet', 'Financial Concerns'],
  ['Facilities', 'building', 'Facility Concerns'],
  ['Technical', 'monitor', 'Technical Concerns'],
  ['Registrar', 'file', 'Registrar Concerns'],
  ['Student life', 'users', 'Student Affairs Concerns'],
]

const seed: Concern[] = [
  { code: 'CN-2026-001284', title: 'Student portal keeps logging me out', category: 'Technical', status: 'In Progress', updated: 'Today, 9:15 AM', description: 'The student portal signs me out after a few minutes, even while I am actively using it.' },
  { code: 'CN-2026-001276', title: 'Scholarship disbursement follow-up', category: 'Financial', status: 'Under Review', updated: 'Yesterday, 2:40 PM', description: 'I would like to follow up on the scholarship disbursement reflected in my student account.' },
  { code: 'CN-2026-001241', title: 'Air conditioning in room 304', category: 'Facilities', status: 'Resolved', updated: 'Oct 24, 4:20 PM', description: 'The air conditioning unit in room 304 was not cooling the room.' },
]

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const content: Record<string, ReactNode> = {
    home: <path d="m3 10 9-7 9 7v10H15v-7H9v7H3V10Z" />,
    list: <><path d="M8 6h13M8 12h13M8 18h13" /><path d="M3 6h.01M3 12h.01M3 18h.01" /></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    graduation: <><path d="m3 8.5 9-4.5 9 4.5-9 4.5-9-4.5Z" /><path d="M7 11v5c3 2.5 7 2.5 10 0v-5" /></>,
    wallet: <><rect x="3" y="5" width="18" height="15" rx="3" /><path d="M16 11h5v5h-5a2.5 2.5 0 0 1 0-5Z" /></>,
    building: <><path d="M4 21V8l8-5 8 5v13H4Z" /><path d="M9 21v-6h6v6M8 10h.01M16 10h.01" /></>,
    monitor: <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8M12 17v4M8 10l2.5 2.5L16 7" /></>,
    file: <><path d="M6 3h9l4 4v14H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" /><path d="M14 3v5h5M8 13h8M8 17h8" /></>,
    users: <><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0M16 6a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 6" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    shield: <><path d="M12 3 19 6v5c0 5-3.2 8.3-7 10-3.8-1.7-7-5-7-10V6l7-3Z" /><path d="M8 10h8M9 13h6M10 7h4" /></>,
    sparkle: <path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3ZM19 16l.6 1.4L21 18l-1.4.6L19 20l-.6-1.4L17 18l1.4-.6L19 16Z" />,
    logout: <path d="m10 17 5-5-5-5M15 12H3M15 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />,
    upload: <><path d="M12 16V4m-4 4 4-4 4 4" /><path d="M5 14v5h14v-5" /></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{content[name]}</svg>
}

function Brand() {
  return <div className="brand"><span className="brand-mark"><img src={plmunSeal} alt="Pamantasan ng Lungsod ng Muntinlupa seal" /></span><span><strong>PLMUN</strong><small>Student Concern Portal</small></span></div>
}

function Pill({ status }: { status: Status }) {
  return <span className={`pill ${status.toLowerCase().replaceAll(' ', '-')}`}>{status}</span>
}

function ConcernCard({ item, open }: { item: Concern; open: () => void }) {
  return <button className="concern-card" onClick={open}>
    <i className="accent" /><span className="concern-content"><span className="concern-head"><small>{item.code}</small><Pill status={item.status} /></span><strong>{item.title}</strong><span className="meta">{item.category}<i />Updated {item.updated}</span></span><span className="round-arrow"><Icon name="chevron" size={16} /></span>
  </button>
}

export default function App() {
  const [view, setView] = useState<View>('Home')
  const [concerns, setConcerns] = useState(seed)
  const [modal, setModal] = useState(false)
  const [category, setCategory] = useState('')
  const [selected, setSelected] = useState<Concern | null>(null)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')
  const [unread, setUnread] = useState(2)
  const [loadingConcerns, setLoadingConcerns] = useState(true)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    if (typeof window === 'undefined') return null
    const saved = window.localStorage.getItem('plmun-user')
    if (!saved) return null
    try { return JSON.parse(saved) as UserProfile } catch { return null }
  })
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [signedOut, setSignedOut] = useState(() => !currentUser)
  const [authError, setAuthError] = useState('')
  const [assistantMessages, setAssistantMessages] = useState<Array<{ id: number; sender: 'bot' | 'user'; text: string; time: string }>>([
    { id: 1, sender: 'bot', text: 'Hi! I can help you classify your concern, explain the next step, or suggest what to include in your message.', time: 'Now' },
  ])
  const [assistantOpen, setAssistantOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const roleLabel = currentUser?.role === 'admin' ? 'Admin' : currentUser?.role === 'staff' ? 'Staff' : 'Student'
  const navItems: View[] = currentUser?.role === 'admin'
    ? ['Home', 'Concerns', 'Updates', 'Profile', 'Assistant', 'Admin']
    : currentUser?.role === 'staff'
      ? ['Home', 'Concerns', 'Updates', 'Profile', 'Assistant', 'Admin']
      : ['Home', 'Concerns', 'Updates', 'Profile', 'Assistant']

  useEffect(() => {
    async function loadConcerns() {
      try {
        const response = await fetch('/api/concerns')
        if (!response.ok) throw new Error('Unable to load concerns')
        const data = await response.json() as Concern[]
        if (Array.isArray(data) && data.length > 0) {
          setConcerns(data)
        }
      } catch {
        setConcerns(seed)
      } finally {
        setLoadingConcerns(false)
      }
    }

    void loadConcerns()
  }, [])

  useEffect(() => {
    if (currentUser) {
      window.localStorage.setItem('plmun-user', JSON.stringify(currentUser))
      setSignedOut(false)
    } else {
      window.localStorage.removeItem('plmun-user')
    }
  }, [currentUser])

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [view, selected])

  const shown = useMemo(() => concerns.filter(c => {
    const type = filter === 'All' || (filter === 'Active' ? c.status !== 'Resolved' : c.status === 'Resolved')
    const q = search.toLowerCase()
    return type && (!q || `${c.code} ${c.title} ${c.category}`.toLowerCase().includes(q))
  }), [concerns, filter, search])

  function navigate(next: View) { setView(next); setSelected(null) }
  function openForm(value = '') { setCategory(value); setModal(true) }
  function notify(message: string) { setToast(message); window.setTimeout(() => setToast(''), 2600) }
  function generateAssistantReply(message: string): string {
    const text = message.toLowerCase()
    if (text.includes('portal') || text.includes('login') || text.includes('password') || text.includes('account')) {
      return 'For portal access issues, try clearing your browser cache, ensuring you are using the correct email, and confirming your password. If the issue continues, submit a Technical concern with the exact error message and the device/browser you are using.'
    }
    if (text.includes('scholarship') || text.includes('financial') || text.includes('refund') || text.includes('payment')) {
      return 'That sounds like a Financial concern. The best next step is to prepare the amount, date, and proof of payment, then submit the concern under Financial. Include your student number and the office or transaction involved.'
    }
    if (text.includes('schedule') || text.includes('advising') || text.includes('class') || text.includes('academic')) {
      return 'This sounds academic in nature. Gather your course code, subject schedule, and the reason for the request. You can submit it under Academic and explain whether you need a schedule change, advising, or extension.'
    }
    if (text.includes('facilities') || text.includes('room') || text.includes('aircon') || text.includes('elevator') || text.includes('broken')) {
      return 'This is likely a Facilities concern. Describe the exact location, the issue, and whether it affects safety or class operations. Include photos if available so the Facilities team can respond faster.'
    }
    if (text.includes('safety') || text.includes('danger') || text.includes('parking')) {
      return 'Please report this as a safety concern right away. Include the exact location, time of occurrence, and any witnesses or evidence. If it is urgent, contact campus security or the student affairs office immediately.'
    }
    if (text.includes('technical') || text.includes('wifi') || text.includes('network') || text.includes('printer') || text.includes('software')) {
      return 'That matches Technical support. Include your device type, browser, the exact error, and whether the problem happens on mobile, desktop, or both. This helps the IT team troubleshoot quickly.'
    }
    if (text.includes('how') && (text.includes('submit') || text.includes('report')) || text.includes('what should i include')) {
      return 'For any concern, include a clear title, category, description, and any supporting evidence like screenshots or photos. A strong report explains the issue, when it happened, and the impact it has on your studies.'
    }
    return 'I can help with that. Please tell me the kind of issue you are facing, where it happened, and whether it is Academic, Technical, Financial, Facilities, or Student life. The more details you give, the better the guidance will be.'
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const label = categories.find(c => c[2] === category)?.[0] || 'Awaiting classification'
    const title = String(data.get('title'))
    const description = String(data.get('description'))
    const file = data.get('attachment')
    const payload = {
      title,
      category: label,
      status: 'Submitted',
      updated: 'Just now',
      description,
      attachment: file instanceof File && file.name ? file.name : undefined,
    }

    try {
      const response = await fetch('/api/concerns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error('Unable to save concern')
      const savedConcern = await response.json() as Concern
      setConcerns(old => [savedConcern, ...old])
      setModal(false); setView('Concerns'); notify('Concern submitted successfully')
    } catch {
      setConcerns(old => [{ code: `CN-2026-${String(1285 + old.length).padStart(6, '0')}`, title, category: label, status: 'Submitted', updated: 'Just now', description, attachment: file instanceof File && file.name ? file.name : undefined }, ...old])
      setModal(false); setView('Concerns'); notify('Concern submitted successfully')
    }
  }

  async function updateConcernStatus(code: string, status: Status) {
    try {
      const response = await fetch(`/api/concerns/${code}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, updated: 'Just now' }),
      })
      if (!response.ok) throw new Error('Unable to update concern status')
      const updatedConcern = await response.json() as Concern
      setConcerns(old => old.map(item => item.code === code ? { ...item, ...updatedConcern } : item))
      setSelected(current => current && current.code === code ? { ...current, status, updated: 'Just now' } : current)
      notify(`Concern marked as ${status}`)
    } catch {
      setConcerns(old => old.map(item => item.code === code ? { ...item, status, updated: 'Just now' } : item))
      setSelected(current => current && current.code === code ? { ...current, status, updated: 'Just now' } : current)
      notify(`Concern marked as ${status}`)
    }
  }

  return <div className="app">
    <aside className="sidebar">
      <Brand />
      <nav>{navItems.map(item => <button key={item} className={view === item ? 'active' : ''} onClick={() => navigate(item)}><Icon name={{ Home: 'home', Concerns: 'list', Updates: 'bell', Profile: 'user', Assistant: 'sparkle', Admin: 'shield' }[item]} /><span>{item === 'Concerns' ? 'My concerns' : item === 'Admin' ? (currentUser?.role === 'admin' ? 'Admin desk' : currentUser?.role === 'staff' ? 'Staff desk' : 'Admin view') : item === 'Assistant' ? 'Help desk' : item}</span>{item === 'Updates' && unread > 0 && <b>{unread}</b>}</button>)}</nav>
      <div className="privacy"><span><Icon name="shield" size={17} /></span><strong>{roleLabel} access</strong><p>Every concern is treated privately and routed securely.</p></div>
      <button className="mini-profile" onClick={() => navigate('Profile')}><span className="avatar">{(currentUser?.firstName?.slice(0, 1) || 'A')}{(currentUser?.lastName?.slice(0, 1) || 'R')}</span><span><strong>{currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Alex Rivera'}</strong><small>{currentUser?.role ? `${roleLabel} account` : currentUser?.studentNumber || '2023-10482'}</small></span><Icon name="chevron" size={15} /></button>
    </aside>

    <main className="main">
      <header className="topbar"><div className="mobile-brand"><Brand /></div><div className="crumb"><small>Student concern portal</small><strong>{selected ? 'Concern details' : view === 'Home' ? 'Dashboard' : view}</strong></div><div className="top-actions"><button aria-label="Search concerns" onClick={() => navigate('Concerns')}><Icon name="search" /></button><button className="notification" aria-label="View updates" onClick={() => navigate('Updates')}><Icon name="bell" />{unread > 0 && <i />}</button><span className="avatar">{(currentUser?.firstName?.slice(0, 1) || 'A')}{(currentUser?.lastName?.slice(0, 1) || 'R')}</span></div></header>
      <div className="content" ref={contentRef}>
        {view === 'Home' && <Home user={currentUser} concerns={concerns} openForm={openForm} openAll={() => { setFilter('All'); setSearch(''); navigate('Concerns') }} openUpdates={() => navigate('Updates')} openProfile={() => navigate('Profile')} openAssistant={() => navigate('Assistant')} openConcern={c => { setView('Concerns'); setSelected(c) }} onStatSelect={nextFilter => { setFilter(nextFilter); setSearch(''); navigate('Concerns') }} />}
        {view === 'Concerns' && !selected && <Concerns list={shown} total={concerns.length} filter={filter} search={search} setFilter={setFilter} setSearch={setSearch} newConcern={() => openForm()} open={setSelected} />}
        {view === 'Concerns' && selected && <Detail item={selected} back={() => setSelected(null)} onStatusChange={currentUser?.role === 'admin' || currentUser?.role === 'staff' ? updateConcernStatus : undefined} />}
        {view === 'Updates' && <Updates unread={unread} markRead={() => { setUnread(0); notify('All updates marked as read') }} />}
        {view === 'Profile' && <Profile user={currentUser} notify={notify} signOut={() => setSignedOut(true)} />}
        {view === 'Assistant' && <AssistantView messages={assistantMessages} onSubmit={(text) => {
          const nextUser = { id: Date.now(), sender: 'user', text, time: 'Now' }
          setAssistantMessages(old => [...old, nextUser, { id: Date.now() + 1, sender: 'bot', text: generateAssistantReply(text), time: 'Now' }])
        }} />}
        {view === 'Admin' && selected && <Detail item={selected} back={() => setSelected(null)} onStatusChange={currentUser?.role === 'admin' || currentUser?.role === 'staff' ? updateConcernStatus : undefined} />}
        {view === 'Admin' && !selected && <AdminView concerns={concerns} role={currentUser?.role || 'student'} onSelect={(item) => { setSelected(item); setView('Admin') }} />}
      </div>
    </main>

    {view !== 'Assistant' && (
      <>
        <button className={`assistant-fab ${assistantOpen ? 'active' : ''}`} onClick={() => setAssistantOpen(open => !open)} aria-label="Toggle support desk">
          <Icon name="sparkle" size={22} />
        </button>

        <div className={`assistant-widget ${assistantOpen ? 'open' : ''}`}>
          <div className="assistant-widget-header">
            <div>
              <small>Support desk</small>
              <strong>Student help</strong>
            </div>
            <button type="button" className="assistant-widget-close" onClick={() => setAssistantOpen(false)} aria-label="Close support desk">
              <Icon name="close" size={14} />
            </button>
          </div>
          <div className="assistant-messages compact">
            {assistantMessages.map(message => (
              <div key={message.id} className={`assistant-message ${message.sender}`}>
                <div className="bubble"><strong>{message.sender === 'bot' ? 'Campus guide' : 'You'}</strong><p>{message.text}</p><small>{message.time}</small></div>
              </div>
            ))}
          </div>
          <form className="assistant-form compact-form" onSubmit={event => {
            event.preventDefault()
            const input = event.currentTarget.elements.namedItem('assistant-input') as HTMLInputElement | null
            const trimmed = input?.value.trim() || ''
            if (!trimmed) return
            const nextUser = { id: Date.now(), sender: 'user', text: trimmed, time: 'Now' }
            const nextBot = { id: Date.now() + 1, sender: 'bot', text: generateAssistantReply(trimmed), time: 'Now' }
            setAssistantMessages(old => [...old, nextUser, nextBot])
            input.value = ''
            setAssistantOpen(true)
          }}>
            <input name="assistant-input" placeholder="Ask for help..." />
            <button className="btn primary" type="submit">Send</button>
          </form>
        </div>
      </>
    )}

    <nav className="mobile-nav">{navItems.map(item => <button key={item} className={view === item ? 'active' : ''} onClick={() => navigate(item)}><Icon name={{ Home: 'home', Concerns: 'list', Updates: 'bell', Profile: 'user', Assistant: 'sparkle', Admin: 'shield' }[item]} size={20} /><span>{item === 'Assistant' ? 'Help' : item === 'Admin' ? (currentUser?.role === 'admin' ? 'Admin' : currentUser?.role === 'staff' ? 'Staff' : 'Admin') : item}</span></button>)}</nav>

    {loadingConcerns && <div className="backdrop"><div className="modal loading-modal"><p>Loading student concerns...</p></div></div>}
    {modal && <div className="backdrop" onMouseDown={e => e.target === e.currentTarget && setModal(false)}><form className="modal" onSubmit={submit}>
      <div className="modal-title"><span><Icon name="sparkle" /></span><div><small>New concern</small><h2>How can we help?</h2></div><button type="button" onClick={() => setModal(false)}><Icon name="close" /></button></div>
      <p>Share the details below. We’ll classify your concern and send it to the right campus team.</p>
      <label><span>Concern title</span><input name="title" minLength={5} required autoFocus placeholder="Briefly describe your concern" /></label>
      <label><span>Category <small>Optional</small></span><select value={category} onChange={e => setCategory(e.target.value)}><option value="">Let the portal suggest a category</option>{categories.map(c => <option key={c[2]} value={c[2]}>{c[2]}</option>)}</select></label>
      <label><span>Tell us more</span><textarea name="description" minLength={10} required placeholder="Include relevant details so the campus team can assist you faster" /><small>Your submission is visible only to authorized staff.</small></label>
      <label className="file-field"><span>Supporting image <small>Optional</small></span><input name="attachment" type="file" accept="image/png,image/jpeg,image/webp" /><small>PNG, JPG, or WebP up to 5 MB.</small></label>
      <div className="modal-actions"><button type="button" className="btn ghost" onClick={() => setModal(false)}>Cancel</button><button className="btn primary">Submit concern <Icon name="arrow" size={16} /></button></div>
    </form></div>}
    {signedOut && <div className="backdrop auth-backdrop"><div className="auth-shell"><form className="modal sign-in-modal" onSubmit={async event => {
      event.preventDefault()
      const form = new FormData(event.currentTarget)
      const studentNumber = String(form.get('studentNumber') || '').trim()
      const payload = {
        firstName: String(form.get('firstName') || ''),
        lastName: String(form.get('lastName') || ''),
        email: authMode === 'signup' ? `${studentNumber.toLowerCase()}@plmun.edu.ph` : String(form.get('email') || ''),
        password: String(form.get('password') || ''),
        studentNumber,
        program: String(form.get('program') || ''),
        yearLevel: String(form.get('yearLevel') || ''),
        campus: String(form.get('campus') || ''),
        phone: String(form.get('phone') || ''),
      }

      try {
        const endpoint = authMode === 'signup' ? '/api/signup' : '/api/login'
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Unable to continue.')
        const user = data.user as UserProfile
        setCurrentUser(user)
        setSignedOut(false)
        const nextView: View = user.role === 'staff' || user.role === 'admin' ? 'Admin' : 'Home'
        navigate(nextView)
        notify(authMode === 'signup' ? `Welcome, ${user.firstName}!` : `Welcome back, ${user.firstName}.`)
        setAuthError('')
      } catch (error) {
        setAuthError(error instanceof Error ? error.message : 'Unable to continue.')
      }
    }}>
      <div className="sign-in-brand"><Brand /></div>
      <div className="sign-in-copy"><p className="eyebrow">Secure student access</p><h2>{authMode === 'signup' ? 'Create account' : 'Welcome back'}</h2><span>{authMode === 'signup' ? 'Register your student account and start submitting concerns.' : 'Sign in to continue to your concerns and campus updates.'}</span></div>
      {authMode === 'signup' ? <>
        <div className="split-fields">
          <label><span>First name</span><input name="firstName" type="text" required placeholder="First name" /></label>
          <label><span>Last name</span><input name="lastName" type="text" required placeholder="Last name" /></label>
        </div>
        <div className="split-fields">
          <label><span>Student no.</span><input name="studentNumber" type="text" required placeholder="2023-10482" /></label>
          <label><span>Program</span><input name="program" type="text" required placeholder="BSIT" /></label>
        </div>
        <div className="split-fields">
          <label><span>Year level</span><input name="yearLevel" type="text" required placeholder="3rd year" /></label>
          <label><span>Campus</span><input name="campus" type="text" required placeholder="Main Campus" /></label>
        </div>
        <label><span>Mobile number</span><input name="phone" type="tel" placeholder="+63 917 555 0182" /></label>
      </> : null}
      {authMode === 'signin' && <label><span>Student email</span><input name="email" type="email" required defaultValue={currentUser?.email || 'alex.rivera@plmun.edu.ph'} /></label>}
      <label><span>Password</span><input name="password" type="password" required minLength={6} defaultValue={authMode === 'signin' ? 'password' : ''} /></label>
      {authError && <small className="auth-error">{authError}</small>}
      <button className="btn primary sign-in-button">{authMode === 'signup' ? 'Create account' : 'Sign in'} <Icon name="arrow" size={16} /></button>
      <small className="demo-note">{authMode === 'signup' ? 'Your account will be stored in the database.' : 'Demo accounts: student, staff, and admin are ready to use.'}</small>
      <button type="button" className="auth-toggle" onClick={() => { setAuthMode(mode => mode === 'signin' ? 'signup' : 'signin'); setAuthError('') }}>
        {authMode === 'signin' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
      </button>
    </form></div></div>}
    <div className={toast ? 'toast show' : 'toast'}>{toast}<Icon name="check" size={16} /></div>
  </div>
}

function Home({ user, concerns, openForm, openAll, openUpdates, openProfile, openAssistant, openConcern, onStatSelect }: { user: UserProfile | null; concerns: Concern[]; openForm: (c?: string) => void; openAll: () => void; openUpdates: () => void; openProfile: () => void; openAssistant: () => void; openConcern: (c: Concern) => void; onStatSelect: (filter: 'All' | 'Active' | 'Resolved') => void }) {
  const active = concerns.filter(c => c.status !== 'Resolved').length
  const firstName = user?.firstName || 'Alex'
  return <>
    <section className="welcome"><div><p className="eyebrow">Tuesday, November 4</p><h1>Good morning, {firstName}.</h1><span>Your voice helps make our campus better.</span></div><button className="btn primary desktop-cta" onClick={() => openForm()}><Icon name="plus" size={18} /> Submit a concern</button></section>
    <section className="hero"><div><span className="hero-label"><Icon name="sparkle" size={14} /> We’re listening</span><h2>Something on your mind?</h2><p>Share a concern with the right campus team and follow every update in one secure place.</p><button onClick={() => openForm()}>Start a new concern <Icon name="arrow" size={16} /></button></div><div className="hero-art"><i /><i /><span><b /><b /><b /></span><span><Icon name="check" size={24} /></span></div></section>
    <section className="stats">
      <Stat icon="list" value={concerns.length} label="Total concerns" tone="green" onClick={() => onStatSelect('All')} />
      <Stat icon="clock" value={active} label="Active concerns" tone="amber" onClick={() => onStatSelect('Active')} />
      <Stat icon="check" value={concerns.length - active} label="Resolved" tone="blue" onClick={() => onStatSelect('Resolved')} />
    </section>
    <section className="feature-launcher">
      <button onClick={() => openForm()}><span><Icon name="plus" /></span><strong>Submit</strong><small>New concern</small></button>
      <button onClick={openAll}><span><Icon name="list" /></span><strong>Track</strong><small>View progress</small></button>
      <button onClick={openUpdates}><span><Icon name="bell" /></span><strong>Updates</strong><small>Notifications</small></button>
      <button onClick={openProfile}><span><Icon name="user" /></span><strong>Profile</strong><small>Preferences</small></button>
      <button onClick={openAssistant}><span><Icon name="sparkle" /></span><strong>Help</strong><small>Get support</small></button>
    </section>
    <div className="dashboard-grid">
      <section className="panel category-panel"><Heading title="Browse by category" sub="Select a topic to start a concern" /><div className="category-grid">{categories.map(c => <button key={c[0]} onClick={() => openForm(c[2])}><span><Icon name={c[1]} /></span><strong>{c[0]}</strong><small>Campus resources</small><Icon name="chevron" size={15} /></button>)}</div></section>
      <section className="panel recent"><Heading title="Recent concerns" sub="Your latest activity" action={openAll} /><div>{concerns.slice(0, 3).map(c => <ConcernCard key={c.code} item={c} open={() => openConcern(c)} />)}</div></section>
    </div>
  </>
}

function Stat({ icon, value, label, tone, onClick }: { icon: string; value: number; label: string; tone: string; onClick: () => void }) {
  return <button type="button" className="stat" onClick={onClick} aria-label={`View ${label.toLowerCase()}`}><span className={tone}><Icon name={icon} /></span><div><strong>{value}</strong><b>{label}</b><small>Click to view matching concerns</small></div></button>
}

function Heading({ title, sub, action }: { title: string; sub: string; action?: () => void }) {
  return <div className="heading"><div><h3>{title}</h3><p>{sub}</p></div>{action && <button onClick={action}>View all <Icon name="arrow" size={14} /></button>}</div>
}

function Concerns({ list, total, filter, search, setFilter, setSearch, newConcern, open }: { list: Concern[]; total: number; filter: string; search: string; setFilter: (v: string) => void; setSearch: (v: string) => void; newConcern: () => void; open: (c: Concern) => void }) {
  return <section className="view"><div className="view-title"><div><p className="eyebrow">Track your requests</p><h1>My concerns</h1><span>Follow progress and responses from campus teams.</span></div><button className="btn primary" onClick={newConcern}><Icon name="plus" size={18} /> New concern</button></div>
    <div className="toolbar"><label><Icon name="search" size={18} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title, category, or reference" /></label><div>{['All', 'Active', 'Resolved'].map(item => <button className={filter === item ? 'active' : ''} onClick={() => setFilter(item)} key={item}>{item}{item === 'All' && <span>{total}</span>}</button>)}</div></div>
    <div className="panel concern-list">{list.length ? list.map(c => <ConcernCard key={c.code} item={c} open={() => open(c)} />) : <div className="empty"><Icon name="search" size={28} /><h3>No concerns found</h3><p>Try adjusting your search or filters.</p></div>}</div>
  </section>
}

function Detail({ item, back, onStatusChange }: { item: Concern; back: () => void; onStatusChange?: (code: string, status: Status) => void }) {
  const allowStatusUpdate = !!onStatusChange
  return <section className="view"><button className="back" onClick={back}><Icon name="arrow" size={16} /> Back to concerns</button><div className="detail-title"><div><small>{item.code}</small><h1>{item.title}</h1><p>{item.category}</p></div><Pill status={item.status} /></div>
    <div className="detail-grid"><div><section className="panel detail-card"><h3>Your concern</h3><p>{item.description}</p>{item.attachment && <div className="attachment"><Icon name="upload" size={17} /><span><strong>Attached image</strong><small>{item.attachment}</small></span></div>}<small>Submitted October 28, 2026</small></section>{allowStatusUpdate && <section className="panel detail-actions"><h3>Manage concern</h3><div className="status-button-row">{(['Submitted', 'Under Review', 'In Progress', 'Resolved'] as Status[]).map(status => <button key={status} type="button" className={item.status === status ? 'active' : ''} onClick={() => onStatusChange?.(item.code, status)}>{status}</button>)}</div></section> }<section className="panel response"><span><Icon name="shield" /></span><div><small>Latest response from campus</small><h3>{item.category === 'Technical' ? 'Information Technology Office' : 'Student Services Office'}</h3><p>Our campus team is reviewing your concern. We will post another update as soon as the next step is confirmed.</p><b>Today, 9:15 AM</b></div></section></div>
      <section className="panel timeline"><h3>Status timeline</h3>{['Concern submitted', 'Under review', 'Assigned to campus team', 'Work in progress', 'Resolved'].map((text, i) => { const done = i < (item.status === 'Resolved' ? 5 : item.status === 'In Progress' ? 4 : item.status === 'Under Review' ? 2 : 1); return <div className={done ? 'done' : ''} key={text}><span>{done ? <Icon name="check" size={12} /> : i + 1}</span><p><strong>{text}</strong><small>{done ? 'Completed' : 'Pending'}</small></p></div>})}</section>
    </div>
  </section>
}

function Updates({ unread, markRead }: { unread: number; markRead: () => void }) {
  const items = [['Work has started', 'Your portal access concern is now In Progress.', 'Today · 9:15 AM'], ['Concern received', 'Your scholarship concern was received and is Under Review.', 'Yesterday · 2:40 PM'], ['Issue resolved', 'The air conditioning concern in room 304 has been resolved.', 'Oct 24 · 4:20 PM']]
  return <section className="view"><div className="view-title"><div><p className="eyebrow">Stay informed</p><h1>Updates</h1><span>{unread === 0 ? 'You are all caught up.' : `You have ${unread} unread notification${unread === 1 ? '' : 's'}.`}</span></div>{unread > 0 && <button className="btn ghost" onClick={markRead}>Mark all as read</button>}</div><div className="panel update-list">{items.map((x, i) => <article className={unread > 0 && i < Math.min(unread, 2) ? 'unread' : ''} key={x[0]}><span><Icon name={i === 2 ? 'check' : 'bell'} size={18} /></span><div><strong>{x[0]}</strong><p>{x[1]}</p><small>{x[2]}</small></div>{unread > 0 && i < Math.min(unread, 2) && <i />}</article>)}</div></section>
}

function Profile({ user, notify, signOut }: { user: UserProfile | null; notify: (m: string) => void; signOut: () => void }) {
  const firstName = user?.firstName || 'Alex'
  const lastName = user?.lastName || 'Rivera'
  const fullName = `${firstName} ${lastName}`.trim()
  const program = user?.program || 'BS Information Technology'
  const studentNumber = user?.studentNumber || '2023-10482'
  const yearLevel = user?.yearLevel || '3rd year'
  const campus = user?.campus || 'Main Campus'
  const phone = user?.phone || '+63 917 555 0182'
  const email = user?.email || 'alex.rivera@plmun.edu.ph'

  return <section className="view"><div className="view-title"><div><p className="eyebrow">Account settings</p><h1>Your profile</h1><span>Manage your student information and preferences.</span></div></div><div className="profile-grid">
    <aside className="panel profile-summary"><span className="big-avatar">{firstName.slice(0, 1)}{lastName.slice(0, 1)}</span><h2>{fullName}</h2><p>{program}</p><b><Icon name="check" size={12} /> Verified student</b><dl><div><dt>Student number</dt><dd>{studentNumber}</dd></div><div><dt>Year level</dt><dd>{yearLevel}</dd></div><div><dt>Campus</dt><dd>{campus}</dd></div></dl></aside>
    <form className="panel profile-form" onSubmit={e => { e.preventDefault(); notify('Profile changes saved') }}><h3>Personal information</h3><p>Keep your details current so campus teams can reach you.</p><div>{[['Full name', fullName], ['Student email', email], ['Program', program], ['Mobile number', phone]].map(x => <label key={x[0]}><span>{x[0]}</span><input defaultValue={x[1]} /></label>)}</div><footer><button className="btn primary">Save changes</button></footer></form>
    <section className="panel preference"><span><Icon name="bell" /></span><div><h3>Update notifications</h3><p>Receive an email when your concern status changes.</p></div><label className="toggle"><input type="checkbox" defaultChecked onChange={event => notify(event.target.checked ? 'Email updates turned on' : 'Email updates turned off')} /><i /></label></section>
    <button className="panel signout" onClick={signOut}><Icon name="logout" /><span><strong>Sign out</strong><small>End your current portal session</small></span><Icon name="chevron" size={16} /></button>
  </div></section>
}

function AssistantView({ messages, onSubmit }: { messages: Array<{ id: number; sender: 'bot' | 'user'; text: string; time: string }>; onSubmit: (text: string) => void }) {
  const [draft, setDraft] = useState('')

  return <section className="view"><div className="view-title"><div><p className="eyebrow">Support desk</p><h1>Student help</h1><span>Ask for guidance on your concern before you submit it.</span></div></div>
    <div className="panel assistant-panel">
      <div className="assistant-messages">
        {messages.map(message => (
          <div key={message.id} className={`assistant-message ${message.sender}`}>
            <div className="bubble"><strong>{message.sender === 'bot' ? 'Campus guide' : 'You'}</strong><p>{message.text}</p><small>{message.time}</small></div>
          </div>
        ))}
      </div>
      <form className="assistant-form" onSubmit={event => {
        event.preventDefault()
        const trimmed = draft.trim()
        if (!trimmed) return
        onSubmit(trimmed)
        setDraft('')
      }}>
        <input value={draft} onChange={event => setDraft(event.target.value)} placeholder="Describe your concern or ask for help..." />
        <button className="btn primary" type="submit">Send</button>
      </form>
    </div>
  </section>
}

function AdminView({ concerns, role, onSelect }: { concerns: Concern[]; role: Role; onSelect: (item: Concern) => void }) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const queueRef = useRef<HTMLDivElement>(null)
  const isAdmin = role === 'admin'
  const subtitle = isAdmin
    ? 'Full access to all concerns and live records for oversight.'
    : 'Review the student queue and monitor updates from the campus team.'
  const openCount = concerns.filter(item => item.status !== 'Resolved').length
  const reviewCount = concerns.filter(item => item.status === 'Submitted' || item.status === 'Under Review').length
  const resolvedCount = concerns.length - openCount
  const filteredConcerns = concerns.filter(item => {
    const matchesSearch = `${item.code} ${item.title} ${item.category} ${item.description}`.toLowerCase().includes(query.trim().toLowerCase())
    const matchesStatus = statusFilter === 'All'
      || (statusFilter === 'Needs review' && (item.status === 'Submitted' || item.status === 'Under Review'))
      || item.status === statusFilter
    return matchesSearch && matchesStatus
  })
  function scrollQueue(direction: -1 | 1) {
    const queue = queueRef.current
    if (queue) queue.scrollBy({ left: direction * Math.max(queue.clientWidth * 0.85, 220), behavior: 'smooth' })
  }

  return <section className="view admin-view">
    <div className="view-title"><div><p className="eyebrow">{isAdmin ? 'Admin access' : 'Staff access'}</p><h1>Manage concerns</h1><span>{subtitle}</span></div></div>

    <div className="admin-summary" aria-label="Concern totals">
      <div><small>Total concerns</small><strong>{concerns.length}</strong></div>
      <div><small>Needs review</small><strong>{reviewCount}</strong></div>
      <div><small>In progress</small><strong>{concerns.filter(item => item.status === 'In Progress').length}</strong></div>
      <div><small>Resolved</small><strong>{resolvedCount}</strong></div>
    </div>

    <section className="panel admin-manage" aria-label="Manage concern queue">
      <div className="admin-tools">
        <label className="admin-search"><Icon name="search" size={17} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search title, category, or reference" aria-label="Search concerns" /></label>
        <div className="admin-filters" aria-label="Filter concerns by status">
          {['All', 'Needs review', 'In Progress', 'Resolved'].map(option => {
            const count = option === 'All' ? concerns.length
              : option === 'Needs review' ? reviewCount
                : concerns.filter(item => item.status === option).length
            return <button type="button" key={option} className={statusFilter === option ? 'active' : ''} onClick={() => setStatusFilter(option)}>{option}<span>{count}</span></button>
          })}
        </div>
      </div>

      <div className="admin-queue-heading"><div><h2>Concern queue</h2><p>{filteredConcerns.length} of {concerns.length} records</p></div><div className="admin-queue-controls"><span>Swipe to browse</span><button type="button" onClick={() => scrollQueue(-1)} aria-label="Scroll concerns left" title="Scroll left"><Icon name="arrow" size={15} /></button><button type="button" onClick={() => scrollQueue(1)} aria-label="Scroll concerns right" title="Scroll right"><Icon name="arrow" size={15} /></button></div></div>
      {filteredConcerns.length ? <div className="panel admin-board-wrap" ref={queueRef} tabIndex={0} role="region" aria-label="Swipeable concern queue">
        <div className="admin-board" aria-label="Filtered concerns">
          {filteredConcerns.map(item => <article className="admin-card" key={item.code}>
            <div className="admin-card-header"><span className="admin-code">{item.code}</span><Pill status={item.status} /></div>
            <h3>{item.title}</h3>
            <div className="admin-meta"><span>{item.category}</span><span>Updated {item.updated}</span></div>
            <p>{item.description}</p>
            <button type="button" className="btn ghost admin-action" onClick={() => onSelect(item)}>Review concern <Icon name="arrow" size={15} /></button>
          </article>)}
        </div>
      </div> : <div className="admin-empty"><Icon name="search" size={24} /><strong>No matching concerns</strong><span>Try another search or status filter.</span></div>}
    </section>
  </section>
}
