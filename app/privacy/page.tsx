import Link from 'next/link'
import { FileText } from 'lucide-react'

export default function PrivacyPage() {
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
        <h1>Privacy Policy</h1>
        <p className="text-gray-500 text-sm">Last updated: June 2026</p>
        <h2>What we collect</h2>
        <p>We collect your name, email address, and the content you enter to generate NDIS notes. We do not sell your data to third parties.</p>
        <h2>How we use it</h2>
        <p>Your data is used solely to provide the NoteScribe AI service — generating notes and saving your note history. We use Claude (Anthropic) to generate notes; your input is sent to their API and subject to their privacy policy.</p>
        <h2>Data storage</h2>
        <p>All data is stored securely in Australia-based infrastructure. Note content is encrypted at rest.</p>
        <h2>Your rights</h2>
        <p>You may request deletion of your account and all associated data at any time by emailing us.</p>
        <h2>Contact</h2>
        <p>For privacy enquiries: <a href="mailto:privacy@notescribe.ai">privacy@notescribe.ai</a></p>
      </div>
    </div>
  )
}
