'use client'

import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { AuthPage } from './AuthPage'
import { NoAccessPage } from './NoAccessPage'

const PROJECT_SLUG = 'home'

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) {
        setHasAccess(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session?.user) {
      setHasAccess(null)
      return
    }

    async function checkAccess() {
      const userId = session!.user.id

      // Check if user has an explicit access row for this project
      const { data: projectData } = await supabase
        .from('app_projects')
        .select('id, visibility')
        .eq('slug', PROJECT_SLUG)
        .single()

      if (!projectData) {
        setHasAccess(false)
        return
      }

      // Public sites: everyone has access (shouldn't need auth gate, but just in case)
      if (projectData.visibility === 'public') {
        setHasAccess(true)
        return
      }

      // Register sites: any authenticated user has access
      if (projectData.visibility === 'register') {
        setHasAccess(true)
        return
      }

      // Private sites: check user_access table
      const { data: accessRow } = await supabase
        .from('user_access')
        .select('access_level')
        .eq('user_id', userId)
        .eq('project_id', projectData.id)
        .single()

      setHasAccess(!!accessRow)
    }

    checkAccess()
  }, [session])

  // Loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1a1b2e' }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(79,70,229,0.2)', borderTopColor: '#4f46e5' }} />
      </div>
    )
  }

  // Not logged in: show login page (no signup for private)
  if (!session) {
    return <AuthPage />
  }

  // Checking access
  if (hasAccess === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1a1b2e' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-3" style={{ borderColor: 'rgba(79,70,229,0.2)', borderTopColor: '#4f46e5' }} />
          <p className="text-xs" style={{ color: '#6b6c88' }}>Checking access...</p>
        </div>
      </div>
    )
  }

  // No access: show cool denied page
  if (!hasAccess) {
    return <NoAccessPage email={session.user.email ?? 'unknown'} />
  }

  // Has access: render the app
  return <>{children}</>
}
