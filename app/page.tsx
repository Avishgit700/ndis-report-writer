'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { FileText, Zap, Shield, Clock, Check, ArrowRight, Sparkles, Users, ClipboardList } from 'lucide-react'

const EXAMPLE_INPUT = `"john shower good mood talked about birthday chose own clothes no incidents today"`
const EXAMPLE_NOTE = `John was supported with personal care, including showering and grooming. He presented in good spirits and engaged enthusiastically in conversation about his upcoming birthday. John independently selected his outfit for the day, demonstrating meaningful progress toward his goal of increased independence in daily living activities.\n\nNo incidents or concerns were observed during the support shift. John's mood and engagement were positive throughout the session.\n\nRecommended follow-up: Continue to encourage and celebrate independent choice-making in daily routines to further progress toward John's self-management goals.`

const FEATURES = [
  { icon: Zap,           title: 'Instant note generation',     desc: 'Speak or type a quick summary — get a full professional NDIS progress note in under 5 seconds.' },
  { icon: ClipboardList, title: 'All report types',            desc: 'Progress notes, support plans, incident reports, functional capacity assessments — all covered.' },
  { icon: Users,         title: 'Client profiles saved',       desc: 'Save participant details and NDIS goals once. Every future note is pre-loaded and faster.' },
  { icon: Shield,        title: 'NDIS-compliant language',     desc: 'Person-centred language, goal-linked outcomes, measurable progress — meets NDIS practice standards.' },
]

const TESTIMONIALS = [
  { quote: "I used to spend 30 minutes on each progress note. Now it takes me 45 seconds. I get home on time now.", name: "Priya M.", role: "Support Worker, Sydney", stars: 5 },
  { quote: "Our team of 12 switched to NoteScribe and we save about 25 hours of admin a week. The notes are genuinely better too.", name: "David K.", role: "NDIS Provider, Melbourne", stars: 5 },
  { quote: "The language is perfect — person-centred, goal-linked, exactly what auditors want to see. Absolute lifesaver.", name: "Sarah T.", role: "Support Coordinator, Brisbane", stars: 5 },
]

