"use client"

import { motion } from "framer-motion"
import { useEffect } from "react"
import { type Battle } from "@/lib/types"

interface WinnerStateProps {
  battle: Battle
  yellowName: string
  winnerName: string
}

export function WinnerState({ battle, yellowName, winnerName }: WinnerStateProps) {
  const isYellowWinner = yellowName === winnerName
  const bgClass = isYellowWinner ? "bg-btc-yellow" : "bg-btc-purple"
  const textClass = isYellowWinner ? "text-btc-dark" : "text-white"

  useEffect(() => {
    navigator.vibrate?.([100, 50, 200])
  }, [])

  return (
    <div className={`min-h-screen w-full relative overflow-hidden flex items-center justify-center ${bgClass}`}>
      {/* Flash transition */}
      <motion.div
        initial={{ opacity: 0.8 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.7 }}
        className="absolute inset-0 bg-white pointer-events-none"
      />

      {/* Radiating circles */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.2, opacity: 0.5 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.5, ease: "linear" }}
            className={`absolute w-40 h-40 rounded-full border-2 ${
              isYellowWinner ? "border-btc-dark/20" : "border-white/20"
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`${textClass}/60 uppercase tracking-[0.5em] text-sm mb-6`}
        >
          GANADOR
        </motion.p>

        <motion.h1
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.2, 1, 0.3, 1] }}
          className={`text-6xl md:text-8xl font-black uppercase wrap-break-word ${textClass}`}
        >
          {winnerName}
        </motion.h1>

        {/* Accent line */}
        <motion.div
          animate={{ scaleX: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`mt-8 h-1 w-24 rounded-full ${
            isYellowWinner ? "bg-btc-dark/40" : "bg-white/40"
          }`}
        />
      </div>
    </div>
  )
}