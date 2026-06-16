'use client'

import { useEffect, useState } from 'react'
import { getUser, getToken, setUser, ENGINE_URL } from '@/lib/engine'
import { Check, Loader2 } from 'lucide-react'

export default function SettingsPage() {
  const [name, setName]     = useState('')
  const [email, setEmail]   = useState('')
  const [org, setOrg]       = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)

  useEffect(() => {
    const user = getUser()
    if (user) {
      setName(user.name ?? '')
      setEmail(user.email ?? '')
    }
    const token = getToken()
    if (token) {
      fetch(`${ENGINE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(json => {
          if (json.data) {
            setName(json.data.name ?? '')
            setEmail(json.data.email ?? '')
            setOrg(json.data.organisation ?? '')
            setUser(json.data)
          }
        })
        .catch(() => {})
    }
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const token = getToken()
    try {
      await fetch(`${ENGINE_URL}/api/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name, organisation: org }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your account details</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-5">Account</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input type="email" value={email} disabled
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-400 text-sm bg-gray-50 cursor-not-allowed" />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Organisation / Provider name</label>
            <input type="text" value={org} onChange={e => setOrg(e.target.value)}
              placeholder="e.g. Sunrise Disability Services"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-gray-50" />
          </div>
          <button type="submit" disabled={saving}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>
              : saved
                ? <><Check className="w-4 h-4" />Saved!</>
                : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
