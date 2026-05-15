"use client"

import Image from "next/image"
import { ContestantGroup, type Battle } from "@/lib/types"
import { useRef, useEffect, useState } from 'react'

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
  scale: number
}

function ContestantSlot({ name, isWinner, isYellow, showArrow, scale }: ContestantSlotProps) {
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

  // If no name, show as empty/neutral
  const emptyBgColor = "bg-slate-900/50 border border-slate-700/50"
  const emptyTextColor = "text-slate-600"
  const finalBgColor = !name ? emptyBgColor : bgColor
  const finalTextColor = !name ? emptyTextColor : textColor

  // Scale text and padding based on number of contestants
  const paddingClass = scale >= 2 ? "px-4 py-2.5" : "px-3 py-1.5"
  const textSizeClass = scale >= 2 ? "text-base" : "text-sm"
  const arrowSizeClass = scale >= 2 ? "text-sm" : "text-xs"

  return (
    <div className={`flex items-center gap-2 rounded ${paddingClass} ${finalBgColor}`}>
      {showArrow && <span className={arrowSizeClass}>{"•"}</span>}
      <span className={`font-semibold uppercase truncate ${finalTextColor} ${textSizeClass}`}>
        {name || "TBD"}
      </span>
    </div>
  )
}

interface BattleCardProps {
  battle: Battle
  scale: number
}

function BattleCard({ battle, scale }: BattleCardProps) {
  const yellowName = battle.yellowContestant?.name || null
  const purpleName = battle.purpleContestant?.name || null
  const winnerId = battle.winnerId

  const gapClass = scale >= 2 ? "gap-2" : "gap-1"
  const minWidthClass = scale >= 2 ? "min-w-48" : "min-w-35"

  return (
    <div data-battle-id={battle.id} className={`flex flex-col ${gapClass} ${minWidthClass}`}>
      <ContestantSlot
        name={yellowName}
        isWinner={winnerId === battle.yellowContestantId}
        isYellow={true}
        showArrow={!!yellowName}
        scale={scale}
      />
      <ContestantSlot
        name={purpleName}
        isWinner={winnerId === battle.purpleContestantId}
        isYellow={false}
        showArrow={!!purpleName}
        scale={scale}
      />
    </div>
  )
}

function BracketConnectors({ battlesByRound, rounds, containerRef }: {
  battlesByRound: Map<number, Battle[]>
  rounds: number[]
  containerRef: React.RefObject<HTMLDivElement | null>
}) {
  const [lines, setLines] = useState<{ x1: number; y1: number; x2: number; y2: number }[]>([])

  useEffect(() => {
    const calculate = () => {
      requestAnimationFrame(() => {
        const container = containerRef.current
        if (!container) return

        const newLines: { x1: number; y1: number; x2: number; y2: number }[] = []

        rounds.forEach((round, roundIndex) => {
          if (roundIndex === rounds.length - 1) return
          const roundBattles = battlesByRound.get(round) || []

          for (let i = 0; i < roundBattles.length; i += 2) {
            const topCard = container.querySelector(`[data-battle-id="${roundBattles[i].id}"]`)
            const bottomCard = container.querySelector(`[data-battle-id="${roundBattles[i + 1]?.id}"]`)
            const nextRoundBattles = battlesByRound.get(rounds[roundIndex + 1]) || []
            const nextCard = container.querySelector(`[data-battle-id="${nextRoundBattles[Math.floor(i / 2)]?.id}"]`)

            if (!topCard || !bottomCard || !nextCard) return

            const containerRect = container.getBoundingClientRect()
            const topRect = topCard.getBoundingClientRect()
            const bottomRect = bottomCard.getBoundingClientRect()
            const nextRect = nextCard.getBoundingClientRect()

            const topY = topRect.top + topRect.height / 2 - containerRect.top
            const bottomY = bottomRect.top + bottomRect.height / 2 - containerRect.top
            const rightX = topRect.right - containerRect.left
            const nextX = nextRect.left - containerRect.left
            const midX = rightX + (nextX - rightX) / 2
            const nextMidY = nextRect.top + nextRect.height / 2 - containerRect.top

            // Top horizontal
            newLines.push({ x1: rightX, y1: topY, x2: midX, y2: topY })
            // Bottom horizontal
            newLines.push({ x1: rightX, y1: bottomY, x2: midX, y2: bottomY })
            // Vertical connecting top and bottom
            newLines.push({ x1: midX, y1: topY, x2: midX, y2: bottomY })
            // Horizontal to next round
            newLines.push({ x1: midX, y1: nextMidY, x2: nextX, y2: nextMidY })
          }
        })

        setLines(newLines)
      })
    }

    // Initial calculation
    calculate()

    // Recalculate on resize
    window.addEventListener('resize', calculate)

    // Recalculate on fullscreen change
    document.addEventListener('fullscreenchange', calculate)

    return () => {
      window.removeEventListener('resize', calculate)
      document.removeEventListener('fullscreenchange', calculate)
    }
  }, [battlesByRound, rounds, containerRef])

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      {lines.map((line, i) => (
        <line
          key={i}
          x1={line.x1} y1={line.y1}
          x2={line.x2} y2={line.y2}
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  )
}

export function BracketView({ battles, group }: BracketViewProps) {
  const bracketRef = useRef<HTMLDivElement | null>(null)
  const battlesByRound = organizeBattlesByRound(battles)
  const rounds = Array.from(battlesByRound.keys()).sort((a, b) => a - b)
  const totalRounds = rounds.length

  // Calculate scale based on number of contestants
  // 8 contestants = scale 2, 16 contestants = scale 1
  const totalContestants = Math.pow(2, totalRounds)
  const scale = totalContestants === 8 ? 2 : 1

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
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `url('/images/tv-background.svg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Round headers */}
      <div className="relative z-10 flex justify-between mb-6 px-4">
        {rounds.map((round) => (
          <div
            key={round}
            className="flex-1 text-center"
          >
            <span className="text-btc-purple text-2xl font-bold uppercase tracking-wider">
              {getRoundName(round, totalRounds)}
            </span>
          </div>
        ))}
      </div>

      {/* Bracket structure */}
      <div ref={bracketRef} className="relative z-10 flex items-center justify-between h-[calc(100vh-150px)]">
        <BracketConnectors battlesByRound={battlesByRound} rounds={rounds} containerRef={bracketRef} />
        {rounds.map((round, roundIndex) => {
          const roundBattles = battlesByRound.get(round) || []
          const spacing = Math.pow(2, roundIndex) * 60 * scale // Scale spacing based on contestant count

          return (
            <div
              key={round}
              className="flex flex-col justify-around h-full flex-1"
              style={{ gap: `${spacing}px` }}
            >
              {roundBattles.map((battle) => (
                <div key={battle.id} className="flex items-center justify-center">
                  <BattleCard battle={battle} scale={scale} />
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* Logo in corner */}
      <div className="absolute bottom-6 right-6 w-100">
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
