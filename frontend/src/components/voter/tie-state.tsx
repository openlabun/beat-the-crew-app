"use client"

import { type Battle } from "@/lib/types"

interface TieStateProps {
  battle: Battle
}

export function TieState({ battle }: TieStateProps) {
  return (
    <div className="min-h-screen w-full bg-btc-dark flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Split background */}
      <div className="absolute inset-0 flex">
        <div className="w-1/2 bg-btc-yellow/10" />
        <div className="w-1/2 bg-btc-purple/10" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-6">
        <h1 className="text-5xl md:text-7xl font-black text-foreground uppercase tracking-tight">
          ¡Empate!
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground uppercase tracking-wide">
          Esperando desempate...
        </p>

        {/* VS indicator */}
        <div className="flex items-center gap-4 mt-8">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-btc-yellow animate-pulse" />
            <span className="text-btc-yellow mt-2 font-semibold">
              {battle.yellowContestant?.name || "Amarillo"}
            </span>
          </div>
          <span className="text-2xl font-bold text-muted-foreground">VS</span>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-btc-purple animate-pulse" />
            <span className="text-btc-purple mt-2 font-semibold">
              {battle.purpleContestant?.name || "Morado"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
