'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  BookOpen, PenLine, History, Users, Brain, CreditCard, Settings,
  ChevronDown, ChevronUp, Mic, Download, Printer, Trash2, Filter,
  Sparkles, Shield, CheckCircle2, AlertCircle, FileText, Zap, Star,
  ArrowRight, Copy, RefreshCw, UserPlus, Search
} from 'lucide-react'

interface FAQItem { q: string; a: string }
interface Section {
  id: string
  icon: React.ElementType
  title: string
  color: string
  intro: string
  steps: string[]
  tips: string[]
  faqs: FAQItem[]
}

const SECTIONS: Section[] = [
  {
    id: 'write',
    icon: PenLine,
    title: 'Writing a Note',
    color: 'emerald',
    intro: 'The Write Note page is the heart of NoteScribe AI. Fill in your shift details, type rough notes in plain English, and the AI generates a professional NDIS-compliant note in seconds.',
    steps: [
      'Select the report type (Progress Note, Incident Report, etc.) — or type your own custom type',
      'If you have saved client profiles, select the participant from the "Load saved participant" dropdown to auto-fill their name and NDIS goals',
      'Enter the participant name and your name as support worker',
      'Set the date and shift duration (e.g. "2 hours 30 mins")',
      'Select or describe the participant\'s mood — choose from the list or type exactly what you observed',
      'Optionally add the participant\'s NDIS goals — this makes the AI link your note to their plan',
      'Type your raw notes in plain English — just write what happened, as brief or detailed as you like',
      'Click Generate — your professional note appears in under 10 seconds',
      'Review the note, copy it, download it, or print to PDF',
    ],
    tips: [
      'Your raw notes can be messy — "john shower good mood no incidents" works perfectly',
      'The more NDIS goals you add, the richer the AI note becomes',
      'For incident reports, mention what happened, immediate response, and follow-up in your raw notes',
      'Use the Regenerate button if you want a different version',
      'Notes are automatically saved to your History',
    ],
    faqs: [
      { q: 'How long should my raw notes be?', a: 'As short as a few words or as long as a paragraph — the AI works with both. "john shower, good mood, chose clothes himself, no incidents" is enough for a full progress note.' },
      { q: 'Can I use voice instead of typing?', a: 'Yes — on mobile, tap and hold the microphone icon on your keyboard to dictate. On desktop, use Windows Speech Recognition (Win+H) or Chrome\'s built-in voice input.' },
      { q: 'What if the generated note is wrong or inaccurate?', a: 'Always review before submitting. The AI works from what you write — if something is missing or wrong in the output, add more detail to your raw notes and regenerate.' },
      { q: 'Are my notes private?', a: 'Yes. Notes are stored in your account only. If you\'re using local AI (Ollama), your notes never leave your machine during generation.' },
    ],
  },
  {
    id: 'history',
    icon: History,
    title: 'Note History',
    color: 'blue',
    intro: 'Every note you generate is automatically saved to History. You can search, filter, export, print, and delete notes from here.',
    steps: [
      'Go to History from the top navigation',
      'Use the search bar to find notes by participant name or note content',
      'Use the filter dropdown to show only one type of report (e.g. "Incident Report")',
      'Click any note row to expand it and read the full note',
      'Click the Copy icon to copy the note text to your clipboard',
      'Click the Download icon to save the note as a formatted .txt file',
      'Click the Print icon to open a print-ready view — use your browser\'s "Save as PDF" option',
      'Click the Trash icon to permanently delete a note',
    ],
    tips: [
      'The .txt download includes participant name, date, worker, and duration as a header',
      'Print to PDF gives you a clean document ready for case management systems',
      'Use the report type filter at the start of each month to check your documentation spread',
      'Deleted notes cannot be recovered — double-check before deleting',
    ],
    faqs: [
      { q: 'How many notes are stored in History?', a: 'All notes are stored indefinitely. The history page loads up to 200 of your most recent notes.' },
      { q: 'Can I edit a saved note?', a: 'Not directly in History yet — copy the note, edit it in a text editor, then re-save or submit it to your case management system.' },
      { q: 'How do I export multiple notes at once?', a: 'Currently notes are exported one at a time. Bulk export is on the roadmap for a future update.' },
      { q: 'Why can\'t I see notes I wrote last week?', a: 'Make sure you\'re logged in with the same account. Notes are linked to your user account, not the device.' },
    ],
  },
  {
    id: 'clients',
    icon: Users,
    title: 'Client Profiles',
    color: 'purple',
    intro: 'Save your participants\' details once — name, NDIS number, goals, and current supports. Every time you write a note for that participant, their details are auto-filled in seconds.',
    steps: [
      'Go to Clients from the navigation',
      'Click "Add Client" to open the profile form',
      'Enter the participant\'s full name (required)',
      'Optionally add their NDIS number, date of birth, current diagnosis, NDIS goals, and current supports',
      'Click Save Client Profile',
      'When writing a note, select the participant from the "Load saved participant" dropdown — their name and goals auto-fill instantly',
    ],
    tips: [
      'The NDIS goals field is the most important — paste the participant\'s actual plan goals for richer AI notes',
      'You can save as many clients as you need',
      'Current supports field helps the AI understand the context of each shift',
      'Keep goals updated when the participant\'s plan is reviewed',
    ],
    faqs: [
      { q: 'Is client data secure?', a: 'Yes — client profiles are stored in your NoteScribe AI account only, accessible to you. Never share your login credentials.' },
      { q: 'Can I edit or delete a saved client?', a: 'Full edit and delete functionality is coming in the next update. For now, you can add a new profile with corrected details.' },
      { q: 'Do I need to add clients before writing notes?', a: 'No — you can type the participant name manually every time. Client profiles just speed things up.' },
      { q: 'Can multiple support workers share client profiles?', a: 'Not yet — team/shared profiles are on the roadmap. Currently each account has its own separate profiles.' },
    ],
  },
  {
    id: 'advisor',
    icon: Brain,
    title: 'AI Documentation Coach',
    color: 'teal',
    intro: 'The AI Coach analyses all your real notes and gives you personalised, specific feedback on your documentation quality — person-centred language, goal linkage, follow-up consistency, and more.',
    steps: [
      'Go to AI Coach from the navigation',
      'The coach automatically loads and analyses all your notes — wait a few seconds',
      'Read your quality scores: Person-centred %, Goal-linked %, Follow-up %, Note length',
      'Review the stats: total notes, unique participants, report type breakdown',
      'Read the AI\'s personalised coaching advice in the advice panel',
      'Click any quick question button for targeted advice on a specific area',
      'Or type your own question in the text field and press Ask',
      'Click Refresh to re-analyse after writing new notes',
    ],
    tips: [
      'The coach is most useful after you have 5+ notes — it needs data to give meaningful feedback',
      'Ask it: "What would an NDIS auditor flag in my notes?" for audit preparation',
      'Ask it: "Give me 3 example sentences for goal-linked language" to get copy-paste examples',
      'The coach runs locally (Ollama/llama3) — your notes never leave your machine during analysis',
    ],
    faqs: [
      { q: 'Why is the coach slow to respond?', a: 'The AI coach runs on your local machine using Ollama. First load can take 10-30 seconds depending on your hardware. Subsequent questions are faster.' },
      { q: 'What does "person-centred %" mean?', a: 'It measures how often your notes describe the participant as an active agent ("John chose", "John demonstrated") vs passive ("John was helped to"). Higher is better.' },
      { q: 'The coach says Ollama is not running — what do I do?', a: 'Open a terminal and run: ollama serve — then refresh the page. Make sure you have the llama3 model: ollama pull llama3' },
      { q: 'Can I ask about a specific participant?', a: 'Yes — type their name in the question field: "How are my notes for John Smith different from my other participants?"' },
    ],
  },
  {
    id: 'billing',
    icon: CreditCard,
    title: 'Billing & Plans',
    color: 'amber',
    intro: 'NoteScribe AI has a Free plan (5 notes/month) and a Pro plan ($79 AUD/month, unlimited notes). You can upgrade, downgrade, or cancel anytime.',
    steps: [
      'Go to Billing from the navigation to see your current plan',
      'Free plan: 5 AI-generated notes per month, all report types, note history',
      'Pro plan ($79/month): unlimited notes, all features, PDF export, saved client profiles',
      'Click "Upgrade to Pro" to go to the Stripe checkout page',
      'Enter your card details on the secure Stripe page',
      'After payment, you\'re redirected back to the dashboard — Pro is activated immediately',
      'To cancel: email support or manage your subscription through Stripe\'s customer portal',
    ],
    tips: [
      'At $79/month you break even by saving just 1.5 hours of admin time — most workers save 3+ hours daily',
      'Payments are handled entirely by Stripe — NoteScribe AI never stores your card details',
      'You can cancel anytime — you keep Pro until the end of your billing period',
      'The free plan resets on the 1st of each month',
    ],
    faqs: [
      { q: 'I upgraded but it still shows Free — what do I do?', a: 'Refresh the page and wait 30 seconds. If it still shows Free, the Stripe webhook may be delayed — log out, log back in, and it should update.' },
      { q: 'Is my payment secure?', a: 'Yes — all payments go through Stripe, which is PCI-DSS Level 1 certified. NoteScribe AI never sees or stores your card number.' },
      { q: 'Can I get a refund?', a: 'Yes — contact us within 7 days of your payment for a full refund, no questions asked.' },
      { q: 'Do you offer team or organisation plans?', a: 'Team plans (multiple workers under one provider account) are coming soon. Contact us to discuss early access.' },
    ],
  },
  {
    id: 'settings',
    icon: Settings,
    title: 'Settings & Account',
    color: 'gray',
    intro: 'Update your profile, organisation name, and password from the Settings page.',
    steps: [
      'Go to Settings from the navigation',
      'Update your full name — this auto-fills as the support worker name on every new note',
      'Add your organisation or provider name — helps with note context',
      'To change your password, scroll to the Change Password section',
      'Enter your current password, new password (8+ characters), and confirm it',
      'Click Update Password',
    ],
    tips: [
      'Keep your name accurate — it appears in every generated note as the support worker',
      'Your email address cannot be changed — it\'s your account identifier',
      'Use a strong password: mix of uppercase, numbers, and symbols',
      'If you forget your password, use the Forgot Password link on the login page',
    ],
    faqs: [
      { q: 'Can I change my email address?', a: 'Not currently — email is used as your permanent account identifier. Contact support if you need to transfer your account.' },
      { q: 'I forgot my password — how do I reset it?', a: 'Go to the login page and click "Forgot password?" — enter your email and you\'ll receive a reset link within a few minutes.' },
      { q: 'How do I delete my account?', a: 'Contact support and we\'ll delete all your data within 48 hours, in line with our Privacy Policy.' },
    ],
  },
]

