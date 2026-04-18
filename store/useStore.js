import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ─── Seed Data ────────────────────────────────────────────────────────────────
const NOW = Date.now()
const SEED_PROPERTIES = [
  { id: 'prop-001', name: 'The Grand Meridian', address: '14 Marine Drive, Nariman Point, Mumbai 400021', phone: '+91-22-6600-7700', rooms: 312, zone: 'Mumbai Central' },
  { id: 'prop-002', name: 'Sky Suites Bangalore', address: '7 Residency Rd, Bangalore 560025', phone: '+91-80-4100-8800', rooms: 180, zone: 'South India' },
  { id: 'prop-003', name: 'The Regal Goa', address: 'Sinquerim Beach Rd, North Goa 403515', phone: '+91-832-240-9900', rooms: 248, zone: 'Goa' },
  { id: 'prop-004', name: 'Palace Heights Delhi', address: '12 Chanakyapuri, New Delhi 110021', phone: '+91-11-6660-5500', rooms: 420, zone: 'Delhi NCR' },
]

const SEED_INCIDENTS = [
  {
    id: 'INC-2024-001',
    propertyId: 'prop-001',
    type: 'medical',
    severity: 'S0',
    status: 'responding',
    location: 'Room 1204',
    silentMode: false,
    guestPII: false,
    description: 'Guest reported chest pain and shortness of breath.',
    assignedTo: 'Raj Kumar',
    createdAt: NOW - 12 * 60000,
    updatedAt: NOW - 8 * 60000,
  },
  {
    id: 'INC-2024-002',
    propertyId: 'prop-002',
    type: 'fire',
    severity: 'S0',
    status: 'acknowledged',
    location: 'Kitchen Level B1',
    silentMode: false,
    guestPII: false,
    description: 'Smoke detected in kitchen exhaust near fryer station.',
    assignedTo: 'Arjun Nair',
    createdAt: NOW - 28 * 60000,
    updatedAt: NOW - 20 * 60000,
  },
  {
    id: 'INC-2024-003',
    propertyId: 'prop-001',
    type: 'threat',
    severity: 'S1',
    status: 'active',
    location: 'Parking Level B1',
    silentMode: true,
    guestPII: false,
    description: 'Guest silently reported suspicious individual near vehicles.',
    assignedTo: null,
    createdAt: NOW - 4 * 60000,
    updatedAt: NOW - 4 * 60000,
  },
  {
    id: 'INC-2024-004',
    propertyId: 'prop-003',
    type: 'infrastructure',
    severity: 'S2',
    status: 'investigating',
    location: 'Floors 7–10',
    silentMode: false,
    guestPII: false,
    description: 'Power fluctuation affecting 4 floors. Generator on standby.',
    assignedTo: 'Priya Singh',
    createdAt: NOW - 45 * 60000,
    updatedAt: NOW - 30 * 60000,
  },
  {
    id: 'INC-2024-005',
    propertyId: 'prop-004',
    type: 'harassment',
    severity: 'S1',
    status: 'resolved',
    location: 'Restaurant Level 2',
    silentMode: false,
    guestPII: false,
    description: 'Guest reported verbal harassment by another patron. Situation de-escalated.',
    assignedTo: 'Meera Joshi',
    createdAt: NOW - 4 * 60 * 60000,
    updatedAt: NOW - 3 * 60 * 60000,
    resolutionNote: 'Guest moved to separate area. Patron warned and escorted out.',
  },
]

