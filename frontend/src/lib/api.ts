import type { Battle, Event, VoteTally, ContestantGroup, VoteChoice, Contestant } from "./types"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://beat-the-crew-production.up.railway.app/"

// Helper to get auth header
function getAuthHeader(): HeadersInit {
  if (typeof window === "undefined") return {}
  const token = localStorage.getItem("admin_token")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Auth
export async function login(username: string, password: string): Promise<{ accessToken: string }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) throw new Error("Invalid password")
  return res.json()
}

// Events
export async function createEvent(name: string): Promise<Event> {
  const res = await fetch(`${API_BASE}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error("Failed to create event")
  return res.json()
}

export async function getEvents(): Promise<(Event & { _count: { contestants: number; battles: number } })[]> {
  const res = await fetch(`${API_BASE}/events`)
  if (!res.ok) throw new Error("Failed to fetch events")
  return res.json()
}

export async function getEvent(id: number): Promise<Event> {
  const res = await fetch(`${API_BASE}/events/${id}`)
  if (!res.ok) throw new Error("Event not found")
  return res.json()
}

export async function addContestants(eventId: number, names: string[], group: ContestantGroup): Promise<{ count: number }> {
  const res = await fetch(`${API_BASE}/events/${eventId}/contestants`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify({ names, group }),
  })
  if (!res.ok) throw new Error("Failed to add contestants")
  return res.json()
}

export async function updateContestant(contestantId: number, name: string): Promise<Contestant> {
  const res = await fetch(`${API_BASE}/events/contestants/${contestantId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error("Failed to update contestant")
  return res.json()
}

export async function generateBracket(eventId: number, group: ContestantGroup): Promise<Battle[]> {
  const res = await fetch(`${API_BASE}/events/${eventId}/generate?group=${group}`, {
    method: "POST",
    headers: { ...getAuthHeader() },
  })
  if (!res.ok) throw new Error("Failed to generate bracket")
  return res.json()
}

export async function reshuffleBracket(eventId: number, group: ContestantGroup): Promise<Battle[]> {
  const res = await fetch(`${API_BASE}/events/${eventId}/reshuffle?group=${group}`, {
    method: "POST",
    headers: { ...getAuthHeader() },
  })
  if (!res.ok) throw new Error("Failed to reshuffle bracket")
  return res.json()
}

export async function getBracket(eventId: number, group: ContestantGroup): Promise<Battle[]> {
  const res = await fetch(`${API_BASE}/events/${eventId}/bracket?group=${group}`, {
    headers: { ...getAuthHeader() },
  })
  if (!res.ok) throw new Error("Failed to get bracket")
  return res.json()
}

// Battles
export async function getCurrentBattle(): Promise<Battle | null> {
  const res = await fetch(`${API_BASE}/battles/current`, {
    headers: { ...getAuthHeader() },
  })
  if (!res.ok) return null
  return res.json()
}

export async function getActiveBattle(eventId: number): Promise<Battle | null> {
  const res = await fetch(`${API_BASE}/battles/active?eventId=${eventId}`)
  if (!res.ok) return null
  return res.json()
}

export async function getBattle(battleId: number): Promise<Battle> {
  const res = await fetch(`${API_BASE}/battles/${battleId}`)
  if (!res.ok) throw new Error("Battle not found")
  return res.json()
}

export async function openVoting(battleId: number): Promise<Battle> {
  const res = await fetch(`${API_BASE}/battles/${battleId}/open`, {
    method: "PATCH",
    headers: { ...getAuthHeader() },
  })
  if (!res.ok) throw new Error("Failed to open voting")
  return res.json()
}

export async function closeVoting(battleId: number): Promise<Battle> {
  const res = await fetch(`${API_BASE}/battles/${battleId}/close`, {
    method: "PATCH",
    headers: { ...getAuthHeader() },
  })
  if (!res.ok) throw new Error("Failed to close voting")
  return res.json()
}

export async function announceResult(battleId: number): Promise<Battle> {
  const res = await fetch(`${API_BASE}/battles/${battleId}/announce`, {
    method: "PATCH",
    headers: { ...getAuthHeader() },
  })
  if (!res.ok) throw new Error("Failed to announce result")
  return res.json()
}

export async function rerunBattle(battleId: number): Promise<Battle> {
  const res = await fetch(`${API_BASE}/battles/${battleId}/rerun`, {
    method: "PATCH",
    headers: { ...getAuthHeader() },
  })
  if (!res.ok) throw new Error("Failed to rerun battle")
  return res.json()
}

export async function forfeitBattle(battleId: number, side: "yellow" | "purple"): Promise<Battle> {
  const res = await fetch(`${API_BASE}/battles/${battleId}/forfeit?side=${side}`, {
    method: "PATCH",
    headers: { ...getAuthHeader() },
  })
  if (!res.ok) throw new Error("Failed to forfeit battle")
  return res.json()
}

export async function getVoteTally(battleId: number): Promise<VoteTally> {
  const res = await fetch(`${API_BASE}/battles/${battleId}/tally`, {
    headers: { ...getAuthHeader() },
  })
  if (!res.ok) throw new Error("Failed to get tally")
  return res.json()
}

// Votes
export async function castVote(battleId: number, userId: string, votedFor: VoteChoice): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/votes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ battleId, userId, votedFor }),
  })
  if (!res.ok) {
    if (res.status === 409) throw new Error("Already voted")
    if (res.status === 400) throw new Error("Voting is not open")
    throw new Error("Failed to cast vote")
  }
  return res.json()
}
