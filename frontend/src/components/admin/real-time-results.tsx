"use client"

import { type Battle, type VoteTally } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RealTimeResultsProps {
  tally: VoteTally
  activeBattle: Battle | null
}

export function RealTimeResults({ tally, activeBattle }: RealTimeResultsProps) {
  const total = tally.yellowVotes + tally.purpleVotes
  const yellowPercent = total > 0 ? Math.round((tally.yellowVotes / total) * 100) : 50
  const purplePercent = total > 0 ? Math.round((tally.purpleVotes / total) * 100) : 50

  return (
    <Card className="bg-btc-dark-lighter border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-foreground text-sm uppercase tracking-wider">
          Resultados en Tiempo Real
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Vote counters */}
        <div className="grid grid-cols-2 gap-4">
          {/* Yellow */}
          <div className="bg-btc-yellow p-4 rounded-lg">
            <p className="text-btc-dark text-xs uppercase tracking-wider font-medium">
              {activeBattle?.yellowContestant?.name || "Amarillo"}
            </p>
            <p className="text-btc-dark text-4xl font-black">{tally.yellowVotes}</p>
            <p className="text-btc-dark/70 text-xs">votos</p>
          </div>

          {/* Purple */}
          <div className="bg-btc-purple p-4 rounded-lg">
            <p className="text-foreground text-xs uppercase tracking-wider font-medium">
              {activeBattle?.purpleContestant?.name || "Morado"}
            </p>
            <p className="text-foreground text-4xl font-black">{tally.purpleVotes}</p>
            <p className="text-foreground/70 text-xs">votos</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex h-4 rounded overflow-hidden">
            <div
              className="bg-btc-yellow transition-all duration-500"
              style={{ width: `${yellowPercent}%` }}
            />
            <div
              className="bg-btc-purple transition-all duration-500"
              style={{ width: `${purplePercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{yellowPercent}%</span>
            <span>{total} votos totales</span>
            <span>{purplePercent}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
