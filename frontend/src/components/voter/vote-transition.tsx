"use client"

import { motion } from "framer-motion"
import { VoteChoice } from "@/lib/types"

interface VoteTransitionProps {
  choice: VoteChoice
}

export function VoteTransition({choice}: VoteTransitionProps) {
  const isYellow =
    choice === VoteChoice.YELLOW

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Original split */}
      <div className="absolute inset-0 flex flex-col">
        <div className="flex-1 bg-btc-yellow" />
        <div className="h-0.5 bg-btc-dark" />
        <div className="flex-1 bg-btc-purple" />
      </div>

      {/* Expanding chosen color */}
      <motion.div
        initial={{height: "50%", top: isYellow ? 0 : "50%"}}
        animate={{height: "100%", top: 0}}
        transition={{duration: 0.15, ease: "linear"}}
        className="absolute left-0 right-0 flex flex-col"
      >
        {/* Chosen color */}
        <div
          className={`flex-1 ${isYellow ? "bg-btc-yellow" : "bg-btc-purple"}`}
        />
        {/* Moving divider */}
        <div className="h-0.5 bg-btc-dark" />
      </motion.div>

      {/* Confirmation icon */}
      <motion.div
        initial={{opacity: 0, scale: .7}}
        animate={{opacity: 1, scale: 1}}
        transition={{delay: .2, duration: .5}}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className={`text-8xl font-black ${isYellow ? "text-btc-dark" : "text-white"}`}>
          ✓
        </div>
      </motion.div>
    </div>
  )
}