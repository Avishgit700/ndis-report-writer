'use client'

import { useRouter } from 'next/navigation'
import { FileText } from 'lucide-react'
import AuthPage, { BrandConfig } from '@/components/AuthPage'
import { engineAuth, setToken, setUser } from '@/lib/engine'

const brand: BrandConfig = {
  name: 'NoteScribe AI',
  logo: (
    <div className="relative">
      <div className="absolute inset-0 bg-emerald-500 rounded-xl blur-md opacity-60" />
      <div className="relative w-9 h-9 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-500 rounded-xl flex items-center justify-center">
        <FileText className="w-4 h-4 text-white" />
      </div>
    </div>
  ),
  accent: {
    blob1:       'bg-emerald-600/20',
    blob2:       'bg-teal-500/15',
    blob3:       'bg-cyan-600/10',
    cube:        'rgba(16,185,129,0.25)',
    cubeBg:      'rgba(16,185,129,0.04)',
    glow:        'bg-emerald-600/8',
    badge:       'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    checkBg:     'bg-emerald-500/20 border-emerald-500/30',
    checkIcon:   'text-emerald-400',
    input:       'focus:border-emerald-500/60',
    button:      'from-emerald-600 to-teal-600',
    buttonHover: 'from-emerald-500 to-teal-500',
    tab:         'bg-emerald-600',
  },
  badgeText:      'NDIS Progress Note AI',
  headline:       <><span>Stop writing.</span><br /><span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">Start caring.</span></>,
  subheadline:    'Generate professional, NDIS-compliant progress notes in 30 seconds. Built for Australian support workers.',
  features: [
    'Progress notes, incident reports, support plans',
    'NDIS practice-standard language built in',
    '5 free notes/month — no card needed',
  ],
  proof: {
    avatarGradient: 'from-emerald-500 to-teal-500',
    initials: ['P', 'D', 'S'],
    line1: 'Used by 200+ NDIS support workers',
    line2: 'Average 3 hours saved per worker per day',
  },
  loginSubtitle:  'Sign in to your NoteScribe AI account',
  signupSubtitle: '5 free notes/month — no credit card needed',
  showPassword:   false,
}

export default function LoginPage() {
  const router = useRouter()
  return (
    <AuthPage
      brand={brand}
      mode="tabs"
      onLogin={(email, password) => engineAuth.login(email, password)}
      onRegister={(name, email, password) => engineAuth.register(name, email, password)}
      onSuccess={(result) => {
        setToken((result as { accessToken: string }).accessToken)
        setUser((result as { user: object }).user)
        router.push('/dashboard')
      }}
    />
  )
}
