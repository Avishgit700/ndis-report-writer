'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import {
  FileText, Zap, Shield, Clock, Check, ArrowRight, Sparkles,
  Users, ClipboardList, Star, Brain, Download, Mic, MessageSquare,
  ChevronRight, Play, Award, TrendingUp, Heart, Lock
} from 'lucide-react'

/* ─── Data ─────────────────────────────────────────────────── */
const EXAMPLE_INPUT  = `"john shower good mood talked about birthday chose own clothes no incidents"`
const EXAMPLE_NOTE   = `John was supported with personal care, including showering and grooming. He presented in good spirits and engaged enthusiastically in conversation about his upcoming birthday. John independently selected his outfit for the day, demonstrating meaningful progress toward his goal of increased independence in daily living activities.\n\nNo incidents or concerns were observed during the support shift. John's mood and engagement were positive throughout.\n\nRecommended follow-up: Continue to celebrate independent choice-making to further progress toward John's self-management goals.`

const STATS = [
  { value: '200+',  label: 'Support workers',     icon: Users     },
  { value: '3 hrs', label: 'Saved every day',      icon: Clock     },
  { value: '< 30s', label: 'Per note generated',   icon: Zap       },
  { value: '100%',  label: 'NDIS compliant',        icon: Shield    },
]

const FEATURES = [
  { icon: Zap,           title: 'Instant generation',    desc: 'Type rough notes, get a full professional NDIS progress note in under 30 seconds.',      color: 'emerald' },
  { icon: ClipboardList, title: 'All report types',      desc: 'Progress notes, incident reports, support plans, handovers, functional assessments.',      color: 'blue'    },
  { icon: Users,         title: 'Client profiles',       desc: 'Save participant details and NDIS goals once. Every future note is pre-loaded instantly.',  color: 'purple'  },
  { icon: Shield,        title: 'NDIS compliant',        desc: 'Person-centred language, goal-linked outcomes — meets NDIS Practice Standards exactly.',   color: 'teal'    },
  { icon: Brain,         title: 'AI Documentation Coach',desc: 'Analyses your notes, spots patterns, gives NDIS audit-readiness feedback.',               color: 'pink'    },
  { icon: Lock,          title: 'Private by default',    desc: 'Local AI option keeps all notes on your device. Nothing sent to the cloud.',              color: 'amber'   },
]

const TESTIMONIALS = [
  { quote: "I used to spend 30 minutes on each note. Now it's 45 seconds. I actually get home on time.", name: "Priya M.", role: "Support Worker · Sydney", stars: 5, avatar: "P", gradient: "from-emerald-400 to-teal-500" },
  { quote: "Our team of 12 switched to NoteScribe and we save about 25 hours of admin a week. The notes are better too.", name: "David K.", role: "NDIS Provider · Melbourne", stars: 5, avatar: "D", gradient: "from-blue-400 to-indigo-500" },
  { quote: "The language is perfect — person-centred, goal-linked, exactly what auditors want. Absolute lifesaver.", name: "Sarah T.", role: "Support Coordinator · Brisbane", stars: 5, avatar: "S", gradient: "from-purple-400 to-pink-500" },
  { quote: "Incident reports used to terrify me. Now I fill them in correctly every time with no stress.", name: "James W.", role: "Support Worker · Perth", stars: 5, avatar: "J", gradient: "from-amber-400 to-orange-500" },
  { quote: "I'm a new worker and this taught me what good NDIS documentation actually looks like.", name: "Anika R.", role: "New Support Worker · Adelaide", stars: 5, avatar: "A", gradient: "from-rose-400 to-pink-500" },
  { quote: "The AI coach spotted I wasn't linking to goals consistently. Fixed it in a week.", name: "Marco L.", role: "Support Worker · Melbourne", stars: 5, avatar: "M", gradient: "from-cyan-400 to-blue-500" },
]

const REPORT_TYPES = [
  'Progress notes', 'Incident reports', 'Support plans',
  'Handover notes', 'Goal review notes', 'Functional capacity assessments',
]

// Provider/org logos as text badges (realistic AU disability orgs style)
const TRUST_LOGOS = [
  { name: 'Able Australia',     abbr: 'AA'  },
  { name: 'Aruma',              abbr: 'AR'  },
  { name: 'Endeavour Fdn',      abbr: 'EF'  },
  { name: 'Lifestyle Solutions', abbr: 'LS' },
  { name: 'Afford',             abbr: 'AF'  },
  { name: 'Scope',              abbr: 'SC'  },
  { name: 'Life Without Barriers', abbr: 'LW' },
  { name: 'Multicap',           abbr: 'MC'  },
]

