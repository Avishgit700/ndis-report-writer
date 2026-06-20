'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { clearToken, getUser, ENGINE_URL } from '@/lib/engine'
import {
  FileText, PenLine, History, Users, Settings, CreditCard,
  LogOut, Brain, Menu, X, BookOpen, Zap, ChevronRight, Shield
} from 'lucide-react'

const FREE_LIMIT = 5
const NAV = [
  { href: '/dashboard',          label: 'Write Note', icon: PenLine  },
  { href: '/dashboard/history',  label: 'History',    icon: History  },
  { href: '/dashboard/clients',  label: 'Clients',    icon: Users    },
  { href: '/dashboard/advisor',  label: 'AI Coach',   icon: Brain    },
  { href: '/dashboard/help',     label: 'Help',       icon: BookOpen },
]
const NAV_BOTTOM = [
  { href: '/dashboard/settings', label: 'Settings',   icon: Settings   },
  { href: '/dashboard/billing',  label: 'Billing',    icon: CreditCard },
]

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [ready, setReady]       = useState(false)
  const [plan, setPlan]         = useState<string>('free')
  const [usageCount, setUsage]  = useState(0)
  const [mobileOpen, setMobile] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('ndisrw_token')
    if (!token) { router.replace('/login'); return }
    setReady(true)

    fetch(`${ENGINE_URL}/api/auth/subscription`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(j => { if (j.data?.plan) setPlan(j.data.plan) }).catch(() => {})

    fetch(`${ENGINE_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(j => {
        if (j.data?.id) {
          const uid   = j.data.id
          const month = new Date().toISOString().slice(0, 7)
          fetch(`${ENGINE_URL}/api/orgs/${process.env.NEXT_PUBLIC_ORG_ID}/projects/${process.env.NEXT_PUBLIC_PROJECT_ID}/records?entityType=usage_event&limit=1000`, {
            headers: { 'X-API-Key': process.env.NEXT_PUBLIC_API_KEY ?? '' },
          })
            .then(r => r.json())
            .then(d => {
              const count = (d.data?.data ?? []).filter(
                (r: { data?: { userId?: string }; createdAt?: string }) =>
                  r.data?.userId === uid && r.createdAt?.startsWith(month)
              ).length
              setUsage(count)
            }).catch(() => {})
        }
      }).catch(() => {})
  }, [router])

  useEffect(() => { setMobile(false) }, [pathname])

  if (!ready) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center animate-pulse">
          <FileText className="w-4 h-4 text-white" />
        </div>
        <p className="text-gray-400 text-sm">Loading NoteScribe AI…</p>
      </div>
    </div>
  )

  const user  = getUser()
  const isPro = plan === 'pro'
  const freeLeft = FREE_LIMIT - usageCount

  /* ── Sidebar content (shared between desktop + mobile drawer) ── */
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-black text-gray-900 text-sm leading-none">NoteScribe</p>
            <p className="text-emerald-600 text-xs font-bold">AI</p>
          </div>
        </Link>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">Menu</p>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}>
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-emerald-600' : 'text-gray-400'}`} />
              <span>{label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-emerald-400" />}
            </Link>
          )
        })}

        <div className="pt-3 mt-3 border-t border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">Account</p>
          {NAV_BOTTOM.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}>
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-emerald-600' : 'text-gray-400'}`} />
                <span>{label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-emerald-400" />}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Usage / upgrade strip */}
      <div className="px-3 pb-3">
        {isPro ? (
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-3 text-white">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 fill-white" />
              <span className="text-xs font-black">Pro Plan</span>
            </div>
            <p className="text-xs text-emerald-100">Unlimited notes · All features</p>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-700">{freeLeft} free notes left</span>
              <span className="text-xs text-gray-400">of {FREE_LIMIT}</span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full mb-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${freeLeft <= 1 ? 'bg-red-500' : freeLeft <= 3 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${(freeLeft / FREE_LIMIT) * 100}%` }}
              />
            </div>
            <Link href="/dashboard/billing"
              className="w-full block text-center bg-emerald-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-emerald-700 transition-colors">
              Upgrade to Pro — $79/mo
            </Link>
          </div>
        )}
      </div>

      {/* User info + sign out */}
      <div className="px-3 pb-4 border-t border-gray-100 pt-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-black">{user?.email?.[0]?.toUpperCase() ?? '?'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900 truncate">{user?.email}</p>
            <p className="text-xs text-gray-400">{isPro ? 'Pro plan' : 'Free plan'}</p>
          </div>
          <button onClick={() => { clearToken(); router.replace('/login') }}
            title="Sign out"
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-200 fixed left-0 top-0 bottom-0 z-40">
        <SidebarContent />
      </aside>

      {/* ── Mobile: top bar + drawer ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 flex items-center justify-between px-4 h-14">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
            <FileText className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-black text-gray-900 text-sm">NoteScribe <span className="text-emerald-600">AI</span></span>
        </Link>
        <button onClick={() => setMobile(o => !o)}
          className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setMobile(false)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Main content ── */}
      <main className="flex-1 md:ml-56 pt-0 md:pt-0">
        <div className="md:hidden h-14" /> {/* spacer for mobile top bar */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div data-plan={plan} data-usage={usageCount} data-free-limit={FREE_LIMIT}>
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
