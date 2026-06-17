'use client'

import { useEffect, useState } from 'react'
import { getToken } from '@/lib/engine'
import { Brain, Sparkles, TrendingUp, Users, FileText, Target, MessageSquare, Loader2, Send } from 'lucide-react'

interface Analysis {
  totalNotes: number
  uniqueClients: number
  clientNames: string[]
  typeCounts: Record<string, number>
  avgWordLength: number
  goalLanguagePct: number
  followupPct: number
  personCentredPct: number
  workerCentredCount: number
}

const QUICK_QUESTIONS = [
  'What are my top 3 documentation weaknesses?',
  'How can I improve my goal-linked language?',
  'Which client needs more varied note types?',
  'What would an NDIS auditor flag in my notes?',
  'Give me example sentences to make my notes more person-centred.',
]

export default function AdvisorPage() {
  const [advice, setAdvice]       = useState('')
  const [analysis, setAnalysis]   = useState<Analysis | null>(null)
  const [loading, setLoading]     = useState(false)
  const [question, setQuestion]   = useState('')
  const [hasLoaded, setHasLoaded] = useState(false)

  async function fetchAdvice(q = '') {
    setLoading(true)
    setAdvice('')
    try {
      const token = getToken()
      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ question: q }),
      })
      const data = await res.json()
      setAdvice(data.advice ?? '')
      setAnalysis(data.analysis ?? null)
      setHasLoaded(true)
    } catch {
      setAdvice('Could not connect to advisor. Make sure Ollama is running (ollama serve).')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAdvice() }, [])

  function handleAsk(q: string) {
    setQuestion('')
    fetchAdvice(q)
  }

  const scoreColor = (pct: number) =>
    pct >= 80 ? 'text-green-600' : pct >= 60 ? 'text-amber-500' : 'text-red-500'

  const scoreBg = (pct: number) =>
    pct >= 80 ? 'bg-green-50 border-green-200' : pct >= 60 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="w-6 h-6 text-emerald-600" /> AI Documentation Coach
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Powered by local llama3 · Analyses your real notes · Gives personalised NDIS advice
          </p>
        </div>
        <button
          onClick={() => fetchAdvice(question)}
          disabled={loading}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats grid */}
      {analysis && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span className="text-xs text-gray-500 font-medium">Total Notes</span>
            </div>
            <p className="text-3xl font-black text-gray-900">{analysis.totalNotes}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span className="text-xs text-gray-500 font-medium">Participants</span>
            </div>
            <p className="text-3xl font-black text-gray-900">{analysis.uniqueClients}</p>
          </div>
          <div className={`rounded-2xl border p-4 shadow-sm ${scoreBg(analysis.personCentredPct)}`}>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-emerald-600" />
              <span className="text-xs text-gray-500 font-medium">Person-centred</span>
            </div>
            <p className={`text-3xl font-black ${scoreColor(analysis.personCentredPct)}`}>
              {analysis.personCentredPct}%
            </p>
          </div>
          <div className={`rounded-2xl border p-4 shadow-sm ${scoreBg(analysis.goalLanguagePct)}`}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="text-xs text-gray-500 font-medium">Goal-linked</span>
            </div>
            <p className={`text-3xl font-black ${scoreColor(analysis.goalLanguagePct)}`}>
              {analysis.goalLanguagePct}%
            </p>
          </div>
        </div>
      )}

      {/* Quality bars */}
      {analysis && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Documentation Quality Scores</h2>
          <div className="space-y-4">
            {[
              { label: 'Person-centred language',    pct: analysis.personCentredPct,  tip: 'Participant as active agent, not passive recipient' },
              { label: 'Goal-linked documentation',  pct: analysis.goalLanguagePct,   tip: 'Notes reference NDIS goals and progress' },
              { label: 'Follow-up recommendations',  pct: analysis.followupPct,       tip: 'Each note suggests next steps or monitoring' },
              { label: 'Note length (target 150w+)', pct: Math.min(100, Math.round(analysis.avgWordLength / 1.5)), tip: `Current average: ${analysis.avgWordLength} words` },
            ].map(({ label, pct, tip }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                  <span className={`text-sm font-bold ${scoreColor(pct)}`}>{pct}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-700 ${pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-amber-400' : 'bg-red-400'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{tip}</p>
              </div>
            ))}
          </div>

          {/* Report type breakdown */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-700 mb-3">Report types written</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(analysis.typeCounts).map(([type, count]) => (
                <span key={type} className="text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full">
                  {type}: <strong>{count}</strong>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Advice panel */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Brain className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">llama3 Documentation Advisor</p>
            <p className="text-xs text-gray-400">Running locally · Your data never leaves your machine</p>
          </div>
        </div>

        {loading && (
          <div className="flex items-center gap-3 py-8 justify-center">
            <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
            <p className="text-sm text-gray-500">Analysing your notes with llama3…</p>
          </div>
        )}

        {!loading && advice && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
            {advice}
          </div>
        )}

        {!loading && !advice && hasLoaded && (
          <p className="text-gray-400 text-sm text-center py-6">No advice generated yet.</p>
        )}
      </div>

      {/* Ask a question */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-600" /> Ask the Advisor
        </h2>

        {/* Quick questions */}
        <div className="flex flex-wrap gap-2 mb-4">
          {QUICK_QUESTIONS.map(q => (
            <button
              key={q}
              onClick={() => handleAsk(q)}
              disabled={loading}
              className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Custom question */}
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && question.trim() && handleAsk(question)}
            placeholder="Ask anything about your documentation quality…"
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-gray-50"
          />
          <button
            onClick={() => question.trim() && handleAsk(question)}
            disabled={loading || !question.trim()}
            className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-1.5 text-sm font-semibold"
          >
            <Send className="w-3.5 h-3.5" /> Ask
          </button>
        </div>
      </div>
    </div>
  )
}
