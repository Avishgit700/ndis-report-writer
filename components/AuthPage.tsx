'use client'

/**
 * ─── Shared Auth Page Component ───────────────────────────────────────────────
 * Used by ALL products. To redesign auth across every product:
 *   → Edit THIS file only (same file exists in each product repo)
 *
 * Each product passes a BrandConfig — logo, colours, copy, features.
 * The login/signup pages are thin wrappers that call this component.
 */

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { Loader2, ArrowRight, Check, Eye, EyeOff } from 'lucide-react'

// ─── Brand config type ─────────────────────────────────────────────────────────
export interface BrandConfig {
  name: string                        // "ReplyMate"
  logo: ReactNode                     // icon JSX
  accent: {
    blob1: string                     // Tailwind bg class e.g. "bg-violet-600/20"
    blob2: string
    blob3: string
    cube: string                      // CSS rgba border colour
    cubeBg: string                    // CSS rgba bg colour
    glow: string                      // right-panel glow class
    badge: string                     // "border-violet-500/30 bg-violet-500/10 text-violet-300"
    checkBg: string                   // "bg-violet-500/20 border-violet-500/30"
    checkIcon: string                 // "text-violet-400"
    input: string                     // focus border class
    button: string                    // gradient from/to classes
    buttonHover: string
    tab: string                       // active tab bg class
  }
  headline: ReactNode                 // big left headline JSX
  subheadline: string                 // paragraph below headline
  badgeText: string                   // pill above headline
  features: string[]                  // 3 bullet points
  proof: {
    avatarGradient: string            // gradient classes for avatar circles
    initials: string[]                // 3 letters
    line1: string
    line2: string
  }
  loginSubtitle: string
  signupSubtitle: string
  dashboardPath?: string              // default '/dashboard'
  showPassword?: boolean              // show eye toggle (default false)
}

// ─── Props ─────────────────────────────────────────────────────────────────────
interface AuthPageProps {
  brand: BrandConfig
  mode: 'login' | 'signup' | 'tabs'  // 'tabs' = single page with toggle
  onLogin: (email: string, password: string) => Promise<{ accessToken: string; user: unknown }>
  onRegister: (name: string, email: string, password: string) => Promise<{ accessToken: string; user: unknown }>
  onSuccess: (result: { accessToken: string; user: unknown }) => void
}

