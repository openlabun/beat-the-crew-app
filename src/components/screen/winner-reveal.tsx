"use client"

import { useEffect, useState } from "react"

interface WinnerRevealProps {
  winnerName: string
  yellowVotes: number
  purpleVotes: number
}

export function WinnerReveal({ winnerName, yellowVotes, purpleVotes }: WinnerRevealProps) {
  const total = yellowVotes + purpleVotes
  const yellowPercent = total > 0 ? Math.round((yellowVotes / total) * 100) : 50
  const purplePercent = total > 0 ? Math.round((purpleVotes / total) * 100) : 50

  return (
    <div className="min-h-screen w-full bg-btc-dark flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute inset-0 border-4 border-btc-yellow/20 rounded-full animate-radiate"
            style={{ animationDelay: `${i * 0.3}s` }}
          />
        ))}
      </div>

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at center, rgba(234,179,8,0.2) 0%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-8">
        {/* Winner label */}
        <p className="text-3xl md:text-4xl text-muted-foreground uppercase tracking-[0.5em] animate-pulse">
          Ganador
        </p>

        {/* Winner name with dramatic reveal */}
        <h1
          className="text-6xl md:text-9xl font-black text-btc-yellow uppercase tracking-tight animate-in zoom-in-50 duration-1000"
        >
          {winnerName}
        </h1>
      </div>
    </div>
  )
}
