"use client"

import { useState, useEffect } from "react"
import { ContestantsSetup } from "./contestants-setup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, Plus, FolderOpen, Calendar, Users } from "lucide-react"
import Image from "next/image"
import { getEvents } from "@/lib/api"
import type { Event } from "@/lib/types"

interface EventWithCount extends Event {
  _count: { contestants: number; battles: number }
}

interface EventSetupProps {
  onCreateEvent: (eventName: string) => Promise<number>
  onLogout: () => void
  onComplete: (eventId: number) => void
}

export function EventSetup({ onCreateEvent, onLogout, onComplete }: EventSetupProps) {
  const [tab, setTab] = useState<"create" | "load">("create")
  const [step, setStep] = useState<"form" | "contestants">("form")
  const [eventName, setEventName] = useState("")
  const [eventId, setEventId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [events, setEvents] = useState<EventWithCount[]>([])
  const [loadingEvents, setLoadingEvents] = useState(false)

  useEffect(() => {
    if (tab === "load") {
      setLoadingEvents(true)
      getEvents()
        .then(setEvents)
        .catch(() => setError("Failed to load events"))
        .finally(() => setLoadingEvents(false))
    }
  }, [tab])

  const handleCreateEvent = async () => {
    if (!eventName.trim()) { setError("El nombre no puede estar vacío"); return }
    try {
      setIsLoading(true)
      setError(null)
      const id = await onCreateEvent(eventName)
      setEventId(id)
      setStep("contestants")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el evento")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoadEvent = (id: number) => {
    onComplete(id)
  }

  if (step === "contestants" && eventId) {
    return (
      <ContestantsSetup
        eventName={eventName}
        eventId={eventId}
        onComplete={() => onComplete(eventId)}
        onBack={() => { setStep("form"); setError(null) }}
      />
    )
  }

  return (
    <div className="min-h-screen w-full bg-btc-dark p-4 md:p-6 relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="flex items-center justify-between mb-8">
          <Image src="/images/logo.svg" alt="Beat The Crew" width={240} height={102} className="w-60 h-auto" priority />
          <Button variant="ghost" size="sm" onClick={onLogout} className="text-muted-foreground hover:text-foreground">
            <LogOut className="w-4 h-4 mr-2" />
            Salir
          </Button>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 bg-input rounded-lg p-1">
          <button
            onClick={() => { setTab("create"); setError(null) }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-semibold transition-all ${
              tab === "create"
                ? "bg-btc-yellow text-btc-dark"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Plus className="w-4 h-4" />
            Nuevo Evento
          </button>
          <button
            onClick={() => { setTab("load"); setError(null) }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-semibold transition-all ${
              tab === "load"
                ? "bg-btc-purple text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            Cargar Evento
          </button>
        </div>

        {error && (
          <div className="bg-destructive/20 border border-destructive text-destructive-foreground p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* CREATE TAB */}
        {tab === "create" && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-btc-purple">Crear Nuevo Evento</CardTitle>
              <CardDescription>Comienza creando un nuevo evento para la competencia</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="event-name">Nombre del Evento</Label>
                <Input
                  id="event-name"
                  placeholder="Beat the Crew 2026"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateEvent()}
                  disabled={isLoading}
                  className="bg-input border-border"
                />
              </div>
              <Button
                onClick={handleCreateEvent}
                disabled={isLoading || !eventName.trim()}
                className="w-full bg-btc-yellow text-btc-dark hover:bg-btc-yellow-light font-semibold"
              >
                {isLoading ? "Creando..." : "Crear Evento"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* LOAD TAB */}
        {tab === "load" && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-btc-purple">Cargar Evento</CardTitle>
              <CardDescription>Selecciona un evento existente para continuar</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingEvents ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-btc-yellow border-t-transparent rounded-full animate-spin" />
                </div>
              ) : events.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">
                  No hay eventos creados todavía
                </p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {events.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => handleLoadEvent(event.id)}
                      className="w-full text-left bg-input hover:bg-input/80 border border-border hover:border-btc-purple/50 rounded-lg px-4 py-3 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-foreground text-sm group-hover:text-btc-purple transition-colors">
                          {event.name}
                        </p>
                        <span className="text-xs text-muted-foreground shrink-0">
                          #{event.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="w-3 h-3" />
                          {event._count.contestants} participantes
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(event.createdAt).toLocaleDateString('es-CO', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}