const SEED_EVENTS = [
  { id: 'ev-001', incidentId: 'INC-2024-001', type: 'report',   message: 'Guest SOS submitted via app.', actor: 'System', createdAt: NOW - 12 * 60000 },
  { id: 'ev-002', incidentId: 'INC-2024-001', type: 'ack',      message: 'Raj Kumar acknowledged incident.', actor: 'Raj Kumar', createdAt: NOW - 10 * 60000 },
  { id: 'ev-003', incidentId: 'INC-2024-001', type: 'update',   message: 'AED retrieved from level 12 station. Medical team on scene.', actor: 'Raj Kumar', createdAt: NOW - 8 * 60000 },
  { id: 'ev-004', incidentId: 'INC-2024-002', type: 'report',   message: 'Smoke detector triggered in kitchen.', actor: 'System', createdAt: NOW - 28 * 60000 },
  { id: 'ev-005', incidentId: 'INC-2024-002', type: 'ack',      message: 'Arjun Nair acknowledged. Kitchen staff evacuated.', actor: 'Arjun Nair', createdAt: NOW - 25 * 60000 },
  { id: 'ev-006', incidentId: 'INC-2024-003', type: 'report',   message: 'Silent SOS received from parking level.', actor: 'System', createdAt: NOW - 4 * 60000 },
  { id: 'ev-007', incidentId: 'INC-2024-004', type: 'report',   message: 'Power fluctuation detected on floors 7–10.', actor: 'System', createdAt: NOW - 45 * 60000 },
  { id: 'ev-008', incidentId: 'INC-2024-004', type: 'assign',   message: 'Assigned to Priya Singh. Generator activated.', actor: 'Priya Singh', createdAt: NOW - 35 * 60000 },
  { id: 'ev-009', incidentId: 'INC-2024-005', type: 'report',   message: 'Harassment reported by guest at restaurant.', actor: 'System', createdAt: NOW - 4 * 60 * 60000 },
  { id: 'ev-010', incidentId: 'INC-2024-005', type: 'resolve',  message: 'Incident resolved. Patron removed. Guest offered compensation.', actor: 'Meera Joshi', createdAt: NOW - 3 * 60 * 60000 },
]

const SEED_TASKS = [
  // INC-2024-001
  { id: 'task-001', incidentId: 'INC-2024-001', title: 'Assess guest condition and call 112', done: true },
  { id: 'task-002', incidentId: 'INC-2024-001', title: 'Retrieve AED from floor 12 station', done: true },
  { id: 'task-003', incidentId: 'INC-2024-001', title: 'Clear elevator for paramedic access', done: false },
  { id: 'task-004', incidentId: 'INC-2024-001', title: 'Notify General Manager', done: false },
  { id: 'task-005', incidentId: 'INC-2024-001', title: 'Secure guest belongings in room', done: false },
  // INC-2024-002
  { id: 'task-006', incidentId: 'INC-2024-002', title: 'Evacuate kitchen staff', done: true },
  { id: 'task-007', incidentId: 'INC-2024-002', title: 'Activate fire suppression check', done: true },
  { id: 'task-008', incidentId: 'INC-2024-002', title: 'Isolate gas supply to kitchen', done: false },
  // INC-2024-003
  { id: 'task-009', incidentId: 'INC-2024-003', title: 'Dispatch security to Parking B1', done: false },
  { id: 'task-010', incidentId: 'INC-2024-003', title: 'Review CCTV footage — parking zone', done: false },
  { id: 'task-011', incidentId: 'INC-2024-003', title: 'Do not confront — observe and report', done: false },
]

