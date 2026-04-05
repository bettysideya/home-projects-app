'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, ChevronRight, Trash2, Plus, CheckCircle2, Circle, GripVertical, Pencil, CalendarDays } from 'lucide-react'
import { Project } from '@/lib/supabase'
import { deleteProject, updateProject, updateProjectDueDate, fetchTasks, createTask, toggleTask, deleteTask, updateTaskDueDate } from '@/lib/queries'
import { ResourceLinker } from './ResourceLinker'
import { TaskResourceLinker } from './TaskResourceLinker'

interface Props {
  project: Project
  accentColor?: string
}

export function ProjectCard({ project, accentColor = '#4f46e5' }: Props) {
  const qc = useQueryClient()
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(project.title)
  const [editDesc, setEditDesc] = useState(project.description ?? '')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [addingTask, setAddingTask] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', project.id],
    queryFn: () => fetchTasks(project.id),
    enabled: expanded,
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteProject(project.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  })

  const updateMutation = useMutation({
    mutationFn: (updates: Partial<Pick<Project, 'title' | 'description'>>) =>
      updateProject(project.id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      setEditing(false)
    },
  })

  const addTaskMutation = useMutation({
    mutationFn: () => createTask(project.id, newTaskTitle),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', project.id] })
      setNewTaskTitle('')
      setAddingTask(false)
    },
  })

  const toggleTaskMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      toggleTask(id, completed),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', project.id] }),
  })

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', project.id] }),
  })

  const projectDueDateMutation = useMutation({
    mutationFn: (dueDate: string | null) => updateProjectDueDate(project.id, dueDate),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  })

  const dueDateMutation = useMutation({
    mutationFn: ({ id, dueDate }: { id: string; dueDate: string | null }) =>
      updateTaskDueDate(id, dueDate),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', project.id] }),
  })

  const completedCount = tasks.filter(t => t.completed).length

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: '#1e1f38',
        border: '1px solid #2d2e4a',
        borderRadius: '12px',
        padding: '14px',
      }}
      className="group transition-all hover:border-opacity-80"
      onMouseEnter={e => (e.currentTarget.style.borderColor = '#3d3e5a')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = '#2d2e4a')}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing touch-none"
          style={{ color: '#3d3e5a' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#8b8ca8')}
          onMouseLeave={e => (e.currentTarget.style.color = '#3d3e5a')}
        >
          <GripVertical size={16} />
        </button>

        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-2">
              <input
                autoFocus
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="w-full text-sm font-semibold border-b outline-none pb-1"
                style={{
                  background: 'transparent',
                  color: '#e2e3f0',
                  borderColor: accentColor,
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') updateMutation.mutate({ title: editTitle, description: editDesc || null })
                  if (e.key === 'Escape') setEditing(false)
                }}
              />
              <textarea
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                placeholder="Description (optional)"
                rows={2}
                className="w-full text-xs rounded p-1 outline-none resize-none"
                style={{ background: '#252640', color: '#8b8ca8', border: '1px solid #2d2e4a' }}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => updateMutation.mutate({ title: editTitle, description: editDesc || null })}
                  className="text-xs text-white px-3 py-1 rounded-lg"
                  style={{ background: accentColor }}
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="text-xs"
                  style={{ color: '#8b8ca8' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setExpanded(!expanded)}
                  style={{ color: '#8b8ca8' }}
                >
                  {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                <h3 className="text-sm font-semibold truncate flex-1" style={{ color: '#e2e3f0' }}>
                  {project.title}
                </h3>
                <button
                  onClick={() => setEditing(true)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: '#8b8ca8' }}
                  onMouseEnter={e => (e.currentTarget.style.color = accentColor)}
                  onMouseLeave={e => (e.currentTarget.style.color = '#8b8ca8')}
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => deleteMutation.mutate()}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: '#8b8ca8' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#8b8ca8')}
                >
                  <Trash2 size={13} />
                </button>
                <div className="relative flex-shrink-0 min-w-[40px] h-[18px] flex items-center justify-end">
                  <input
                    type="date"
                    value={project.due_date ?? ''}
                    onChange={e => projectDueDateMutation.mutate(e.target.value || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    style={{ zIndex: 1 }}
                  />
                  {project.due_date ? (
                    <span
                      className="text-xs cursor-pointer select-none"
                      style={{ color: '#8b8ca8', fontSize: '10px' }}
                      title={project.due_date}
                    >
                      {(() => {
                        const [, m, d] = project.due_date.split('-')
                        return `${parseInt(m)}/${parseInt(d)}`
                      })()}
                    </span>
                  ) : (
                    <span className="cursor-pointer" style={{ color: '#4a4b6a' }}>
                      <CalendarDays size={11} />
                    </span>
                  )}
                </div>
              </div>

              {project.description && (
                <p className="text-xs mt-1 ml-5 line-clamp-2" style={{ color: '#6b6c88' }}>
                  {project.description}
                </p>
              )}

              {tasks.length > 0 && (
                <div className="mt-1 ml-5">
                  <span className="text-xs" style={{ color: '#6b6c88' }}>
                    {completedCount}/{tasks.length} tasks
                  </span>
                  <div className="h-1 rounded-full mt-1" style={{ background: '#2d2e4a' }}>
                    <div
                      className="h-1 rounded-full transition-all"
                      style={{
                        width: `${tasks.length ? (completedCount / tasks.length) * 100 : 0}%`,
                        background: accentColor,
                      }}
                    />
                  </div>
                </div>
              )}

              <ResourceLinker projectId={project.id} accentColor={accentColor} />
            </>
          )}

          {expanded && !editing && (
            <div className="mt-3 ml-5 space-y-1">
              {tasks.map(task => (
                <div key={task.id} className="flex items-center gap-2 group/task">
                  <button
                    onClick={() => toggleTaskMutation.mutate({ id: task.id, completed: !task.completed })}
                    className="flex-shrink-0"
                    style={{ color: task.completed ? accentColor : '#6b6c88' }}
                  >
                    {task.completed ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <Circle size={14} />
                    )}
                  </button>
                  <span
                    className="text-xs flex-1"
                    style={{
                      color: task.completed ? '#4a4b6a' : '#c2c3d8',
                      textDecoration: task.completed ? 'line-through' : 'none',
                    }}
                  >
                    {task.title}
                  </span>
                  <TaskResourceLinker taskId={task.id} accentColor={accentColor} />
                  <div className="relative flex-shrink-0 min-w-[40px] h-[18px] flex items-center">
                    <input
                      type="date"
                      value={task.due_date ?? ''}
                      onChange={e => dueDateMutation.mutate({ id: task.id, dueDate: e.target.value || null })}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      style={{ zIndex: 1 }}
                    />
                    {task.due_date ? (
                      <span
                        className="text-xs cursor-pointer select-none"
                        style={{ color: '#8b8ca8', fontSize: '10px' }}
                        title={task.due_date}
                      >
                        {(() => {
                          const [, m, d] = task.due_date.split('-')
                          return `${parseInt(m)}/${parseInt(d)}`
                        })()}
                      </span>
                    ) : (
                      <span
                        className="cursor-pointer"
                        style={{ color: '#4a4b6a' }}
                      >
                        <CalendarDays size={11} />
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => deleteTaskMutation.mutate(task.id)}
                    className="opacity-0 group-hover/task:opacity-100"
                    style={{ color: '#3d3e5a' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#3d3e5a')}
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}

              {addingTask ? (
                <div className="flex items-center gap-1 mt-1">
                  <input
                    autoFocus
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    placeholder="Task name..."
                    className="text-xs border-b outline-none flex-1 pb-0.5"
                    style={{
                      background: 'transparent',
                      color: '#e2e3f0',
                      borderColor: accentColor,
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newTaskTitle.trim()) addTaskMutation.mutate()
                      if (e.key === 'Escape') setAddingTask(false)
                    }}
                  />
                  <button
                    onClick={() => newTaskTitle.trim() && addTaskMutation.mutate()}
                    style={{ color: accentColor }}
                  >
                    <Plus size={13} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingTask(true)}
                  className="flex items-center gap-1 text-xs mt-1"
                  style={{ color: '#6b6c88' }}
                  onMouseEnter={e => (e.currentTarget.style.color = accentColor)}
                  onMouseLeave={e => (e.currentTarget.style.color = '#6b6c88')}
                >
                  <Plus size={12} /> Add task
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