const NDIS_LANGUAGE = [
  {
    label: 'Person-centred ✅',
    color: 'green',
    examples: [
      '"John chose his outfit independently."',
      '"Sarah demonstrated strong engagement during the activity."',
      '"Michael expressed his preference for…"',
      '"Participant initiated the conversation about…"',
      '"Aisha successfully completed the task with minimal prompting."',
    ],
  },
  {
    label: 'Worker-centred ❌ (avoid)',
    color: 'red',
    examples: [
      '"I helped John get dressed."',
      '"We made Sarah do the activity."',
      '"I assisted Michael with…"',
      '"We told the participant to…"',
      '"I completed the task for Aisha."',
    ],
  },
]

const AUDIT_CHECKLIST = [
  'Participant is named and identifiable',
  'Date, time, and duration of support are recorded',
  'Support worker is identified',
  'Observable facts are described (not assumptions or diagnoses)',
  'Participant\'s mood and engagement are noted',
  'NDIS goals are referenced where relevant',
  'Any incidents are documented with immediate response and follow-up',
  'Recommended next steps or follow-up actions are included',
  'Language is professional, objective, and person-centred',
  'No discriminatory, derogatory, or subjective language',
  'Medical opinions or diagnoses are NOT included (unless quoting a clinician)',
]

function AccordionFAQ({ faqs }: { faqs: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="space-y-2">
      {faqs.map((faq, i) => (
        <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
          >
            {faq.q}
            {open === i ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />}
          </button>
          {open === i && (
            <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

const colorMap: Record<string, { bg: string; border: string; text: string; icon: string; badge: string }> = {
  emerald: { bg: 'bg-emerald-50',  border: 'border-emerald-200', text: 'text-emerald-700', icon: 'bg-emerald-100 text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
  blue:    { bg: 'bg-blue-50',     border: 'border-blue-200',    text: 'text-blue-700',    icon: 'bg-blue-100 text-blue-600',       badge: 'bg-blue-100 text-blue-700'    },
  purple:  { bg: 'bg-purple-50',   border: 'border-purple-200',  text: 'text-purple-700',  icon: 'bg-purple-100 text-purple-600',   badge: 'bg-purple-100 text-purple-700'},
  teal:    { bg: 'bg-teal-50',     border: 'border-teal-200',    text: 'text-teal-700',    icon: 'bg-teal-100 text-teal-600',       badge: 'bg-teal-100 text-teal-700'    },
  amber:   { bg: 'bg-amber-50',    border: 'border-amber-200',   text: 'text-amber-700',   icon: 'bg-amber-100 text-amber-600',     badge: 'bg-amber-100 text-amber-700'  },
  gray:    { bg: 'bg-gray-50',     border: 'border-gray-200',    text: 'text-gray-700',    icon: 'bg-gray-100 text-gray-600',       badge: 'bg-gray-100 text-gray-700'    },
}

export default function HelpPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'guide' | 'ndis' | 'audit'>('guide')

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-600" /> Help & Documentation
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Everything you need to use NoteScribe AI and write compliant NDIS notes</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {([
          { id: 'guide', label: 'User Guide',          icon: FileText  },
          { id: 'ndis',  label: 'NDIS Language Guide', icon: Shield    },
          { id: 'audit', label: 'Audit Checklist',     icon: CheckCircle2 },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      {/* ── USER GUIDE TAB ── */}
      {activeTab === 'guide' && (
        <div className="space-y-4">
          {/* Quick-start strip */}
          <div className="bg-emerald-600 rounded-2xl p-5 text-white">
            <p className="font-bold text-base mb-3 flex items-center gap-2"><Zap className="w-4 h-4" /> Quick start — 3 steps</p>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { n: '1', t: 'Add your clients', d: 'Go to Clients → Add Client. Save name + NDIS goals once.' },
                { n: '2', t: 'Write a note', d: 'Go to Write Note → type what happened → click Generate.' },
                { n: '3', t: 'Copy or export', d: 'Copy to clipboard, download .txt, or print to PDF.' },
              ].map(({ n, t, d }) => (
                <div key={n} className="bg-white/10 rounded-xl p-3">
                  <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center text-xs font-black mb-2">{n}</div>
                  <p className="font-semibold text-sm mb-0.5">{t}</p>
                  <p className="text-emerald-100 text-xs leading-relaxed">{d}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Feature sections */}
          {SECTIONS.map(section => {
            const c = colorMap[section.color]
            const Icon = section.icon
            const isOpen = activeSection === section.id
            return (
              <div key={section.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <button
                  onClick={() => setActiveSection(isOpen ? null : section.id)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.icon}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-gray-900">{section.title}</span>
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 space-y-5 border-t border-gray-100">
                    <p className="text-sm text-gray-600 leading-relaxed pt-4">{section.intro}</p>

                    {/* Steps */}
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Step by step</p>
                      <ol className="space-y-2">
                        {section.steps.map((step, i) => (
                          <li key={i} className="flex gap-3 text-sm text-gray-700">
                            <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${c.badge}`}>{i + 1}</span>
                            <span className="leading-relaxed">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Tips */}
                    <div className={`${c.bg} border ${c.border} rounded-xl p-4`}>
                      <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${c.text}`}>
                        <Star className="w-3 h-3 inline mr-1" />Pro tips
                      </p>
                      <ul className="space-y-1.5">
                        {section.tips.map((tip, i) => (
                          <li key={i} className="flex gap-2 text-sm text-gray-700">
                            <span className="text-gray-400 flex-shrink-0">·</span>{tip}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* FAQs */}
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Frequently asked</p>
                      <AccordionFAQ faqs={section.faqs} />
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {/* Keyboard shortcuts */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <p className="font-semibold text-gray-900 mb-4">Keyboard shortcuts</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {[
                { key: 'Enter', action: 'Submit question in AI Coach' },
                { key: 'Ctrl + A', action: 'Select all text in note output' },
                { key: 'Ctrl + C', action: 'Copy selected text' },
                { key: 'Win + H', action: 'Windows voice dictation (for raw notes)' },
                { key: 'Ctrl + P', action: 'Print / Save as PDF from print view' },
              ].map(({ key, action }) => (
                <div key={key} className="flex items-center gap-3 text-sm">
                  <kbd className="bg-gray-100 border border-gray-200 rounded-lg px-2 py-1 text-xs font-mono font-semibold text-gray-700 flex-shrink-0">{key}</kbd>
                  <span className="text-gray-600">{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── NDIS LANGUAGE GUIDE TAB ── */}
      {activeTab === 'ndis' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-2">What is person-centred documentation?</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              NDIS Practice Standards require that all documentation describes the participant as an active, capable person — not a passive recipient of care. The participant should be the subject of sentences, making choices and taking actions, not someone things are done <em>to</em>.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              NoteScribe AI is built to generate person-centred language automatically — but you should still review every note before submitting.
            </p>
          </div>

          {/* Good vs Bad examples */}
          <div className="grid sm:grid-cols-2 gap-4">
            {NDIS_LANGUAGE.map(({ label, color, examples }) => (
              <div key={label} className={`rounded-2xl border p-5 ${color === 'green' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <p className={`font-bold text-sm mb-3 ${color === 'green' ? 'text-green-700' : 'text-red-700'}`}>{label}</p>
                <ul className="space-y-2">
                  {examples.map((ex, i) => (
                    <li key={i} className={`text-sm leading-relaxed ${color === 'green' ? 'text-green-800' : 'text-red-800'}`}>
                      {ex}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Report type guides */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
            <h2 className="font-bold text-gray-900">What goes in each report type</h2>
            {[
              {
                type: 'Progress Note',
                required: ['Observations (what the worker observed)', 'Participant mood and engagement', 'Activities completed during the shift', 'Goal progress (link to NDIS plan goals)', 'Any incidents or concerns (or confirm none)', 'Recommended follow-up'],
                example: '"John was supported with personal care and meal preparation. He presented in good spirits and engaged enthusiastically in conversation. John independently selected his outfit, demonstrating progress toward his goal of increased daily living independence. No incidents were observed. Recommended: continue to encourage independent choice-making."',
              },
              {
                type: 'Incident Report',
                required: ['What happened — factual description', 'Time and location of incident', 'Immediate response taken', 'Outcome and current status', 'Notification (who was informed)', 'Follow-up actions required'],
                example: '"At approximately 2:30pm, John slipped on a wet floor in the bathroom. Support worker immediately assisted John to a seated position and checked for injury. John reported no pain. Incident reported to supervisor at 2:45pm. No medical treatment required. Follow-up: install non-slip mat in bathroom before next shift."',
              },
              {
                type: 'Handover Note',
                required: ['Shift summary (what was covered)', 'Key observations about participant', 'Any changes from previous shift', 'Pending tasks or unfinished business', 'Important follow-up for next worker'],
                example: '"Sarah was supported with community access and cooking. She was in a positive mood throughout the shift. Her medication was taken at 12pm. Sarah mentioned she has a physio appointment on Thursday — she will need transport. The food shopping was not completed — please prioritise this on the next shift."',
              },
              {
                type: 'Support Plan',
                required: ['Participant overview (brief background)', 'Current supports and services', 'NDIS goals (from plan)', 'Strategies and approaches that work', 'Communication style and preferences', 'Risks and management strategies', 'Review date'],
                example: 'Support plans are longer documents — use the Generate button with detailed raw notes about the participant\'s background, current goals, and what approaches work well.',
              },
            ].map(({ type, required, example }) => (
              <div key={type} className="border border-gray-100 rounded-xl p-4 space-y-3">
                <p className="font-semibold text-gray-900 text-sm">{type}</p>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Must include</p>
                  <ul className="space-y-1">
                    {required.map((r, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />{r}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Example</p>
                  <p className="text-xs text-gray-600 leading-relaxed italic">{example}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Common mistakes */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" /> Common documentation mistakes
            </h2>
            <div className="space-y-3">
              {[
                { mistake: 'Diagnosing or speculating', fix: 'Don\'t write "John seemed depressed" — write "John was quiet and disengaged during activities"' },
                { mistake: 'Vague language', fix: 'Don\'t write "John had a good day" — write "John completed his meal preparation independently and engaged positively in conversation"' },
                { mistake: 'Missing follow-up', fix: 'Every note should end with a recommended next step, even if it\'s "Continue current support plan"' },
                { mistake: 'Worker as the subject', fix: 'Don\'t write "I helped John" — write "John was supported to…" or "John completed… with support"' },
                { mistake: 'Including other people\'s private information', fix: 'Don\'t name other participants, family members\' personal issues, or third-party medical details' },
                { mistake: 'Abbreviations without explanation', fix: 'Write "Activities of Daily Living (ADL)" not just "ADL" — not all readers know the abbreviation' },
              ].map(({ mistake, fix }) => (
                <div key={mistake} className="flex gap-3 text-sm">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-800">{mistake}</p>
                    <p className="text-gray-600 mt-0.5">{fix}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── AUDIT CHECKLIST TAB ── */}
      {activeTab === 'audit' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" /> NDIS Audit Readiness Checklist
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-5">
              Before submitting any note, run through this checklist. NDIS Quality and Safeguards Commission auditors look for all of these elements. NoteScribe AI automatically addresses most of them — but always review before submitting.
            </p>
            <div className="space-y-2">
              {AUDIT_CHECKLIST.map((item, i) => (
                <AuditItem key={i} text={item} />
              ))}
            </div>
          </div>

          {/* What auditors actually look for */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-gray-900">What NDIS auditors specifically look for</h2>
            {[
              {
                area: 'Progress toward goals',
                detail: 'Auditors check that notes link back to the participant\'s NDIS plan goals. Each note should mention at least one goal and describe whether progress was made, maintained, or if there\'s a concern.',
                risk: 'High',
              },
              {
                area: 'Incident documentation',
                detail: 'Every incident, no matter how minor, must be documented with: what happened, immediate response, outcome, who was notified, and follow-up. Missing incident notes is one of the most common audit failures.',
                risk: 'Critical',
              },
              {
                area: 'Consistency across workers',
                detail: 'If multiple workers support the same participant, auditors check that notes are consistent in describing the participant. Conflicting descriptions of mood, behaviour, or goals are a red flag.',
                risk: 'Medium',
              },
              {
                area: 'Timeliness',
                detail: 'Notes should be written on the day of the shift, or within 24 hours. Notes written days or weeks later are viewed with suspicion. Always note the actual date of the shift, not when you wrote it.',
                risk: 'High',
              },
              {
                area: 'Restrictive practices',
                detail: 'Any use of restrictive practices (physical, chemical, environmental, mechanical, or seclusion) must be explicitly documented with justification, participant response, and review dates. Undocumented restrictive practices are a serious compliance issue.',
                risk: 'Critical',
              },
            ].map(({ area, detail, risk }) => (
              <div key={area} className="flex gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900 text-sm">{area}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      risk === 'Critical' ? 'bg-red-100 text-red-700' :
                      risk === 'High'     ? 'bg-amber-100 text-amber-700' :
                                           'bg-blue-100 text-blue-700'
                    }`}>{risk}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick reference */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
            <p className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Use the AI Coach for audit prep
            </p>
            <p className="text-sm text-emerald-700 leading-relaxed mb-3">
              Go to <strong>AI Coach</strong> and ask: <em>"What would an NDIS auditor flag in my notes?"</em> — the coach will analyse your real notes and give you specific, actionable feedback based on your actual documentation patterns.
            </p>
            <Link href="/dashboard/advisor"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-900 transition-colors">
              Go to AI Coach <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Footer help strip */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-gray-900 text-sm">Still need help?</p>
          <p className="text-gray-500 text-xs mt-0.5">Email us at support@notescribe.ai — we respond within 24 hours.</p>
        </div>
        <a href="mailto:support@notescribe.ai"
          className="flex-shrink-0 flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-800 transition-colors">
          Contact support <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  )
}

function AuditItem({ text }: { text: string }) {
  const [checked, setChecked] = useState(false)
  return (
    <button onClick={() => setChecked(c => !c)}
      className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl text-left transition-colors ${checked ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'}`}>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${checked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
        {checked && <CheckCircle2 className="w-3 h-3 text-white" />}
      </div>
      <span className={`text-sm leading-relaxed ${checked ? 'text-emerald-700 line-through' : 'text-gray-700'}`}>{text}</span>
    </button>
  )
}
