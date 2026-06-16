import Link from 'next/link'
import { FileText } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-gray-900">NoteScribe AI</span>
          </Link>
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-16 prose prose-gray">
        <h1>Terms of Service</h1>
        <p className="text-gray-500 text-sm">Last updated: June 2026</p>
        <h2>Service</h2>
        <p>NoteScribe AI provides an AI-assisted NDIS documentation tool for support workers and disability service providers in Australia.</p>
        <h2>Acceptable use</h2>
        <p>You must always review AI-generated notes before submitting them. NoteScribe AI notes are a drafting aid — you are responsible for the accuracy and compliance of any submitted documentation.</p>
        <h2>Subscription</h2>
        <p>Pro subscriptions are billed monthly via Stripe. You may cancel at any time and retain access until the end of your billing period.</p>
        <h2>Limitation of liability</h2>
        <p>NoteScribe AI is not liable for documentation errors, regulatory non-compliance, or any decisions made based on AI-generated content. Always apply professional judgement.</p>
        <h2>Contact</h2>
        <p>Questions? Email <a href="mailto:hello@notescribe.ai">hello@notescribe.ai</a></p>
      </div>
    </div>
  )
}
