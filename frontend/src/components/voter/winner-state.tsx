"use client"

import { type Battle } from "@/lib/types"

interface WinnerStateProps {
  battle: Battle
  winnerId: number
  winnerName: string
  yellowVotes: number
  purpleVotes: number
}

export function WinnerState({ battle, winnerId, winnerName, yellowVotes, purpleVotes }: WinnerStateProps) {
  const isYellowWinner = battle.yellowContestant?.id === winnerId
  const total = yellowVotes + purpleVotes
  const yellowPercent = total > 0 ? Math.round((yellowVotes / total) * 100) : 50
  const purplePercent = total > 0 ? Math.round((purpleVotes / total) * 100) : 50

  return (
    <div className="min-h-screen w-full bg-btc-dark flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow */}
      <div
        className={`absolute inset-0 opacity-30 ${
          isYellowWinner ? "bg-btc-yellow" : "bg-btc-purple"
        }`}
        style={{
          background: isYellowWinner
            ? "radial-gradient(circle at center, var(--btc-yellow) 0%, transparent 70%)"
            : "radial-gradient(circle at center, var(--btc-purple) 0%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-8">
        {/* Winner label */}
        <p className="text-xl md:text-2xl text-muted-foreground uppercase tracking-widest">
          Ganador
        </p>

        {/* Winner name */}
        <h1
          className={`text-5xl md:text-7xl font-black uppercase tracking-tight ${
            isYellowWinner ? "text-btc-yellow" : "text-btc-purple"
          }`}
        >
          {winnerName}
        </h1>

        {/* Vote bar */}
        <div className="w-full max-w-sm space-y-2 mt-8">
          <div className="flex h-8 rounded-lg overflow-hidden">
            <div
              className="bg-btc-yellow flex items-center justify-center transition-all duration-1000"
              style={{ width: `${yellowPercent}%` }}
            >
              {yellowPercent > 15 && (
                <span className="text-btc-dark font-bold text-sm">{yellowPercent}%</span>
              )}
            </div>
            <div
              className="bg-btc-purple flex items-center justify-center transition-all duration-1000"
              style={{ width: `${purplePercent}%` }}
            >
              {purplePercent > 15 && (
                <span className="text-foreground font-bold text-sm">{purplePercent}%</span>
              )}
            </div>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{yellowVotes} votos</span>
            <span>{purpleVotes} votos</span>
          </div>
        </div>
      </div>
    </div>
  )
}
