import { Ollama } from '@langchain/ollama'
import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const ENGINE_URL  = process.env.NEXT_PUBLIC_ENGINE_URL ?? 'https://saas-engine-production.up.railway.app'
const ORG_ID      = process.env.SAAS_ENGINE_ORG_ID!
const PROJECT_ID  = process.env.SAAS_ENGINE_PROJECT_ID!
const API_KEY     = process.env.SAAS_ENGINE_API_KEY!
const USE_LOCAL   = process.env.USE_LOCAL_LLM === 'true'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'llama3'

interface NoteRecord {
  data?: {
    userId?: string
    clientName?: string
    reportType?: string
    generatedNote?: string
    rawInput?: string
    workerName?: string
    date?: string
  }
  createdAt?: string
}

async function getEngineUser(token: string) {
  const res = await fetch(`${ENGINE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return null
  return (await res.json()).data as { id: string; name: string; email: string } | null
}

async function getUserNotes(userId: string): Promise<NoteRecord[]> {
  const res = await fetch(
    `${ENGINE_URL}/api/orgs/${ORG_ID}/projects/${PROJECT_ID}/records?entityType=ndis_note&limit=200`,
    { headers: { 'X-API-Key': API_KEY } }
  )
  if (!res.ok) return []
  const json = await res.json()
  const all: NoteRecord[] = json.data?.data ?? []
  return all.filter(r => r.data?.userId === userId)
}

function analyseNotes(notes: NoteRecord[]) {
  if (notes.length === 0) return null

  // Count report types
  const typeCounts: Record<string, number> = {}
  notes.forEach(n => {
    const t = n.data?.reportType ?? 'Unknown'
    typeCounts[t] = (typeCounts[t] ?? 0) + 1
  })

  // Unique clients
  const clients = [...new Set(notes.map(n => n.data?.clientName).filter(Boolean))]

  // Avg note length
  const avgLength = Math.round(
    notes.reduce((sum, n) => sum + (n.data?.generatedNote?.split(' ').length ?? 0), 0) / notes.length
  )

  // Goal language usage
  const goalKeywords = ['goal', 'independence', 'community', 'communication', 'capacity', 'progress', 'skill']
  const withGoalLang = notes.filter(n =>
    goalKeywords.some(k => n.data?.generatedNote?.toLowerCase().includes(k))
  ).length
  const goalLangPct = Math.round((withGoalLang / notes.length) * 100)

  // Follow-up language
  const withFollowup = notes.filter(n =>
    ['follow', 'recommend', 'review', 'monitor'].some(k =>
      n.data?.generatedNote?.toLowerCase().includes(k)
    )
  ).length
  const followupPct = Math.round((withFollowup / notes.length) * 100)

  // Person-centred language (bad patterns)
  const workerCentred = notes.filter(n => {
    const note = n.data?.generatedNote?.toLowerCase() ?? ''
    return note.includes('i helped') || note.includes('we helped') || note.includes('i assisted') || note.includes('we made')
  }).length
  const personCentredPct = Math.round(((notes.length - workerCentred) / notes.length) * 100)

  // Recent 5 notes summary
  const recentSample = notes
    .slice(0, 5)
    .map(n => `- [${n.data?.reportType}] ${n.data?.clientName}: "${(n.data?.generatedNote ?? '').substring(0, 120)}..."`)
    .join('\n')

  return {
    totalNotes: notes.length,
    uniqueClients: clients.length,
    clientNames: clients.slice(0, 10),
    typeCounts,
    avgWordLength: avgLength,
    goalLanguagePct: goalLangPct,
    followupPct,
    personCentredPct,
    workerCentredCount: workerCentred,
    recentSample,
  }
}

async function generateAdvice(analysis: NonNullable<ReturnType<typeof analyseNotes>>, workerName: string, question: string): Promise<string> {
  const systemPrompt = `You are an expert NDIS documentation coach and quality advisor for Australian disability support workers.
You analyse real note-writing patterns and give specific, practical, encouraging feedback.
Focus on: person-centred language, NDIS goal linkage, documentation compliance, and professional development.
Be warm, specific, and actionable. Reference the actual data provided. Keep responses under 400 words.`

  const dataContext = `
WORKER: ${workerName}
TOTAL NOTES WRITTEN: ${analysis.totalNotes}
UNIQUE PARTICIPANTS: ${analysis.uniqueClients} (${analysis.clientNames.join(', ')})
REPORT TYPES USED: ${Object.entries(analysis.typeCounts).map(([k, v]) => `${k}: ${v}`).join(', ')}
AVERAGE NOTE LENGTH: ${analysis.avgWordLength} words
GOAL-LINKED LANGUAGE: ${analysis.goalLanguagePct}% of notes reference NDIS goals
FOLLOW-UP INCLUDED: ${analysis.followupPct}% of notes include recommended follow-up
PERSON-CENTRED LANGUAGE: ${analysis.personCentredPct}% (${analysis.workerCentredCount} notes had worker-centred language)

RECENT NOTE SAMPLES:
${analysis.recentSample}

WORKER'S QUESTION: ${question || 'Give me an overall quality review and top 3 things to improve.'}`

  if (USE_LOCAL) {
    const llm = new Ollama({ model: OLLAMA_MODEL, baseUrl: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434', temperature: 0.4 })
    return (await llm.invoke(`${systemPrompt}\n\n${dataContext}`)).trim()
  } else {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: systemPrompt,
      messages: [{ role: 'user', content: dataContext }],
    })
    return msg.content.filter(b => b.type === 'text').map(b => (b as { type: 'text'; text: string }).text).join('')
  }
}

export async function POST(request: NextRequest) {
  const token = (request.headers.get('Authorization') ?? '').replace('Bearer ', '').trim()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getEngineUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const question: string = body.question ?? ''

  const notes    = await getUserNotes(user.id)
  const analysis = analyseNotes(notes)

  if (!analysis) {
    return NextResponse.json({
      advice: `Hi ${user.name}! You haven't written any notes yet. Generate your first NDIS progress note from the Write Note tab, then come back here for personalised coaching based on your real documentation patterns.`,
      analysis: null,
    })
  }

  const advice = await generateAdvice(analysis, user.name, question)

  return NextResponse.json({ advice, analysis })
}
