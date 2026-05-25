# Component Development Guide

This guide helps you extend and customize the ColdChain dashboard with new components.

## Creating a New Component

### Basic Component Template

```typescript
// src/components/YourComponent.tsx
'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface YourComponentProps {
  // Define your props
  title: string
  data?: any[]
  onAction?: () => void
  className?: string
}

export const YourComponent: React.FC<YourComponentProps> = ({
  title,
  data = [],
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        // Base styles
        'rounded-lg border border-zinc-700/50 bg-zinc-900/30 backdrop-blur-sm p-6',
        // Hover states
        'transition-all duration-300 hover:border-zinc-600/80 hover:bg-zinc-900/50',
        // Custom classes
        className
      )}
    >
      <h2 className="text-lg font-semibold text-zinc-100 mb-4">{title}</h2>

      {/* Component content */}
      {data.length > 0 ? (
        <div className="space-y-2">
          {data.map((item) => (
            <div key={item.id} className="text-sm text-zinc-300">
              {item.label}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-500">No data available</p>
      )}

      {/* Optional action */}
      {onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-sm font-medium"
        >
          Take Action
        </button>
      )}
    </div>
  )
}
```

## Component Patterns

### 1. Data Fetching Component

```typescript
'use client'

import { useEffect, useState } from 'react'

interface DataComponent {
  sourceId: string
}

export const DataComponent: React.FC<DataComponent> = ({ sourceId }) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      try {
        const response = await fetch(`/api/source/${sourceId}`)
        if (!response.ok) throw new Error('Failed to fetch')

        const json = await response.json()

        if (isMounted) {
          setData(json)
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false // Cleanup for component unmount
    }
  }, [sourceId])

  if (loading) return <div className="animate-pulse">Loading...</div>
  if (error) return <div className="text-red-400">Error: {error.message}</div>
  if (!data) return <div className="text-zinc-400">No data</div>

  return <div>{/* Render data */}</div>
}
```

### 2. Interactive Component with State

```typescript
'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExpandableItem {
  id: string
  title: string
  content: React.ReactNode
}

export const ExpandableList: React.FC<{ items: ExpandableItem[] }> = ({
  items,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="border border-zinc-700/30 rounded-lg">
          {/* Header */}
          <button
            onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-zinc-800/50 transition-colors"
          >
            <span className="font-medium">{item.title}</span>
            <ChevronDown
              size={16}
              className={cn(
                'transition-transform duration-200',
                expandedId === item.id && 'rotate-180'
              )}
            />
          </button>

          {/* Content */}
          {expandedId === item.id && (
            <div className="border-t border-zinc-700/20 px-4 py-3 bg-zinc-800/20 animate-slide">
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
```

### 3. Chart Component with Recharts

```typescript
'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface ChartComponentProps {
  data: Array<{ timestamp: number; value: number }>
  title: string
  yAxisLabel?: string
}

export const ChartComponent: React.FC<ChartComponentProps> = ({
  data,
  title,
  yAxisLabel = 'Value',
}) => {
  return (
    <div className="rounded-lg border border-zinc-700/50 bg-zinc-900/30 p-6">
      <h3 className="text-lg font-semibold mb-4 text-zinc-100">{title}</h3>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              dataKey="timestamp"
              tick={{ fill: '#a1a1aa', fontSize: 12 }}
              axisLine={false}
            />
            <YAxis
              label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }}
              tick={{ fill: '#a1a1aa', fontSize: 12 }}
              axisLine={false}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                border: '1px solid #3f3f46',
                borderRadius: '8px',
              }}
            />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#34d399"
              strokeWidth={2}
              dot={false}
              isAnimationActive
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
```

## Styling Guidelines

### Using Tailwind Classes

```typescript
// ✅ Good: Semantic, readable, maintainable
className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors"

// ❌ Bad: Avoid inline styles
style={{ padding: '8px 16px', borderRadius: '8px' }}

// ✅ Use cn() for conditional classes
className={cn(
  'base-class',
  isActive && 'active-class',
  isFocused && 'focus-class'
)}
```

### Theme Colors

