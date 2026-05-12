"use client"

import { useEffect, useState, useCallback } from "react"
import { SocketProvider, useVotingOpened, useBattleWinner, useBattleTie, useBattleRerun, useBattleForfeit, useSocket } from "@/lib/socket-context"
import { getBracket, getActiveBattle, getEvent } from "@/lib/api"
import { ContestantGroup, type Battle, type Event } from "@/lib/types"
import { BracketView } from "@/components/screen/bracket-view"
import { LogoView } from "@/components/screen/logo-view"
import { WinnerReveal } from "@/components/screen/winner-reveal"
import { TieReveal } from "@/components/screen/tie-reveal"

const EVENT_ID = parseInt(process.env.NEXT_PUBLIC_EVENT_ID || "1")

type ScreenMode = "logo" | "bracket" | "winner" | "tie"

interface ScreenState {
  mode: ScreenMode
  group: ContestantGroup
  battles: Battle[]
  event: Event | null
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
  const [prevMode, setPrevMode] = useState<ScreenMode | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const switchMode = useCallback((newMode: ScreenMode) => {
    if (newMode === currentMode || isTransitioning) return
    setIsTransitioning(true)
    
    // Change content halfway through the wipe animation (300ms out of 600ms)
    setTimeout(() => {
      setCurrentMode(newMode)
      setPrevMode(null)
    }, 300)
    
    // Finish transitioning after animation completes
    setTimeout(() => {
      setIsTransitioning(false)
    }, 600)
  }, [currentMode, isTransitioning])


  // Load event and bracket data
  const loadData = useCallback(async () => {
    try {
      const [event, battles] = await Promise.all([
        getEvent(EVENT_ID),
        getBracket(EVENT_ID, state.group),
      ])
      setState((prev) => ({ ...prev, event, battles }))
    } catch (err) {
      console.log("[v0] Failed to load screen data:", err)
    }
  }, [state.group])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Socket event handlers
  const handleVotingOpened = useCallback(() => {
    loadData()
  }, [loadData])

  const handleBattleWinner = useCallback((payload: { battleId: number; winnerId: number; winnerName: string; yellowVotes: number; purpleVotes: number }) => {
    setState((prev) => ({
      ...prev,
      mode: "winner",
      winnerData: payload,
    }))
    // Return to bracket after delay
    setTimeout(() => {
      loadData()
      setState((prev) => ({ ...prev, mode: "bracket", winnerData: undefined }))
    }, 8000)
  }, [loadData])

  const handleBattleTie = useCallback((payload: { battleId: number }) => {
    setState((prev) => ({ ...prev, mode: "tie" }))
    setTimeout(() => {
      setState((prev) => ({ ...prev, mode: "bracket" }))
    }, 5000)
  }, [])

  const handleBattleRerun = useCallback(() => {
    setState((prev) => ({ ...prev, mode: "bracket" }))
    loadData()
  }, [loadData])

  const handleBattleForfeit = useCallback(() => {
    loadData()
  }, [loadData])

  useVotingOpened(handleVotingOpened)
  useBattleWinner(handleBattleWinner)
  useBattleTie(handleBattleTie)
  useBattleRerun(handleBattleRerun)
  useBattleForfeit(handleBattleForfeit)

  // Listen for admin commands via localStorage (for local control)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "btc_screen_command") {
        const command = e.newValue
        if (command === "show_bracket") {
          switchMode("bracket")
          setState((prev) => ({ ...prev, mode: "bracket" }))
        } else if (command === "show_logo") {
          switchMode("logo")
          setState((prev) => ({ ...prev, mode: "logo" }))
        } else if (command?.startsWith("group:")) {
          const group = command.replace("group:", "") as ContestantGroup
          // Always trigger transition when switching groups, even if already on bracket
          setIsTransitioning(true)
          setTimeout(() => {
            setState((prev) => ({ ...prev, group }))
            loadData()
          }, 300)
          setTimeout(() => {
            setIsTransitioning(false)
          }, 600)
        }
      }
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [loadData, switchMode])

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
        <ModeContent mode={currentMode} state={state} />
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

function ModeContent({ mode, state }: { mode: ScreenMode, state: ScreenState }) {
  switch (mode) {
    case 'logo':    return <LogoView eventName={state.event?.name} />
    case 'bracket': return <BracketView battles={state.battles} group={state.group} />
    case 'winner':  return state.winnerData ? <WinnerReveal {...state.winnerData} /> : null
    case 'tie':     return <TieReveal />
  }
}

export default function ScreenPage() {
  return (
    <SocketProvider>
      <ScreenApp />
    </SocketProvider>
  )
}
