'use client'

import { useEffect, useRef, useState } from 'react'

interface ShadowHeartbeatProps {
  isActive: boolean
  isListening: boolean
  isSpeaking: boolean
}

export function ShadowHeartbeat({ isActive, isListening, isSpeaking }: ShadowHeartbeatProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const phaseRef = useRef(0)
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; radius: number; opacity: number }>>([])

  // Energy ripple trigger
  const triggerRipple = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    setRipples(prev => [
      ...prev,
      { x: canvas.width / 2, y: canvas.height / 2, radius: 0, opacity: 1 }
    ])
  }

  // Trigger ripple when AI responds
  useEffect(() => {
    if (isSpeaking && !isListening) {
      triggerRipple()
    }
  }, [isSpeaking])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const centerY = height / 2

    const drawHeartbeat = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
      ctx.fillRect(0, 0, width, height)

      // Main heartbeat line
      ctx.beginPath()
      ctx.strokeStyle = isListening 
        ? '#a855f7' // Purple when listening
        : isSpeaking 
          ? '#06b6d4' // Cyan when speaking
          : '#6366f1' // Primary when idle
      ctx.lineWidth = 2
      ctx.shadowColor = ctx.strokeStyle
      ctx.shadowBlur = isActive ? 25 : 12

      const speed = isActive ? 0.1 : 0.03
      const amplitude = isActive ? (isSpeaking ? 55 : isListening ? 45 : 35) : 18

      for (let x = 0; x < width; x++) {
        const normalizedX = (x + phaseRef.current) / width
        let y = centerY

        // Create heartbeat pattern
        const heartbeatPhase = (normalizedX * 4) % 1

        if (isActive) {
          if (heartbeatPhase < 0.1) {
            y = centerY - Math.sin(heartbeatPhase * Math.PI * 10) * amplitude * 0.5
          } else if (heartbeatPhase < 0.2) {
            const t = (heartbeatPhase - 0.1) * 10
            y = centerY + Math.sin(t * Math.PI) * amplitude * 0.3 - Math.sin(t * Math.PI * 2) * amplitude
          } else if (heartbeatPhase < 0.3) {
            const t = (heartbeatPhase - 0.2) * 10
            y = centerY - Math.sin(t * Math.PI) * amplitude * 0.4
          } else if (heartbeatPhase < 0.35) {
            const t = (heartbeatPhase - 0.3) * 20
            y = centerY - Math.sin(t * Math.PI) * amplitude * 0.2
          } else {
            y = centerY + Math.sin(normalizedX * Math.PI * 8 + phaseRef.current * 0.01) * 3
          }
        } else {
          y = centerY + Math.sin(normalizedX * Math.PI * 2 + phaseRef.current * 0.01) * amplitude * 0.3
        }

        if (x === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }

      ctx.stroke()
      ctx.shadowBlur = 0

      // Draw energy ripples
      setRipples(prevRipples => {
        const updated: typeof prevRipples = []
        prevRipples.forEach(ripple => {
          if (ripple.opacity <= 0) return
          
          ctx.beginPath()
          ctx.strokeStyle = isSpeaking ? `rgba(6, 182, 212, ${ripple.opacity * 0.5})` : `rgba(138, 43, 226, ${ripple.opacity * 0.5})`
          ctx.lineWidth = 2
          ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2)
          ctx.stroke()
          
          // Inner glow
          ctx.beginPath()
          const gradient = ctx.createRadialGradient(ripple.x, ripple.y, 0, ripple.x, ripple.y, ripple.radius * 1.5)
          gradient.addColorStop(0, isSpeaking ? `rgba(6, 182, 212, ${ripple.opacity * 0.3})` : `rgba(138, 43, 226, ${ripple.opacity * 0.3})`)
          gradient.addColorStop(1, 'transparent')
          ctx.fillStyle = gradient
          ctx.arc(ripple.x, ripple.y, ripple.radius * 1.5, 0, Math.PI * 2)
          ctx.fill()
          
          updated.push({
            ...ripple,
            radius: ripple.radius + 3,
            opacity: ripple.opacity - 0.02
          })
        })
        return updated
      })

      // Draw glowing orb in center with enhanced effects
      const orbBaseRadius = isActive ? 10 : 6
      const orbPulse = Math.sin(phaseRef.current * 0.08) * (isActive ? 4 : 2)
      const orbRadius = orbBaseRadius + orbPulse
      
      // Outer glow
      const outerGlow = ctx.createRadialGradient(
        width / 2, centerY, 0,
        width / 2, centerY, orbRadius * 5
      )
      
      const orbColor = isListening ? '#a855f7' : isSpeaking ? '#06b6d4' : '#6366f1'
      const glowIntensity = isActive ? 0.4 : 0.2
      
      outerGlow.addColorStop(0, orbColor)
      outerGlow.addColorStop(0.3, orbColor + '60')
      outerGlow.addColorStop(0.6, orbColor + '20')
      outerGlow.addColorStop(1, 'transparent')

      ctx.beginPath()
      ctx.fillStyle = outerGlow
      ctx.arc(width / 2, centerY, orbRadius * 5, 0, Math.PI * 2)
      ctx.fill()

      // Middle glow layer
      const middleGlow = ctx.createRadialGradient(
        width / 2, centerY, 0,
        width / 2, centerY, orbRadius * 3
      )
      middleGlow.addColorStop(0, orbColor)
      middleGlow.addColorStop(0.5, orbColor + '40')
      middleGlow.addColorStop(1, 'transparent')

      ctx.beginPath()
      ctx.fillStyle = middleGlow
      ctx.arc(width / 2, centerY, orbRadius * 3, 0, Math.PI * 2)
      ctx.fill()

      // Core orb
      ctx.beginPath()
      ctx.fillStyle = orbColor
      ctx.shadowColor = orbColor
      ctx.shadowBlur = isActive ? 30 : 15
      ctx.arc(width / 2, centerY, orbRadius, 0, Math.PI * 2)
      ctx.fill()
      
      // Inner bright core
      ctx.beginPath()
      ctx.fillStyle = '#ffffff'
      ctx.shadowColor = '#ffffff'
      ctx.shadowBlur = 10
      ctx.arc(width / 2, centerY, orbRadius * 0.3, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      phaseRef.current += speed * 16
      animationRef.current = requestAnimationFrame(drawHeartbeat)
    }

    drawHeartbeat()

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [isActive, isListening, isSpeaking, ripples])

  return (
    <div className="relative w-full h-32 flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={400}
        height={128}
        className={`w-full max-w-md h-32 rounded-lg transition-all duration-300 ${
          isListening ? 'listening-glow' : isSpeaking ? 'speaking-glow' : 'glow-border'
        }`}
      />
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
          {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : isActive ? 'Voice Mode Active' : 'Voice Mode Standby'}
        </span>
        {isActive && (
          <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-purple-500 animate-ping' : isSpeaking ? 'bg-cyan-500 animate-ping' : 'bg-primary animate-pulse'}`} />
        )}
      </div>
    </div>
  )
}
