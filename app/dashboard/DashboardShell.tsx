'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { clearToken, getUser, ENGINE_URL } from '@/lib/engine'
import {
  FileText, PenLine, History, Users, Settings, CreditCard,
  LogOut, Brain, Menu, X, BookOpen, Zap, ChevronRight,
  Sparkles, Bell, TrendingUp
} from 'lucide-react'

const FREE_LIMIT = 5

const NAV = [
  { href: '/dashboard',          label: 'Write Note', icon: PenLine,    color: 'text-emerald-500', bg: 'bg-emerald-50',  dot: 'bg-emerald-500' },
  { href: '/dashboard/history',  label: 'History',    icon: History,    color: 'text-blue-500',    bg: 'bg-blue-50',     dot: 'bg-blue-500'    },
  { href: '/dashboard/clients',  label: 'Clients',    icon: Users,      color: 'text-purple-500',  bg: 'bg-purple-50',   dot: 'bg-purple-500'  },
  { href: '/dashboard/advisor',  label: 'AI Coach',   icon: Brain,      color: 'text-pink-500',    bg: 'bg-pink-50',     dot: 'bg-pink-500'    },
  { href: '/dashboard/help',     label: 'Help',       icon: BookOpen,   color: 'text-amber-500',   bg: 'bg-amber-50',    dot: 'bg-amber-500'   },
]
const NAV_BOTTOM = [
  { href: '/dashboard/settings', label: 'Settings',   icon: Settings,   color: 'text-gray-500',    bg: 'bg-gray-50',     dot: 'bg-gray-400'    },
  { href: '/dashboard/billing',  label: 'Billing',    icon: CreditCard, color: 'text-teal-500',    bg: 'bg-teal-50',     dot: 'bg-teal-500'    },
]

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [ready, setReady]       = useState(false)
  const [plan, setPlan]         = useState('free')
  const [usageCount, setUsage]  = useState(0)
  const [mobileOpen, setMobile] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const mainRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const token = localStorage.getItem('ndisrw_token')
    if (!token) { router.replace('/login'); return }
    setReady(true)

    fetch(`${ENGINE_URL}/api/auth/subscription`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(j => { if (j.data?.plan) setPlan(j.data.plan) }).catch(() => {})

    fetch(`${ENGINE_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(j => {
        if (!j.data?.id) return
        const uid = j.data.id, month = new Date().toISOString().slice(0, 7)
        fetch(`${ENGINE_URL}/api/orgs/${process.env.NEXT_PUBLIC_ORG_ID}/projects/${process.env.NEXT_PUBLIC_PROJECT_ID}/records?entityType=usage_event&limit=1000`, {
          headers: { 'X-API-Key': process.env.NEXT_PUBLIC_API_KEY ?? '' },
        }).then(r => r.json()).then(d => {
          setUsage((d.data?.data ?? []).filter((r: { data?: { userId?: string }; createdAt?: string }) =>
            r.data?.userId === uid && r.createdAt?.startsWith(month)).length)
        }).catch(() => {})
      }).catch(() => {})
  }, [router])

  useEffect(() => { setMobile(false) }, [pathname])

  useEffect(() => {
    const el = mainRef.current
    if (!el) return
    const onScroll = () => setScrolled(el.scrollTop > 8)
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [ready])

  if (!ready) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div className="absolute -inset-1 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl blur opacity-30 animate-pulse" />
        </div>
        <p className="text-gray-400 text-sm font-medium">Loading NoteScribe AI…</p>
      </div>
    </div>
  )

  const user     = getUser()
  const isPro    = plan === 'pro'
  const freeLeft = Math.max(0, FREE_LIMIT - usageCount)
  const usedPct  = Math.min(100, (usageCount / FREE_LIMIT) * 100)
  const initials = user?.email?.[0]?.toUpperCase() ?? '?'

  const NavItem = ({ href, label, icon: Icon, color, bg }: typeof NAV[0]) => {
    const active = pathname === href
    return (
      <Link href={href} className={`
        group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
        transition-all duration-200 select-none
        ${active
          ? `${bg} ${color} shadow-sm`
          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
        }
      `}>
        {/* active indicator bar */}
        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full transition-all duration-200 ${active ? color.replace('text-', 'bg-') : 'bg-transparent'}`} />

        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
          active ? color.replace('text-', 'bg-').replace('500', '100') : 'bg-transparent group-hover:bg-gray-100'
        }`}>
          <Icon className={`w-4 h-4 transition-colors duration-200 ${active ? color : 'text-gray-400 group-hover:text-gray-600'}`} />
        </div>

        <span className="flex-1">{label}</span>

        {active && <ChevronRight className={`w-3.5 h-3.5 ${color} opacity-60 flex-shrink-0`} />}

        {/* AI badge on coach */}
        {label === 'AI Coach' && !active && (
          <span className="text-[10px] font-black bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded-full">AI</span>
        )}
      </Link>
    )
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-white">

      {/* Logo */}
      <div className="px-4 pt-5 pb-4">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md shadow-emerald-100 group-hover:shadow-emerald-200 transition-shadow">
              <FileText className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
            </div>
            <div className="absolute -inset-0.5 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl blur opacity-0 group-hover:opacity-20 transition-opacity" />
          </div>
          <div>
            <p className="font-black text-gray-900 text-sm leading-tight">NoteScribe</p>
            <p className="text-emerald-600 text-xs font-bold leading-tight">AI — NDIS Notes</p>
          </div>
        </Link>
      </div>

      {/* Main nav */}
      <div className="flex-1 overflow-y-auto px-3 pb-2 space-y-0.5 scrollbar-hide">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 py-2">Main</p>
        {NAV.map(item => <NavItem key={item.href} {...item} />)}

        <div className="pt-3 mt-1">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 py-2">Account</p>
          {NAV_BOTTOM.map(item => <NavItem key={item.href} {...item} />)}
        </div>
      </div>

      {/* Usage / upgrade */}
      <div className="px-3 pb-3">
        {isPro ? (
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-4 text-white">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                <span className="text-xs font-black">Pro Plan Active</span>
              </div>
              <p className="text-xs text-emerald-200 leading-snug">Unlimited notes · All features · Priority support</p>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-gray-800">{freeLeft} notes left</span>
              <span className="text-[10px] text-gray-400 font-medium">of {FREE_LIMIT} free</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full mb-3 overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${
                freeLeft <= 1 ? 'bg-gradient-to-r from-red-400 to-red-500' :
                freeLeft <= 2 ? 'bg-gradient-to-r from-amber-400 to-orange-400' :
                                'bg-gradient-to-r from-emerald-400 to-teal-500'
              }`} style={{ width: `${100 - usedPct}%` }} />
            </div>
            <Link href="/dashboard/billing"
              className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold py-2.5 rounded-xl hover:from-emerald-500 hover:to-teal-500 transition-all shadow-sm shadow-emerald-200 hover:shadow-emerald-300">
              <Sparkles className="w-3 h-3" /> Upgrade to Pro
            </Link>
            {freeLeft === 0 && (
              <p className="text-[10px] text-red-500 font-medium text-center mt-1.5">Monthly limit reached</p>
            )}
          </div>
        )}
      </div>

      {/* User row */}
      <div className="px-3 pb-4 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-50 transition-colors group">
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-black">{initials}</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900 truncate">{user?.email}</p>
            <p className="text-[10px] text-gray-400 font-medium">{isPro ? '⚡ Pro plan' : '🆓 Free plan'}</p>
          </div>
          <button onClick={() => { clearToken(); router.replace('/login') }}
            title="Sign out"
            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 flex-shrink-0">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Desktop sidebar */}
      <aside className="hidden md:block w-60 bg-white border-r border-gray-100 fixed left-0 top-0 bottom-0 z-40 shadow-sm">
        <Sidebar />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-200"
        style={{ background: scrolled ? 'rgba(255,255,255,0.95)' : 'white', backdropFilter: scrolled ? 'blur(12px)' : 'none', borderBottom: '1px solid #f1f5f9' }}>
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-sm">
              <FileText className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-black text-gray-900 text-sm">NoteScribe <span className="text-emerald-600">AI</span></span>
          </Link>
          <div className="flex items-center gap-2">
            {!isPro && (
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                freeLeft <= 1 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
              }`}>{freeLeft} left</span>
            )}
            {isPro && <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">PRO</span>}
            <button onClick={() => setMobile(o => !o)}
              className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-all">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={`md:hidden fixed inset-0 z-40 transition-all duration-300 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobile(false)} />
        <aside className={`absolute left-0 top-0 bottom-0 w-72 shadow-2xl transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <Sidebar />
        </aside>
      </div>

      {/* Main content */}
      <main ref={mainRef} className="flex-1 md:ml-60 overflow-y-auto">
        <div className="md:hidden h-14" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div data-plan={plan} data-usage={usageCount} data-free-limit={FREE_LIMIT}>
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
