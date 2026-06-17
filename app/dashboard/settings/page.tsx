'use client'

import { useEffect, useState } from 'react'
import { getUser, getToken, setUser, ENGINE_URL } from '@/lib/engine'
import { Check, Loader2, Lock, User, AlertCircle } from 'lucide-react'

export default function SettingsPage() {
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [org, setOrg]           = useState('')
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [saveErr, setSaveErr]   = useState('')

  const [curPwd, setCurPwd]     = useState('')
  const [newPwd, setNewPwd]     = useState('')
  const [confPwd, setConfPwd]   = useState('')
  const [pwdSaving, setPwdSaving]   = useState(false)
  const [pwdSaved, setPwdSaved]     = useState(false)
  const [pwdErr, setPwdErr]         = useState('')

  useEffect(() => {
    const user  = getUser()
    if (user) { setName(user.name ?? ''); setEmail(user.email ?? '') }
    const token = getToken()
    if (token) {
      fetch(`${ENGINE_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
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
    setSaveErr('')
    const token = getToken()
    try {
      const res = await fetch(`${ENGINE_URL}/api/auth/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ name, organisation: org }),
      })
      if (!res.ok) { setSaveErr('Could not save. Please try again.'); return }
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch { setSaveErr('Network error. Please try again.') }
    finally   { setSaving(false) }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setPwdErr('')
    if (newPwd.length < 8)  { setPwdErr('New password must be at least 8 characters.'); return }
    if (newPwd !== confPwd) { setPwdErr('Passwords do not match.'); return }
    setPwdSaving(true)
    const token = getToken()
    try {
      const res = await fetch(`${ENGINE_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ currentPassword: curPwd, newPassword: newPwd }),
      })
      const data = await res.json()
      if (!res.ok) { setPwdErr(data.message ?? data.error ?? 'Incorrect current password.'); return }
      setPwdSaved(true)
      setCurPwd(''); setNewPwd(''); setConfPwd('')
      setTimeout(() => setPwdSaved(false), 3000)
    } catch { setPwdErr('Network error. Please try again.') }
    finally   { setPwdSaving(false) }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your account details</p>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <User className="w-4 h-4 text-emerald-600" />
          <h2 className="font-semibold text-gray-900">Profile</h2>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-gray-50 focus:bg-white transition-colors" />
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
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-gray-50 focus:bg-white transition-colors" />
          </div>
          {saveErr && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {saveErr}
            </div>
          )}
          <button type="submit" disabled={saving}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {saving    ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>
             : saved   ? <><Check className="w-4 h-4" />Saved!</>
             : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Password */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <Lock className="w-4 h-4 text-emerald-600" />
          <h2 className="font-semibold text-gray-900">Change Password</h2>
        </div>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Current password</label>
            <input type="password" value={curPwd} onChange={e => setCurPwd(e.target.value)} required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-gray-50 focus:bg-white transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">New password</label>
            <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} required minLength={8}
              placeholder="Minimum 8 characters"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-gray-50 focus:bg-white transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm new password</label>
            <input type="password" value={confPwd} onChange={e => setConfPwd(e.target.value)} required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-gray-50 focus:bg-white transition-colors" />
          </div>
          {pwdErr && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {pwdErr}
            </div>
          )}
          {pwdSaved && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
              <Check className="w-4 h-4" /> Password changed successfully.
            </div>
          )}
          <button type="submit" disabled={pwdSaving || !curPwd || !newPwd || !confPwd}
            className="w-full bg-gray-800 text-white py-3 rounded-xl font-semibold text-sm hover:bg-gray-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {pwdSaving ? <><Loader2 className="w-4 h-4 animate-spin" />Updating…</> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
