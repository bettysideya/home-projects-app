'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Column, Project } from '@/lib/supabase'
import { fetchProjects, updateProject } from '@/lib/queries'
import { KanbanColumn } from './KanbanColumn'
import { ProjectCard } from './ProjectCard'

const COLUMNS: Column[] = ['backlog', 'active', 'done']

export function KanbanBoard() {
  const qc = useQueryClient()
  const [activeProject, setActiveProject] = useState<Project | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  })

  const moveMutation = useMutation({
    mutationFn: async ({ updates }: { updates: { id: string; column: Column; position: number }[] }) => {
      // Fire all updates in parallel
      await Promise.all(updates.map(u => updateProject(u.id, { column: u.column, position: u.position })))
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
    onError: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  })

  function handleDragStart(event: DragStartEvent) {
    const project = projects.find(p => p.id === event.active.id)
    if (project) setActiveProject(project)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeProject = projects.find(p => p.id === activeId)
    if (!activeProject) return

    // If dragging over a column droppable
    if (COLUMNS.includes(overId as Column)) {
      if (activeProject.column !== overId) {
        qc.setQueryData(['projects'], (old: Project[] = []) =>
          old.map(p => p.id === activeId ? { ...p, column: overId as Column } : p)
        )
      }
      return
    }

    // If dragging over another card
    const overProject = projects.find(p => p.id === overId)
    if (!overProject) return

    if (activeProject.column !== overProject.column) {
      qc.setQueryData(['projects'], (old: Project[] = []) =>
        old.map(p => p.id === activeId ? { ...p, column: overProject.column } : p)
      )
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveProject(null)
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Get current snapshot from cache (handleDragOver already updated it optimistically)
    const currentProjects: Project[] = qc.getQueryData(['projects']) ?? []
    const activeProj = currentProjects.find(p => p.id === activeId)
    if (!activeProj) return

    const targetColumn = COLUMNS.includes(overId as Column)
      ? (overId as Column)
      : (currentProjects.find(p => p.id === overId)?.column ?? activeProj.column)

    // All projects in the target column after optimistic update
    const columnProjects = currentProjects
      .filter(p => p.column === targetColumn)
      .sort((a, b) => a.position - b.position)

    const overIndex = columnProjects.findIndex(p => p.id === overId)
    const activeIndex = columnProjects.findIndex(p => p.id === activeId)

    let reordered = [...columnProjects]
    if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
      reordered = arrayMove(columnProjects, activeIndex, overIndex)
    } else if (activeIndex === -1) {
      // Card moved from another column — append at end or at overIndex
      reordered = [...columnProjects.filter(p => p.id !== activeId)]
      const insertAt = overIndex !== -1 ? overIndex : reordered.length
      reordered.splice(insertAt, 0, activeProj)
    }

    // Assign positions 0..n
    const updates = reordered.map((p, i) => ({
      id: p.id,
      column: targetColumn,
      position: i,
    }))

    // Also include the active card in case column changed and it isn't in reordered yet
    const hasActive = updates.some(u => u.id === activeId)
    if (!hasActive) {
      updates.push({ id: activeId, column: targetColumn, position: reordered.length })
    }

    // Optimistically update local cache with new positions
    qc.setQueryData(['projects'], (old: Project[] = []) =>
      old.map(p => {
        const u = updates.find(u => u.id === p.id)
        return u ? { ...p, column: u.column, position: u.position } : p
      })
    )

    moveMutation.mutate({ updates })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500 text-sm">
        Failed to load projects. Check your Supabase configuration.
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map(col => (
          <KanbanColumn
            key={col}
            column={col}
            projects={projects.filter(p => p.column === col)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeProject && (
          <div className="rotate-2 opacity-95">
            <ProjectCard project={activeProject} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
