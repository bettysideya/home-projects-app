export const dynamic = 'force-dynamic'

import { KanbanBoard } from '@/components/KanbanBoard'
import { Home } from 'lucide-react'

export default function HomePage() {
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

      {/* Main board */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <KanbanBoard />
      </main>
    </div>
  )
}
