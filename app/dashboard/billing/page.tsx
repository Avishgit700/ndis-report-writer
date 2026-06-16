'use client'

import { useEffect, useState } from 'react'
import { getToken, ENGINE_URL } from '@/lib/engine'
import { Check, Zap, Loader2 } from 'lucide-react'

const FREE_LIMIT = 5

export default function BillingPage() {
  const [plan, setPlan]         = useState<string>('free')
  const [loading, setLoading]   = useState(true)
  const [upgrading, setUpgrading] = useState(false)

  useEffect(() => {
    const token = getToken()
    if (!token) return
    fetch(`${ENGINE_URL}/api/auth/subscription`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(json => { if (json.data?.plan) setPlan(json.data.plan) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleUpgrade() {
    setUpgrading(true)
    const token = getToken()
    try {
      const res = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ plan: 'pro' }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      // ignore
    } finally {
      setUpgrading(false)
    }
  }

  const isPro = plan === 'pro'

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your NoteScribe AI subscription</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Current plan */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Current Plan</h2>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${isPro ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                {isPro ? 'PRO' : 'FREE'}
              </span>
            </div>
            {isPro ? (
              <p className="text-sm text-gray-500">You&apos;re on Pro — unlimited note generation, all report types, PDF export, full note history.</p>
            ) : (
              <p className="text-sm text-gray-500">You&apos;re on the Free plan. You get {FREE_LIMIT} notes per month. Upgrade to Pro for unlimited notes.</p>
            )}
          </div>

          {/* Plans comparison */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Free */}
            <div className={`bg-white rounded-2xl border p-6 ${!isPro ? 'border-emerald-300 ring-2 ring-emerald-200' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Free</h3>
                {!isPro && <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">Current</span>}
              </div>
              <div className="mb-5">
                <span className="text-3xl font-black text-gray-900">$0</span>
                <span className="text-gray-400 text-sm ml-1">/month</span>
              </div>
              <ul className="space-y-2">
                {[`${FREE_LIMIT} AI notes/month`, 'All report types', 'Note history', 'Copy to clipboard'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div className={`bg-emerald-600 rounded-2xl p-6 relative ${isPro ? 'ring-2 ring-emerald-400' : ''}`}>
              {!isPro && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-black px-3 py-0.5 rounded-full">
                  RECOMMENDED
                </div>
              )}
              {isPro && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-400 text-emerald-900 text-xs font-black px-3 py-0.5 rounded-full">
                  ACTIVE
                </div>
              )}
              <h3 className="font-bold text-white mb-4">Pro</h3>
              <div className="mb-5">
                <span className="text-3xl font-black text-white">$79</span>
                <span className="text-emerald-300 text-sm ml-1">/month</span>
              </div>
              <ul className="space-y-2 mb-6">
                {['Unlimited AI notes', 'All report types', 'Saved client profiles', 'PDF & Word export', 'Full note history', 'Cancel anytime'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-emerald-100">
                    <Check className="w-3.5 h-3.5 text-white flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              {!isPro && (
                <button
                  onClick={handleUpgrade}
                  disabled={upgrading}
                  className="w-full bg-white text-emerald-600 py-3 rounded-xl font-black text-sm hover:bg-emerald-50 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {upgrading
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Redirecting…</>
                    : <><Zap className="w-4 h-4" />Upgrade to Pro — $79/mo</>}
                </button>
              )}
              {isPro && (
                <p className="text-emerald-200 text-sm text-center">You&apos;re all set. Enjoy unlimited notes!</p>
              )}
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center">
            Payments handled securely by Stripe. Cancel anytime — no lock-in.
          </p>
        </>
      )}
    </div>
  )
}
