// Enums
export enum ContestantGroup {
  CREW = "CREW",
  INVITED = "INVITED",
}

export enum VoteChoice {
  YELLOW = "YELLOW",
  PURPLE = "PURPLE",
}

export enum BattleStatus {
  PENDING = "PENDING",
  VOTING = "VOTING",
  CLOSED = "CLOSED",
  ANNOUNCED = "ANNOUNCED",
}

// Types
export interface Contestant {
  id: number
  name: string
  group: ContestantGroup
  eventId: number
}

export interface Battle {
  id: number
  round: number
  position: number
  eventId: number
  group: ContestantGroup
  yellowContestantId: number | null
  purpleContestantId: number | null
  yellowContestant: Contestant | null
  purpleContestant: Contestant | null
  winnerId: number | null
  winner: Contestant | null
  votingOpen: boolean
  active: boolean
}

export interface Event {
  id: number
  name: string
  createdAt: string
  contestants: Contestant[]
  battles: Battle[]
}

export interface VoteTally {
  yellowVotes: number
  purpleVotes: number
  votingOpen: boolean
}

// WebSocket Event Payloads
export interface VotingOpenedPayload {
  battleId: number
  yellow: string
  purple: string
}

export interface BattleWinnerPayload {
  battleId: number
  winnerId: number
  winnerName: string
  yellowVotes: number
  purpleVotes: number
}

export interface BattleTiePayload {
  battleId: number
  yellow: string
  purple: string
}

export interface BattleRerunPayload {
  battleId: number
  yellow: string
  purple: string
}

export interface BattleForfeitPayload {
  battleId: number
  forfeitingName: string
  winnerName: string
}

export interface VotesUpdatedPayload {
  battleId: number
  yellowVotes: number
  purpleVotes: number
}

// App State
export type AppState = 
  | { status: "waiting" }
  | { status: "voting"; battle: Battle }
  | { status: "voted"; battle: Battle; choice: VoteChoice }
  | { status: "winner"; battle: Battle; winnerId: number; winnerName: string; yellowVotes: number; purpleVotes: number }
  | { status: "tie"; battle: Battle }
  | { status: "forfeit"; battle: Battle; forfeitingName: string; winnerName: string }
  | { status: "vote_transition"; battle: Battle; choice: VoteChoice }
