# 🚨 Rapid Crisis Response Platform

Rapid Crisis is a comprehensive, real-time incident management and crisis response platform specifically designed for large properties, hotels, and corporate environments. It bridges the gap between those experiencing an emergency (guests) and those responding to it (on-ground staff and corporate command), ensuring rapid communication, strict accountability, and organized post-incident analysis.

## 🌟 Key Features

The application is composed of three interconnected modules tailored for different user roles:

### 1. 📱 Guest SOS (`/guest`)
A frictionless interface that allows guests or occupants to quickly request emergency assistance.
- **Instant Reporting**: One-tap reporting for Medical, Fire, Security Threats, Harassment, and Infrastructure failures.
- **Silent Mode**: For security threats, guests can report silently without drawing attention.
- **Live Updates**: Guests receive real-time status updates as staff acknowledge and respond to their SOS.

### 2. 🛡️ Staff Dashboard (`/staff`)
The operational backbone for on-ground security and response personnel.
- **Real-Time Incident Feed**: Instantly receive and acknowledge SOS alerts.
- **Incident Playbooks**: Auto-generated task checklists based on the specific type of emergency SOP.
- **Floor Maps & Routing**: Visual property map indicating AED stations, emergency exits, and live incident locations.
- **Shift Handover**: Formalized logging and handover processes for incoming/outgoing staff shifts.

### 3. 🏢 Command Center (`/command`)
A high-level oversight dashboard for General Managers and Regional Directors.
- **Global Analytics**: Powered by Recharts, visualize SLA compliance, average resolution times, and property-wise incident volume.
- **Global Broadcasting**: Instantly broadcast crucial information or evacuation alerts to all properties.
- **Postmortem Builder**: Tools for generating structured post-incident reports (Timeline, Root Cause Analysis, Actions) once an event is resolved.

## 🛠️ Tech Stack

- **Framework**: Next.js (React 19)
- **State Management**: Zustand (with persistent JSON storage)
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **Styling**: Custom CSS Variables & Glassmorphism UI components

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository and navigate to the project directory.
2. Install the dependencies:
   ```bash
   npm install
   ```

### Running the Application

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Navigation Paths
- **Home**: `http://localhost:3000/`
- **Guest SOS**: `http://localhost:3000/guest`
- **Staff Dashboard**: `http://localhost:3000/staff`
- **Command Center**: `http://localhost:3000/command`

## 📁 Project Structure

```
├── components/
│   └── shared/          # Reusable UI components (Modal, Toasts, Severity Badges)
├── pages/
│   ├── command/         # Command Center dashboard
│   ├── guest/           # Guest SOS interface
│   ├── staff/           # Staff Operations dashboard
│   ├── _app.jsx         # App entry point & global providers
│   └── index.jsx        # Landing page
├── src/
│   ├── data/            # Mock data sources (Incidents, Analytics, RBAC)
│   └── index.css        # Global CSS variables, utility classes, and animations
├── store/
│   └── useStore.js      # Global Zustand store for real-time incident state
└── next.config.js       # Next.js configuration
```

## 🤝 Contributing
When contributing, please ensure all new dependencies and UI components are compatible with the Next.js `pages` router and properly utilize the global CSS variables defined in `src/index.css`.
