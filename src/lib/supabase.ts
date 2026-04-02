import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Column = 'backlog' | 'active' | 'done'

export interface Project {
  id: string
  title: string
  description: string | null
  column: Column
  position: number
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  project_id: string
  title: string
  description: string | null
  completed: boolean
  position: number
  created_at: string
}