const SEED_BROADCASTS = [
  { id: 'bc-001', propertyId: 'prop-001', message: 'Reminder: All staff to review fire evacuation routes before evening shift.', createdAt: NOW - 2 * 60 * 60000, author: 'Corporate Command' },
  { id: 'bc-002', propertyId: 'all', message: 'NETWORK MAINTENANCE: Brief outage expected 02:00–02:30 tonight. Fallback SMS active.', createdAt: NOW - 6 * 60 * 60000, author: 'IT Operations' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function uid() {
  return 'id-' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36)
}

// ─── Store ────────────────────────────────────────────────────────────────────
const useStore = create(
  persist(
    (set, get) => ({
      // ── State ──
      seeded: false,
      properties: [],
      incidents: [],
      events: [],
      tasks: [],
      broadcasts: [],
      currentStaffUser: null,
      currentCommandUser: null,

      // ── Seed (called once on first mount) ──────────────────────────────────
      seed() {
        if (get().seeded) return
        set({
          seeded: true,
          properties: SEED_PROPERTIES,
          incidents: SEED_INCIDENTS,
          events: SEED_EVENTS,
          tasks: SEED_TASKS,
          broadcasts: SEED_BROADCASTS,
        })
      },

      // ── Auth ───────────────────────────────────────────────────────────────
      loginStaff(user)   { set({ currentStaffUser: user }) },
      logoutStaff()      { set({ currentStaffUser: null }) },
      loginCommand(user) { set({ currentCommandUser: user }) },
      logoutCommand()    { set({ currentCommandUser: null }) },

      // ── Guest SOS ──────────────────────────────────────────────────────────
      submitSOS({ propertyId, type, severity, location, silentMode, description }) {
        const id = 'INC-' + new Date().getFullYear() + '-' + String(get().incidents.length + 1).padStart(3, '0')
        const now = Date.now()
        const incident = { id, propertyId: propertyId || 'prop-001', type, severity, status: 'active', location, silentMode, guestPII: false, description, assignedTo: null, createdAt: now, updatedAt: now }
        const event = { id: uid(), incidentId: id, type: 'report', message: silentMode ? 'Silent SOS submitted — no communication mode.' : 'SOS submitted via guest app.', actor: 'Guest', createdAt: now }

        // Default tasks per type
        const taskTemplates = {
          medical:        ['Assess guest and call 112', 'Retrieve AED from nearest station', 'Clear elevator for paramedic access', 'Notify GM'],
          fire:           ['Evacuate affected areas immediately', 'Activate fire suppression', 'Call fire brigade 101', 'Secure elevator banks'],
          threat:         ['Dispatch security — do not confront', 'Review CCTV', 'Notify police 100 if confirmed', 'Brief all staff on lockdown'],
          harassment:     ['Separate parties — ensure guest safety', 'Document statements', 'Escort guest to safe area', 'Notify manager on duty'],
          infrastructure: ['Isolate affected system', 'Activate backup', 'Guest communication', 'Notify facilities'],
          other:          ['Assess situation', 'Escalate to manager', 'Document all details'],
        }
        const tasks = (taskTemplates[type] || taskTemplates.other).map((title, i) => ({ id: uid() + i, incidentId: id, title, done: false }))

        set(s => ({ incidents: [incident, ...s.incidents], events: [event, ...s.events], tasks: [...tasks, ...s.tasks] }))
        return id
      },

      // ── Staff Actions ──────────────────────────────────────────────────────
      acknowledgeIncident(id) {
        const now = Date.now()
        const user = get().currentStaffUser?.name || 'Staff'
        set(s => ({
          incidents: s.incidents.map(i => i.id === id ? { ...i, status: 'acknowledged', updatedAt: now } : i),
          events: [{ id: uid(), incidentId: id, type: 'ack', message: `${user} acknowledged incident and is responding.`, actor: user, createdAt: now }, ...s.events],
        }))
      },

      assignToMe(id) {
        const now = Date.now()
        const user = get().currentStaffUser?.name || 'Staff'
        set(s => ({
          incidents: s.incidents.map(i => i.id === id ? { ...i, assignedTo: user, status: i.status === 'active' ? 'acknowledged' : i.status, updatedAt: now } : i),
          events: [{ id: uid(), incidentId: id, type: 'assign', message: `${user} assigned to and taking ownership.`, actor: user, createdAt: now }, ...s.events],
        }))
      },

      addTimelineEvent(incidentId, message) {
        const now = Date.now()
        const user = get().currentStaffUser?.name || 'Staff'
        set(s => ({
          incidents: s.incidents.map(i => i.id === incidentId ? { ...i, updatedAt: now } : i),
          events: [{ id: uid(), incidentId, type: 'update', message, actor: user, createdAt: now }, ...s.events],
        }))
      },

      resolveIncident(id, note) {
        const now = Date.now()
        const user = get().currentStaffUser?.name || 'Staff'
        set(s => ({
          incidents: s.incidents.map(i => i.id === id ? { ...i, status: 'resolved', resolutionNote: note, updatedAt: now } : i),
          events: [{ id: uid(), incidentId: id, type: 'resolve', message: `Resolved by ${user}. Note: ${note}`, actor: user, createdAt: now }, ...s.events],
        }))
      },

      toggleTask(taskId) {
        set(s => ({ tasks: s.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t) }))
      },

      // ── Command Actions ────────────────────────────────────────────────────
      createBroadcast(propertyId, message) {
        const user = get().currentCommandUser?.name || 'Command'
        const bc = { id: uid(), propertyId, message, createdAt: Date.now(), author: user }
        set(s => ({ broadcasts: [bc, ...s.broadcasts] }))
        return bc.id
      },

      // ── Selectors (computed) ───────────────────────────────────────────────
      getIncidentEvents(incidentId) {
        return get().events.filter(e => e.incidentId === incidentId).sort((a, b) => b.createdAt - a.createdAt)
      },
      getIncidentTasks(incidentId) {
        return get().tasks.filter(t => t.incidentId === incidentId)
      },
      getPropertyIncidents(propertyId) {
        return get().incidents.filter(i => i.propertyId === propertyId)
      },
    }),
    {
      name: 'rcr-store-v2',
      storage: createJSONStorage(() => {
        // SSR-safe localStorage
        if (typeof window === 'undefined') return { getItem: () => null, setItem: () => {}, removeItem: () => {} }
        return localStorage
      }),
    }
  )
)

export default useStore
