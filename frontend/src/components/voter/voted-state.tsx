"use client"

import { VoteChoice, type Battle } from "@/lib/types"

interface VotedStateProps {
  battle: Battle
  choice: VoteChoice
}

export function VotedState({ battle, choice }: VotedStateProps) {
  const isYellow = choice === VoteChoice.YELLOW
  const contestantName = isYellow
    ? battle.yellowContestant?.name || "Amarillo"
    : battle.purpleContestant?.name || "Morado"

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden ${
        isYellow ? "bg-btc-yellow" : "bg-btc-purple"
      }`}
    >
      {/* Radiating circles background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full border-7 ${
              isYellow ? "border-btc-dark/10" : "border-white/10"
            } animate-radiate`}
            style={{
              width: "50%",
              height: "50%",
              maxWidth: "200vw",
              maxHeight: "200vh",
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center p-6 space-y-6">
        {/* Contestant Name */}
        <h1
          className={`text-5xl md:text-7xl font-black uppercase tracking-tight ${
            isYellow ? "text-btc-dark" : "text-foreground"
          }`}
        >
          {contestantName}
        </h1>

        {/* Vote confirmed message */}
        <div className="space-y-2">
          <p
            className={`text-2xl md:text-3xl font-bold uppercase tracking-wide ${
              isYellow ? "text-btc-dark" : "text-foreground"
            }`}
          >
            ¡Voto Emitido!
          </p>
          <p
            className={`text-sm md:text-base uppercase tracking-widest ${
              isYellow ? "text-btc-dark/70" : "text-foreground/70"
            }`}
          >
            Levanta el celular
          </p>
        </div>

        {/* Beat The Crew text */}
        <p
          className={`text-lg md:text-xl font-bold uppercase tracking-[0.2em] mt-8 ${
            isYellow ? "text-btc-dark/50" : "text-foreground/50"
          }`}
        >
          Beat The Crew
        </p>
      </div>
    </div>
  )
}
