"use client"

import { useState } from "react"
import Image from "next/image"
import { login } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface LoginFormProps {
  onSuccess: (token: string) => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await login(username, password)
      onSuccess(result.accessToken)
    } catch (err) {
      setError("Contraseña incorrecta")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-btc-dark flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-20 top-1/4 w-64 h-64 rounded-full bg-btc-yellow/10 blur-3xl" />
        <div className="absolute -right-20 bottom-1/4 w-64 h-64 rounded-full bg-btc-purple/10 blur-3xl" />
      </div>

      {/* Dark pattern background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/images/logo.svg"
            alt="Beat The Crew"
            width={240}
            height={102}
            className="w-60 h-auto"
            priority
          />
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-foreground uppercase tracking-wider text-sm">
              Usuario
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-btc-dark-lighter border-btc-yellow/50 text-foreground h-12 focus:border-btc-yellow focus:ring-btc-yellow"
              placeholder="Ingrese su usuario"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground uppercase tracking-wider text-sm">
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-btc-dark-lighter border-btc-yellow/50 text-foreground h-12 focus:border-btc-yellow focus:ring-btc-yellow"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="text-destructive text-sm text-center">{error}</p>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-btc-yellow text-btc-dark font-bold uppercase tracking-wider hover:bg-btc-yellow-light disabled:opacity-50"
          >
            {isLoading ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>
      </div>
    </div>
  )
}
