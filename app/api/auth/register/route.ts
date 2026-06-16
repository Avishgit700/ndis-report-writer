import { NextRequest, NextResponse } from 'next/server'

const ENGINE_URL = process.env.NEXT_PUBLIC_ENGINE_URL
  ?? process.env.ENGINE_URL
  ?? 'https://saas-engine-production.up.railway.app'

const ORG_ID  = process.env.SAAS_ENGINE_ORG_ID  ?? '2127e648-2d40-42e6-8453-1e66c50b3b00'
const API_KEY = process.env.SAAS_ENGINE_API_KEY  ?? ''

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const res = await fetch(`${ENGINE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()

    if (res.ok && data.data?.user?.id && API_KEY) {
      fetch(`${ENGINE_URL}/api/orgs/${ORG_ID}/members/by-user-id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
        body: JSON.stringify({ userId: data.data.user.id, role: 'MEMBER' }),
      }).catch(() => {})
    }

    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Registration failed' },
      { status: 500 }
    )
  }
}
