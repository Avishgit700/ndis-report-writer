'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { clearToken, getUser, ENGINE_URL } from '@/lib/engine'
import { FileText, PenLine, History, Users, Settings, CreditCard, LogOut, Brain, Menu, X, BookOpen } from 'lucide-react'

const FREE_LIMIT = 5
const NAV = [
  { href: '/dashboard',          label: 'Write Note', icon: PenLine },
  { href: '/dashboard/history',  label: 'History',    icon: History },
  { href: '/dashboard/clients',  label: 'Clients',    icon: Users },
  { href: '/dashboard/advisor',  label: 'AI Coach',   icon: Brain },
  { href: '/dashboard/help',     label: 'Help',       icon: BookOpen },
  { href: '/dashboard/settings', label: 'Settings',   icon: Settings },
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

    fetch(`${ENGINE_URL}/api/auth/subscription`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(json => { if (json.data?.plan) setPlan(json.data.plan) })
      .catch(() => {})

    fetch(`${ENGINE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(json => {
        if (json.data?.id) {
          const uid   = json.data.id
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
            })
            .catch(() => {})
        }
      })
      .catch(() => {})
  }, [router])

  // close mobile nav on route change
  useEffect(() => { setMobile(false) }, [pathname])

  if (!ready) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center animate-pulse">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <p className="text-gray-400 text-sm">Loading NoteScribe AI…</p>
        </div>
      </div>
    )
  }

  const user  = getUser()
  const isPro = plan === 'pro'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 bg-emerald-600 rounded-md flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">NoteScribe <span className="text-emerald-600">AI</span></span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === href ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}>
                <Icon className="w-3.5 h-3.5" />{label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {isPro ? (
              <span className="hidden sm:block bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">PRO</span>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs text-gray-400">{FREE_LIMIT - usageCount} free left</span>
                <Link href="/dashboard/billing"
                  className="bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-emerald-700 transition-colors">
                  Upgrade
                </Link>
              </div>
            )}
            <span className="text-xs text-gray-400 hidden lg:block truncate max-w-[140px]">{user?.email}</span>
            <button onClick={() => { clearToken(); router.replace('/login') }}
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100 hidden sm:block"
              title="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
            {/* Mobile menu toggle */}
            <button onClick={() => setMobile(o => !o)}
              className="md:hidden p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  pathname === href ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'
                }`}>
                <Icon className="w-4 h-4" />{label}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">{user?.email}</p>
                {!isPro && <p className="text-xs text-gray-400">{FREE_LIMIT - usageCount} free notes left</p>}
                {isPro  && <p className="text-xs text-emerald-600 font-semibold">Pro — unlimited</p>}
              </div>
              <button onClick={() => { clearToken(); router.replace('/login') }}
                className="flex items-center gap-1.5 text-xs text-red-500 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div data-plan={plan} data-usage={usageCount} data-free-limit={FREE_LIMIT}>
          {children}
        </div>
      </main>
    </div>
  )
}
