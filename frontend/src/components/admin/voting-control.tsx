"use client"

import { type Battle, type VoteTally } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface VotingControlProps {
  activeBattle: Battle | null
  tally: VoteTally
  onOpenVoting: (battleId: number) => Promise<void>
  onCloseVoting: () => Promise<void>
  onAnnounceResult: () => Promise<void>
  onRerun: () => Promise<void>
}

export function VotingControl({
  activeBattle,
  onCloseVoting,
  onAnnounceResult,
  onRerun,
}: VotingControlProps) {
  const yellowName = activeBattle?.yellowContestant?.name || "Amarillo"
  const purpleName = activeBattle?.purpleContestant?.name || "Morado"
  const isVotingOpen = activeBattle?.votingOpen ?? false
  const hasWinner = !!activeBattle?.winnerId

  return (
    <Card className="bg-btc-dark-lighter border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-foreground text-sm uppercase tracking-wider">
          Control de Votación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Voting buttons */}
        <div className="flex gap-2">
          <Button
            onClick={onCloseVoting}
            disabled={!isVotingOpen}
            className={`flex-1 ${
              isVotingOpen
                ? "bg-btc-yellow text-btc-dark hover:bg-btc-yellow-light"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {isVotingOpen ? "Cerrar Votación" : "Iniciar Votación"}
          </Button>
          <Button
            onClick={onAnnounceResult}
            disabled={isVotingOpen || !activeBattle || hasWinner}
            className={`flex-1 ${
              !isVotingOpen && activeBattle && !hasWinner
                ? "bg-btc-purple text-foreground hover:bg-btc-purple-light"
                : "bg-muted text-muted-foreground"
            }`}
          >
            Anunciar Resultado
          </Button>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isVotingOpen ? "bg-green-500 animate-pulse" : "bg-muted-foreground"
            }`}
          />
          <span className="text-xs text-muted-foreground uppercase">
            {isVotingOpen ? "Votación Abierta" : "Votación Cerrada"}
          </span>
        </div>

        {/* Active battle info */}
        {activeBattle && (
          <div className="text-sm text-muted-foreground">
            <span className="text-btc-yellow">{yellowName}</span>
            {" vs "}
            <span className="text-btc-purple">{purpleName}</span>
          </div>
        )}

        {/* Rerun button (for ties) */}
        {activeBattle && !isVotingOpen && !hasWinner && (
          <Button
            onClick={onRerun}
            variant="outline"
            className="w-full border-btc-purple text-btc-purple hover:bg-btc-purple hover:text-foreground"
          >
            Repetir Batalla (Empate)
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