export default function AuthPage({ brand, mode, onLogin, onRegister, onSuccess }: AuthPageProps) {
  const useTabs = mode === 'tabs'
  const [tab, setTab]               = useState<'login' | 'signup'>(mode === 'signup' ? 'signup' : 'login')
  const [name, setName]             = useState('')
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [showPw, setShowPw]         = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  const isLogin = useTabs ? tab === 'login' : mode === 'login'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = isLogin
        ? await onLogin(email, password)
        : await onRegister(name, email, password)
      onSuccess(result)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  const a = brand.accent

  return (
    <div className="min-h-screen flex bg-[#080808]">

      {/* ══════════════════════════════════════════════════════════
          LEFT PANEL — brand, headline, features, social proof
      ══════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-14">

        {/* Animated gradient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className={`absolute top-[10%] left-[15%] w-72 h-72 rounded-full blur-[80px] animate-auth-blob ${a.blob1}`} />
          <div className={`absolute top-[50%] right-[5%] w-80 h-80 rounded-full blur-[100px] animate-auth-blob auth-delay-2 ${a.blob2}`} />
          <div className={`absolute bottom-[10%] left-[25%] w-60 h-60 rounded-full blur-[80px] animate-auth-blob auth-delay-4 ${a.blob3}`} />
        </div>

        {/* Floating CSS cubes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[
            { w: 60,  h: 60,  t: '15%',  l: '10%',  dur: '12s', delay: '0s',  br: 10 },
            { w: 40,  h: 40,  t: '40%',  ri: '12%', dur: '9s',  delay: '2s',  br: 8  },
            { w: 80,  h: 80,  b: '25%',  l: '20%',  dur: '15s', delay: '4s',  br: 14 },
            { w: 30,  h: 30,  t: '65%',  l: '45%',  dur: '8s',  delay: '1s',  br: 6  },
            { w: 50,  h: 50,  t: '25%',  ri: '30%', dur: '11s', delay: '3s',  br: 10 },
          ].map((c, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: c.w, height: c.h,
                top: c.t, left: c.l, right: c.ri, bottom: c.b,
                border: `1px solid ${a.cube}`,
                background: a.cubeBg,
                borderRadius: c.br ?? 8,
                animation: `auth-float-cube linear ${c.dur} ${c.delay} infinite`,
              }}
            />
          ))}
        </div>

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5">
            {brand.logo}
            <span className="font-bold text-white text-lg tracking-tight">{brand.name}</span>
          </Link>
        </div>

        {/* Headline block */}
        <div className="relative z-10">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium mb-6 ${a.badge}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
            {brand.badgeText}
          </div>

          <h1 className="text-5xl font-black text-white leading-[1.05] mb-5 tracking-tight">
            {brand.headline}
          </h1>

          <p className="text-white/40 text-lg leading-relaxed mb-10 max-w-sm">
            {brand.subheadline}
          </p>

          <div className="space-y-3">
            {brand.features.map((f) => (
              <div key={f} className="flex items-center gap-3 text-white/60 text-sm">
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${a.checkBg}`}>
                  <Check className={`w-3 h-3 ${a.checkIcon}`} />
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Social proof */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 p-4 rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm">
            <div className="flex -space-x-2">
              {brand.proof.initials.map((l, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full border-2 border-[#080808] flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br ${brand.proof.avatarGradient}`}
                >
                  {l}
                </div>
              ))}
            </div>
            <div>
              <p className="text-white text-sm font-semibold">{brand.proof.line1}</p>
              <p className="text-white/40 text-xs">{brand.proof.line2}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          RIGHT PANEL — form
      ══════════════════════════════════════════════════════════ */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-20 relative">
        <div className={`absolute top-[-10%] right-[-10%] w-80 h-80 rounded-full blur-[120px] pointer-events-none ${a.glow}`} />

        {/* Mobile logo */}
        <div className="lg:hidden mb-10">
          <Link href="/" className="inline-flex items-center gap-2.5">
            {brand.logo}
            <span className="font-bold text-white text-lg">{brand.name}</span>
          </Link>
        </div>

        <div className="w-full max-w-md relative z-10">

          {/* Tab switcher (only shown in tabs mode) */}
          {useTabs && (
            <div className="flex bg-white/[0.04] border border-white/8 rounded-xl p-1 mb-8">
              {(['login', 'signup'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setError('') }}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                    tab === t ? `${a.tab} text-white shadow-sm` : 'text-white/30 hover:text-white/60'
                  }`}
                >
                  {t === 'login' ? 'Sign in' : 'Create account'}
                </button>
              ))}
            </div>
          )}

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-black text-white tracking-tight mb-2">
              {isLogin ? 'Welcome back' : (mode === 'signup' ? 'Create your account' : 'Get started free')}
            </h2>
            <p className="text-white/40">
              {isLogin ? brand.loginSubtitle : brand.signupSubtitle}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">Full name</label>
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  required={!isLogin} autoComplete="name"
                  placeholder="Your name"
                  className={`w-full px-4 py-3.5 rounded-xl border border-white/8 bg-white/[0.04] text-white text-sm placeholder-white/15 focus:outline-none focus:bg-white/[0.06] transition-all ${a.input}`}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                required autoFocus autoComplete="email"
                placeholder="you@example.com"
                className={`w-full px-4 py-3.5 rounded-xl border border-white/8 bg-white/[0.04] text-white text-sm placeholder-white/15 focus:outline-none focus:bg-white/[0.06] transition-all ${a.input}`}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">Password</label>
                {isLogin && (
                  <Link href="/forgot-password" className={`text-xs transition-colors ${a.checkIcon} hover:text-white`}>
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  required minLength={isLogin ? 1 : 6} autoComplete={isLogin ? 'current-password' : 'new-password'}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3.5 rounded-xl border border-white/8 bg-white/[0.04] text-white text-sm placeholder-white/15 focus:outline-none focus:bg-white/[0.06] transition-all ${brand.showPassword ? 'pr-12' : ''} ${a.input}`}
                />
                {brand.showPassword && (
                  <button
                    type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                )}
              </div>
              {!isLogin && (
                <p className="text-xs text-white/20 mt-1">Uppercase letter, number, 8+ characters</p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full relative group overflow-hidden rounded-xl py-3.5 font-semibold text-sm text-white disabled:opacity-50 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${a.button}`} />
                <div className={`absolute inset-0 bg-gradient-to-r ${a.buttonHover} opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />
                <span className="relative flex items-center justify-center gap-2">
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> {isLogin ? 'Signing in…' : 'Creating account…'}</>
                    : <><ArrowRight className="w-4 h-4" /> {isLogin ? 'Sign in' : 'Create free account'}</>
                  }
                </span>
              </button>
            </div>
          </form>

          {/* Toggle link (non-tabs mode) */}
          {!useTabs && (
            <>
              <div className="flex items-center gap-4 my-7">
                <div className="flex-1 h-px bg-white/8" />
                <span className="text-white/20 text-xs">or</span>
                <div className="flex-1 h-px bg-white/8" />
              </div>
              <p className="text-center text-sm text-white/30">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <Link
                  href={isLogin ? '/signup' : '/login'}
                  className={`font-semibold hover:text-white transition-colors ${a.checkIcon}`}
                >
                  {isLogin ? 'Create one free →' : 'Sign in →'}
                </Link>
              </p>
            </>
          )}

          <p className="text-center text-xs text-white/15 mt-7">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-white/30 transition-colors">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="underline hover:text-white/30 transition-colors">Privacy Policy</Link>
          </p>
        </div>
      </div>

      {/* Global keyframes */}
      <style jsx global>{`
        @keyframes auth-blob {
          0%, 100% { transform: translate(0,0) scale(1); }
          33%       { transform: translate(20px,-15px) scale(1.05); }
          66%       { transform: translate(-10px,20px) scale(0.97); }
        }
        @keyframes auth-float-cube {
          0%   { transform: translateY(0px) rotate(0deg); opacity: 0.12; }
          50%  { transform: translateY(-28px) rotate(180deg); opacity: 0.22; }
          100% { transform: translateY(0px) rotate(360deg); opacity: 0.12; }
        }
        .animate-auth-blob { animation: auth-blob 10s infinite ease-in-out; }
        .auth-delay-2 { animation-delay: 2s; }
        .auth-delay-4 { animation-delay: 4s; }
      `}</style>
    </div>
  )
}
