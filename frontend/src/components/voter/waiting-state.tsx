"use client"

import Image from "next/image"

interface WaitingStateProps {
  isConnected: boolean
}

export function WaitingState({ isConnected }: WaitingStateProps) {
  return (
    <div className="relative min-h-screen w-full bg-btc-dark flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Yellow orb */}
        <div className="absolute -left-20 top-1/4 w-64 h-64 rounded-full bg-btc-yellow/20 blur-3xl animate-pulse-glow" />
        {/* Purple orb */}
        <div className="absolute -right-20 bottom-1/4 w-64 h-64 rounded-full bg-btc-purple/20 blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-8">
        {/* Logo */}
        <div className="w-64 md:w-80">
          <Image
            src="/images/logo.svg"
            alt="Beat The Crew - Dance Battle UNC"
            width={320}
            height={136}
            className="w-full h-auto"
            priority
          />
        </div>

        {/* Waiting message */}
        <div className="space-y-4">
          <p className="text-xl md:text-2xl font-semibold text-foreground tracking-wide uppercase">
            Esperando la batalla...
          </p>
          
          {/* Connection status */}
          <div className="flex items-center justify-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                isConnected ? "bg-btc-yellow animate-pulse" : "bg-red-500"
              }`}
            />
            <span className="text-sm text-muted-foreground uppercase tracking-wider">
              {isConnected ? "En Vivo" : "Conectando..."}
            </span>
          </div>
        </div>

        {/* VS indicator */}
        <div className="flex items-center gap-4 mt-8">
          <div className="w-10 h-10 rounded-full bg-btc-yellow/80" />
          <span className="text-xl font-bold text-muted-foreground">VS</span>
          <div className="w-10 h-10 rounded-full bg-btc-purple/80" />
        </div>
      </div>
    </div>
  )
}