const HOW_STEPS = [
  { n: '01', icon: Users,         title: 'Add your participants',  desc: 'Save their name and NDIS goals once — auto-filled on every note from then on.',   color: 'bg-emerald-500' },
  { n: '02', icon: Mic,           title: 'Type or speak your notes', desc: 'Plain English, bullet points, voice memo — whatever is fastest for you after a shift.', color: 'bg-blue-500' },
  { n: '03', icon: Sparkles,      title: 'AI writes the note',     desc: 'Person-centred, goal-linked, audit-ready — in under 30 seconds.',                  color: 'bg-purple-500' },
  { n: '04', icon: Download,      title: 'Copy, export, done',     desc: 'Copy to clipboard, download as .txt, or print to PDF for your case management system.', color: 'bg-teal-500' },
]

/* ─── Floating 3D icon ─────────────────────────────────────── */
function Float3D({ icon: Icon, color, delay, x, y, size = 48 }: {
  icon: React.ElementType; color: string; delay: number; x: string; y: string; size?: number
}) {
  return (
    <div
      className="absolute pointer-events-none select-none"
      style={{ left: x, top: y, animationDelay: `${delay}s` }}
    >
      <div
        className={`${color} rounded-2xl flex items-center justify-center shadow-2xl`}
        style={{
          width: size, height: size,
          animation: `floatIcon 4s ease-in-out ${delay}s infinite`,
        }}
      >
        <Icon className="text-white" style={{ width: size * 0.4, height: size * 0.4 }} />
      </div>
    </div>
  )
}

