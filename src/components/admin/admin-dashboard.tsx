"use client"

import { useState, useEffect, useCallback } from "react"
import { useVotesUpdated } from "@/lib/socket-context"
import {
  createEvent,
  getEvent,
  getBracket,
  getVoteTally,
  addContestants,
  openVoting,
  closeVoting,
  announceResult,
  rerunBattle,
  forfeitBattle,
} from "@/lib/api"
import { ContestantGroup, type Battle, type Event, type VoteTally } from "@/lib/types"
import { VotingControl } from "./voting-control"
import { RealTimeResults } from "./real-time-results"
import { ScreenControl } from "./screen-control"
import { BracketControl } from "./bracket-control"
import { EventSetup } from "./event-setup"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

interface AdminDashboardProps {
  onLogout: () => void
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [eventId, setEventId] = useState<number | null>(() => {
    if (typeof window === 'undefined') return null
    const stored = localStorage.getItem('btc_event_id')
    return stored ? Number(stored) : null
  })
  const [event, setEvent] = useState<Event | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<ContestantGroup>(ContestantGroup.CREW)
  const [battles, setBattles] = useState<Battle[]>([])
  const [activeBattle, setActiveBattle] = useState<Battle | null>(null)
  const [tally, setTally] = useState<VoteTally>({ yellowVotes: 0, purpleVotes: 0, votingOpen: false })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load event data
  const loadEventData = useCallback(async (id: number) => {
    try {
      setIsLoading(true)
      setError(null)
      const [eventData, bracketData] = await Promise.all([
        getEvent(id),
        getBracket(id, selectedGroup).catch(() => []),
      ])
      setEvent(eventData)
      setBattles(bracketData)

      // Find active battle
      const active = bracketData.find((b: Battle) => b.active)
      setActiveBattle(active || null)

      if (active) {
        const tallyData = await getVoteTally(active.id)
        setTally(tallyData)
      }
    } catch (err) {
      console.error("Failed to load event data:", err)
      setError("Failed to load event. Make sure the backend is running.")
      localStorage.removeItem('btc_event_id')
      setEventId(null)
    } finally {
      setIsLoading(false)
    }
  }, [selectedGroup])

  // Reload when selectedGroup changes
  useEffect(() => {
    if (eventId) {
      loadEventData(eventId)
    }
  }, [eventId, selectedGroup, loadEventData])

  // Handle creating a new event
  const handleCreateEvent = async (eventName: string) => {
    try {
      setError(null)
      const newEvent = await createEvent(eventName)
      return newEvent.id
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event")
      throw err
    }
  }

  const handleSetEventId = (id: number) => {
    localStorage.setItem('btc_event_id', String(id))
    setEventId(id)
  }

  // Handle adding contestants
  const handleAddContestants = async (names: string[], group: ContestantGroup) => {
    if (!eventId) return
    try {
      setError(null)
      await addContestants(eventId, names, group)
      // Reload event data to reflect new contestants
      await loadEventData(eventId)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add contestants")
      throw err
    }
  }

  // Handle real-time vote updates
  const handleVotesUpdated = useCallback((payload: { battleId: number; yellowVotes: number; purpleVotes: number }) => {
    if (activeBattle?.id === payload.battleId) {
      setTally((prev) => ({
        ...prev,
        yellowVotes: payload.yellowVotes,
        purpleVotes: payload.purpleVotes,
      }))
    }
  }, [activeBattle?.id])

  useVotesUpdated(handleVotesUpdated)

  // Battle control handlers
  const handleOpenVoting = async (battleId: number) => {
    try {
      await openVoting(battleId)
      if (eventId) await loadEventData(eventId)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to open voting")
    }
  }

  const handleCloseVoting = async () => {
    if (!activeBattle || !eventId) return
    try {
      await closeVoting(activeBattle.id)
      await loadEventData(eventId)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to close voting")
    }
  }

  const handleAnnounceResult = async () => {
    if (!activeBattle || !eventId) return
    try {
      await announceResult(activeBattle.id)
      await loadEventData(eventId)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to announce result")
    }
  }

  const handleRerun = async () => {
    if (!activeBattle || !eventId) return
    try {
      await rerunBattle(activeBattle.id)
      await loadEventData(eventId)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rerun battle")
    }
  }

  const handleForfeit = async (side: "yellow" | "purple") => {
    if (!activeBattle || !eventId) return
    try {
      await forfeitBattle(activeBattle.id, side)
      await loadEventData(eventId)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to forfeit battle")
    }
  }

  // Show event setup screen if no event selected
  if (!eventId) {
    return (
      <EventSetup
        onCreateEvent={handleCreateEvent}
        onLogout={onLogout}
        onComplete={(id: number) => {
          handleSetEventId(id)
        }}
      />
    )
  }

  if (isLoading && !event) {
    return (
      <div className="min-h-screen bg-btc-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-btc-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-btc-dark p-4 md:p-6 relative overflow-hidden">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-btc-purple uppercase tracking-wider">
              Panel de Control
            </h1>
            {event && <p className="text-sm text-muted-foreground mt-1">{event.name}</p>}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Salir
          </Button>
        </div>

        {/* Error display */}
        {error && (
          <div className="bg-destructive/20 border border-destructive text-destructive-foreground p-4 rounded-lg">
            {error}
          </div>
        )}

        {/* Voting Control */}
        {event && (
          <>
            <VotingControl
              activeBattle={activeBattle}
              tally={tally}
              onOpenVoting={handleOpenVoting}
              onCloseVoting={handleCloseVoting}
              onAnnounceResult={handleAnnounceResult}
              onRerun={handleRerun}
              onForfeit={handleForfeit}
            />

            {/* Real-time Results */}
            <RealTimeResults tally={tally} activeBattle={activeBattle} />

            {/* Screen Control */}
            <ScreenControl />

            {/* Bracket Control */}
            <BracketControl
              eventId={eventId}
              battles={battles}
              selectedGroup={selectedGroup}
              onGroupChange={setSelectedGroup}
              onSelectBattle={handleOpenVoting}
              activeBattleId={activeBattle?.id || null}
              onRefresh={() => eventId && loadEventData(eventId)}
            />
          </>
        )}
      </div>
    </div>
  )
}