const REPORT_TYPES = [
  'Progress notes',
  'Incident reports',
  'Support plans',
  'Handover notes',
  'Goal review notes',
  'Functional capacity assessments',
]

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white">

      {/* Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100' : 'bg-transparent'}`}>
        <div className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">NoteScribe <span className="text-emerald-600">AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">How it works</a>
            <a href="#pricing"      className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">Sign in</Link>
            <Link href="/login" className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm">
              Try free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50 -z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-emerald-100/50 rounded-full blur-3xl -z-10 animate-glow-pulse" />

        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 ai-badge text-emerald-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping-slow" />
            Built for Australian NDIS support workers
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-[1.08] tracking-tight mb-6">
            Write NDIS notes
            <br />
            <span className="text-shimmer">in 30 seconds.</span>
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Type a quick summary of your support shift. AI writes the professional,
            NDIS-compliant progress note — saving you 3+ hours of paperwork every day.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            {REPORT_TYPES.map(t => (
              <span key={t} className="text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full">
                {t}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <Link href="/login" className="w-full sm:w-auto bg-emerald-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 hover:-translate-y-0.5">
              Try free — no credit card <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto flex items-center justify-center gap-1.5 text-gray-600 hover:text-gray-900 font-medium transition-colors">
              See how it works <ArrowRight className="w-4 h-4" />
            </a>
          </div>
          <p className="text-sm text-gray-400">5 free notes/month · No credit card required</p>
        </div>

        {/* Demo card */}
        <div className="max-w-5xl mx-auto mt-16">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-100 px-5 py-3 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <span className="text-xs text-gray-400 font-mono">notescribe.ai/dashboard</span>
              <div className="ml-auto flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                AI Active
              </div>
            </div>
            <div className="p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Your quick notes</p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full">Progress Note · John Smith · 2h</span>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-gray-600 text-sm leading-relaxed italic">
                    {EXAMPLE_INPUT}
                  </div>
                  <button className="mt-3 w-full bg-emerald-600 text-white text-sm font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" /> Generate Note
                  </button>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Professional NDIS note</p>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 bg-emerald-600 rounded flex items-center justify-center">
                      <Zap className="w-3 h-3 text-white fill-white" />
                    </div>
                    <span className="text-xs text-emerald-600 font-semibold">Generated in 2.8s</span>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 text-gray-700 text-sm leading-relaxed">
                    {EXAMPLE_NOTE.split('\n\n').map((para, i) => (
                      <p key={i} className={i > 0 ? 'mt-3' : ''}>{para}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-100 bg-gray-50 py-8 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[
            { stat: '3+ hrs',  label: 'Saved per support worker per day' },
            { stat: '< 30s',   label: 'Average note generation time' },
            { stat: '100%',    label: 'NDIS practice standard compliant' },
          ].map(({ stat, label }) => (
            <div key={label}>
              <p className="text-2xl md:text-3xl font-black text-gray-900">{stat}</p>
              <p className="text-xs md:text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-6 py-24 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest mb-3">Simple process</p>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">From shift to note <span className="text-shimmer">in 3 steps</span></h2>
          <p className="text-gray-500 max-w-xl mx-auto">No jargon. No training. Works on your first try.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-0.5 bg-emerald-100" />
          {[
            { step: '01', title: 'Select client + report type', desc: 'Choose the participant and what type of note you need — progress note, incident report, handover, and more.' },
            { step: '02', title: 'Type your rough notes',       desc: 'Jot down what happened in plain English. As brief as you like — the AI handles the rest.' },
            { step: '03', title: 'Review + export',             desc: 'Get a professional, goal-linked note in seconds. Edit if needed, then copy or export to PDF/Word.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="relative text-center">
              <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-200">
                <span className="text-white font-black text-lg">{step}</span>
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest mb-3">Why NoteScribe AI</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Everything support workers <span className="text-shimmer">actually need</span></h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100 card-lift gradient-border transition-all">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-24 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest mb-3">Loved by support workers</p>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900">Real time saved, <span className="text-shimmer">real results</span></h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ quote, name, role, stars }) => (
            <div key={name} className="bg-white rounded-2xl p-6 border border-gray-100 card-lift gradient-border shadow-sm transition-all">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: stars }).map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-5 italic">&ldquo;{quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-600 text-sm">{name[0]}</div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{name}</p>
                  <p className="text-gray-400 text-xs">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">Saves more than it costs</h2>
            <p className="text-gray-500">At $79/month you need to save just 1.5 hours to break even. Most workers save 3+ hours daily.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8">
              <h3 className="text-xl font-black text-gray-900 mb-1">Free</h3>
              <p className="text-gray-500 text-sm mb-6">Perfect to get started</p>
              <div className="mb-8">
                <span className="text-5xl font-black text-gray-900">$0</span>
                <span className="text-gray-400 text-sm ml-1">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['5 AI notes per month', 'All report types', 'Copy to clipboard', 'Note history'].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-5 h-5 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0"><Check className="w-3 h-3 text-green-500" /></div>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="w-full block text-center border-2 border-gray-200 text-gray-700 px-6 py-3.5 rounded-xl font-bold hover:border-gray-300 hover:bg-gray-50 transition-all">
                Get started free
              </Link>
            </div>
            {/* Pro */}
            <div className="bg-emerald-600 rounded-2xl p-8 relative shadow-xl shadow-emerald-200">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-black px-4 py-1 rounded-full shadow-sm whitespace-nowrap">
                MOST POPULAR
              </div>
              <h3 className="text-xl font-black text-white mb-1">Pro</h3>
              <p className="text-emerald-200 text-sm mb-6">For support workers & coordinators</p>
              <div className="mb-8">
                <span className="text-5xl font-black text-white">$79</span>
                <span className="text-emerald-300 text-sm ml-1">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited AI notes',
                  'All report types',
                  'Saved client profiles',
                  'PDF & Word export',
                  'Full note history',
                  'Cancel anytime',
                ].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-emerald-100">
                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0"><Check className="w-3 h-3 text-white" /></div>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="w-full block text-center bg-white text-emerald-600 px-6 py-3.5 rounded-xl font-black hover:bg-emerald-50 transition-colors shadow-sm">
                Start Pro — $79/mo
              </Link>
            </div>
          </div>
          <p className="text-center text-sm text-gray-400 mt-8">
            Need a team plan for your NDIS provider? <Link href="/login" className="text-emerald-600 font-medium hover:underline">Contact us →</Link>
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-700 -z-10" />
        <div className="absolute inset-0 opacity-10 -z-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            Stop writing notes.<br />Start caring for people.
          </h2>
          <p className="text-emerald-200 text-lg mb-10">Join support workers across Australia saving hours every day.</p>
          <Link href="/login" className="inline-flex items-center gap-2 bg-white text-emerald-600 px-8 py-4 rounded-xl text-lg font-black hover:bg-emerald-50 transition-colors shadow-xl">
            Try free — 5 notes/month <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-emerald-300 text-sm mt-4">No credit card required · Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white">NoteScribe AI</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#pricing"      className="hover:text-white transition-colors">Pricing</a>
            <Link href="/privacy"   className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms"     className="hover:text-white transition-colors">Terms</Link>
          </div>
          <p className="text-gray-500 text-sm">© 2026 NoteScribe AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
