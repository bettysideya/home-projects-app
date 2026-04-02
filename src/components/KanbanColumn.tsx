'use client'

import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus, X } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Column, Project } from '@/lib/supabase'
import { createProject } from '@/lib/queries'
import { ProjectCard } from './ProjectCard'

const COLUMN_CONFIG: Record<Column, { label: string; accentColor: string }> = {
  backlog: { label: 'TO DO', accentColor: '#ef4444' },
  active: { label: 'IN PROGRESS', accentColor: '#f59e0b' },
  done: { label: 'DONE', accentColor: '#22c55e' },
}

interface Props {
  column: Column
  projects: Project[]
}

export function KanbanColumn({ column, projects }: Props) {
  const qc = useQueryClient()
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const config = COLUMN_CONFIG[column]

  const { setNodeRef, isOver } = useDroppable({ id: column })

  const addMutation = useMutation({
    mutationFn: () => createProject(title.trim(), desc.trim() || null, column),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      setTitle('')
      setDesc('')
      setAdding(false)
    },
  })

  return (
    <div
      className="flex flex-col rounded-2xl transition-all"
      style={{
        background: '#252640',
        border: isOver ? `2px solid ${config.accentColor}` : '2px solid #2d2e4a',
        boxShadow: isOver ? `0 0 0 1px ${config.accentColor}20` : 'none',
      }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        {/* Accent bar */}
        <div className="h-1 w-8 rounded-full mb-3" style={{ background: config.accentColor }} />
        <div className="flex items-center gap-2">
          <h2
            className="text-sm font-bold uppercase tracking-widest flex-1"
            style={{ color: '#e2e3f0' }}
          >
            {config.label}
          </h2>
          <span
            className="text-xs font-semibold rounded-full px-2 py-0.5"
            style={{ background: '#1a1b2e', color: '#8b8ca8' }}
          >
            {projects.length}
          </span>
          <button
            onClick={() => setAdding(true)}
            className="transition-colors"
            style={{ color: '#8b8ca8' }}
            onMouseEnter={e => (e.currentTarget.style.color = config.accentColor)}
            onMouseLeave={e => (e.currentTarget.style.color = '#8b8ca8')}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Cards */}
      <div ref={setNodeRef} className="flex-1 px-3 pb-3 space-y-2 min-h-[120px]">
        <SortableContext items={projects.map(p => p.id)} strategy={verticalListSortingStrategy}>
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} accentColor={config.accentColor} />
          ))}
        </SortableContext>

        {projects.length === 0 && !adding && (
          <div className="flex items-center justify-center h-16 text-xs" style={{ color: '#4a4b6a' }}>
            Drop projects here
          </div>
        )}
      </div>

      {/* Add project form */}
      {adding && (
        <div className="px-3 pb-3">
          <div
            className="rounded-xl p-3 space-y-2"
            style={{ background: '#1a1b2e', border: '1px solid #2d2e4a' }}
          >
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Project title..."
              className="w-full text-sm font-medium outline-none border-b pb-1"
              style={{
                background: 'transparent',
                color: '#e2e3f0',
                borderColor: '#3d3e5a',
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && title.trim()) addMutation.mutate()
                if (e.key === 'Escape') setAdding(false)
              }}
            />
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Description (optional)..."
              rows={2}
              className="w-full text-xs outline-none resize-none"
              style={{ background: 'transparent', color: '#8b8ca8' }}
            />
            <div className="flex gap-2 items-center">
              <button
                onClick={() => title.trim() && addMutation.mutate()}
                disabled={!title.trim() || addMutation.isPending}
                className="text-xs text-white px-3 py-1.5 rounded-lg font-medium disabled:opacity-50"
                style={{ background: config.accentColor }}
              >
                {addMutation.isPending ? 'Adding...' : 'Add project'}
              </button>
              <button
                onClick={() => { setAdding(false); setTitle(''); setDesc('') }}
                style={{ color: '#8b8ca8' }}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
