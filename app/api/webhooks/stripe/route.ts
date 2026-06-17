import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'

const ENGINE_URL = process.env.NEXT_PUBLIC_ENGINE_URL ?? 'https://saas-engine-production.up.railway.app'
const ORG_ID     = process.env.SAAS_ENGINE_ORG_ID!
const PROJECT_ID = process.env.SAAS_ENGINE_PROJECT_ID!
const API_KEY    = process.env.SAAS_ENGINE_API_KEY!

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' })
}

async function saveSubscription(data: Record<string, unknown>) {
  await fetch(`${ENGINE_URL}/api/orgs/${ORG_ID}/projects/${PROJECT_ID}/records`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
    body:    JSON.stringify({ entityType: 'subscription', data }),
  }).catch(console.error)
}

export async function POST(request: NextRequest) {
  const body      = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const stripe = getStripe()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId  = session.metadata?.userId
      if (userId && session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string)
        await saveSubscription({
          userId,
          stripeCustomerId:     session.customer,
          stripeSubscriptionId: sub.id,
          plan: 'pro', status: 'active',
          updatedAt: new Date().toISOString(),
        })
      }
      break
    }
    case 'customer.subscription.updated': {
      const sub    = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.userId
      await saveSubscription({
        userId:               userId ?? null,
        stripeCustomerId:     sub.customer,
        stripeSubscriptionId: sub.id,
        plan:   sub.status === 'active' ? 'pro' : 'free',
        status: sub.status,
        updatedAt: new Date().toISOString(),
      })
      break
    }
    case 'customer.subscription.deleted': {
      const sub    = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.userId
      await saveSubscription({
        userId:               userId ?? null,
        stripeCustomerId:     sub.customer,
        stripeSubscriptionId: sub.id,
        plan: 'free', status: 'canceled',
        updatedAt: new Date().toISOString(),
      })
      break
    }
  }

  return NextResponse.json({ received: true })
}
