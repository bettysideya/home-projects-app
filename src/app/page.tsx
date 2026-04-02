export const dynamic = 'force-dynamic'

import { KanbanBoard } from '@/components/KanbanBoard'
import { Home } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Home size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Home Projects</h1>
            <p className="text-xs text-gray-500">Drag & drop your way to a finished home 🏠</p>
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
