'use client'

import { useEffect, useState } from 'react'
import { getToken, getUser } from '@/lib/engine'
import { Users, Plus, X, Check, Loader2 } from 'lucide-react'

interface ClientRecord {
  id: string
  data: {
    name?: string
    ndisNumber?: string
    dob?: string
    diagnosis?: string
    goals?: string
    supports?: string
  }
  createdAt: string
}

const ENGINE_URL = process.env.NEXT_PUBLIC_ENGINE_URL ?? 'https://saas-engine-production.up.railway.app'

export default function ClientsPage() {
  const [clients, setClients]     = useState<ClientRecord[]>([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)
  const [form, setForm]           = useState({
    name: '', ndisNumber: '', dob: '', diagnosis: '', goals: '', supports: '',
  })

  useEffect(() => {
    fetch(`${ENGINE_URL}/api/orgs/${process.env.NEXT_PUBLIC_ORG_ID}/projects/${process.env.NEXT_PUBLIC_PROJECT_ID}/records?entityType=client_profile&limit=200`, {
      headers: { 'X-API-Key': process.env.NEXT_PUBLIC_API_KEY ?? '' },
    })
      .then(r => r.json())
      .then(d => setClients(d.data?.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function saveClient() {
    if (!form.name.trim()) return
    setSaving(true)
    const user = getUser()
    await fetch(`${ENGINE_URL}/api/orgs/${process.env.NEXT_PUBLIC_ORG_ID}/projects/${process.env.NEXT_PUBLIC_PROJECT_ID}/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': process.env.NEXT_PUBLIC_API_KEY ?? '' },
      body: JSON.stringify({ entityType: 'client_profile', data: { ...form, userId: user?.id } }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.data) setClients(prev => [d.data, ...prev])
        setSaved(true)
        setShowForm(false)
        setForm({ name: '', ndisNumber: '', dob: '', diagnosis: '', goals: '', supports: '' })
        setTimeout(() => setSaved(false), 2000)
      })
      .catch(() => {})
      .finally(() => setSaving(false))
  }

  const _ = getToken() // ensure token used

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Profiles</h1>
          <p className="text-gray-500 text-sm mt-0.5">Save participant details to speed up note generation</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Client
        </button>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-green-700">
          <Check className="w-4 h-4" /> Client profile saved!
        </div>
      )}

      {/* Add client form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">New Client Profile</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name <span className="text-red-400">*</span></label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Participant's full name"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">NDIS number</label>
              <input type="text" value={form.ndisNumber} onChange={e => setForm(f => ({ ...f, ndisNumber: e.target.value }))}
                placeholder="43x xxx xxxx"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date of birth</label>
              <input type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-gray-50" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">NDIS goals</label>
              <textarea value={form.goals} onChange={e => setForm(f => ({ ...f, goals: e.target.value }))}
                placeholder="e.g. Increase independence in daily living, improve communication, build community connections"
                rows={2}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-gray-50 resize-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Current supports</label>
              <input type="text" value={form.supports} onChange={e => setForm(f => ({ ...f, supports: e.target.value }))}
                placeholder="e.g. Daily personal care, weekly community access, OT monthly"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-gray-50" />
            </div>
          </div>
          <button onClick={saveClient} disabled={saving || !form.name.trim()}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : 'Save Client Profile'}
          </button>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && clients.length === 0 && !showForm && (
        <div className="text-center py-16">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7 text-emerald-300" />
          </div>
          <p className="text-gray-500 font-medium">No client profiles yet</p>
          <p className="text-gray-400 text-sm mt-1">Add your participants once — notes will be pre-filled every time.</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {clients.map(client => (
          <div key={client.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center font-bold text-emerald-600 text-sm flex-shrink-0">
                {(client.data.name ?? '?')[0]}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-900">{client.data.name}</p>
                {client.data.ndisNumber && <p className="text-xs text-gray-400 mt-0.5">NDIS: {client.data.ndisNumber}</p>}
                {client.data.goals && (
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    <span className="font-medium text-gray-700">Goals:</span> {client.data.goals}
                  </p>
                )}
                {client.data.supports && (
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    <span className="font-medium text-gray-700">Supports:</span> {client.data.supports}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
