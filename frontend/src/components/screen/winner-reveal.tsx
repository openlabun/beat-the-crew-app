"use client"

import { motion } from "framer-motion"

interface WinnerRevealProps {
  winnerName: string
  yellowVotes: number
  purpleVotes: number
}

export function WinnerReveal({ winnerName, yellowVotes, purpleVotes }: WinnerRevealProps) {
  const isPurpleWinner = purpleVotes > yellowVotes

  const theme = isPurpleWinner
    ? {
        primary: "#7B2FBE",
        secondary: "#B066FF",
        glow: "rgba(176,102,255,0.45)",
        particle: "#C084FC",
      }
    : {
        primary: "#EAB308",
        secondary: "#FFD84D",
        glow: "rgba(255,216,77,0.45)",
        particle: "#FDE047",
      }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black flex items-center justify-center">
      {/* Background image */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url('/images/tv-background.svg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Initial flash */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.7 }}
        className="absolute inset-0 z-50 bg-white pointer-events-none"
      />

      {/* Ambient pulsing glow */}
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-300 h-300 rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle, ${theme.glow} 0%, transparent 70%)`,
        }}
      />

      {/* Moving streak lights */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: "-150%",
              opacity: 0,
              rotate: -20,
            }}
            animate={{
              x: "150%",
              opacity: [0, 0.18, 0],
            }}
            transition={{
              duration: 6 + i,
              repeat: Infinity,
              delay: i * 0.7,
              ease: "linear",
            }}
            className="absolute top-[-20%] h-[200%] w-52 blur-3xl"
            style={{
              background: theme.primary,
            }}
          />
        ))}
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => {
          const size = Math.random() * 10 + 4
          const left = Math.random() * 100
          const duration = Math.random() * 6 + 6
          const delay = Math.random() * 5

          return (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: size,
                height: size,
                left: `${left}%`,
                bottom: "-5%",
                background: theme.particle,
                boxShadow: `0 0 20px ${theme.particle}`,
              }}
              animate={{
                y: ["0vh", "-120vh"],
                x: [0, (Math.random() - 0.5) * 120],
                opacity: [0, 1, 1, 0],
                scale: [0.6, 1, 1, 0.4],
              }}
              transition={{
                duration,
                repeat: Infinity,
                delay,
                ease: "linear",
              }}
            />
          )
        })}
      </div>

      {/* Giant drifting background text */}
      <motion.h1
        animate={{
          x: [-20, 20, -20],
          y: [-10, 10, -10],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute text-[18rem] md:text-[28rem] font-black uppercase tracking-tighter opacity-[0.05] select-none"
        style={{
          color: theme.primary,
        }}
      >
        WINNER
      </motion.h1>

      {/* Edge vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_35%,rgba(0,0,0,0.88)_100%)]" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        {/* Top accent line */}
        <motion.div
          initial={{
            width: 0,
            opacity: 0,
          }}
          animate={{
            width: "70%",
            opacity: 1,
          }}
          transition={{
            delay: 1.1,
            duration: 1.2,
          }}
          className="h-1 mb-10 rounded-full"
          style={{
            background: `linear-gradient(to right, transparent, ${theme.primary}, transparent)`,
          }}
        />

        {/* Label */}
        <motion.p
          initial={{
            opacity: 0,
            y: -40,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
            delay: 0.5,
          }}
          className="mb-6 mt-6 text-lg md:text-2xl uppercase tracking-[0.8em] text-white/60"
        >
          GANADOR
        </motion.p>

        {/* Winner name */}
        <motion.h2
          initial={{
            scale: 0.2,
            opacity: 0,
            rotateX: -90,
          }}
          animate={{
            scale: [1.15, 1],
            opacity: 1,
            rotateX: 0,
          }}
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 10,
            delay: 0.8,
          }}
          className="text-6xl md:text-[10rem] leading-none font-black uppercase tracking-tight"
          style={{
            color: theme.primary,
            textShadow: `
              0 0 20px ${theme.glow},
              0 0 60px ${theme.glow},
              0 0 120px ${theme.glow}
            `,
          }}
        >
          {winnerName}
        </motion.h2>

        {/* Bottom accent line */}
        <motion.div
          initial={{
            width: 0,
            opacity: 0,
          }}
          animate={{
            width: "70%",
            opacity: 1,
          }}
          transition={{
            delay: 1.5,
            duration: 1.2,
          }}
          className="h-1 mt-10 rounded-full"
          style={{
            background: `linear-gradient(to right, transparent, ${theme.primary}, transparent)`,
          }}
        />

      </div>
    </div>
  )
}