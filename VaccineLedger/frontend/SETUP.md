# Setup & Installation Guide

## Prerequisites

Before you begin, ensure you have:
- **Node.js**: v18.17 or higher ([Download](https://nodejs.org/))
- **npm**: v9 or higher (comes with Node.js)
- **Git**: For version control
- **A modern code editor**: VS Code recommended

Verify your installation:
```bash
node --version    # Should be v18.17+
npm --version     # Should be v9+
```

## Installation Steps

### 1. Navigate to Frontend Directory
```bash
cd path/to/EL2/frontend
```

### 2. Install Dependencies
```bash
npm install
```

This will install all packages specified in `package.json`:
- React 18 & React DOM
- Next.js 14
- Tailwind CSS 3.4
- Recharts 2.12
- Lucide React icons
- TypeScript
- And more...

### 3. Setup Environment Variables
```bash
# Copy example env file
cp .env.example .env.local

# Edit .env.local with your configuration
# (optional - defaults work for local development)
```

### 4. Start Development Server
```bash
npm run dev
```

The dashboard will be available at **http://localhost:3000**

## Development Workflow

### Hot Module Reloading
- Edit any `.tsx` or `.css` file and see changes instantly
- No manual refresh needed
- State is preserved during edits

### Component Development
```bash
# File structure for new components
src/components/YourComponent.tsx
```

Skeleton for new component:
```typescript
'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface YourComponentProps {
  // Your props here
}

export const YourComponent: React.FC<YourComponentProps> = ({ /* props */ }) => {
  return (
    <div className="...">
      {/* Component JSX */}
    </div>
  )
}
```

### Debugging
1. Open browser DevTools (F12)
2. Use React Developer Tools extension
3. Check console for errors
4. Use NextJS debug output in terminal

## Building for Production

### Build Optimization
```bash
npm run build
```

This creates:
- Optimized bundle in `.next/` directory
- Automatic code splitting
- Image optimization
- CSS minification
- JavaScript minification

### Production Server
```bash
npm start
```

Runs on **http://localhost:3000** (production mode)

### Build Analysis
To analyze bundle size:
```bash
npm run build
# Check .next/static for size reports
```

## Deployment

### Vercel (Recommended for Next.js)
1. Push code to GitHub
2. Connect repo to Vercel
3. Deploy with one click
4. Automatic CI/CD

### Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t coldchain-dashboard .
docker run -p 3000:3000 coldchain-dashboard
```

### Azure / AWS / GCP
- Deploy Next.js to any Node.js hosting
- Use serverless functions (Vercel, Netlify)
- Container services (Docker, Kubernetes)

## Project Structure Explained

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page (dashboard)
│   │   └── globals.css         # Global styles
│   │
│   ├── components/             # React components
│   │   ├── MetricCard.tsx
│   │   ├── RealTimeStream.tsx
│   │   ├── LedgerAuditTimeline.tsx
│   │   ├── AnomalyIncidentConsole.tsx
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   └── index.ts            # Component exports
│   │
│   ├── types/                  # TypeScript definitions
│   │   └── index.ts            # All interfaces
│   │
│   ├── lib/                    # Utilities & helpers
│   │   └── utils.ts            # formatters, classNames, etc.
│   │
│   └── data/                   # Mock data
│       └── mockData.ts         # Generators & fixtures
│
├── public/                     # Static files (if needed)
├── .next/                      # Build output (generated)
├── node_modules/               # Dependencies (generated)
│
├── package.json               # Dependencies & scripts
├── tailwind.config.ts         # Tailwind configuration
├── next.config.js             # Next.js configuration
├── postcss.config.js          # PostCSS configuration
├── tsconfig.json              # TypeScript configuration
├── README.md                  # Project documentation
└── SETUP.md                   # This file!
```

## Connecting to Backend

### API Integration Example

Replace mock data with real API calls in `src/app/page.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/sensors/live')
        const json = await response.json()
        setData(json)
      } catch (error) {
        console.error('Failed to fetch:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    
    // Real-time updates via WebSocket
    const ws = new WebSocket('ws://localhost:8000/stream')
    ws.onmessage = (event) => {
      setData(JSON.parse(event.data))
    }

    return () => ws.close()
  }, [])

  if (loading) return <div>Loading...</div>

  // Render with real data
  return <YourComponent data={data} />
}
```

### Backend Requirements

Your backend should provide:

```
GET /api/sensors/live
{
  "temperature": 2.1,
  "humidity": 45.5,
  "light": 32.0,
  "timestamp": 1234567890000
}

GET /api/blockchain/blocks
[
  {
    "blockNumber": 15847,
    "transactionHash": "0x...",
    "eventType": "Handover Attestation",
    "timestamp": 1234567890000,
    "verified": true
  }
]

WebSocket /stream
// Real-time sensor updates pushed to client
```

## Common Issues & Solutions

### Issue: Port 3000 already in use
```bash
# On macOS/Linux
lsof -i :3000
kill -9 <PID>

# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue: npm packages fail to install
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Tailwind styles not loading
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
npm run dev
```

### Issue: TypeScript errors
```bash
# Check for type errors
npx tsc --noEmit

# Type check on build
npm run build
```

## Performance Tips

1. **Code Splitting**: Next.js automatically splits code by routes
2. **Image Optimization**: Use `next/image` component
3. **Dynamic Imports**: Load heavy components on demand
4. **Memoization**: Use `React.memo()` for expensive components
5. **Lazy Loading**: Use `lazy` and `Suspense` for routes

## Testing (Optional)

Add testing with Jest and React Testing Library:

```bash
npm install --save-dev @testing-library/react jest
```

Create `src/__tests__/MetricCard.test.tsx`:
```typescript
import { render } from '@testing-library/react'
import { MetricCard } from '@/components/MetricCard'

describe('MetricCard', () => {
  it('renders metric label', () => {
    const { getByText } = render(
      <MetricCard label="Test" value={10} icon={<div />} status="healthy" />
    )
    expect(getByText('Test')).toBeInTheDocument()
  })
})
```

## Learning Resources

- **Next.js**: https://nextjs.org/learn
- **React**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com
- **TypeScript**: https://www.typescriptlang.org/docs
- **Recharts**: https://recharts.org/examples

## Support & Troubleshooting

For issues:
1. Check the terminal for error messages
2. Review browser console (F12)
3. Check `package.json` versions
4. Clear `.next` cache
5. Reinstall dependencies

## Next Steps

1. ✅ Run `npm install`
2. ✅ Run `npm run dev`
3. ✅ Open http://localhost:3000
4. ✅ Customize colors in `tailwind.config.ts`
5. ✅ Connect to backend API
6. ✅ Deploy to production

Happy coding! 🚀
