"use client"

import { Flag } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ForfeitButtonProps {
  contestantName: string
  side: "yellow" | "purple"
  battleId: number
  onForfeit: (battleId: number, side: "yellow" | "purple") => void
  className?: string
}

export function ForfeitButton({
  contestantName,
  side,
  battleId,
  onForfeit,
  className = "",
}: ForfeitButtonProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          className={`
            absolute
            top-1/2
            -translate-y-1/2
            opacity-30
            hover:opacity-100
            hover:scale-125
            transition-all
            duration-200
            ${className}
          `}
          title={`Retirar a ${contestantName}`}
        >
          <Flag className="w-4 h-4" />
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Confirmar retiro?
          </AlertDialogTitle>

          <AlertDialogDescription>
            <strong>{contestantName}</strong> perderá
            automáticamente esta batalla y el oponente avanzará
            a la siguiente ronda.

            <br />
            <br />

            Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>
            Cancelar
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={() =>
              onForfeit(battleId, side)
            }
            className={`bg-btc-${side} text-btc-${side === "yellow" ? "dark" : "foreground"} hover:bg-btc-${side}-light`}
          >
            Confirmar retiro
          </AlertDialogAction>

        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}