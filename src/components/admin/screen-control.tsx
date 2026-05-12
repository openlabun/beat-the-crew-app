"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { useSocket, emitScreenCommand, emitScreenGroup } from "@/lib/socket-context"

export function ScreenControl() {
  const [displayMode, setDisplayMode] = useState<"logo" | "bracket_crew" | "bracket_invited">("logo")
  const { socket } = useSocket()

  const sendCommand = (command: string) => {
    emitScreenCommand(socket, command)
  }

  const sendGroupCommand = (group: string) => {
    emitScreenGroup(socket, group)
  }

  const handleShowLogo = () => {
    setDisplayMode("logo")
    sendCommand("show_logo")
  }

  const handleShowBracketCrew = () => {
    setDisplayMode("bracket_crew")
    sendCommand("show_bracket")
    sendGroupCommand("CREW")
  }

  const handleShowBracketInvited = () => {
    setDisplayMode("bracket_invited")
    sendCommand("show_bracket")
    sendGroupCommand("INVITED")
  }

  return (
    <Card className="bg-btc-dark-lighter border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-foreground text-sm uppercase tracking-wider">
          Control de Pantalla TV
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Display mode buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleShowLogo}
            className={`flex-1 ${
              displayMode === "logo"
                ? "bg-muted text-muted-foreground border-2 border-gray-700 hover:bg-muted"
                : "bg-btc-dark text-foreground border-2 border-btc-dark hover:bg-gray-800"
            }`}
          >
            Logo
          </Button>
          <Button
            onClick={handleShowBracketCrew}
            className={`flex-1 ${
              displayMode === "bracket_crew"
                ? "bg-btc-purple/50 text-btc-purple border-2 border-btc-purple hover:bg-btc-purple/50"
                : "bg-btc-purple text-foreground border-2 border-btc-purple hover:bg-btc-purple/80"
            }`}
          >
            Bracket Crew
          </Button>
          <Button
            onClick={handleShowBracketInvited}
            className={`flex-1 ${
              displayMode === "bracket_invited"
                ? "bg-btc-yellow/50 text-btc-yellow border-2 border-btc-yellow hover:bg-btc-yellow/50"
                : "bg-btc-yellow text-btc-dark border-2 border-btc-yellow hover:bg-btc-yellow/80"
            }`}
          >
            Bracket Invitados
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
