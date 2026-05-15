"use client"

import { useState } from "react"
import { ContestantGroup } from "@/lib/types"
import { addContestants } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Plus } from "lucide-react"

const VALID_SIZES = [2, 4, 8, 16]

interface ContestantsSetupProps {
  eventName: string
  eventId: number | null
  onComplete: () => void
  onBack: () => void
}

export function ContestantsSetup({
  eventName,
  eventId,
  onComplete,
  onBack,
}: ContestantsSetupProps) {
  const [crewNames, setCrewNames] = useState<string[]>(["", ""])
  const [invitedNames, setInvitedNames] = useState<string[]>(["", ""])
  const [activeTab, setActiveTab] = useState<ContestantGroup>(ContestantGroup.CREW)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [completedGroups, setCompletedGroups] = useState<Set<ContestantGroup>>(new Set())

  const currentNames = activeTab === ContestantGroup.CREW ? crewNames : invitedNames
  const setCurrentNames = activeTab === ContestantGroup.CREW ? setCrewNames : setInvitedNames

  const filledCount = currentNames.filter((n) => n.trim()).length
  const isValidSize = VALID_SIZES.includes(filledCount)
  const isEmpty = filledCount === 0

  const handleAddName = () => {
    setCurrentNames([...currentNames, ""])
  }

  const handleRemoveName = (index: number) => {
    setCurrentNames(currentNames.filter((_, i) => i !== index))
  }

  const handleNameChange = (index: number, value: string) => {
    const updated = [...currentNames]
    updated[index] = value
    setCurrentNames(updated)
  }

  const handleSubmit = async () => {
    if (!eventId) {
      setError("Falta la ID del evento")
      return
    }

    const names = currentNames.filter((n) => n.trim())

    if (!isValidSize) {
      setError(`Debe tener exactamente 2, 4, 8 o 16 concursantes. Tienes ${filledCount}.`)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      await addContestants(eventId, names, activeTab)
      setCompletedGroups(new Set([...completedGroups, activeTab]))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al agregar concursantes")
    } finally {
      setIsLoading(false)
    }
  }

  const allGroupsComplete = completedGroups.size === Object.keys(ContestantGroup).length

  return (
    <div className="min-h-screen w-full bg-btc-dark p-4 md:p-6 relative overflow-hidden">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-btc-purple uppercase tracking-wider">Agregar Concursantes</h1>
          <p className="text-sm text-muted-foreground mt-2">{eventName}</p>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-btc-yellow">Agregar Concursantes</CardTitle>
            <CardDescription>Agrega 2, 4, 8 o 16 concursantes para cada grupo</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ContestantGroup)}>
              <TabsList className="grid w-full grid-cols-2 bg-input">
                <TabsTrigger
                  value={ContestantGroup.CREW}
                  className="data-[state=active]:bg-btc-yellow data-[state=active]:text-btc-dark"
                >
                  <span className="flex items-center gap-2">
                    Crew
                    {completedGroups.has(ContestantGroup.CREW) && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">✓</span>
                    )}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value={ContestantGroup.INVITED}
                  className="data-[state=active]:bg-btc-purple data-[state=active]:text-white"
                >
                  <span className="flex items-center gap-2">
                    Invitados
                    {completedGroups.has(ContestantGroup.INVITED) && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">✓</span>
                    )}
                  </span>
                </TabsTrigger>
              </TabsList>

              {[ContestantGroup.CREW, ContestantGroup.INVITED].map((group) => (
                <TabsContent key={group} value={group} className="space-y-4 mt-6">
                  {error && (
                    <div className="bg-destructive/20 border border-destructive text-destructive-foreground p-3 rounded-md text-sm">
                      {error}
                    </div>
                  )}

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {currentNames.map((name, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          placeholder={`Concursante ${index + 1}`}
                          value={name}
                          onChange={(e) => handleNameChange(index, e.target.value)}
                          disabled={isLoading || completedGroups.has(group)}
                          className="bg-input border-border flex-1"
                        />
                        {!completedGroups.has(group) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveName(index)}
                            disabled={isLoading || currentNames.length <= 2}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  {!completedGroups.has(group) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddName}
                      disabled={isLoading}
                      className="w-full border-border text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Concursante
                    </Button>
                  )}

                  <div className="pt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Conteo:</span>
                      <span
                        className={`font-semibold ${
                          isValidSize && filledCount > 0
                            ? "text-green-400"
                            : isEmpty
                              ? "text-muted-foreground"
                              : "text-destructive"
                        }`}
                      >
                        {filledCount} / {VALID_SIZES.join(", ")}
                      </span>
                    </div>

                    {!completedGroups.has(group) && (
                      <Button
                        onClick={handleSubmit}
                        disabled={isLoading || !isValidSize || isEmpty}
                        className={`w-full font-semibold ${
                          group === ContestantGroup.CREW
                            ? "bg-btc-purple text-white hover:bg-btc-purple-light"
                            : "bg-btc-yellow text-btc-dark hover:bg-btc-yellow-light"
                        }`}
                      >
                        {isLoading ? "Agregando..." : `Agregar ${filledCount} Concursantes`}
                      </Button>
                    )}

                    {completedGroups.has(group) && (
                      <div className="w-full py-2 text-center text-green-400 text-sm font-semibold">
                        ✓ {filledCount} concursantes agregados
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
            className="flex-1 border-border text-muted-foreground hover:text-foreground"
          >
            Volver
          </Button>
          <Button
            onClick={onComplete}
            disabled={!allGroupsComplete || isLoading}
            className="flex-1 bg-btc-purple text-white hover:bg-btc-purple-light font-semibold"
          >
            Continuar al Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