```typescript
// Emerald (Healthy) - Primary
bg-emerald-400, text-emerald-400, border-emerald-500

// Amber (Warning) - Secondary
bg-amber-400, text-amber-400, border-amber-500

// Red (Critical) - Alert
bg-red-400, text-red-400, border-red-500

// Zinc (Neutral) - Base
bg-zinc-900, text-zinc-100, border-zinc-700

// Usage example
<div className="bg-emerald-400/10 border border-emerald-500/30 text-emerald-400" />
```

### Glassmorphism

```typescript
// Glass effect (used on most cards)
className="rounded-lg border border-zinc-700/50 bg-zinc-900/30 backdrop-blur-sm p-6"

// With hover effect
className="rounded-lg border border-zinc-700/50 bg-zinc-900/30 backdrop-blur-sm p-6 transition-all duration-300 hover:border-zinc-600/80 hover:bg-zinc-900/50"
```

## Animation Patterns

### Micro-interactions

```typescript
// Fade in
className="animate-fade-in"

// Slide down
className="animate-slide"

// Pulse (for alerts)
className="animate-pulse"

// Glow pulse
className="animate-glow-pulse"

// Smooth transition
className="transition-all duration-300 ease-out"
```

### Custom Animations

Add to `globals.css`:
```css
@keyframes custom-animation {
  0% { /* start state */ }
  100% { /* end state */ }
}

.animate-custom {
  animation: custom-animation 0.3s ease-out;
}
```

## TypeScript Best Practices

### Define Clear Props Interfaces

```typescript
interface Props {
  // Required props
  id: string
  title: string

  // Optional props with defaults
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean

  // Callback functions
  onClose?: () => void
  onSubmit?: (data: FormData) => Promise<void>

  // React children
  children?: React.ReactNode
  header?: React.ReactNode

  // Custom class override
  className?: string
}
```

### Use Union Types for Status

```typescript
type Status = 'healthy' | 'warning' | 'critical'
type Size = 'sm' | 'md' | 'lg'
type Variant = 'primary' | 'secondary' | 'tertiary'

// IDE will suggest valid values
```

## Testing Components

### Component Test Example

```typescript
// src/__tests__/YourComponent.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { YourComponent } from '@/components/YourComponent'

describe('YourComponent', () => {
  it('renders with title', () => {
    render(<YourComponent title="Test Title" />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('calls onAction when button clicked', async () => {
    const onAction = jest.fn()
    render(<YourComponent title="Test" onAction={onAction} />)

    const button = screen.getByRole('button')
    await userEvent.click(button)

    expect(onAction).toHaveBeenCalled()
  })

  it('shows no data message when empty', () => {
    render(<YourComponent title="Test" data={[]} />)
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })
})
```

## Performance Optimization

### Code Splitting

```typescript
// src/app/page.tsx
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <div>Loading...</div>,
})

export default function Page() {
  return <HeavyComponent />
}
```

### Memoization

```typescript
import { memo } from 'react'

const ExpensiveComponent = memo(function Component(props) {
  // Only re-renders if props change
  return <div>{props.value}</div>
})
```

### Use useMemo for Expensive Calculations

```typescript
import { useMemo } from 'react'

export function Component({ items }) {
  const sortedItems = useMemo(
    () => items.sort((a, b) => a.name.localeCompare(b.name)),
    [items]
  )

  return <div>{/* Use sortedItems */}</div>
}
```

## Accessibility (a11y)

```typescript
// Always include alt text
<img src="chart.png" alt="Temperature chart for last 24 hours" />

// Use semantic HTML
<button aria-label="Close modal">X</button>

// ARIA labels for non-text elements
<div role="progressbar" aria-valuenow={75} aria-valuemin={0} aria-valuemax={100} />

// Color contrast - meet WCAG AA standards
// Text on emerald: #34d399 on #09090b ✅
// Never rely on color alone
```

## Common Component Exports

Add your component to `src/components/index.ts`:

```typescript
export { YourComponent } from './YourComponent'
```

Then import elsewhere:
```typescript
import { YourComponent } from '@/components'
```

## Debugging Tips

```typescript
// Debug component renders
'use client'

import { useEffect } from 'react'

export function DebugComponent(props: any) {
  useEffect(() => {
    console.log('Component props:', props)
  }, [props])

  return null
}

// Use in development
<DebugComponent {...props} />
```

---

For more examples, check the existing components in `src/components/`.
