"use client"

import { useState } from "react"
import { VoteChoice, type Battle } from "@/lib/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface VotingStateProps {
  battle: Battle
  onVote: (choice: VoteChoice) => Promise<void>
  isSubmitting: boolean
  error: string | null
}

export function VotingState({ battle, onVote, isSubmitting, error }: VotingStateProps) {
  const [pendingVote, setPendingVote] = useState<VoteChoice | null>(null)

  const handleVoteClick = (choice: VoteChoice) => {
    setPendingVote(choice)
  }

  const handleConfirm = async () => {
    if (pendingVote) {
      await onVote(pendingVote)
      setPendingVote(null)
    }
  }

  const handleCancel = () => {
    setPendingVote(null)
  }

  const yellowName = battle.yellowContestant?.name || "Amarillo"
  const purpleName = battle.purpleContestant?.name || "Morado"

  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Yellow Button - Top Half */}
      <button
        onClick={() => handleVoteClick(VoteChoice.YELLOW)}
        disabled={isSubmitting}
        className="flex-1 relative overflow-hidden bg-btc-yellow hover:bg-btc-yellow-light active:scale-[0.98] transition-all duration-200 disabled:opacity-70"
      >
        {/* Stripe pattern overlay */}
        <div className="absolute inset-0 stripe-pattern opacity-30" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-6">
          <h2 className="text-4xl md:text-6xl font-black text-btc-dark uppercase tracking-tight">
            {yellowName}
          </h2>
          <p className="text-sm md:text-base text-btc-dark/70 uppercase tracking-widest mt-2">
            Toca para votar
          </p>
        </div>
      </button>

      {/* Divider */}
      <div className="h-1 bg-btc-dark" />

      {/* Purple Button - Bottom Half */}
      <button
        onClick={() => handleVoteClick(VoteChoice.PURPLE)}
        disabled={isSubmitting}
        className="flex-1 relative overflow-hidden bg-btc-purple hover:bg-btc-purple-light active:scale-[0.98] transition-all duration-200 disabled:opacity-70"
      >
        {/* Stripe pattern overlay */}
        <div className="absolute inset-0 stripe-pattern opacity-30" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-6">
          <h2 className="text-4xl md:text-6xl font-black text-foreground uppercase tracking-tight">
            {purpleName}
          </h2>
          <p className="text-sm md:text-base text-foreground/70 uppercase tracking-widest mt-2">
            Toca para votar
          </p>
        </div>
      </button>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 left-4 right-4 bg-destructive text-destructive-foreground p-4 rounded-lg text-center">
          {error}
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={pendingVote !== null} onOpenChange={() => setPendingVote(null)}>
        <AlertDialogContent className="bg-btc-dark border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground text-xl">
              Confirmar Voto
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {"¿Estás seguro que quieres votar por "}
              <span
                className={`font-bold ${
                  pendingVote === VoteChoice.YELLOW ? "text-btc-yellow" : "text-btc-purple"
                }`}
              >
                {pendingVote === VoteChoice.YELLOW ? yellowName : purpleName}
              </span>
              {"? Esta acción no se puede deshacer."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleCancel}
              className="bg-muted text-foreground hover:bg-muted/80"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isSubmitting}
              className={`${
                pendingVote === VoteChoice.YELLOW
                  ? "bg-btc-yellow text-btc-dark hover:bg-btc-yellow-light"
                  : "bg-btc-purple text-foreground hover:bg-btc-purple-light"
              }`}
            >
              {isSubmitting ? "Votando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
