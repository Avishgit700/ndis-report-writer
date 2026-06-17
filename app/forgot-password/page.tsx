'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileText, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Failed to send reset email')
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/login" className="inline-flex items-center gap-2 mb-10 text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-600 rounded-lg flex items-center justify-center">
              <FileText className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-white text-sm">NoteScribe AI</span>
          </div>
        </Link>

        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-black text-white mb-3">Check your email</h1>
            <p className="text-white/40 text-sm leading-relaxed mb-8">
              If <span className="text-white/70">{email}</span> has an account, we&apos;ve sent a password reset link. Check your inbox (and spam folder).
            </p>
            <Link href="/login" className="text-emerald-400 text-sm font-semibold hover:text-emerald-300 transition-colors">
              Back to sign in →
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-black text-white mb-2">Reset your password</h1>
            <p className="text-white/40 mb-8">Enter your email and we&apos;ll send you a reset link.</p>

            {error && (
              <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">Email</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required autoFocus placeholder="you@example.com"
                  className="w-full px-4 py-3.5 rounded-xl border border-white/8 bg-white/[0.04] text-white text-sm placeholder-white/15 focus:outline-none focus:border-emerald-500/60 focus:bg-white/[0.06] transition-all"
                />
              </div>
              <button
                type="submit" disabled={loading || !email}
                className="w-full relative overflow-hidden rounded-xl py-3.5 font-semibold text-sm text-white disabled:opacity-50 transition-all bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 flex items-center justify-center gap-2"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Sending…</>
                  : 'Send reset link'}
              </button>
            </form>

            <p className="text-center text-sm text-white/30 mt-6">
              Remember your password?{' '}
              <Link href="/login" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
                Sign in →
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
