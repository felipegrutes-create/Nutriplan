"use client"

import { useEffect, useState, useRef } from "react"

function useCountUp(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const start = performance.now()

          const animate = (now: number) => {
            const progress = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * target))
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return { count, ref }
}

const stats = [
  { value: 2400, suffix: "+", label: "Personas usando Nutriplan en todo el mundo" },
  { value: 300, suffix: "+", label: "Recetas probadas y disponibles en el App" },
  { value: 100, suffix: "%", label: "Garantia en tu compra. Cada receta fue probada." },
]

export function StatsSection() {
  return (
    <section className="bg-foreground py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>
      </div>
    </section>
  )
}

function StatCard({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { count, ref } = useCountUp(value)

  return (
    <div ref={ref} className="text-center">
      <p className="font-serif text-5xl font-bold text-primary sm:text-6xl">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-primary-foreground/60">
        {label}
      </p>
    </div>
  )
}
