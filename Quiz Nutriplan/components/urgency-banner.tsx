"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"

export function UrgencyBanner() {
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 47, seconds: 33 })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev
        seconds--
        if (seconds < 0) {
          seconds = 59
          minutes--
        }
        if (minutes < 0) {
          minutes = 59
          hours--
        }
        if (hours < 0) {
          hours = 0
          minutes = 0
          seconds = 0
        }
        return { hours, minutes, seconds }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const pad = (n: number) => String(n).padStart(2, "0")

  return (
    <div className="bg-destructive px-4 py-3 text-center">
      <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-3 text-sm font-bold text-primary-foreground sm:text-base">
        <Clock className="h-4 w-4 animate-pulse" />
        <span>OFERTA DISPONIBLE SOLO POR HOY</span>
        <span className="inline-flex items-center gap-1 rounded-md bg-foreground/20 px-3 py-1 font-mono text-sm tabular-nums">
          {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
        </span>
      </div>
    </div>
  )
}
