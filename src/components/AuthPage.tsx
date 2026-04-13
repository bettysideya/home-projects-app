'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Lock } from 'lucide-react'

type Mode = 'login' | 'reset'

export function AuthPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const reset = () => { setError(''); setSuccess('') }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    reset()
    setLoading(true)

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) setError(error.message)
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/`,
        })
        if (error) setError(error.message)
        else setSuccess('Check your email for a password reset link.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#1a1b2e' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(79,70,229,0.15)' }}>
            <Lock className="w-7 h-7" style={{ color: '#818cf8' }} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Home Projects</h1>
          <p className="text-sm mt-2" style={{ color: '#6b6c88' }}>Sign in to continue</p>
        </div>

        <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: '#6b6c88' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 text-sm rounded-xl border text-white placeholder-gray-600 focus:outline-none transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
                onFocus={e => e.target.style.borderColor = 'rgba(79,70,229,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            {mode === 'login' && (
              <div>
                <label className="text-xs mb-1.5 block" style={{ color: '#6b6c88' }}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border text-white placeholder-gray-600 focus:outline-none transition-colors"
                  style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(79,70,229,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
            )}

            {error && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {success && (
              <p className="text-green-400 text-xs bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-150 disabled:opacity-50"
              style={{ background: '#4f46e5' }}
            >
              {loading ? '...' : mode === 'login' ? 'Sign in' : 'Send reset link'}
            </button>
          </form>

          <div className="mt-4 text-center">
            {mode === 'login' ? (
              <button
                onClick={() => { setMode('reset'); reset() }}
                className="text-xs transition-colors"
                style={{ color: '#6b6c88' }}
                onMouseEnter={e => e.currentTarget.style.color = '#a2a3be'}
                onMouseLeave={e => e.currentTarget.style.color = '#6b6c88'}
              >
                Forgot password?
              </button>
            ) : (
              <button
                onClick={() => { setMode('login'); reset() }}
                className="text-xs transition-colors"
                style={{ color: '#6b6c88' }}
                onMouseEnter={e => e.currentTarget.style.color = '#a2a3be'}
                onMouseLeave={e => e.currentTarget.style.color = '#6b6c88'}
              >
                ← Back to sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
