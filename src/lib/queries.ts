import { supabase, Project, Task, Column } from './supabase'

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
