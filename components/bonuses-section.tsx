import Image from "next/image"
import { ShieldCheck, Calendar, ListChecks } from "lucide-react"

const bonuses = [
  {
    icon: ShieldCheck,
    title: "Checklist Anti-Hipoglucemia",
    description:
      "Para que sepas que hacer en los dias en que el azucar baja y evitar miedo e inseguridad.",
    originalPrice: "15",
    color: "from-primary/10 to-primary/5",
  },
  {
    icon: Calendar,
    title: "Plan de 31 Dias de Control Glucemico",
    description:
      "Una guia diaria, simple y clara, para mantener tu azucar mas estable y evitar subidas y bajadas inesperadas.",
    originalPrice: "10",
    color: "from-accent/10 to-accent/5",
  },
  {
    icon: ListChecks,
    title: "Lista de Alimentos Permitidos y Prohibidos",
    description:
      "Para que sepas que comer y que evitar sin dudas, sin miedo y sin contradicciones.",
    originalPrice: "10",
    color: "from-primary/10 to-primary/5",
  },
]

export function BonusesSection() {
  return (
    <section className="bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-semibold text-accent">
            <span>BONOS GRATIS</span>
          </div>
          <h2 className="mt-4 font-serif text-3xl leading-tight text-foreground sm:text-4xl md:text-5xl text-balance">
            Para que te sientas mas seguro desde el primer dia
          </h2>
        </div>

        {/* Featured Bonus - 200 Recetas Book */}
        <div className="mt-12 mb-8">
          <div className="group relative overflow-hidden rounded-2xl border-2 border-accent/30 bg-card shadow-lg transition-all hover:shadow-xl">
            <div className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:gap-10 sm:p-8">
              <div className="relative flex-shrink-0">
                <Image
                  src="/images/bonus-200-recetas.png"
                  alt="200 Recetas Deliciosas para Diabeticos - Come Bien, Sin Miedo + Azucar Estable"
                  width={200}
                  height={280}
                  className="rounded-lg shadow-lg transition-transform group-hover:scale-105"
                />
                <div className="absolute -top-3 -right-3 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground shadow-md">
                  GRATIS
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="inline-flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-destructive">
                  Bono Especial
                </div>
                <h3 className="mt-3 font-serif text-2xl font-bold text-foreground sm:text-3xl">
                  200 Recetas Deliciosas para Diabeticos
                </h3>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                  Come Bien, Sin Miedo + Azucar Estable. Un recetario completo con 200 opciones deliciosas para que comas rico y controles tus niveles de azucar. Incluye desayunos, almuerzos, cenas, snacks y postres.
                </p>
                <div className="mt-4 flex items-center justify-center gap-3 sm:justify-start">
                  <span className="text-lg text-muted-foreground line-through">
                    US$ 29
                  </span>
                  <span className="rounded-full bg-primary/10 px-4 py-1.5 text-base font-bold text-primary">
                    GRATIS HOY
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {bonuses.map((bonus, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
            >
              {/* Icon */}
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${bonus.color}`}
              >
                <bonus.icon className="h-7 w-7 text-primary" />
              </div>

              {/* Content */}
              <h3 className="mt-5 text-lg font-bold text-foreground">
                {bonus.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {bonus.description}
              </p>

              {/* Price */}
              <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                <span className="text-sm text-muted-foreground line-through">
                  US$ {bonus.originalPrice}
                </span>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                  GRATIS
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
