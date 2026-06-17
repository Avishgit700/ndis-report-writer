'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, FileText, CreditCard, TrendingUp, RefreshCw, LogOut, Shield, Mail, Calendar, Activity } from 'lucide-react'

const ENGINE_URL    = process.env.NEXT_PUBLIC_ENGINE_URL ?? 'https://saas-engine-production.up.railway.app'
const ORG_ID        = process.env.NEXT_PUBLIC_ORG_ID!
const PROJECT_ID    = process.env.NEXT_PUBLIC_PROJECT_ID!
const API_KEY       = process.env.NEXT_PUBLIC_API_KEY!
const ADMIN_EMAILS  = ['avishkunwar00@gmail.com', 'avishkunwar6@gmail.com', 'ndisadmin2026@gmail.com']

interface NoteRecord  { data?: { userId?: string; clientName?: string; reportType?: string; workerName?: string; llm?: string }; createdAt?: string }
interface SubRecord   { data?: { userId?: string; plan?: string; status?: string; stripeCustomerId?: string }; createdAt?: string }
interface UsageRecord { data?: { userId?: string; action?: string }; createdAt?: string }

interface UserStat {
  id: string; email: string; name: string; createdAt: string
  noteCount: number; plan: string; status: string; lastActive: string
}

export default function AdminPage() {
  const router = useRouter()
  const [authed, setAuthed]     = useState(false)
  const [loading, setLoading]   = useState(true)
  const [users, setUsers]       = useState<UserStat[]>([])
  const [notes, setNotes]       = useState<NoteRecord[]>([])
  const [subs, setSubs]         = useState<SubRecord[]>([])
  const [usage, setUsage]       = useState<UsageRecord[]>([])
  const [lastRefresh, setLast]  = useState<Date>(new Date())

  useEffect(() => {
    const token = localStorage.getItem('ndisrw_token')
    if (!token) { router.replace('/login'); return }
    // verify admin
    fetch(`${ENGINE_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(j => {
        if (!ADMIN_EMAILS.includes(j.data?.email)) { router.replace('/dashboard'); return }
        setAuthed(true)
        loadData()
      })
      .catch(() => router.replace('/login'))
  }, [router])

  async function loadData() {
    setLoading(true)
    try {
      const [notesRes, subsRes, usageRes] = await Promise.all([
        fetch(`${ENGINE_URL}/api/orgs/${ORG_ID}/projects/${PROJECT_ID}/records?entityType=ndis_note&limit=500`,   { headers: { 'X-API-Key': API_KEY } }),
        fetch(`${ENGINE_URL}/api/orgs/${ORG_ID}/projects/${PROJECT_ID}/records?entityType=subscription&limit=200`, { headers: { 'X-API-Key': API_KEY } }),
        fetch(`${ENGINE_URL}/api/orgs/${ORG_ID}/projects/${PROJECT_ID}/records?entityType=usage_event&limit=1000`, { headers: { 'X-API-Key': API_KEY } }),
      ])
      const [nd, sd, ud] = await Promise.all([notesRes.json(), subsRes.json(), usageRes.json()])
      const n: NoteRecord[]  = nd.data?.data ?? []
      const s: SubRecord[]   = sd.data?.data ?? []
      const u: UsageRecord[] = ud.data?.data ?? []
      setNotes(n); setSubs(s); setUsage(u)

      // Build user stats from notes (each unique userId)
      const userMap: Record<string, UserStat> = {}
      n.forEach(note => {
        const uid = note.data?.userId
        if (!uid) return
        if (!userMap[uid]) {
          const sub = s.find(s => s.data?.userId === uid)
          userMap[uid] = {
            id: uid, email: '', name: note.data?.workerName ?? 'Unknown',
            createdAt: note.createdAt ?? '', noteCount: 0,
            plan: sub?.data?.plan ?? 'free', status: sub?.data?.status ?? 'inactive',
            lastActive: note.createdAt ?? '',
          }
        }
        userMap[uid].noteCount++
        if ((note.createdAt ?? '') > userMap[uid].lastActive) userMap[uid].lastActive = note.createdAt ?? ''
      })
      setUsers(Object.values(userMap).sort((a, b) => b.noteCount - a.noteCount))
    } finally {
      setLoading(false)
      setLast(new Date())
    }
  }

  if (!authed) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const proUsers     = subs.filter(s => s.data?.plan === 'pro' && s.data?.status === 'active').length
  const totalRevenue = proUsers * 79
  const thisMonth    = new Date().toISOString().slice(0, 7)
  const notesThisMonth = notes.filter(n => n.createdAt?.startsWith(thisMonth)).length
  const activeUsers  = new Set(usage.filter(u => u.createdAt?.startsWith(thisMonth)).map(u => u.data?.userId)).size

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-black text-white">NoteScribe Admin</p>
            <p className="text-xs text-gray-500">Last updated: {lastRefresh.toLocaleTimeString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadData} disabled={loading}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button onClick={() => { localStorage.removeItem('ndisrw_token'); router.replace('/login') }}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Users,      label: 'Total Users',        value: users.length,        sub: `${activeUsers} active this month`, color: 'emerald' },
            { icon: CreditCard, label: 'Pro Subscribers',    value: proUsers,            sub: `$${totalRevenue} MRR`,             color: 'blue'    },
            { icon: FileText,   label: 'Notes This Month',   value: notesThisMonth,      sub: `${notes.length} total all time`,   color: 'purple'  },
            { icon: TrendingUp, label: 'Monthly Revenue',    value: `$${totalRevenue}`,  sub: `AUD · ${proUsers} × $79`,          color: 'amber'   },
          ].map(({ icon: Icon, label, value, sub, color }) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
                color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' :
                color === 'blue'    ? 'bg-blue-500/20 text-blue-400'       :
                color === 'purple'  ? 'bg-purple-500/20 text-purple-400'   :
                                      'bg-amber-500/20 text-amber-400'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-white">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
              <p className="text-xs text-gray-600 mt-1">{sub}</p>
            </div>
          ))}
        </div>

        {/* Revenue breakdown */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Revenue Breakdown
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: 'This month MRR',   value: `$${totalRevenue} AUD`,        color: 'text-emerald-400' },
              { label: 'Annual run rate',  value: `$${totalRevenue * 12} AUD`,   color: 'text-blue-400'    },
              { label: 'Free users',       value: users.length - proUsers,       color: 'text-gray-400'    },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white/5 rounded-xl p-4">
                <p className={`text-xl font-black ${color}`}>{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Users table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" /> Users ({users.length})
            </h2>
            <span className="text-xs text-gray-500">{proUsers} Pro · {users.length - proUsers} Free</span>
          </div>
          {loading ? (
            <div className="p-12 text-center text-gray-500 text-sm">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-gray-500 text-sm">No users yet — share the app to get signups</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-xs text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3 text-left">User</th>
                    <th className="px-6 py-3 text-left">Plan</th>
                    <th className="px-6 py-3 text-left">Notes</th>
                    <th className="px-6 py-3 text-left">Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0">
                            {u.name?.[0]?.toUpperCase() ?? '?'}
                          </div>
                          <div>
                            <p className="font-medium text-white">{u.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500 font-mono">{u.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          u.plan === 'pro' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                             'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {u.plan.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{u.noteCount}</span>
                          <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min((u.noteCount / 20) * 100, 100)}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-gray-400 text-xs">
                        {u.lastActive ? new Date(u.lastActive).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent notes */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" /> Recent Notes ({notes.length} total)
            </h2>
          </div>
          <div className="divide-y divide-white/5">
            {notes.slice(0, 10).map((note, i) => (
              <div key={i} className="px-6 py-3 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-white font-medium">{note.data?.reportType ?? 'Note'} — {note.data?.clientName ?? 'Unknown client'}</p>
                    <p className="text-xs text-gray-500">by {note.data?.workerName ?? '?'} · via {note.data?.llm ?? 'AI'}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-600 flex-shrink-0 ml-4">
                  {note.createdAt ? new Date(note.createdAt).toLocaleDateString('en-AU') : '—'}
                </span>
              </div>
            ))}
            {notes.length === 0 && <div className="px-6 py-8 text-center text-gray-500 text-sm">No notes generated yet</div>}
          </div>
        </div>

        {/* Leads / email capture */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-400" /> Outreach Tips
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-400">
            <div className="bg-white/5 rounded-xl p-4">
              <p className="font-bold text-white mb-2">🎯 Get first 10 users</p>
              <ul className="space-y-1.5">
                <li>· Post in "NDIS Support Workers Australia" Facebook group</li>
                <li>· Share before/after note screenshot on LinkedIn</li>
                <li>· Post in r/australia and r/NDIS on Reddit</li>
              </ul>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="font-bold text-white mb-2">💰 Get first provider</p>
              <ul className="space-y-1.5">
                <li>· Google "NDIS provider [your city]"</li>
                <li>· Email ops manager — offer 1 month free trial</li>
                <li>· 10 workers = $790/month</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
