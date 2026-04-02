'use client'

import { useState } from 'react'
import { Home, Users } from 'lucide-react'
import { KanbanBoard } from './KanbanBoard'
import { ResourcesView } from './ResourcesView'

type Tab = 'projects' | 'resources'

export function TabShell() {
  const [tab, setTab] = useState<Tab>('projects')

  return (
    <div className="min-h-screen" style={{ background: '#1a1b2e' }}>
      {/* Header */}
      <header style={{ background: '#12132280', borderBottom: '1px solid #2d2e4a' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#4f46e5' }}>
            <Home size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Home Projects</h1>
            <p className="text-xs" style={{ color: '#8b8ca8' }}>Drag &amp; drop your way to a finished home 🏠</p>
          </div>
        </div>
      </header>

      {/* Tab bar */}
      <div style={{ background: '#12132260', borderBottom: '1px solid #2d2e4a' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-0" aria-label="Tabs">
            {[
              { id: 'projects' as Tab, label: 'Projects', icon: Home },
              { id: 'resources' as Tab, label: 'Resources', icon: Users },
            ].map(({ id, label, icon: Icon }) => {
              const active = tab === id
              return (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors"
                  style={{
                    color: active ? '#e2e3f0' : '#6b6c88',
                    borderColor: active ? '#4f46e5' : 'transparent',
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = '#a2a3be' }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = '#6b6c88' }}
                >
                  <Icon size={15} />
                  {label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {tab === 'projects' ? <KanbanBoard /> : <ResourcesView />}
      </main>
    </div>
  )
}