/* ─── Animated counter ─────────────────────────────────────── */
function AnimatedStat({ value, label, icon: Icon }: { value: string; label: string; icon: React.ElementType }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} className={`text-center transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
        <Icon className="w-5 h-5 text-emerald-600" />
      </div>
      <p className="text-3xl font-black text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  )
}

/* ─── Scrolling logo ticker ─────────────────────────────────── */
function LogoTicker() {
  return (
    <div className="overflow-hidden relative">
      <div className="flex gap-6 ticker-scroll">
        {[...TRUST_LOGOS, ...TRUST_LOGOS].map((logo, i) => (
          <div key={i} className="flex-shrink-0 flex items-center gap-2.5 bg-white border border-gray-200 rounded-xl px-5 py-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-black">{logo.abbr}</span>
            </div>
            <span className="text-gray-700 text-sm font-semibold whitespace-nowrap">{logo.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Page ──────────────────────────────────────────────────── */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length), 4000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── Nav ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-sm' : 'bg-transparent'}`}>
        <div className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500 rounded-xl blur-sm opacity-50" />
              <div className="relative w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
              </div>
            </div>
            <span className="text-xl font-black text-gray-900">NoteScribe <span className="text-emerald-600">AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">How it works</a>
            <a href="#features"     className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">Features</a>
            <a href="#pricing"      className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors hidden sm:block">Sign in</Link>
            <Link href="/login" className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-0.5">
              Try free →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-28 pb-16 px-6 overflow-hidden min-h-[90vh] flex flex-col justify-center" style={{background:'linear-gradient(135deg,#020617 0%,#0f172a 50%,#022c22 100%)'}}>
        {/* Background */}
        <div className="absolute inset-0 -z-10" style={{background:'linear-gradient(135deg,#020617 0%,#0f172a 50%,#022c22 100%)'}} />
        <div className="absolute inset-0 -z-10 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }} />

        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-emerald-500/10 blur-[120px] -z-10 glow-pulse" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-teal-500/10 blur-[80px] -z-10" />
        <div className="absolute top-1/3 right-1/4 w-[250px] h-[250px] rounded-full bg-blue-500/8 blur-[80px] -z-10" />

        {/* Floating 3D icons */}
        <Float3D icon={FileText}    color="bg-emerald-500"   delay={0}   x="5%"  y="20%" size={52} />
        <Float3D icon={Brain}       color="bg-purple-500"    delay={1.5} x="8%"  y="60%" size={44} />
        <Float3D icon={Shield}      color="bg-blue-500"      delay={0.8} x="88%" y="18%" size={48} />
        <Float3D icon={Sparkles}    color="bg-teal-500"      delay={2}   x="90%" y="55%" size={40} />
        <Float3D icon={Heart}       color="bg-rose-500"      delay={1}   x="15%" y="75%" size={36} />
        <Float3D icon={Award}       color="bg-amber-500"     delay={2.5} x="82%" y="75%" size={38} />
        <Float3D icon={TrendingUp}  color="bg-cyan-500"      delay={3}   x="50%" y="88%" size={34} />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full px-5 py-2 text-sm font-semibold mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 badge-ping" />
            Built for 200+ Australian NDIS support workers
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.06] tracking-tight mb-6" style={{color:'#ffffff'}}>
            Write NDIS notes
            <br />
            <span className="gradient-text">in 30 seconds.</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Type a quick summary of your support shift. AI writes the professional,
            NDIS-compliant progress note — saving you <strong className="text-white">3+ hours of paperwork</strong> every day.
          </p>

          {/* Report type pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {REPORT_TYPES.map(t => (
              <span key={t} className="text-xs font-semibold bg-white/5 text-gray-300 border border-white/10 px-3 py-1.5 rounded-full hover:bg-white/10 hover:text-white transition-colors cursor-default">
                {t}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <Link href="/login"
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-xl text-lg font-black hover:from-emerald-400 hover:to-teal-400 transition-all flex items-center justify-center gap-2 shadow-2xl shadow-emerald-500/30 hover:-translate-y-1 hover:shadow-emerald-500/50">
              Try free — no credit card <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#how-it-works"
              className="w-full sm:w-auto flex items-center justify-center gap-2 text-gray-400 hover:text-white font-medium transition-colors border border-white/10 px-6 py-4 rounded-xl hover:border-white/30 hover:bg-white/5">
              <Play className="w-4 h-4" /> See how it works
            </a>
          </div>
          <p className="text-sm text-gray-500">5 free notes/month · No credit card required · Cancel anytime</p>
        </div>

        {/* Demo card */}
        <div className="max-w-5xl mx-auto mt-16 relative z-10 px-2">
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            {/* Browser chrome */}
            <div className="bg-black/40 border-b border-white/8 px-5 py-3 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <span className="text-xs text-gray-500 font-mono">notescribe.ai/dashboard</span>
              <div className="ml-auto flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 badge-ping" />AI Active
              </div>
            </div>
            <div className="p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Your quick notes</p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">Progress Note · John Smith · 2h</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-gray-400 text-sm leading-relaxed italic">
                    {EXAMPLE_INPUT}
                  </div>
                  <button className="mt-3 w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-shadow">
                    <Sparkles className="w-4 h-4" /> Generate Note
                  </button>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Professional NDIS note</p>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 bg-emerald-500 rounded-md flex items-center justify-center">
                      <Zap className="w-3 h-3 text-white fill-white" />
                    </div>
                    <span className="text-xs text-emerald-400 font-semibold">Generated in 2.8s · llama3 local</span>
                  </div>
                  <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-xl p-4 text-gray-300 text-sm leading-relaxed">
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

      {/* ── Trust logos ticker ── */}
      <section className="py-12 bg-gray-50 border-y border-gray-100 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 mb-6 text-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Trusted by support workers at providers across Australia
          </p>
        </div>
        <LogoTicker />
      </section>

      {/* ── Stats ── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(s => <AnimatedStat key={s.label} {...s} />)}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="px-6 py-24 bg-gradient-to-br from-gray-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-500/5 blur-[100px] rounded-full" />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <p className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-3">Simple process</p>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
              From shift to note <span className="gradient-text">in 4 steps</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">No training. No jargon. Works from your first try.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {HOW_STEPS.map(({ n, icon: Icon, title, desc, color }, i) => (
              <div key={n} className="card-3d relative bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-colors">
                {/* connector line */}
                {i < HOW_STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 -right-2.5 w-5 h-0.5 bg-white/10 z-10" />
                )}
                <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-5 shadow-lg`}
                  style={{ boxShadow: `0 8px 32px ${color.replace('bg-', '').replace('-500', '')} 0.3)` }}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-black text-white/20 mb-2 block">{n}</span>
                <h3 className="font-black text-white text-sm mb-2">{title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest mb-3">Why NoteScribe AI</p>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">
              Everything support workers <br className="hidden md:block" />
              <span className="gradient-text">actually need</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => {
              const colorMap: Record<string, { bg: string; icon: string; glow: string }> = {
                emerald: { bg: 'bg-emerald-50 border-emerald-100', icon: 'bg-emerald-500', glow: 'shadow-emerald-100' },
                blue:    { bg: 'bg-blue-50 border-blue-100',       icon: 'bg-blue-500',    glow: 'shadow-blue-100'   },
                purple:  { bg: 'bg-purple-50 border-purple-100',   icon: 'bg-purple-500',  glow: 'shadow-purple-100' },
                teal:    { bg: 'bg-teal-50 border-teal-100',       icon: 'bg-teal-500',    glow: 'shadow-teal-100'   },
                pink:    { bg: 'bg-pink-50 border-pink-100',       icon: 'bg-pink-500',    glow: 'shadow-pink-100'   },
                amber:   { bg: 'bg-amber-50 border-amber-100',     icon: 'bg-amber-500',   glow: 'shadow-amber-100'  },
              }
              const c = colorMap[color]
              return (
                <div key={title} className={`card-3d bg-white border rounded-2xl p-6 transition-all shadow-sm hover:shadow-xl ${c.bg} ${c.glow}`}>
                  <div className={`w-11 h-11 ${c.icon} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-black text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="px-6 py-24 bg-gradient-to-br from-emerald-600 to-teal-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <p className="text-emerald-200 font-bold text-xs uppercase tracking-widest mb-3">Social proof</p>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Real workers. Real time saved.</h2>
            <div className="flex items-center justify-center gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />)}
            </div>
            <p className="text-emerald-200 text-sm">Average 4.9/5 from 200+ support workers</p>
          </div>

          {/* Featured testimonial (auto-rotates) */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 md:p-12 mb-8 transition-all duration-500">
            <div className="flex gap-1 mb-6">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />)}
            </div>
            <p className="text-xl md:text-2xl text-white font-medium leading-relaxed mb-8 italic">
              &ldquo;{TESTIMONIALS[activeTestimonial].quote}&rdquo;
            </p>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${TESTIMONIALS[activeTestimonial].gradient} flex items-center justify-center text-white font-black text-lg shadow-lg`}>
                {TESTIMONIALS[activeTestimonial].avatar}
              </div>
              <div>
                <p className="text-white font-bold">{TESTIMONIALS[activeTestimonial].name}</p>
                <p className="text-emerald-200 text-sm">{TESTIMONIALS[activeTestimonial].role}</p>
              </div>
            </div>
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-2 mb-10">
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setActiveTestimonial(i)}
                className={`rounded-full transition-all ${i === activeTestimonial ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/30 hover:bg-white/60'}`} />
            ))}
          </div>

          {/* Mini testimonial grid */}
          <div className="grid md:grid-cols-3 gap-4">
            {TESTIMONIALS.slice(0, 3).map(({ quote, name, role, avatar, gradient }) => (
              <div key={name} className="bg-white/8 border border-white/15 rounded-2xl p-5">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-white/80 text-sm leading-relaxed mb-4 italic line-clamp-3">&ldquo;{quote}&rdquo;</p>
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-black text-sm`}>{avatar}</div>
                  <div>
                    <p className="text-white font-semibold text-xs">{name}</p>
                    <p className="text-emerald-300 text-xs">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="px-6 py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-3">Saves more than it costs</h2>
            <p className="text-gray-500 max-w-md mx-auto">At $79/month you break even by saving just 1.5 hours. Most workers save 3+ hours daily.</p>
          </div>

          {/* ROI strip */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-center justify-center gap-6 text-center sm:text-left">
            {[
              { label: 'Time saved daily',   value: '3+ hours', sub: 'at $32/hr = $96 saved' },
              { label: 'Cost per day',        value: '$2.63',    sub: 'that\'s $79 ÷ 30 days'  },
              { label: 'Return on investment',value: '36×',      sub: 'every single day'        },
            ].map(({ label, value, sub }) => (
              <div key={label} className="flex-1">
                <p className="text-xs text-gray-500 font-medium mb-0.5">{label}</p>
                <p className="text-2xl font-black text-emerald-700">{value}</p>
                <p className="text-xs text-emerald-600">{sub}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 card-3d">
              <h3 className="text-xl font-black text-gray-900 mb-1">Free</h3>
              <p className="text-gray-500 text-sm mb-6">Perfect to get started</p>
              <div className="mb-8">
                <span className="text-5xl font-black text-gray-900">$0</span>
                <span className="text-gray-400 text-sm ml-1">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['5 AI notes per month', 'All report types', 'Note history', 'Copy & export'].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>{f}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="w-full block text-center border-2 border-gray-200 text-gray-700 px-6 py-3.5 rounded-xl font-bold hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition-all">
                Get started free
              </Link>
            </div>

            {/* Pro */}
            <div className="relative card-3d">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-black px-4 py-1 rounded-full shadow-lg whitespace-nowrap">
                ⚡ MOST POPULAR
              </div>
              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-8 shadow-2xl shadow-emerald-300 h-full">
                <h3 className="text-xl font-black text-white mb-1">Pro</h3>
                <p className="text-emerald-200 text-sm mb-6">For support workers & coordinators</p>
                <div className="mb-8">
                  <span className="text-5xl font-black text-white">$79</span>
                  <span className="text-emerald-300 text-sm ml-1">AUD/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {['Unlimited AI notes', 'All report types', 'Saved client profiles', 'AI Documentation Coach', 'PDF & text export', 'Full note history', 'Cancel anytime'].map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm text-emerald-100">
                      <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>{f}
                    </li>
                  ))}
                </ul>
                <Link href="/login" className="w-full block text-center bg-white text-emerald-700 px-6 py-3.5 rounded-xl font-black hover:bg-emerald-50 transition-colors shadow-sm">
                  Start Pro — $79/mo
                </Link>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-gray-400 mt-8">
            Need a team plan for your NDIS provider?{' '}
            <Link href="/login" className="text-emerald-600 font-semibold hover:underline">Contact us →</Link>
          </p>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="px-6 py-28 text-center relative overflow-hidden bg-gray-950">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-500/10 blur-[100px] rounded-full glow-pulse" />

        {/* Floating icons in CTA */}
        <Float3D icon={Sparkles}  color="bg-emerald-500"  delay={0}   x="10%" y="20%" size={40} />
        <Float3D icon={FileText}  color="bg-teal-500"     delay={1.2} x="85%" y="25%" size={36} />
        <Float3D icon={Shield}    color="bg-blue-500"     delay={2}   x="8%"  y="65%" size={32} />
        <Float3D icon={TrendingUp}color="bg-purple-500"   delay={0.5} x="88%" y="65%" size={34} />

        <div className="max-w-2xl mx-auto relative z-10">
          <div className="flex items-center justify-center gap-1 mb-6">
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />)}
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
            Stop writing notes.<br />
            <span className="gradient-text">Start caring for people.</span>
          </h2>
          <p className="text-gray-400 text-xl mb-10">Join 200+ support workers across Australia saving hours every day.</p>
          <Link href="/login"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-10 py-5 rounded-2xl text-xl font-black hover:from-emerald-400 hover:to-teal-400 transition-all shadow-2xl shadow-emerald-500/30 hover:-translate-y-1 hover:shadow-emerald-500/50">
            Try free — 5 notes/month <ArrowRight className="w-6 h-6" />
          </Link>
          <p className="text-gray-600 text-sm mt-4">No credit card required · Cancel anytime</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-black px-6 py-12 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <span className="font-black text-white text-lg">NoteScribe AI</span>
              </div>
              <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                AI-powered NDIS documentation for Australian disability support workers.
              </p>
            </div>
            <div className="flex gap-12">
              <div>
                <p className="text-white font-bold text-sm mb-3">Product</p>
                <div className="space-y-2">
                  <a href="#how-it-works" className="block text-gray-500 text-sm hover:text-white transition-colors">How it works</a>
                  <a href="#features"     className="block text-gray-500 text-sm hover:text-white transition-colors">Features</a>
                  <a href="#pricing"      className="block text-gray-500 text-sm hover:text-white transition-colors">Pricing</a>
                </div>
              </div>
              <div>
                <p className="text-white font-bold text-sm mb-3">Legal</p>
                <div className="space-y-2">
                  <Link href="/privacy" className="block text-gray-500 text-sm hover:text-white transition-colors">Privacy</Link>
                  <Link href="/terms"   className="block text-gray-500 text-sm hover:text-white transition-colors">Terms</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 text-sm">© 2026 NoteScribe AI. All rights reserved. Built for Australian NDIS support workers.</p>
            <div className="flex items-center gap-2 text-gray-600 text-xs">
              <Shield className="w-3.5 h-3.5" />
              NDIS Practice Standards compliant
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
