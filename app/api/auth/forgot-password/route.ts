import { NextRequest, NextResponse } from 'next/server'

const ENGINE_URL = process.env.NEXT_PUBLIC_ENGINE_URL ?? 'https://saas-engine-production.up.railway.app'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const res = await fetch(`${ENGINE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Failed to send reset email' },
      { status: 500 }
    )
  }
}
