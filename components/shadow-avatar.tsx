'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

interface ShadowAvatarProps {
  className?: string
  isActive?: boolean
  isTyping?: boolean
}

export function ShadowAvatar({ className = '', isActive = false, isTyping = false }: ShadowAvatarProps) {
  const [isBoosted, setIsBoosted] = useState(false)
  const wasActiveRef = useRef(false)

  useEffect(() => {
    if (wasActiveRef.current && !isActive) {
      setIsBoosted(true)
      setTimeout(() => setIsBoosted(false), 1500)
    }
    wasActiveRef.current = isActive
  }, [isActive])

  useEffect(() => {
    if (isTyping) {
      setIsBoosted(true)
    } else if (!isActive) {
      setIsBoosted(false)
    }
  }, [isTyping, isActive])

  const scaleClass = isBoosted 
    ? 'animate-shadow-response' 
    : 'animate-shadow-zoom animate-shadow-float'

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
    >
      {/* Background image container */}
      <div 
        className={`absolute inset-0 transition-all duration-700 ${scaleClass}`}
      >
        {/* Main background image - full screen cover, blended */}
        <Image
          src="/Shadow Monarch image.jpg"
          alt="Shadow Monarch"
          fill
          className="object-cover object-center opacity-30 md:opacity-40 lg:opacity-50"
          style={{
            mixBlendMode: 'lighten',
          }}
          unoptimized
        />
        
        {/* Animated aura glow overlay */}
        <div 
          className={`absolute inset-0 transition-all duration-700 ${
            isBoosted ? 'animate-shadow-response' : 'animate-shadow-aura'
          }`}
          style={{
            background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.2) 0%, rgba(6, 182, 212, 0.1) 50%, transparent 70%)',
          }}
        />
      </div>

      {/* Bottom fade for UI readability */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, var(--background) 0%, transparent 100%)',
        }}
      />
    </div>
  )
}