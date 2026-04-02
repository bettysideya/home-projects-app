'use client'

import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus, X } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Column, Project } from '@/lib/supabase'
import { createProject } from '@/lib/queries'
import { ProjectCard } from './ProjectCard'

const COLUMN_CONFIG: Record<Column, { label: string; color: string; dot: string }> = {
  backlog: { label: 'Backlog', color: 'bg-gray-50 border-gray-200', dot: 'bg-gray-400' },
  active: { label: 'Active', color: 'bg-blue-50 border-blue-200', dot: 'bg-blue-500' },
  done: { label: 'Done', color: 'bg-green-50 border-green-200', dot: 'bg-green-500' },
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
    <div className={`flex flex-col rounded-2xl border-2 ${config.color} ${isOver ? 'ring-2 ring-blue-300' : ''} transition-all`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-inherit">
        <span className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex-1">{config.label}</h2>
        <span className="text-xs font-semibold text-gray-400 bg-white rounded-full px-2 py-0.5 border">
          {projects.length}
        </span>
        <button
          onClick={() => setAdding(true)}
          className="text-gray-400 hover:text-blue-500 transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Cards */}
      <div ref={setNodeRef} className="flex-1 p-3 space-y-2 min-h-[120px]">
        <SortableContext items={projects.map(p => p.id)} strategy={verticalListSortingStrategy}>
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </SortableContext>

        {projects.length === 0 && !adding && (
          <div className="flex items-center justify-center h-16 text-xs text-gray-400">
            Drop projects here
          </div>
        )}
      </div>

      {/* Add project form */}
      {adding && (
        <div className="px-3 pb-3">
          <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm space-y-2">
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Project title..."
              className="w-full text-sm font-medium outline-none border-b pb-1 border-gray-200 focus:border-blue-400"
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
              className="w-full text-xs outline-none resize-none text-gray-600"
            />
            <div className="flex gap-2 items-center">
              <button
                onClick={() => title.trim() && addMutation.mutate()}
                disabled={!title.trim() || addMutation.isPending}
                className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium"
              >
                {addMutation.isPending ? 'Adding...' : 'Add project'}
              </button>
              <button
                onClick={() => { setAdding(false); setTitle(''); setDesc('') }}
                className="text-gray-400 hover:text-gray-600"
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
