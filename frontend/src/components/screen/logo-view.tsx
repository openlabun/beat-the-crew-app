"use client"

import Image from "next/image"

interface LogoViewProps {
  eventName?: string
}

export function LogoView({ eventName }: LogoViewProps) {
  const eventDate = "19 DE MAYO DE 2026"

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden">
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
          className="absolute -left-32 top-1/3 w-96 h-96 rounded-full bg-btc-yellow/70 blur-[100px]"
          style={{
            animation: "pulseGlow 4s ease-in-out infinite, floatOrb1 20s ease-in-out infinite",
          }}
        />

        {/* Purple orb */}
        <div
          className="absolute -right-32 bottom-1/3 w-96 h-96 rounded-full bg-btc-purple/70 blur-[100px]"
          style={{
            animation: "pulseGlow 4s ease-in-out infinite 1s, floatOrb2 20s ease-in-out infinite",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-8">
        {/* Logo */}
        <div className="w-250 max-w-[90vw]">
          <Image
            src="/images/logo.svg"
            alt="Beat The Crew - Dance Battle UNC"
            width={600}
            height={255}
            className="w-full h-auto"
            priority
          />
        </div>

        {/* Event Date */}
        <p className="text-xl md:text-3xl font-medium text-foreground/80 uppercase tracking-[0.3em]">
          {eventDate}
        </p>
      </div>
    </div>
  )
}
