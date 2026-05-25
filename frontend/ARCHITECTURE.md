# Frontend Architecture & System Design

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    BROWSER (Client)                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Next.js 14 Application                    │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │                                                          │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │           Layout.tsx (Root)                      │  │ │
│  │  │    - Font loading (Inter)                        │  │ │
│  │  │    - Global styles                               │  │ │
│  │  │    - SEO/Metadata                                │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │                      ↓                                   │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │          Page.tsx (Dashboard)                    │  │ │
│  │  │    - Main layout orchestration                   │  │ │
│  │  │    - State management                            │  │ │
│  │  │    - Data fetching                               │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │                      ↓                                   │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │        Component Hierarchy                       │  │ │
│  │  ├──────────────────────────────────────────────────┤  │ │
│  │  │                                                   │  │ │
│  │  │  ┌─────────────┐    ┌─────────────────────┐     │  │ │
│  │  │  │  Sidebar    │    │     TopBar           │     │  │ │
│  │  │  │  (Nav)      │    │  (System Status)     │     │  │ │
│  │  │  └─────────────┘    └─────────────────────┘     │  │ │
│  │  │         ↓                    ↓                    │  │ │
│  │  │  ┌──────────────────────────────────────────┐   │  │ │
│  │  │  │       Main Content Grid                  │   │  │ │
│  │  │  ├──────────────────────────────────────────┤   │  │ │
│  │  │  │                                          │   │  │ │
│  │  │  │  ┌──────────────────────────────────┐   │   │  │ │
│  │  │  │  │  Metric Cards (4-col grid)       │   │   │  │ │
│  │  │  │  │  - Temperature                   │   │   │  │ │
│  │  │  │  │  - Blockchain Integrity          │   │   │  │ │
│  │  │  │  │  - Custody Node                  │   │   │  │ │
│  │  │  │  │  - Anomaly Risk                  │   │   │  │ │
│  │  │  │  └──────────────────────────────────┘   │   │  │ │
│  │  │  │                ↓                        │   │  │ │
│  │  │  │  ┌──────────────────────────────────┐   │   │  │ │
│  │  │  │  │  RealTimeStream Chart (2/3 cols)│   │   │  │ │
│  │  │  │  │  ├─ Temperature line             │   │   │  │ │
│  │  │  │  │  ├─ Humidity line                │   │   │  │ │
│  │  │  │  │  └─ Light line                   │   │   │  │ │
│  │  │  │  └──────────────────────────────────┘   │   │  │ │
│  │  │  │                                          │   │  │ │
│  │  │  │  ┌──────────────────────────────────┐   │   │  │ │
│  │  │  │  │ LedgerAuditTimeline (1/3 cols)  │   │   │  │ │
│  │  │  │  │ ├─ Block #15847                  │   │   │  │ │
│  │  │  │  │ ├─ Block #15846                  │   │   │  │ │
│  │  │  │  │ └─ Block #15845 ...              │   │   │  │ │
│  │  │  │  └──────────────────────────────────┘   │   │  │ │
│  │  │  │                ↓                        │   │  │ │
│  │  │  │  ┌──────────────────────────────────┐   │   │  │ │
│  │  │  │  │ AnomalyIncidentConsole (fullw)   │   │   │  │ │
│  │  │  │  │ ├─ [CRITICAL] High Temp Drift   │   │   │  │ │
│  │  │  │  │ ├─ [WARNING] Minor Fluctuation   │   │   │  │ │
│  │  │  │  │ └─ [RESOLVED] Humidity Alert     │   │   │  │ │
│  │  │  │  └──────────────────────────────────┘   │   │  │ │
│  │  │  │                                          │   │  │ │
│  │  │  └──────────────────────────────────────────┘   │  │ │
│  │  │                                                   │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │                                                          │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │            State & Data Flow Layer                     │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │                                                          │ │
│  │  React State (useState)                                │ │
│  │  ├─ sensorData: ChartDataPoint[]                       │ │
│  │  ├─ systemStatus: SystemStatus                         │ │
│  │  └─ sidebarOpen: boolean                               │ │
│  │                                                          │ │
│  │  Effects (useEffect)                                   │ │
│  │  ├─ Fetch initial data                                 │ │
│  │  ├─ Subscribe to WebSocket                             │ │
│  │  └─ Cleanup on unmount                                 │ │
│  │                                                          │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Styling & UI Layer (Tailwind CSS)              │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │  - Dark theme (zinc-950)                               │ │
│  │  - Glassmorphism effects                               │ │
│  │  - Responsive grid (1/2/3/4 columns)                   │ │
│  │  - Micro-animations (200-300ms)                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│              Backend Services (External)                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  REST API Endpoints                                         │
│  ├─ GET /api/sensors/live                                  │
│  ├─ GET /api/sensors/data                                  │
│  ├─ GET /api/blockchain/blocks                             │
│  ├─ GET /api/anomalies                                     │
│  └─ GET /api/system/status                                 │
│                                                               │
│  WebSocket Stream                                           │
│  └─ WS /stream → Real-time sensor updates                  │
│                                                               │
│  Blockchain RPC                                             │
│  └─ Smart contract interactions                             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌─────────────────────────────────────┐
│     Component Initialization        │
└──────────────────┬──────────────────┘
                   ↓
        ┌──────────────────────┐
        │  useEffect Hook      │
        │ ┌──────────────────┐ │
        │ │ Initialize State │ │
        │ │ Load Mock Data   │ │
        │ │ Setup WebSocket  │ │
        │ └──────────────────┘ │
        └──────────────────────┘
                   ↓
    ┌──────────────┴──────────────┐
    ↓                             ↓
