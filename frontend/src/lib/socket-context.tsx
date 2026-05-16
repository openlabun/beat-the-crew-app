"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { io, Socket } from "socket.io-client"
import type {
  VotingOpenedPayload,
  BattleWinnerPayload,
  BattleTiePayload,
  BattleRerunPayload,
  BattleForfeitPayload,
  VotesUpdatedPayload,
} from "./types"

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
})

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || "https://beat-the-crew-production.up.railway.app"
    const socketInstance = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    })

    socketInstance.on("connect", () => {
      console.log("Socket connected:", socketInstance.id)
      setIsConnected(true)
    })

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected")
      setIsConnected(false)
    })

    socketInstance.on("connect_error", (error) => {
      console.log("Socket connection error:", error.message)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  return useContext(SocketContext)
}

// Custom hooks for specific socket events
export function useVotingOpened(callback: (payload: VotingOpenedPayload) => void) {
  const { socket } = useSocket()

  useEffect(() => {
    if (!socket) return

    socket.on("voting:opened", callback)
    return () => {
      socket.off("voting:opened", callback)
    }
  }, [socket, callback])
}

export function useBattleWinner(callback: (payload: BattleWinnerPayload) => void) {
  const { socket } = useSocket()

  useEffect(() => {
    if (!socket) return

    socket.on("battle:winner", callback)
    return () => {
      socket.off("battle:winner", callback)
    }
  }, [socket, callback])
}

export function useBattleTie(callback: (payload: BattleTiePayload) => void) {
  const { socket } = useSocket()

  useEffect(() => {
    if (!socket) return

    socket.on("battle:tie", callback)
    return () => {
      socket.off("battle:tie", callback)
    }
  }, [socket, callback])
}

export function useBattleRerun(callback: (payload: BattleRerunPayload) => void) {
  const { socket } = useSocket()

  useEffect(() => {
    if (!socket) return

    socket.on("battle:rerun", callback)
    return () => {
      socket.off("battle:rerun", callback)
    }
  }, [socket, callback])
}

export function useBattleForfeit(callback: (payload: BattleForfeitPayload) => void) {
  const { socket } = useSocket()

  useEffect(() => {
    if (!socket) return

    socket.on("battle:forfeit", callback)
    return () => {
      socket.off("battle:forfeit", callback)
    }
  }, [socket, callback])
}

export function useVotesUpdated(callback: (payload: VotesUpdatedPayload) => void) {
  const { socket } = useSocket()

  useEffect(() => {
    if (!socket) return

    socket.on("votes:updated", callback)
    return () => {
      socket.off("votes:updated", callback)
    }
  }, [socket, callback])
}

// Screen control hooks
export function useScreenCommand(callback: (command: string) => void) {
  const { socket } = useSocket()

  useEffect(() => {
    if (!socket) return

    socket.on("screen:command", callback)
    return () => {
      socket.off("screen:command", callback)
    }
  }, [socket, callback])
}

export function useScreenGroupCommand(callback: (group: string) => void) {
  const { socket } = useSocket()

  useEffect(() => {
    if (!socket) return

    socket.on("screen:group", callback)
    return () => {
      socket.off("screen:group", callback)
    }
  }, [socket, callback])
}

export function useVotingTick(callback: (payload: { battleId: number; secondsLeft: number }) => void) {
  const { socket } = useSocket()

  useEffect(() => {
    if (!socket) return

    socket.on("voting:tick", callback)
    return () => {
      socket.off("voting:tick", callback)
    }
  }, [socket, callback])
}

// Helper function to emit screen commands
export function emitScreenCommand(socket: Socket | null, command: string) {
  if (socket) {
    socket.emit("screen:command", command)
  }
}

export function emitScreenGroup(socket: Socket | null, group: string) {
  if (socket) {
    socket.emit("screen:group", group)
  }
}
