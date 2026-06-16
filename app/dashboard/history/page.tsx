'use client'

import { useEffect, useState } from 'react'
import { getToken } from '@/lib/engine'
import { FileText, Copy, Check, Search, ChevronDown, ChevronUp } from 'lucide-react'

interface NoteRecord {
  id: string
  data: {
    clientName?: string
    reportType?: string
    generatedNote?: string
    rawInput?: string
    workerName?: string
    duration?: string
    date?: string
  }
  createdAt: string
}

const ENGINE_URL = process.env.NEXT_PUBLIC_ENGINE_URL ?? 'https://saas-engine-production.up.railway.app'

export default function HistoryPage() {
  const [notes, setNotes]         = useState<NoteRecord[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [expanded, setExpanded]   = useState<string | null>(null)
  const [copied, setCopied]       = useState<string | null>(null)

  useEffect(() => {
    const token = getToken()
    if (!token) return
    fetch(`${ENGINE_URL}/api/orgs/${process.env.NEXT_PUBLIC_ORG_ID}/projects/${process.env.NEXT_PUBLIC_PROJECT_ID}/records?entityType=ndis_note&limit=100`, {
      headers: { 'X-API-Key': process.env.NEXT_PUBLIC_API_KEY ?? '' },
    })
      .then(r => r.json())
      .then(d => setNotes(d.data?.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = notes.filter(n => {
    const q = search.toLowerCase()
    return (
      n.data.clientName?.toLowerCase().includes(q) ||
      n.data.reportType?.toLowerCase().includes(q) ||
      n.data.generatedNote?.toLowerCase().includes(q)
    )
  })

  async function copy(id: string, text: string) {
    await navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Note History</h1>
          <p className="text-gray-500 text-sm mt-0.5">All your generated NDIS notes</p>
        </div>
        <span className="text-sm text-gray-400">{notes.length} notes</span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by participant name or note content…"
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7 text-emerald-300" />
          </div>
          <p className="text-gray-500 font-medium">No notes yet</p>
          <p className="text-gray-400 text-sm mt-1">Generate your first note from the Write Note tab.</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(note => (
          <div key={note.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div
              className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpanded(expanded === note.id ? null : note.id)}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {note.data.clientName || 'Unknown participant'} — {note.data.reportType || 'Note'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {note.data.date || new Date(note.createdAt).toLocaleDateString('en-AU')}
                    {note.data.duration ? ` · ${note.data.duration}` : ''}
                    {note.data.workerName ? ` · ${note.data.workerName}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                <button
                  onClick={e => { e.stopPropagation(); copy(note.id, note.data.generatedNote ?? '') }}
                  className="p-1.5 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                  title="Copy note"
                >
                  {copied === note.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
                {expanded === note.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </div>
            </div>
            {expanded === note.id && (
              <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Generated note</p>
                <div className="bg-emerald-50 rounded-xl p-4 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap border border-emerald-100">
                  {note.data.generatedNote}
                </div>
                {note.data.rawInput && (
                  <>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4">Original notes</p>
                    <div className="bg-gray-50 rounded-xl p-3 text-gray-500 text-xs italic border border-gray-200">
                      {note.data.rawInput}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
