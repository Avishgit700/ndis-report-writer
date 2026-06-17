import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 120

const ENGINE_URL  = process.env.NEXT_PUBLIC_ENGINE_URL ?? 'https://saas-engine-production.up.railway.app'
const ORG_ID      = process.env.SAAS_ENGINE_ORG_ID!
const PROJECT_ID  = process.env.SAAS_ENGINE_PROJECT_ID!
const API_KEY     = process.env.SAAS_ENGINE_API_KEY!
const FREE_LIMIT  = 5

const USE_GEMINI      = process.env.USE_GEMINI === 'true'
const USE_LOCAL_LLM   = process.env.USE_LOCAL_LLM === 'true'
const OLLAMA_MODEL    = process.env.OLLAMA_MODEL ?? 'llama3'
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'

const SYSTEM_PROMPT = `You are an expert NDIS documentation assistant. You write professional, compliant, and person-centred NDIS support documentation for Australian disability support workers.

Your notes must:
- Use person-centred language (e.g. "John chose" not "John was told to", "John demonstrated" not "we made John")
- Reference the participant's NDIS goals where provided
- Include measurable, observable outcomes and progress indicators
- Use professional, clinical-appropriate tone without jargon
- Comply with NDIS Practice Standards and Quality and Safeguards Commission requirements
- Never include medical diagnoses or clinical conclusions unless the worker explicitly stated them
- Be structured clearly with observable facts, then outcomes/progress, then recommended follow-up
- Be 150–250 words for progress notes; longer for support plans or functional assessments

For Progress Notes: observations → mood/engagement → activities → goal progress → incidents (if any) → follow-up
For Incident Reports: what happened → immediate response → outcome → follow-up actions required
For Support Plans: participant overview → current supports → goals → strategies → review date
For Handover Notes: shift summary → key observations → pending tasks → follow-up required

Output ONLY the note text — no preamble, no labels like "Here is your note:", no quotes.`

async function generateWithOllama(userPrompt: string): Promise<string> {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model:  OLLAMA_MODEL,
      prompt: `${SYSTEM_PROMPT}\n\n${userPrompt}`,
      stream: true,
      options: { temperature: 0.3, num_predict: 600 },
    }),
  })
  if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`)

  // Read the NDJSON stream and collect all tokens
  const reader  = res.body!.getReader()
  const decoder = new TextDecoder()
  let output    = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value, { stream: true })
    for (const line of chunk.split('\n')) {
      if (!line.trim()) continue
      try {
        const json = JSON.parse(line) as { response?: string; done?: boolean }
        if (json.response) output += json.response
        if (json.done) break
      } catch { /* skip malformed lines */ }
    }
  }
  return output.trim()
}

async function generateWithGemini(userPrompt: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
  const result = await model.generateContent(`${SYSTEM_PROMPT}\n\n${userPrompt}`)
  return result.response.text().trim()
}

async function generateWithClaude(userPrompt: string): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 800,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  })
  return message.content
    .filter(block => block.type === 'text')
    .map(block => (block as { type: 'text'; text: string }).text)
    .join('')
}

async function getEngineUser(token: string) {
  const res = await fetch(`${ENGINE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return null
  const json = await res.json()
  return json.data as { id: string; email: string; name: string } | null
}

async function getUserPlan(userId: string): Promise<string> {
  try {
    const res = await fetch(
      `${ENGINE_URL}/api/orgs/${ORG_ID}/projects/${PROJECT_ID}/records?entityType=subscription&limit=100`,
      { headers: { 'X-API-Key': API_KEY } }
    )
    if (!res.ok) return 'free'
    const json = await res.json()
    const records: Array<{ data?: { userId?: string; plan?: string; status?: string } }> =
      json.data?.data ?? []
    const active = records.find(r => r.data?.userId === userId && r.data?.status === 'active')
    return active?.data?.plan ?? 'free'
  } catch {
    return 'free'
  }
}

