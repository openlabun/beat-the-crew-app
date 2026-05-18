"use client"

import { useEffect, useState, useCallback } from "react"
import { v4 as uuidv4 } from "uuid"
import { SocketProvider, useVotingOpened, useBattleWinner, useBattleTie, useBattleRerun, useBattleForfeit, useSocket } from "@/lib/socket-context"
import { getCurrentBattle, castVote } from "@/lib/api"
import { VoteChoice, type Battle, type AppState, ContestantGroup } from "@/lib/types"
import { WaitingState } from "@/components/voter/waiting-state"
import { VotingState } from "@/components/voter/voting-state"
import { VotedState } from "@/components/voter/voted-state"
import { WinnerState } from "@/components/voter/winner-state"
import { TieState } from "@/components/voter/tie-state"
import { ForfeitState } from "@/components/voter/forfeit-state"
import { useScreenCommand } from "@/lib/socket-context"
import { useVisibilityRehydrate } from "@/lib/visibility-rehydrate"

function VoterApp() {
  const [appState, setAppState] = useState<AppState>({ status: "waiting" })
  const [userId, setUserId] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isConnected } = useSocket()

  // Initialize user ID from localStorage
  useEffect(() => {
    let id = localStorage.getItem("btc_user_id")
    if (!id) {
      id = uuidv4()
      localStorage.setItem("btc_user_id", id)
    }
    setUserId(id)
  }, [])

  // Check for active battle on mount and when user returns to tab
  const checkActiveBattle = useCallback(async () => {
    try {
      const battle = await getCurrentBattle()
      if (battle && battle.votingOpen) {
        const votedBattles = JSON.parse(localStorage.getItem("btc_voted_battles") || "{}")
        if (votedBattles[battle.id]) {
          setAppState({ status: "voted", battle, choice: votedBattles[battle.id] as VoteChoice })
        } else {
          setAppState({ status: "voting", battle })
        }
      } else {
        setAppState(prev =>
          prev.status === "voting" ? { status: "waiting" } : prev
        )
      }
    } catch (err) {}
  }, [])

  useEffect(() => { checkActiveBattle() }, [checkActiveBattle])
  useVisibilityRehydrate(checkActiveBattle)

  // Socket event handlers
  const handleVotingOpened = useCallback((payload: { battleId: number; yellow: string; purple: string }) => {
    const battle: Battle = {
      id: payload.battleId,
      round: 0,
      position: 0,
      eventId: 0,
      group: "CREW" as ContestantGroup,
      yellowContestantId: 0,
      purpleContestantId: 0,
      yellowContestant: { id: 0, name: payload.yellow, group: "CREW" as ContestantGroup, eventId: 0 },
      purpleContestant: { id: 0, name: payload.purple, group: "CREW" as ContestantGroup, eventId: 0 },
      winnerId: null,
      winner: null,
      votingOpen: true,
      active: true,
    }
    
    // Check if user already voted in this battle
    const votedBattles = JSON.parse(localStorage.getItem("btc_voted_battles") || "{}")
    if (votedBattles[payload.battleId]) {
      setAppState({
        status: "voted",
        battle,
        choice: votedBattles[payload.battleId] as VoteChoice,
      })
    } else {
      setAppState({ status: "voting", battle })
    }
    setError(null)
  }, [])

  const handleBattleWinner = useCallback((payload: { battleId: number; winnerId: number; winnerName: string; yellowVotes: number; purpleVotes: number }) => {
    setAppState((prev) => {
      if (prev.status === "voting" || prev.status === "voted") {
        return {
          status: "winner",
          battle: prev.battle,
          winnerId: payload.winnerId,
          winnerName: payload.winnerName,
          yellowVotes: payload.yellowVotes,
          purpleVotes: payload.purpleVotes,
        }
      }
      return prev
    })
  }, [])

  const handleBattleTie = useCallback((payload: { battleId: number }) => {
    setAppState((prev) => {
      if (prev.status === "voting" || prev.status === "voted") {
        return { status: "tie", battle: prev.battle }
      }
      return prev
    })
  }, [])

  const handleBattleRerun = useCallback((payload: { battleId: number; yellow: string; purple: string }) => {
    // Clear the vote for this battle
    const votedBattles = JSON.parse(localStorage.getItem("btc_voted_battles") || "{}")
    delete votedBattles[payload.battleId]
    localStorage.setItem("btc_voted_battles", JSON.stringify(votedBattles))

    const battle: Battle = {
      id: payload.battleId,
      round: 0,
      position: 0,
      eventId: 0,
      group: "CREW" as ContestantGroup,
      yellowContestantId: 0,
      purpleContestantId: 0,
      yellowContestant: { id: 0, name: payload.yellow, group: "CREW" as ContestantGroup, eventId: 0 },
      purpleContestant: { id: 0, name: payload.purple, group: "CREW" as ContestantGroup, eventId: 0 },
      winnerId: null,
      winner: null,
      votingOpen: true,
      active: true,
    }
    setAppState({ status: "voting", battle })
  }, [])

  const handleBattleForfeit = useCallback((payload: { battleId: number; forfeitingName: string; winnerName: string }) => {
    setAppState((prev) => {
      if (prev.status === "voting" || prev.status === "voted" || prev.status === "waiting") {
        return {
          status: "forfeit",
          battle: prev.status !== "waiting" ? prev.battle : {} as Battle,
          forfeitingName: payload.forfeitingName,
          winnerName: payload.winnerName,
        }
      }
      return prev
    })
  }, [])

  const handleScreenCommand = useCallback((command: string) => {
    if (command === "show_logo") {
      setAppState({ status: "waiting" })
    }
  }, [])

  useScreenCommand(handleScreenCommand)
  useVotingOpened(handleVotingOpened)
  useBattleWinner(handleBattleWinner)
  useBattleTie(handleBattleTie)
  useBattleRerun(handleBattleRerun)
  useBattleForfeit(handleBattleForfeit)

  const handleVote = async (choice: VoteChoice) => {
    if (appState.status !== "voting" || !userId || isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    try {
      await castVote(appState.battle.id, userId, choice)
      
      // Store the vote locally
      const votedBattles = JSON.parse(localStorage.getItem("btc_voted_battles") || "{}")
      votedBattles[appState.battle.id] = choice
      localStorage.setItem("btc_voted_battles", JSON.stringify(votedBattles))

      setAppState({
        status: "voted",
        battle: appState.battle,
        choice,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cast vote")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen w-full overflow-hidden">
      {appState.status === "waiting" && <WaitingState isConnected={isConnected} />}
      {appState.status === "voting" && (
        <VotingState
          battle={appState.battle}
          onVote={handleVote}
          isSubmitting={isSubmitting}
          error={error}
        />
      )}
      {appState.status === "voted" && (
        <VotedState battle={appState.battle} choice={appState.choice} />
      )}
      {appState.status === "winner" && (
        <WinnerState
          battle={appState.battle}
          winnerId={appState.winnerId}
          winnerName={appState.winnerName}
          yellowVotes={appState.yellowVotes}
          purpleVotes={appState.purpleVotes}
        />
      )}
      {appState.status === "tie" && <TieState battle={appState.battle} />}
      {appState.status === "forfeit" && (
        <ForfeitState
          forfeitingName={appState.forfeitingName}
          winnerName={appState.winnerName}
        />
      )}
    </main>
  )
}

export default function VoterPage() {
  return (
    <SocketProvider>
      <VoterApp />
    </SocketProvider>
  )
}
