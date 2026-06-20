'use client'

import { useState } from 'react'
import { X, Zap } from 'lucide-react'
import Link from 'next/link'

export default function PromoBanner() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null
  return (
    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2.5 px-4 text-center text-sm font-medium relative">
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 flex-shrink-0" />
        <span>🎉 Launch offer — <strong>50% off</strong> your first month.</span>
        <Link href="/login" className="underline font-bold hover:text-yellow-200 transition-colors">
          Claim offer →
        </Link>
      </div>
      <button onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors p-1">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