async function getUsageCount(userId: string): Promise<number> {
  const res = await fetch(
    `${ENGINE_URL}/api/orgs/${ORG_ID}/projects/${PROJECT_ID}/records?entityType=usage_event&limit=1000`,
    { headers: { 'X-API-Key': API_KEY } }
  )
  if (!res.ok) return 0
  const json = await res.json()
  const records: Array<{ data?: { userId?: string }; createdAt?: string }> = json.data?.data ?? []
  const currentMonth = new Date().toISOString().slice(0, 7)
  return records.filter(r =>
    r.data?.userId === userId && r.createdAt?.startsWith(currentMonth)
  ).length
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization') ?? ''
  const token = authHeader.replace('Bearer ', '').trim()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getEngineUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const plan: string = await getUserPlan(user.id)
  const isPro = plan === 'pro'

  if (!isPro) {
    const used = await getUsageCount(user.id)
    if (used >= FREE_LIMIT) {
      return NextResponse.json(
        { error: `Monthly limit reached. You've used all ${FREE_LIMIT} free notes. Upgrade to Pro for unlimited.` },
        { status: 429 }
      )
    }
  }

  const body = await request.json()
  const { reportType, clientName, workerName, date, duration, clientGoals, rawNotes, mood, activities, incidents } = body

  if (!rawNotes?.trim()) {
    return NextResponse.json({ error: 'Notes are required' }, { status: 400 })
  }

  const userPrompt = `Write a professional NDIS ${reportType || 'Progress Note'} based on the following:

Participant: ${clientName || 'Participant'}
Date: ${date || new Date().toLocaleDateString('en-AU')}
Support Worker: ${workerName || user.name || 'Support Worker'}
Duration: ${duration || 'Not specified'}
${clientGoals ? `Participant's NDIS Goals: ${clientGoals}` : ''}
${mood ? `Participant mood/presentation: ${mood}` : ''}
${activities ? `Activities completed: ${activities}` : ''}
${incidents ? `Incidents/concerns: ${incidents}` : 'No incidents to report.'}

Worker's raw notes:
"${rawNotes}"

Write the ${reportType || 'progress note'} now.`

  try {
    let noteText: string
    let llmUsed: string

    if (USE_GEMINI) {
      console.log('[LLM] Using Gemini 2.0 Flash')
      try {
        noteText = await generateWithGemini(userPrompt)
        llmUsed  = 'gemini-2.0-flash'
      } catch (e) {
        console.warn('[LLM] Gemini failed, falling back to Ollama:', e)
        noteText = await generateWithOllama(userPrompt)
        llmUsed  = OLLAMA_MODEL
      }
    } else if (USE_LOCAL_LLM) {
      console.log(`[LLM] Using Ollama — model: ${OLLAMA_MODEL}`)
      noteText = await generateWithOllama(userPrompt)
      llmUsed  = OLLAMA_MODEL
    } else {
      console.log('[LLM] Using Claude API')
      noteText = await generateWithClaude(userPrompt)
      llmUsed  = 'claude-haiku'
    }

    if (!noteText) {
      return NextResponse.json({ error: 'Failed to generate note' }, { status: 500 })
    }

    // Save note + log usage (fire-and-forget)
    Promise.all([
      fetch(`${ENGINE_URL}/api/orgs/${ORG_ID}/projects/${PROJECT_ID}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
        body: JSON.stringify({
          entityType: 'ndis_note',
          data: { userId: user.id, clientName, reportType, generatedNote: noteText, rawInput: rawNotes, workerName, duration, date, llm: llmUsed },
        }),
      }),
      fetch(`${ENGINE_URL}/api/orgs/${ORG_ID}/projects/${PROJECT_ID}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
        body: JSON.stringify({
          entityType: 'usage_event',
          data: { userId: user.id, plan, action: 'generate_note' },
        }),
      }),
    ]).catch(console.error)

    return NextResponse.json({ note: noteText, llm: llmUsed })
  } catch (error) {
    console.error('AI generation error:', error)
    return NextResponse.json({ error: 'AI generation failed. Please try again.' }, { status: 500 })
  }
}
