'use client'

import { useEffect, useRef, useState } from 'react'

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  hue: number
}

interface ParticleBackgroundProps {
  isTyping?: boolean
  isActive?: boolean
}

export function ParticleBackground({ isTyping = false, isActive = false }: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [intensity, setIntensity] = useState(0.6)

  // Adjust intensity based on activity
  useEffect(() => {
    if (isTyping) {
      setIntensity(0.8)
    } else if (isActive) {
      setIntensity(1)
    } else {
      setIntensity(0.6)
    }
  }, [isTyping, isActive])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const particles: Particle[] = []
    const particleCount = isTyping || isActive ? 70 : 50

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * (isTyping || isActive ? 0.5 : 0.3),
        speedY: (Math.random() - 0.5) * (isTyping || isActive ? 0.5 : 0.3) - 0.2,
        opacity: Math.random() * 0.5 + 0.1,
        hue: Math.random() > 0.5 ? 265 : 200, // Purple or cyan
      })
    }

    let animationFrameId: number

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        particle.x += particle.speedX
        particle.y += particle.speedY

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        // Draw particle with enhanced glow
        const glowMultiplier = isTyping || isActive ? 1.5 : 1
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 4 * glowMultiplier
        )
        
        gradient.addColorStop(0, `hsla(${particle.hue}, 80%, 60%, ${particle.opacity})`)
        gradient.addColorStop(0.5, `hsla(${particle.hue}, 80%, 50%, ${particle.opacity * 0.3})`)
        gradient.addColorStop(1, `hsla(${particle.hue}, 80%, 40%, 0)`)

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * 4 * glowMultiplier, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // Core particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${particle.hue}, 80%, 70%, ${particle.opacity * 2})`
        ctx.fill()
      })

      // Draw connection lines with enhanced visibility when typing/active
      const connectionDistance = isTyping || isActive ? 120 : 150
      const connectionOpacity = isTyping || isActive ? 0.15 : 0.1
      
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < connectionDistance) {
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `hsla(265, 80%, 50%, ${connectionOpacity * (1 - distance / connectionDistance)})`
            ctx.lineWidth = isTyping || isActive ? 0.7 : 0.5
            ctx.stroke()
          }
        })
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [isTyping, isActive])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-500"
      style={{ opacity: intensity }}
    />
  )
}
