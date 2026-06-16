'use client'

import { useEffect, useState } from 'react'
import { getToken, getUser } from '@/lib/engine'
import { Copy, Check, Sparkles, AlertCircle, ArrowRight, X, CheckCircle2, FileText } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const FREE_LIMIT = 5

const REPORT_TYPES = [
  { value: 'Progress Note',                label: 'Progress Note' },
  { value: 'Incident Report',              label: 'Incident Report' },
  { value: 'Handover Note',                label: 'Handover Note' },
  { value: 'Support Plan',                 label: 'Support Plan' },
  { value: 'Goal Review Note',             label: 'Goal Review Note' },
  { value: 'Functional Capacity Assessment', label: 'Functional Capacity Assessment' },
]

const MOOD_OPTIONS = [
  'Happy and engaged',
  'Calm and cooperative',
  'Anxious or unsettled',
  'Tired or low energy',
  'Frustrated or agitated',
  'Neutral / no concerns',
]

const TIPS = [
  'Type rough notes in plain English — the AI handles the professional language.',
  'Save your client profiles to make future notes even faster.',
  'Include NDIS goal keywords like "independence", "communication", or "community access" for richer notes.',
  'Incident reports should mention immediate response and follow-up actions in your raw notes.',
]

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const [reportType, setReportType]   = useState('Progress Note')
  const [clientName, setClientName]   = useState('')
  const [workerName, setWorkerName]   = useState('')
  const [date, setDate]               = useState(new Date().toISOString().split('T')[0])
  const [duration, setDuration]       = useState('')
  const [clientGoals, setClientGoals] = useState('')
  const [mood, setMood]               = useState('')
  const [activities, setActivities]   = useState('')
  const [incidents, setIncidents]     = useState('')
  const [rawNotes, setRawNotes]       = useState('')
  const [note, setNote]               = useState('')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [copied, setCopied]           = useState(false)
  const [usageCount, setUsageCount]   = useState(0)
  const [plan, setPlan]               = useState<string>('free')
  const [showToast, setShowToast]     = useState(false)
  const [tipIndex]                    = useState(() => Math.floor(Math.random() * TIPS.length))

  const ENGINE_URL = process.env.NEXT_PUBLIC_ENGINE_URL ?? 'https://saas-engine-production.up.railway.app'
  const isPro          = plan === 'pro'
  const isLimitReached = !isPro && usageCount >= FREE_LIMIT

  useEffect(() => {
    const user  = getUser()
    const token = getToken()
    if (user?.name) setWorkerName(user.name)
    if (user?.id) {
      const month = new Date().toISOString().slice(0, 7)
      fetch(`${ENGINE_URL}/api/orgs/${process.env.NEXT_PUBLIC_ORG_ID}/projects/${process.env.NEXT_PUBLIC_PROJECT_ID}/records?entityType=usage_event&limit=1000`, {
        headers: { 'X-API-Key': process.env.NEXT_PUBLIC_API_KEY ?? '' },
      })
        .then(r => r.json())
        .then(d => {
          const count = (d.data?.data ?? []).filter(
            (r: { data?: { userId?: string }; createdAt?: string }) =>
              r.data?.userId === user.id && r.createdAt?.startsWith(month)
          ).length
          setUsageCount(count)
        })
        .catch(() => {})
    }
    if (token) {
      fetch(`${ENGINE_URL}/api/auth/subscription`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(json => { if (json.data?.plan) setPlan(json.data.plan) })
        .catch(() => {})
    }
    if (searchParams.get('upgraded') === 'true') {
      setShowToast(true)
      setTimeout(() => setShowToast(false), 6000)
    }
  }, [searchParams, ENGINE_URL])

  async function handleGenerate() {
    if (!rawNotes.trim() || isLimitReached) return
    setLoading(true)
    setError('')
    setNote('')

    try {
      const token = getToken()
      const res = await fetch('/api/generate-note', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ reportType, clientName, workerName, date, duration, clientGoals, mood, activities, incidents, rawNotes }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(res.status === 429
          ? `You've used all ${FREE_LIMIT} free notes this month. Upgrade to Pro for unlimited.`
          : data.error ?? 'Failed to generate note. Please try again.')
        return
      }
      setNote(data.note)
      setUsageCount(prev => prev + 1)
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(note)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-5">
      {showToast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white rounded-xl px-5 py-4 shadow-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">You&apos;re now on Pro!</p>
            <p className="text-green-100 text-xs">Unlimited notes activated.</p>
          </div>
          <button onClick={() => setShowToast(false)} className="ml-2 text-green-200 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Write a Note</h1>
          <p className="text-gray-500 text-sm mt-0.5">Fill in your shift details → get a professional NDIS note instantly</p>
        </div>
        <div className="flex-shrink-0 text-right">
          {isPro ? (
            <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full">PRO · Unlimited</span>
          ) : (
            <div>
              <p className="text-xs text-gray-400 mb-1">Free notes used</p>
              <p className={`text-lg font-bold ${usageCount >= FREE_LIMIT ? 'text-red-500' : 'text-gray-900'}`}>
                {usageCount} <span className="text-gray-300">/</span> {FREE_LIMIT}
              </p>
            </div>
          )}
        </div>
      </div>

      {isLimitReached && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <p className="text-sm text-amber-800">You&apos;ve used all {FREE_LIMIT} free notes this month.</p>
          </div>
          <Link href="/dashboard/billing" className="flex items-center gap-1 text-xs font-semibold bg-amber-500 text-white px-3 py-1.5 rounded-lg hover:bg-amber-600 transition-colors flex-shrink-0">
            Upgrade to Pro <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Input Panel */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-sm">
          <h2 className="font-semibold text-gray-900">Shift Details</h2>

          {/* Report type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Report type <span className="text-red-400">*</span></label>
            <select value={reportType} onChange={e => setReportType(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-gray-50">
              {REPORT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          {/* Client + Worker */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Participant name</label>
              <input type="text" value={clientName} onChange={e => setClientName(e.target.value)}
                placeholder="e.g. John Smith"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-gray-50 focus:bg-white transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Support worker</label>
              <input type="text" value={workerName} onChange={e => setWorkerName(e.target.value)}
                placeholder="Your name"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-gray-50 focus:bg-white transition-colors" />
            </div>
          </div>

          {/* Date + Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration</label>
              <input type="text" value={duration} onChange={e => setDuration(e.target.value)}
                placeholder="e.g. 2 hours"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-gray-50 focus:bg-white transition-colors" />
            </div>
          </div>

          {/* Mood */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Participant mood/presentation</label>
            <select value={mood} onChange={e => setMood(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-gray-50">
              <option value="">Select mood…</option>
              {MOOD_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* NDIS Goals */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Participant NDIS goals <span className="text-gray-400 font-normal">(optional — makes notes richer)</span>
            </label>
            <input type="text" value={clientGoals} onChange={e => setClientGoals(e.target.value)}
              placeholder="e.g. Increase independence in daily living, improve community participation"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-gray-50 focus:bg-white transition-colors" />
          </div>

          {/* Raw notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Your notes <span className="text-red-400">*</span>
              <span className="text-gray-400 font-normal ml-1">— just write what happened</span>
            </label>
            <textarea
              value={rawNotes} onChange={e => setRawNotes(e.target.value)}
              placeholder={`e.g. "john shower good mood talked about birthday chose own clothes no incidents"`}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm resize-none bg-gray-50 focus:bg-white transition-colors"
            />
          </div>

          <button
            onClick={handleGenerate} disabled={loading || !rawNotes.trim() || isLimitReached}
            className="w-full bg-emerald-600 text-white py-3.5 px-6 rounded-xl font-semibold text-sm hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm shadow-emerald-200"
          >
            {loading
              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Generating…</>
              : <><Sparkles className="w-4 h-4" />Generate {reportType}</>}
          </button>
        </div>

        {/* Output Panel */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col shadow-sm min-h-[500px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Your {reportType}</h2>
            {note && (
              <button onClick={copyToClipboard}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all">
                {copied
                  ? <><Check className="w-3.5 h-3.5 text-green-500" /><span className="text-green-600">Copied!</span></>
                  : <><Copy className="w-3.5 h-3.5 text-gray-500" /><span className="text-gray-600">Copy</span></>}
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 mb-4">
              {error}
              {error.includes('limit') && (
                <Link href="/dashboard/billing" className="flex items-center gap-1 mt-2 font-semibold text-emerald-600 hover:underline">
                  Upgrade to Pro <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          )}

          {loading && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm font-medium text-gray-600">Writing your note…</p>
                <p className="text-xs text-gray-400 mt-1">Usually under 5 seconds</p>
              </div>
            </div>
          )}

          {!loading && !note && !error && (
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-xl p-8 text-center">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-7 h-7 text-emerald-400" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">Your professional NDIS note will appear here</p>
              <p className="text-xs text-gray-400 max-w-[220px]">{TIPS[tipIndex]}</p>
            </div>
          )}

          {!loading && note && (
            <div className="flex-1 flex flex-col">
              <div className="flex-1 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap border border-emerald-100">
                {note}
              </div>
              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-gray-400">Always review before submitting</p>
                <button onClick={handleGenerate} disabled={loading}
                  className="text-xs text-emerald-600 hover:text-emerald-800 font-medium flex items-center gap-1 disabled:opacity-50">
                  <Sparkles className="w-3 h-3" /> Regenerate
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {!isPro && usageCount > 0 && !isLimitReached && (
        <p className="text-center text-xs text-gray-400">
          {FREE_LIMIT - usageCount} free note{FREE_LIMIT - usageCount !== 1 ? 's' : ''} left this month ·{' '}
          <Link href="/dashboard/billing" className="text-emerald-600 hover:underline font-medium">Upgrade for unlimited →</Link>
        </p>
      )}
    </div>
  )
}
