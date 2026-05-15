"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { useSocket, emitScreenCommand, emitScreenGroup } from "@/lib/socket-context"

interface ScreenControlProps {
  eventId: number
}

export function ScreenControl({ eventId }: ScreenControlProps) {
  const [displayMode, setDisplayMode] = useState<"logo" | "bracket_crew" | "bracket_invited">("logo")
  const { socket } = useSocket()

  const screenUrl = `${window.location.origin}/screen?eventId=${eventId}`

  const sendCommand = (command: string) => emitScreenCommand(socket, command)
  const sendGroupCommand = (group: string) => emitScreenGroup(socket, group)
  

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
        {/* Screen URL */}
        <div className="flex gap-2">
          <input
            readOnly
            value={screenUrl}
            className="flex-1 bg-input border border-border rounded px-3 py-2 text-xs text-muted-foreground font-mono"
          />
          <Button
            onClick={() => window.open(screenUrl, '_blank')}
            className="bg-btc-dark border border-border text-muted-foreground hover:text-foreground text-xs px-3"
          >
            Abrir
          </Button>
          <Button
            onClick={() => navigator.clipboard.writeText(screenUrl)}
            className="bg-btc-dark border border-border text-muted-foreground hover:text-foreground text-xs px-3"
          >
            Copiar
          </Button>
        </div>

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