import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Column = 'backlog' | 'active' | 'done'

export interface Project {
  id: string
  title: string
  description: string | null
  column: Column
  position: number
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface Resource {
  id: string
  name: string
  company: string | null
  mobile: string | null
  email: string | null
  notes: string | null
  created_at: string
}

export interface ProjectResource {
  id: string
  project_id: string
  resource_id: string
  created_at: string
  resource?: Resource
}

export interface TaskResource {
  id: string
  task_id: string
  resource_id: string
  created_at: string
  resource?: Resource
}

export interface Task {
  id: string
  project_id: string
  title: string
  description: string | null
  completed: boolean
  position: number
  due_date: string | null
  created_at: string
}
