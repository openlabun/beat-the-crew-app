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
          setState((prev) => ({ ...prev, mode: "bracket" }))
        } else if (command === "show_logo") {
          setState((prev) => ({ ...prev, mode: "logo" }))
        } else if (command?.startsWith("group:")) {
          const group = command.replace("group:", "") as ContestantGroup
          setState((prev) => ({ ...prev, group }))
          loadData()
        }
      }
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [loadData])

  return (
    <main className="min-h-screen w-full overflow-hidden bg-btc-dark">
      {state.mode === "logo" && <LogoView eventName={state.event?.name} />}
      {state.mode === "bracket" && (
        <BracketView battles={state.battles} group={state.group} />
      )}
      {state.mode === "winner" && state.winnerData && (
        <WinnerReveal
          winnerName={state.winnerData.winnerName}
          yellowVotes={state.winnerData.yellowVotes}
          purpleVotes={state.winnerData.purpleVotes}
        />
      )}
      {state.mode === "tie" && <TieReveal />}
    </main>
  )
}

export default function ScreenPage() {
  return (
    <SocketProvider>
      <ScreenApp />
    </SocketProvider>
  )
}
