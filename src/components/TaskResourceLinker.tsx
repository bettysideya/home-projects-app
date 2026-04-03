'use client'

import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link2, X } from 'lucide-react'
import { fetchResources, fetchTaskResources, linkResourceToTask, unlinkResourceFromTask } from '@/lib/queries'

interface Props {
  taskId: string
  accentColor?: string
}

export function TaskResourceLinker({ taskId, accentColor = '#4f46e5' }: Props) {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const { data: allResources = [] } = useQuery({
    queryKey: ['resources'],
    queryFn: fetchResources,
  })

  const { data: linkedResources = [] } = useQuery({
    queryKey: ['task-resources', taskId],
    queryFn: () => fetchTaskResources(taskId),
  })

  const linkMutation = useMutation({
    mutationFn: (resourceId: string) => linkResourceToTask(taskId, resourceId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['task-resources', taskId] }),
  })

  const unlinkMutation = useMutation({
    mutationFn: (resourceId: string) => unlinkResourceFromTask(taskId, resourceId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['task-resources', taskId] }),
  })

  const linkedIds = new Set(linkedResources.map(lr => lr.resource_id))

  return (
    <div className="relative inline-flex items-center gap-1" ref={ref}>
      {/* Chips for linked resources */}
      {linkedResources.map(lr => {
        const res = allResources.find(r => r.id === lr.resource_id)
        if (!res) return null
        return (
          <span
            key={lr.id}
            className="flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full"
            style={{ background: `${accentColor}20`, color: accentColor, border: `1px solid ${accentColor}40` }}
          >
            {res.company || res.name}
            <button
              onClick={e => { e.stopPropagation(); unlinkMutation.mutate(res.id) }}
              className="opacity-60 hover:opacity-100 transition-opacity"
            >
              <X size={9} />
            </button>
          </span>
        )
      })}

      {/* Link button — visible on task row hover */}
      <button
        onClick={e => { e.stopPropagation(); setOpen(!open) }}
        className="flex items-center gap-0.5 text-xs opacity-0 group-hover/task:opacity-100 transition-opacity rounded px-1 py-0.5"
        style={{ color: '#6b6c88' }}
        onMouseEnter={e => (e.currentTarget.style.color = accentColor)}
        onMouseLeave={e => (e.currentTarget.style.color = '#6b6c88')}
        title="Link resource"
      >
        <Link2 size={10} />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1 rounded-xl shadow-xl py-1 min-w-[180px]"
          style={{ background: '#1a1b2e', border: '1px solid #3d3e5a' }}
        >
          {allResources.length === 0 ? (
            <div className="px-3 py-2 text-xs" style={{ color: '#6b6c88' }}>
              No resources yet
            </div>
          ) : (
            allResources.map(r => {
              const isLinked = linkedIds.has(r.id)
              return (
                <button
                  key={r.id}
                  onClick={() => {
                    if (isLinked) {
                      unlinkMutation.mutate(r.id)
                    } else {
                      linkMutation.mutate(r.id)
                    }
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 transition-colors"
                  style={{ color: isLinked ? accentColor : '#c2c3d8' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#252640')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span
                    className="w-3 h-3 rounded-sm flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isLinked ? accentColor : 'transparent',
                      border: `1px solid ${isLinked ? accentColor : '#3d3e5a'}`,
                    }}
                  >
                    {isLinked && <span className="text-white" style={{ fontSize: '8px' }}>✓</span>}
                  </span>
                  <span className="flex-1">{r.name}</span>
                  {r.company && (
                    <span className="text-xs" style={{ color: '#4a4b6a' }}>{r.company}</span>
                  )}
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
