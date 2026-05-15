"use client"

interface ForfeitStateProps {
  forfeitingName: string
  winnerName: string
}

export function ForfeitState({ forfeitingName, winnerName }: ForfeitStateProps) {
  return (
    <div className="min-h-screen w-full bg-btc-dark flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: "radial-gradient(circle at center, var(--btc-purple) 0%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-6">
        <p className="text-xl md:text-2xl text-muted-foreground uppercase tracking-widest">
          Abandono
        </p>

        <h1 className="text-4xl md:text-6xl font-black text-btc-purple uppercase tracking-tight">
          {winnerName}
        </h1>

        <p className="text-xl md:text-2xl text-foreground uppercase tracking-wide">
          avanza por abandono
        </p>

        <p className="text-muted-foreground mt-4">
          {forfeitingName} se ha retirado
        </p>
      </div>
    </div>
  )
}
