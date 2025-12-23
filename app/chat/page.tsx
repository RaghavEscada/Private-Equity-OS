'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import DealChat from '@/components/ui/DealChat'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type AuthMode = 'signin' | 'signup'

export default function ChatPage() {
  const [authMode, setAuthMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userPresent, setUserPresent] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        setUserPresent(true)
      }
      setLoading(false)

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUserPresent(!!session?.user)
      })

      return () => {
        authListener.subscription.unsubscribe()
      }
    }

    checkUser()
  }, [])

  const handleAuth = async () => {
    setError(null)
    setAuthLoading(true)
    try {
      if (authMode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        })
        if (signUpError) throw signUpError
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUserPresent(false)
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <div className="text-sm text-white/60">Loading workspace…</div>
      </div>
    )
  }

  if (!userPresent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white px-4">
        <Card className="w-full max-w-md border-white/10 bg-black/80 text-white shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">
              Deal Lab AI
            </CardTitle>
            <CardDescription className="text-white/60">
              {authMode === 'signin'
                ? 'Sign in to access your deals, chats, and transcripts.'
                : 'Create an account to start managing your deal pipeline.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-white/80">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@fund.com"
                className="bg-black border-white/20 text-white placeholder:text-white/40"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/80">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-black border-white/20 text-white placeholder:text-white/40"
              />
            </div>
            {error && (
              <p className="text-xs text-red-400">{error}</p>
            )}
            <Button
              className="w-full bg-white text-black hover:bg-white/90"
              onClick={handleAuth}
              disabled={authLoading || !email || !password}
            >
              {authLoading
                ? authMode === 'signin'
                  ? 'Signing in…'
                  : 'Creating account…'
                : authMode === 'signin'
                  ? 'Sign in'
                  : 'Sign up'}
            </Button>
            <button
              type="button"
              onClick={() => {
                setAuthMode(authMode === 'signin' ? 'signup' : 'signin')
                setError(null)
              }}
              className="w-full text-xs text-white/60 hover:text-white mt-2"
            >
              {authMode === 'signin'
                ? "Don't have an account? Create one"
                : 'Already have an account? Sign in'}
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-black text-white overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/90 backdrop-blur-sm shrink-0">
        <span className="text-xs text-white/60">
          Signed in
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={handleSignOut}
          className="border-white/30 text-white hover:bg-white/10 bg-white/5"
        >
          Sign out
        </Button>
      </div>
      <div className="flex-1 overflow-hidden">
        <DealChat />
      </div>
    </div>
  )
}


