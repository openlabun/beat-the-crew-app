'use client'

import { useEffect, useRef, useState } from 'react'

interface VotingTimerProps {
  secondsLeft: number
  yellow: string
  purple: string
}

export function VotingTimer({ secondsLeft, yellow, purple }: VotingTimerProps) {
  const TIMER_DURATION = 30
  const [displaySeconds, setDisplaySeconds] = useState(secondsLeft)
  const [smoothProgress, setSmoothProgress] = useState(secondsLeft / TIMER_DURATION)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isDone = secondsLeft <= 0

  useEffect(() => {
    // Stop everything when timer is done
    if (isDone) {
      setDisplaySeconds(0)
      setSmoothProgress(0)
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    setDisplaySeconds(secondsLeft)
    setSmoothProgress(secondsLeft / TIMER_DURATION)

    if (intervalRef.current) clearInterval(intervalRef.current)

    let elapsed = 0
    const startProgress = secondsLeft / TIMER_DURATION
    const endProgress = (secondsLeft - 1) / TIMER_DURATION

    intervalRef.current = setInterval(() => {
      elapsed += 50
      const t = Math.min(elapsed / 1000, 1)
      setSmoothProgress(startProgress - (startProgress - endProgress) * t)
      if (elapsed >= 1000) {
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }, 50)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [secondsLeft, isDone])

  const isUrgent = displaySeconds <= 10 && !isDone
  const circumference = 2 * Math.PI * 180

  return (
    <div className="min-h-screen w-full bg-btc-dark flex flex-col items-center justify-center relative overflow-hidden dark-stripe-texture">
      {/* Background layer */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: `url('/images/tv-background.svg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Background decorative orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        
        {/* Yellow orb */}
        <div
          className="absolute -left-32 top-1/3 w-96 h-96 rounded-full bg-btc-yellow blur-[100px]"
          style={{
            animation: "pulseGlow 4s ease-in-out infinite, floatOrb1 2s ease-in-out infinite",
          }}
        />

        {/* Purple orb */}
        <div
          className="absolute -right-32 bottom-1/3 w-96 h-96 rounded-full bg-btc-purple blur-[100px]"
          style={{
            animation: "pulseGlow 4s ease-in-out infinite 1s, floatOrb2 2s ease-in-out infinite",
          }}
        />
      </div>

      {/* Contestant names */}
      <div className="flex items-center gap-12 mb-24">
        <span
          className="font-bebas text-7xl tracking-wide"
          style={{ color: '#F5C400', textShadow: '0 0 30px rgba(245,196,0,0.4)' }}
        >
          {yellow.toUpperCase()}
        </span>
        <span className="font-bebas text-5xl text-white">VS</span>
        <span
          className="font-bebas text-7xl tracking-wide"
          style={{ color: '#7B2FBE', textShadow: '0 0 30px rgba(123,47,190,0.4)' }}
        >
          {purple.toUpperCase()}
        </span>
      </div>

      {/* Big countdown number */}
      {/* Countdown or waiting state */}
      {/* Countdown or waiting state */}
      <div className="relative flex items-center justify-center mb-16" style={{ width: '250px', height: '250px' }}>
        <svg width="420" height="420" className="absolute">
          <circle cx="210" cy="210" r="180"
            fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
          <circle
            cx="210" cy="210" r="180"
            fill="none"
            stroke={isUrgent ? '#FF4444' : isDone ? 'rgba(255,255,255,0.1)' : '#F5C400'}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - smoothProgress)}
            transform="rotate(-90 210 210)"
            style={{
              filter: isUrgent ? 'drop-shadow(0 0 8px rgba(255,68,68,0.8))' : 'drop-shadow(0 0 8px rgba(245,196,0,0.6))',
              transition: 'stroke 0.3s ease',
            }}
          />
        </svg>

        {isDone ? (
          // Waiting for admin to announce
          <span
            className="font-bebas relative z-10 animate-pulse"
            style={{
              fontSize: '5rem',
              lineHeight: 1,
              color: 'rgba(255,68,68,1)',
              textShadow: '0 0 40px rgba(245,196,0,0.5)',
              textAlign: 'center',
              maxWidth: '340px',
            }}
          >
            ¿QUIÉN<br />GANÓ?
          </span>
        ) : (
          <span className="font-bebas relative z-10"
            style={{
              fontSize: '14rem',
              lineHeight: 1,
              color: isUrgent ? '#FF4444' : '#ffffff',
              textShadow: isUrgent ? '0 0 40px rgba(255,68,68,0.6)' : '0 0 40px rgba(255,255,255,0.2)',
              transition: 'color 0.3s ease, text-shadow 0.3s ease',
              minWidth: '300px',
              textAlign: 'center',
            }}>
            {displaySeconds}
          </span>
        )}
      </div>

      <p className="font-barlow font-bold text-2xl tracking-[0.3em] uppercase text-white mt-8">
        {isDone ? '¡Esperen el resultado!' : '¡Voten desde sus teléfonos!'}
      </p>

      {/* Urgency pulse overlay when low */}
      {isUrgent && (
        <div
          className="absolute inset-0 pointer-events-none animate-pulse"
          style={{ background: 'radial-gradient(circle at center, rgba(255,68,68,0.06) 0%, transparent 70%)' }}
        />
      )}

      {/* Logo */}
      <img
        src="/images/logo.svg"
        alt="Beat The Crew"
        className="absolute bottom-6 right-6 h-16 opacity-60"
        onError={e => { e.currentTarget.style.display = 'none' }}
      />
    </div>
  )
}