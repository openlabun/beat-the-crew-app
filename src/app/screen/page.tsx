"use client"

import { useEffect, useState, useCallback } from "react"
import { SocketProvider, useVotingOpened, useBattleWinner, useBattleTie, useBattleRerun, useBattleForfeit, useSocket, useScreenCommand, useScreenGroupCommand, useVotingTick, emitScreenCommand } from "@/lib/socket-context"
import { getBracket, getEvent } from "@/lib/api"
import { ContestantGroup, VotingOpenedPayload, type Battle, type Event } from "@/lib/types"
import { BracketView } from "@/components/screen/bracket-view"
import { LogoView } from "@/components/screen/logo-view"
import { WinnerReveal } from "@/components/screen/winner-reveal"
import { TieReveal } from "@/components/screen/tie-reveal"
import { VotingTimer } from "@/components/screen/voting-timer"
import { useSearchParams } from "next/navigation"

type ScreenMode = "logo" | "bracket" | "winner" | "tie" | "timer"

interface ScreenState {
  mode: ScreenMode
  group: ContestantGroup
  battles: Battle[]
  event: Event | null
  currentYellow?: string,
  currentPurple?: string,
  winnerData?: {
    battleId: number
    winnerId: number
    winnerName: string
    yellowVotes: number
    purpleVotes: number
  }
}

function ScreenApp() {
  const [state, setState] = useState<ScreenState>({
    mode: "logo",
    group: ContestantGroup.CREW,
    battles: [],
    event: null,
  })
  const { isConnected } = useSocket()
  const [currentMode, setCurrentMode] = useState<ScreenMode>('logo')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const searchParams = useSearchParams()
  const eventId = parseInt(searchParams.get('eventId') || '0')

  const switchMode = useCallback((newMode: ScreenMode) => {
    if (newMode === currentMode || isTransitioning) return
    setIsTransitioning(true)
    
    // Change content halfway through the wipe animation (300ms out of 600ms)
    setTimeout(() => {
      setCurrentMode(newMode)
    }, 300)
    
    // Finish transitioning after animation completes
    setTimeout(() => {
      setIsTransitioning(false)
    }, 600)
  }, [currentMode, isTransitioning])

  // Load event and bracket data
  const loadData = useCallback(async (id: number, group: ContestantGroup) => {
    try {
      const [event, battles] = await Promise.all([
        getEvent(id),
        getBracket(id, group),
      ])
      setState((prev) => ({ ...prev, event, battles }))
    } catch (err) {
    }
  }, [])

  useEffect(() => {
    if (eventId) loadData(eventId, state.group)
  }, [eventId, state.group, loadData])

  // Socket event handlers
  const handleVotingTick = useCallback((data: { battleId: number; secondsLeft: number }) => {
    setSecondsLeft(data.secondsLeft)
  }, [])

  const handleVotingOpened = useCallback((data: VotingOpenedPayload) => {
    setState((prev) => ({
      ...prev,
      currentYellow: data.yellow.name,
      currentPurple: data.purple.name,
    }))
    setSecondsLeft(30)
    switchMode("timer")
    loadData(eventId, state.group)
  }, [loadData, switchMode, eventId, state.group])

  const handleBattleWinner = useCallback((payload: { battleId: number; winnerId: number; winnerName: string; yellowVotes: number; purpleVotes: number }) => {
    setSecondsLeft(null)
    setState((prev) => ({ ...prev, winnerData: payload }))
    switchMode("winner")
  }, [switchMode])

  const handleBattleTie = useCallback((payload: { battleId: number }) => {
    setSecondsLeft(null)
    switchMode("tie")
  }, [switchMode])

  const handleBattleRerun = useCallback(() => {
    switchMode("bracket")
    loadData(eventId, state.group)
  }, [loadData, switchMode, eventId, state.group])

  const handleBattleForfeit = useCallback(() => {
    loadData(eventId, state.group)
  }, [loadData, eventId, state.group])

  useVotingTick(handleVotingTick)
  useVotingOpened(handleVotingOpened)
  useBattleWinner(handleBattleWinner)
  useBattleTie(handleBattleTie)
  useBattleRerun(handleBattleRerun)
  useBattleForfeit(handleBattleForfeit)

  // Listen for admin commands via WebSocket
  const handleScreenCommand = useCallback((command: string) => {
    if (command === "show_bracket") {
      switchMode("bracket")
    } else if (command === "show_logo") {
      switchMode("logo")
    }
  }, [switchMode])

  const handleScreenGroup = useCallback((group: string) => {
    // Always trigger transition when switching groups
    setIsTransitioning(true)
    setTimeout(() => {
      setState((prev) => ({ ...prev, group: group as ContestantGroup }))
      loadData(eventId, group as ContestantGroup)
    }, 300)
    setTimeout(() => {
      setIsTransitioning(false)
    }, 600)
  }, [loadData, eventId])

  useScreenCommand(handleScreenCommand)
  useScreenGroupCommand(handleScreenGroup)

  return (
    <main className="min-h-screen w-full overflow-hidden bg-btc-dark relative">
      <style>{`
        @keyframes wipeRight {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100vw);
          }
        }
      `}</style>
      
      {/* Base content */}
      <div className="absolute inset-0">
        <ModeContent mode={currentMode} state={state} secondsLeft={secondsLeft} />
      </div>

      {/* Wipe overlay - purple and yellow stripes */}
      {isTransitioning && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, #eab308 0%, #9333ea 50%, #eab308 100%)',
            backgroundSize: '200% 100%',
            animation: 'wipeRight 0.6s ease-in-out forwards',
            zIndex: 50,
          }}
        />
      )}
    </main>
  )
}

function ModeContent({ mode, state, secondsLeft }: { mode: ScreenMode, state: ScreenState, secondsLeft: number | null }) {
  switch (mode) {
    case 'logo':    return <LogoView eventName={state.event?.name} />
    case 'bracket': return <BracketView battles={state.battles} group={state.group} />
    case 'winner':  return state.winnerData ? <WinnerReveal {...state.winnerData} /> : null
    case 'tie':     return <TieReveal />
    case 'timer':   return <VotingTimer
        secondsLeft={secondsLeft ?? 60}
        yellow={state.currentYellow ?? ''}
        purple={state.currentPurple ?? ''}
      />
  }
}

export default function ScreenPage() {
  return (
    <SocketProvider>
      <ScreenApp />
    </SocketProvider>
  )
}
