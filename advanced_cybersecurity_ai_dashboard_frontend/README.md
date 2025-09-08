# Advanced Cybersecurity AI Dashboard - Frontend

Modern, minimalistic React frontend for real-time cybersecurity threat monitoring, AI analysis visualization, alert notifications, role-based access, configurable widgets, and historical analytics.

## Features

- Real-time threat monitoring (WebSocket with mock fallback)
- AI analysis visualization
- Incident alert notifications (toast overlay)
- User authentication and role management (mock: "admin" emails receive admin role)
- Configurable dashboard widgets (add/remove in UI)
- Historical analytics (placeholder chart area)
- Responsive layout: sidebar, topbar, analytics panel, widgets panel, overlays
- Light, modern theme
  - primary: `#0A192F`
  - secondary: `#112D4E`
  - accent: `#F9D423`

## What's New (AI Design Refresh)

We modernized the UI to reflect cutting-edge AI dashboard aesthetics:

- Glassmorphism and soft neumorphism where appropriate (panels, KPIs, inputs)
- Neural-inspired background orbs and soft gradient accents
- Animated micro-interactions (hover lift, smooth transitions)
- AI activity indicators (typing pulse in search; animated dots in panel headers)
- Enhanced KPI and chart visuals with gradients and shimmer loaders
- Softer rounded corners and minimal iconography
- Floating notification toasts with slide/fade-in and gentle float animation

You can tweak these in `src/App.css`:
- Theme variables: at the top under `:root` (colors, radii, shadows)
- Glassmorphism: `.glass` helper class
- Neumorphism: `.neo` helper class
- Activity loaders: `.ai-typing`, `.ai-activity`, `.ai-dot`, `.chart:after` (shimmer)

## Getting Started

- Install dependencies: `npm install`
- Start development server: `npm start`
- Run tests: `npm test`
- Build production bundle: `npm run build`

## Environment Variables

Copy `.env.example` to `.env` and set:

- `REACT_APP_API_BASE_URL` - REST API base URL (leave empty to use mock API)
- `REACT_APP_WS_URL` - WebSocket URL for real-time stream (leave empty to use mock generator)

The application auto-falls back to mock data if the variables are not set.

## Architecture Overview

- `src/App.js` - Entry point, implements:
  - Auth context and mock login
  - Real-time WebSocket stream (mock when no WS URL)
  - REST API wrapper with mock responses
  - Layout (Sidebar, Topbar, panels)
  - KPI cards, threat list, widget grid, alerts overlay
  - AI-inspired animated indicators and loaders

- `src/services/api.js` - Fetch wrapper for REST (env based)
- `src/services/ws.js` - WebSocket helper
- `src/utils/roles.js` - Role access utilities
- `src/App.css` - Full theme and layout styling (glassmorphism, micro-interactions, loaders)

## Role Management

- Log in with any email to access; if the email contains "admin", the assigned role is `admin` and admin-only nav items appear.
- Click "Use admin" button on login to prefill admin email/password.

## Integrating Real Backends

Replace mock fallbacks by setting environment variables:
- REST endpoints used (examples; replace with your backend routes):
  - `POST /auth/login` -> { token, user: { id, email, role } }
  - `GET /auth/me` -> user profile
  - `GET /analytics/summary`
  - `GET /analytics/historical`
  - `GET /widgets`
  - `GET /alerts/recent`
- WebSocket messages expected:
  - JSON objects with type `THREAT_EVENT` and payload:
    `{ id, sourceIP, severity: "low|medium|high", timestamp, rule, score, aiInsights }`

Adjust `apiFetch` and WebSocket connection endpoints to match your backend if they differ.

## License

Internal project template for KAVIA code generation workflows.
