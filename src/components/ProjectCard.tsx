'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, ChevronRight, Trash2, Plus, CheckCircle2, Circle, GripVertical, Pencil } from 'lucide-react'
import { Project } from '@/lib/supabase'
import { deleteProject, updateProject, fetchTasks, createTask, toggleTask, deleteTask } from '@/lib/queries'

interface Props {
  project: Project
}

export function ProjectCard({ project }: Props) {
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
    opacity: isDragging ? 0.5 : 1,
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

  const completedCount = tasks.filter(t => t.completed).length

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 group hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none"
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
                className="w-full text-sm font-semibold border-b border-blue-400 outline-none pb-1"
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
                className="w-full text-xs border rounded p-1 outline-none resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => updateMutation.mutate({ title: editTitle, description: editDesc || null })}
                  className="text-xs bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600"
                >
                  Save
                </button>
                <button onClick={() => setEditing(false)} className="text-xs text-gray-500 hover:text-gray-700">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                <h3 className="text-sm font-semibold text-gray-800 truncate flex-1">{project.title}</h3>
                <button
                  onClick={() => setEditing(true)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-500 transition-opacity"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => deleteMutation.mutate()}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {project.description && (
                <p className="text-xs text-gray-500 mt-1 ml-5 line-clamp-2">{project.description}</p>
              )}

              {tasks.length > 0 && (
                <div className="mt-1 ml-5">
                  <span className="text-xs text-gray-400">
                    {completedCount}/{tasks.length} tasks
                  </span>
                  <div className="h-1 bg-gray-100 rounded-full mt-1">
                    <div
                      className="h-1 bg-green-400 rounded-full transition-all"
                      style={{ width: `${tasks.length ? (completedCount / tasks.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {expanded && !editing && (
            <div className="mt-3 ml-5 space-y-1">
              {tasks.map(task => (
                <div key={task.id} className="flex items-center gap-2 group/task">
                  <button
                    onClick={() => toggleTaskMutation.mutate({ id: task.id, completed: !task.completed })}
                    className="text-gray-400 hover:text-green-500 flex-shrink-0"
                  >
                    {task.completed ? (
                      <CheckCircle2 size={14} className="text-green-500" />
                    ) : (
                      <Circle size={14} />
                    )}
                  </button>
                  <span className={`text-xs flex-1 ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {task.title}
                  </span>
                  <button
                    onClick={() => deleteTaskMutation.mutate(task.id)}
                    className="opacity-0 group-hover/task:opacity-100 text-gray-300 hover:text-red-400"
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
                    className="text-xs border-b border-blue-400 outline-none flex-1 pb-0.5"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newTaskTitle.trim()) addTaskMutation.mutate()
                      if (e.key === 'Escape') setAddingTask(false)
                    }}
                  />
                  <button
                    onClick={() => newTaskTitle.trim() && addTaskMutation.mutate()}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingTask(true)}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 mt-1"
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