┌─────────────┐          ┌──────────────────┐
│ Mock Data   │          │  Real-time Stream│
│ (Initial)   │          │  via WebSocket   │
└──────┬──────┘          └────────┬─────────┘
       │                          │
       └──────────────┬───────────┘
                      ↓
         ┌────────────────────────┐
         │   Update State         │
         │ setSensorData(newData) │
         └────────────┬───────────┘
                      ↓
         ┌────────────────────────┐
         │  Re-render Components  │
         └────────────┬───────────┘
                      ↓
      ┌───────────────┼───────────────┐
      ↓               ↓               ↓
 ┌─────────┐  ┌──────────────┐  ┌──────────┐
 │Metric   │  │RealTime      │  │Ledger    │
 │Cards    │  │Stream Chart  │  │Timeline  │
 │Update   │  │Updates       │  │Updates   │
 └─────────┘  └──────────────┘  └──────────┘
      ↓               ↓               ↓
      └───────────────┼───────────────┘
                      ↓
         ┌────────────────────────┐
         │   Browser Renders      │
         │   Updated UI           │
         └────────────────────────┘
```

## Component Dependency Tree

```
Dashboard (src/app/page.tsx)
│
├── Sidebar
│   └── Navigation items
│
├── TopBar
│   ├── Edge Node Status
│   ├── Wallet Address
│   ├── Simulation Toggle
│   └── Blockchain Health
│
└── Main Content
    │
    ├── Metric Cards Grid (4 cols)
    │   ├── MetricCard (Temperature)
    │   │   └── Recharts LineChart (sparkline)
    │   ├── MetricCard (Blockchain Integrity)
    │   │   └── Recharts LineChart (sparkline)
    │   ├── MetricCard (Custody Node)
    │   └── MetricCard (Anomaly Risk)
    │
    ├── Content Grid (3 cols)
    │   ├── RealTimeStream (2 cols)
    │   │   └── Recharts ComposedChart
    │   │       ├── Temperature line
    │   │       ├── Humidity line
    │   │       └── Light line
    │   │
    │   └── LedgerAuditTimeline (1 col)
    │       └── Block items
    │           ├── Transaction hash
    │           ├── Event type
    │           └── Verification badge
    │
    └── AnomalyIncidentConsole (fullwidth)
        └── Incident items
            ├── Severity badge
            ├── Expandable accordion
            └── ML analysis details
```

## State Management Flow

```
Dashboard Component
│
├─ State: sensorData
│  ├─ Type: ChartDataPoint[]
│  ├─ Updated: Every 1 second (mock)
│  ├─ Used by: RealTimeStream
│  └─ Source: generateMockSensorData() + WebSocket
│
├─ State: sidebarOpen
│  ├─ Type: boolean
│  ├─ Updated: User click on menu
│  ├─ Used by: Sidebar, mobile layout
│  └─ Source: User interaction
│
└─ State: systemStatus (constant)
   ├─ Type: SystemStatus
   ├─ Updated: On component mount
   ├─ Used by: MetricCards, TopBar
   └─ Source: mockSystemStatus
```

## Responsive Layout Breakpoints

```
Mobile (< 768px)
├─ Sidebar: Hidden (collapsible)
├─ TopBar: Full width
├─ Metric Cards: 1 column
├─ Main Content: Single column
└─ All interactive

Tablet (768px - 1024px)
├─ Sidebar: Visible
├─ TopBar: Visible
├─ Metric Cards: 2 columns
├─ Charts: Stacked
└─ Optimized for touch

Desktop (> 1024px)
├─ Sidebar: Always visible
├─ Main content pushed: ml-64
├─ Metric Cards: 4 columns
├─ Charts: Side-by-side (2/3 + 1/3)
└─ Full feature set
```

## Performance Considerations

```
Optimization Areas
├─ Code Splitting
│  ├─ Dynamic imports for heavy components
│  └─ Separate chunks per route
│
├─ State Updates
│  ├─ Batch updates (every 1s for mock data)
│  ├─ Keep only last 60 data points
│  └─ Use shouldComponentUpdate patterns
│
├─ Rendering
│  ├─ Memoize expensive components
│  ├─ Use React.lazy for routes
│  └─ Optimize re-renders (dependencies)
│
├─ Bundle Size
│  ├─ Tree-shaking unused Recharts features
│  ├─ Minimal Lucide icons (18-24px)
│  └─ Tailwind CSS purging (unused styles)
│
└─ Network
   ├─ Compress API responses
   ├─ Use WebSocket for real-time (vs polling)
   └─ Implement request deduplication
```

---

This architecture ensures:
✅ Scalability - Easy to add new components
✅ Maintainability - Clear separation of concerns
✅ Performance - Optimized rendering and state management
✅ Accessibility - Semantic HTML and ARIA labels
✅ Responsiveness - Mobile-first design
