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
    mutationFn: ({ id, column, position }: { id: string; column: Column; position: number }) =>
      updateProject(id, { column, position }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
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
    const activeProj = projects.find(p => p.id === activeId)
    if (!activeProj) return

    const targetColumn = COLUMNS.includes(overId as Column)
      ? (overId as Column)
      : (projects.find(p => p.id === overId)?.column ?? activeProj.column)

    const columnProjects = projects.filter(p => p.column === targetColumn)
    const overIndex = columnProjects.findIndex(p => p.id === overId)
    const activeIndex = columnProjects.findIndex(p => p.id === activeId)

    let newPosition = activeProj.position
    if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
      const reordered = arrayMove(columnProjects, activeIndex, overIndex)
      newPosition = overIndex
      // Persist reordering
      reordered.forEach((p, i) => {
        if (p.id !== activeId) return
        moveMutation.mutate({ id: activeId, column: targetColumn, position: i })
      })
      return
    }

    if (activeProj.column !== targetColumn) {
      moveMutation.mutate({ id: activeId, column: targetColumn, position: newPosition })
    }
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
