# ColdChain Dashboard - Quick Start Guide ⚡

## 🎯 5-Minute Setup

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open browser
# Visit http://localhost:3000
```

**That's it! Dashboard is live.** 🚀

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components (6 main components)
│   ├── types/            # TypeScript interfaces
│   ├── lib/              # Utilities & helpers
│   └── data/             # Mock data generators
├── README.md             # Project overview
├── SETUP.md              # Detailed setup guide
├── API_INTEGRATION.md    # Backend integration patterns
└── COMPONENT_GUIDE.md    # How to build new components
```

## 🎨 Key Components

| Component | Purpose | Location |
|-----------|---------|----------|
| **MetricCard** | KPI displays with sparklines | `src/components/MetricCard.tsx` |
| **RealTimeStream** | Time-series chart | `src/components/RealTimeStream.tsx` |
| **LedgerAuditTimeline** | Blockchain events | `src/components/LedgerAuditTimeline.tsx` |
| **AnomalyIncidentConsole** | Alert management | `src/components/AnomalyIncidentConsole.tsx` |
| **Sidebar** | Navigation | `src/components/Sidebar.tsx` |
| **TopBar** | System status | `src/components/TopBar.tsx` |

## 🔌 Replace Mock Data with Real API

### Option 1: Simple REST API

```typescript
// In src/app/page.tsx, replace:
const [sensorData, setSensorData] = useState<ChartDataPoint[]>([])

// With:
useEffect(() => {
  fetch('/api/sensors/data')
    .then(r => r.json())
    .then(data => setSensorData(data))
}, [])
```

### Option 2: Real-Time WebSocket

```typescript
useEffect(() => {
  const ws = new WebSocket('ws://your-backend:8000/stream')
  ws.onmessage = (event) => {
    const newPoint = JSON.parse(event.data)
    setSensorData(prev => [...prev.slice(-59), newPoint])
  }
  return () => ws.close()
}, [])
```

See `API_INTEGRATION.md` for complete examples.

## 🎯 Customization Checklist

### Design
- [ ] Update colors in `tailwind.config.ts`
- [ ] Change accent colors (emerald/amber/red)
- [ ] Modify font in `src/app/layout.tsx`
- [ ] Update sidebar branding in `src/components/Sidebar.tsx`

### Data
- [ ] Connect to your backend API
- [ ] Update type definitions in `src/types/index.ts`
- [ ] Transform API responses in `src/data/mockData.ts`
- [ ] Add real WebSocket connection

### Components
- [ ] Add new components to `src/components/`
- [ ] Export in `src/components/index.ts`
- [ ] Import and use in `src/app/page.tsx`

### Deployment
- [ ] Build: `npm run build`
- [ ] Test: `npm start`
- [ ] Deploy to Vercel/Docker/Cloud

## 🌍 Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8000
NEXT_PUBLIC_ENABLE_SIMULATION=true
```

See `.env.example` for all options.

## 📊 Development Commands

```bash
npm run dev       # Start dev server (hot reload)
npm run build     # Build for production
npm start         # Run production build
npm run lint      # Run linter (if configured)
npm test          # Run tests (if configured)
```

## 📖 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Full project overview |
| `SETUP.md` | Detailed setup & deployment |
| `API_INTEGRATION.md` | Backend API patterns |
| `COMPONENT_GUIDE.md` | Building custom components |

## 🎓 Key Files to Know

- **Main Page**: `src/app/page.tsx` - Dashboard layout
- **Global Styles**: `src/app/globals.css` - Theme & animations
- **Types**: `src/types/index.ts` - All interfaces
- **Utils**: `src/lib/utils.ts` - Helpers & formatters
- **Mock Data**: `src/data/mockData.ts` - Sample data

## 🚀 Common Tasks

### Add a New Component

1. Create `src/components/MyComponent.tsx`
2. Export in `src/components/index.ts`
3. Import in `src/app/page.tsx`
4. Add to layout grid

### Change Theme Colors

Edit `tailwind.config.ts`:
```typescript
colors: {
  emerald: { 400: '#YOUR_COLOR' }
}
```

### Add API Integration

See `API_INTEGRATION.md` for:
- WebSocket streaming
- REST API calls
- Error handling
- Caching strategies

### Deploy to Production

```bash
# Build
npm run build

# Option 1: Vercel
vercel

# Option 2: Docker
docker build -t dashboard .
docker run -p 3000:3000 dashboard

# Option 3: Traditional server
npm start
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 3000 in use | `lsof -i :3000` then `kill -9 PID` |
| Styles not loading | `rm -rf .next && npm run dev` |
| npm install fails | `npm cache clean --force && npm install` |
| TypeScript errors | Check `src/types/index.ts` |

See `SETUP.md` for more solutions.

## 📚 Learning Resources

- **Next.js**: https://nextjs.org/learn
- **React**: https://react.dev
- **Tailwind**: https://tailwindcss.com/docs
- **Recharts**: https://recharts.org
- **TypeScript**: https://www.typescriptlang.org/docs

## 🎨 Design System

### Colors
- **Background**: `zinc-950` (#09090b)
- **Card**: `zinc-900` (#18181b)
- **Border**: `zinc-700` (#3f3f46)
- **Healthy**: `emerald-400` (#34d399)
- **Warning**: `amber-400` (#fbbf24)
- **Critical**: `red-400` (#f87171)

### Typography
- **Font**: Inter (Geist fallback)
- **Heading**: Bold, explicit hierarchy
- **Body**: Regular weight, `text-zinc-100`
- **Labels**: Uppercase, `text-zinc-400`

### Spacing
- Use Tailwind units: `p-2`, `p-4`, `p-6`, `p-8`
- Consistent 4px grid
- Cards: `p-6`
- Content: `gap-4` or `gap-6`

## ✅ Pre-Launch Checklist

- [ ] Run `npm run build` - no errors
- [ ] Test on mobile - responsive
- [ ] Connect to real API - data flows
- [ ] Check all links - navigation works
- [ ] Test error states - graceful fallbacks
- [ ] Verify accessibility - a11y pass
- [ ] Set up environment variables
- [ ] Review colors and branding
- [ ] Deploy to staging
- [ ] Final testing and approval

## 🎉 You're Ready!

Your premium SaaS dashboard is ready to deploy. Happy coding! 🚀

---

**Questions?** Check the full documentation:
- `README.md` - Overview
- `SETUP.md` - Installation & deployment
- `API_INTEGRATION.md` - Backend patterns
- `COMPONENT_GUIDE.md` - Component development

**Need more help?** Start with `npm run dev` and explore the components!
