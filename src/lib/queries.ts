import { supabase, Project, Task, Column, Resource, ProjectResource, TaskResource } from './supabase'

// Projects
export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('position', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function createProject(
  title: string,
  description: string | null,
  column: Column
): Promise<Project> {
  const { data: existing } = await supabase
    .from('projects')
    .select('position')
    .eq('column', column)
    .order('position', { ascending: false })
    .limit(1)
  const position = existing && existing.length > 0 ? existing[0].position + 1 : 0

  const { data, error } = await supabase
    .from('projects')
    .insert({ title, description, column, position })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateProject(
  id: string,
  updates: Partial<Pick<Project, 'title' | 'description' | 'column' | 'position'>>
): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw error
}

// Tasks
export async function fetchTasks(projectId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('position', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function createTask(
  projectId: string,
  title: string
): Promise<Task> {
  const { data: existing } = await supabase
    .from('tasks')
    .select('position')
    .eq('project_id', projectId)
    .order('position', { ascending: false })
    .limit(1)
  const position = existing && existing.length > 0 ? existing[0].position + 1 : 0

  const { data, error } = await supabase
    .from('tasks')
    .insert({ project_id: projectId, title, completed: false, position })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function toggleTask(id: string, completed: boolean): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update({ completed })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}

// Resources
export async function fetchResources(): Promise<Resource[]> {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .order('name', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function createResource(
  resource: Omit<Resource, 'id' | 'created_at'>
): Promise<Resource> {
  const { data, error } = await supabase
    .from('resources')
    .insert(resource)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateResource(
  id: string,
  updates: Partial<Omit<Resource, 'id' | 'created_at'>>
): Promise<Resource> {
  const { data, error } = await supabase
    .from('resources')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteResource(id: string): Promise<void> {
  const { error } = await supabase.from('resources').delete().eq('id', id)
  if (error) throw error
}

// Project Resources (junction)
export async function fetchProjectResources(projectId: string): Promise<ProjectResource[]> {
  const { data, error } = await supabase
    .from('project_resources')
    .select('*, resource:resources(*)')
    .eq('project_id', projectId)
  if (error) throw error
  return data ?? []
}

export async function linkResourceToProject(
  projectId: string,
  resourceId: string
): Promise<ProjectResource> {
  const { data, error } = await supabase
    .from('project_resources')
    .insert({ project_id: projectId, resource_id: resourceId })
    .select()
    .single()
  if (error) throw error
  return data
}

// Task Resources (junction)
export async function fetchTaskResources(taskId: string): Promise<TaskResource[]> {
  const { data, error } = await supabase
    .from('task_resources')
    .select('*, resource:resources(*)')
    .eq('task_id', taskId)
  if (error) throw error
  return data ?? []
}

export async function linkResourceToTask(
  taskId: string,
  resourceId: string
): Promise<TaskResource> {
  const { data, error } = await supabase
    .from('task_resources')
    .insert({ task_id: taskId, resource_id: resourceId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function unlinkResourceFromTask(
  taskId: string,
  resourceId: string
): Promise<void> {
  const { error } = await supabase
    .from('task_resources')
    .delete()
    .eq('task_id', taskId)
    .eq('resource_id', resourceId)
  if (error) throw error
}

export async function unlinkResourceFromProject(
  projectId: string,
  resourceId: string
): Promise<void> {
  const { error } = await supabase
    .from('project_resources')
    .delete()
    .eq('project_id', projectId)
    .eq('resource_id', resourceId)
  if (error) throw error
}
