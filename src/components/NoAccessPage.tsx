'use client'

import { ShieldOff, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function NoAccessPage({ email }: { email: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#1a1b2e' }}>
      <div className="w-full max-w-md text-center">
        {/* Animated glow ring */}
        <div className="relative w-28 h-28 mx-auto mb-8">
          <div
            className="absolute inset-0 rounded-full animate-pulse"
            style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)' }}
          />
          <div
            className="absolute inset-2 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <ShieldOff className="w-12 h-12 text-red-400/80" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Access Restricted</h1>
        <p className="text-sm mb-1" style={{ color: '#6b6c88' }}>
          You&apos;re signed in as <span className="text-white font-medium">{email}</span>
        </p>
        <p className="text-sm mb-8" style={{ color: '#6b6c88' }}>
          but you don&apos;t have permission to access this application.
        </p>

        <div
          className="rounded-2xl p-5 mb-6"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-xs" style={{ color: '#6b6c88' }}>
            This is a private application. If you believe you should have access,
            contact an administrator to be added.
          </p>
        </div>

        <button
          onClick={() => supabase.auth.signOut()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ background: 'rgba(255,255,255,0.06)', color: '#a2a3be', border: '1px solid rgba(255,255,255,0.08)' }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
            e.currentTarget.style.color = '#e2e3f0'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
            e.currentTarget.style.color = '#a2a3be'
          }}
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  )
}
