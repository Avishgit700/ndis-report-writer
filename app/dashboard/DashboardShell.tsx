'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { clearToken, getUser, ENGINE_URL } from '@/lib/engine'
import { FileText, PenLine, History, Users, Settings, CreditCard, LogOut } from 'lucide-react'

const FREE_LIMIT = 5
const NAV = [
  { href: '/dashboard',          label: 'Write Note', icon: PenLine },
  { href: '/dashboard/history',  label: 'History',    icon: History },
  { href: '/dashboard/clients',  label: 'Clients',    icon: Users },
  { href: '/dashboard/settings', label: 'Settings',   icon: Settings },
  { href: '/dashboard/billing',  label: 'Billing',    icon: CreditCard },
]

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [ready, setReady]      = useState(false)
  const [plan, setPlan]        = useState<string>('free')
  const [usageCount, setUsage] = useState(0)

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
          const uid = json.data.id
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
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-emerald-600 rounded-md flex items-center justify-center">
                <FileText className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-sm">NoteScribe <span className="text-emerald-600">AI</span></span>
            </Link>
            <nav className="hidden sm:flex items-center gap-1">
              {NAV.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === href
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {isPro ? (
              <span className="hidden sm:block bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">PRO</span>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs text-gray-400">{FREE_LIMIT - usageCount} free left</span>
                <Link
                  href="/dashboard/billing"
                  className="bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-emerald-700 transition-colors"
                >
                  Upgrade
                </Link>
              </div>
            )}
            <span className="text-xs text-gray-400 hidden sm:block truncate max-w-[140px]">{user?.email}</span>
            <button
              onClick={() => { clearToken(); router.replace('/login') }}
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        <div data-plan={plan} data-usage={usageCount} data-free-limit={FREE_LIMIT}>
          {children}
        </div>
      </main>
    </div>
  )
}
