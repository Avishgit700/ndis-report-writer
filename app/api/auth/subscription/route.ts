import { NextRequest, NextResponse } from 'next/server'

const ENGINE_URL = process.env.NEXT_PUBLIC_ENGINE_URL ?? 'https://saas-engine-production.up.railway.app'
const ORG_ID     = process.env.SAAS_ENGINE_ORG_ID!
const PROJECT_ID = process.env.SAAS_ENGINE_PROJECT_ID!
const API_KEY    = process.env.SAAS_ENGINE_API_KEY!

async function getEngineUser(token: string) {
  const res = await fetch(`${ENGINE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return null
  return (await res.json()).data as { id: string } | null
}

export async function GET(request: NextRequest) {
  const token = (request.headers.get('Authorization') ?? '').replace('Bearer ', '').trim()
  if (!token) return NextResponse.json({ data: { plan: 'free' } })

  const user = await getEngineUser(token)
  if (!user) return NextResponse.json({ data: { plan: 'free' } })

  // Find the most recent active subscription record for this user
  const res = await fetch(
    `${ENGINE_URL}/api/orgs/${ORG_ID}/projects/${PROJECT_ID}/records?entityType=subscription&limit=100`,
    { headers: { 'X-API-Key': API_KEY } }
  )
  if (!res.ok) return NextResponse.json({ data: { plan: 'free' } })

  const json = await res.json()
  const records: Array<{ data?: { userId?: string; plan?: string; status?: string } }> =
    json.data?.data ?? []

  const active = records.find(
    r => r.data?.userId === user.id && r.data?.status === 'active'
  )

  return NextResponse.json({ data: { plan: active?.data?.plan ?? 'free' } })
}
