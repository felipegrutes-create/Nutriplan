"use client"

import Image from "next/image"
import { useEffect, useRef } from "react"

export function VideoSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Create the smart player element
    const player = document.createElement("vturb-smartplayer")
    player.id = "vid-698c0aef7a04c8d380d02a90"
    player.style.display = "block"
    player.style.margin = "0 auto"
    player.style.width = "100%"
    containerRef.current.appendChild(player)

    // Load the player script
    const script = document.createElement("script")
    script.src =
      "https://scripts.converteai.net/6601423c-9685-4425-b46b-bc330133e7e6/players/698c0aef7a04c8d380d02a90/v4/player.js"
    script.async = true
    document.head.appendChild(script)

    return () => {
      script.remove()
      if (containerRef.current) {
        containerRef.current.innerHTML = ""
      }
    }
  }, [])

  return (
    <section className="bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Descubre el metodo
          </p>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-foreground sm:text-4xl md:text-5xl text-balance">
            Mira lo que nuestra chef descubrio sobre los picos de azucar
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            Video rapido de 1 minuto
          </p>
        </div>

        {/* Vturb Video Player */}
        <div
          ref={containerRef}
          className="mt-10 overflow-hidden rounded-2xl bg-foreground/5 shadow-2xl shadow-foreground/10"
        />

        {/* Chef Info */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-primary/20">
            <Image
              src="/images/chef-maria.jpg"
              alt="Chef Maria Gonzalez"
              fill
              className="object-cover"
            />
          </div>
          <div className="text-left">
            <p className="font-semibold text-foreground">Chef Maria Gonzalez</p>
            <p className="text-sm text-muted-foreground">
              Especialista en Cocina Saludable
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
