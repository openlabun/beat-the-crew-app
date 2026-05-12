"use client"

import Image from "next/image"
import { ContestantGroup, type Battle } from "@/lib/types"

interface BracketViewProps {
  battles: Battle[]
  group: ContestantGroup
}

// Helper to organize battles by round
function organizeBattlesByRound(battles: Battle[]): Map<number, Battle[]> {
  const byRound = new Map<number, Battle[]>()
  battles.forEach((battle) => {
    const round = battle.round
    if (!byRound.has(round)) {
      byRound.set(round, [])
    }
    byRound.get(round)!.push(battle)
  })
  // Sort each round by position
  byRound.forEach((roundBattles) => {
    roundBattles.sort((a, b) => a.position - b.position)
  })
  return byRound
}

// Get round name based on total rounds and current round
function getRoundName(round: number, totalRounds: number): string {
  const roundsFromFinal = totalRounds - round
  switch (roundsFromFinal) {
    case 0:
      return "FINAL"
    case 1:
      return "SEMI"
    case 2:
      return "CUARTOS"
    case 3:
      return "OCTAVOS"
    default:
      return `RONDA ${round}`
  }
}

interface ContestantSlotProps {
  name: string | null
  isWinner: boolean
  isYellow: boolean
  showArrow?: boolean
}

function ContestantSlot({ name, isWinner, isYellow, showArrow }: ContestantSlotProps) {
  const bgColor = isYellow
    ? isWinner
      ? "bg-btc-yellow"
      : "bg-btc-yellow/20 border border-btc-yellow/50"
    : isWinner
    ? "bg-btc-purple"
    : "bg-btc-purple/20 border border-btc-purple/50"

  const textColor = isYellow
    ? isWinner
      ? "text-btc-dark"
      : "text-btc-yellow"
    : isWinner
    ? "text-foreground"
    : "text-btc-purple"

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded ${bgColor}`}>
      {showArrow && <span className="text-xs">{"•"}</span>}
      <span className={`text-sm font-semibold uppercase truncate ${textColor}`}>
        {name || "TBD"}
      </span>
    </div>
  )
}

interface BattleCardProps {
  battle: Battle
}

function BattleCard({ battle }: BattleCardProps) {
  const yellowName = battle.yellowContestant?.name || null
  const purpleName = battle.purpleContestant?.name || null
  const winnerId = battle.winnerId

  return (
    <div className="flex flex-col gap-1 min-w-35">
      <ContestantSlot
        name={yellowName}
        isWinner={winnerId === battle.yellowContestantId}
        isYellow={true}
        showArrow={!!yellowName}
      />
      <ContestantSlot
        name={purpleName}
        isWinner={winnerId === battle.purpleContestantId}
        isYellow={false}
        showArrow={!!purpleName}
      />
    </div>
  )
}

export function BracketView({ battles, group }: BracketViewProps) {
  const battlesByRound = organizeBattlesByRound(battles)
  const rounds = Array.from(battlesByRound.keys()).sort((a, b) => a - b)
  const totalRounds = rounds.length

  if (battles.length === 0) {
    return (
      <div className="min-h-screen w-full bg-btc-dark flex items-center justify-center">
        <p className="text-muted-foreground text-xl">No hay bracket generado</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-btc-dark p-8 relative overflow-hidden">
      {/* Dark pattern background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Round headers */}
      <div className="relative z-10 flex justify-between mb-6 px-4">
        {rounds.map((round) => (
          <div
            key={round}
            className="flex-1 text-center"
          >
            <span className="text-btc-purple text-sm font-bold uppercase tracking-wider">
              {getRoundName(round, totalRounds)}
            </span>
          </div>
        ))}
      </div>

      {/* Bracket structure */}
      <div className="relative z-10 flex items-center justify-between h-[calc(100vh-150px)]">
        {rounds.map((round, roundIndex) => {
          const roundBattles = battlesByRound.get(round) || []
          const spacing = Math.pow(2, roundIndex) * 60 // Increase spacing for later rounds

          return (
            <div
              key={round}
              className="flex flex-col justify-around h-full flex-1"
              style={{ gap: `${spacing}px` }}
            >
              {roundBattles.map((battle) => (
                <div key={battle.id} className="flex items-center justify-center">
                  <BattleCard battle={battle} />
                  {/* Connector line to next round */}
                  {roundIndex < rounds.length - 1 && (
                    <div className="w-8 h-px bg-border/50" />
                  )}
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* Logo in corner */}
      <div className="absolute bottom-6 right-6 w-48">
        <Image
          src="/images/logo.svg"
          alt="Beat The Crew"
          width={192}
          height={82}
          className="w-full h-auto opacity-80"
        />
      </div>
    </div>
  )
}
