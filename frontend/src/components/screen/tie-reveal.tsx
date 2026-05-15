"use client"

export function TieReveal() {
  return (
    <div className="min-h-screen w-full bg-btc-dark flex flex-col items-center justify-center relative overflow-hidden">
      {/* Split background */}
      <div className="absolute inset-0 flex">
        <div className="w-1/2 bg-btc-yellow/10" />
        <div className="w-1/2 bg-btc-purple/10" />
      </div>

      {/* VS clash effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-full bg-foreground/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-8">
        <h1 className="text-7xl md:text-9xl font-black text-foreground uppercase tracking-tight animate-pulse">
          ¡Empate!
        </h1>
        <p className="text-2xl md:text-4xl text-muted-foreground uppercase tracking-[0.3em]">
          Preparando desempate...
        </p>

        {/* Animated indicators */}
        <div className="flex items-center gap-8 mt-12">
          <div className="w-24 h-24 rounded-full bg-btc-yellow animate-pulse shadow-[0_0_60px_var(--btc-yellow)]" />
          <span className="text-4xl font-black text-muted-foreground">VS</span>
          <div className="w-24 h-24 rounded-full bg-btc-purple animate-pulse shadow-[0_0_60px_var(--btc-purple)]" style={{ animationDelay: "0.5s" }} />
        </div>
      </div>
    </div>
  )
}
