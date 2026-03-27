import { Wheat, Droplets, CandyOff } from "lucide-react"

const benefits = [
  {
    icon: Wheat,
    title: "Bajas en Carbohidratos",
    description:
      "En una dieta baja en carbohidratos se debe evitar el consumo de azucares, harinas refinadas, arroz blanco y dulces industriales. Nuestras +300 opciones cumplen con todos los requisitos para que puedas preparar y comer lo mejor.",
  },
  {
    icon: Droplets,
    title: "Sin Leche de Vaca",
    description:
      "Se puede empezar una dieta sin lacteos por varias razones: intolerancia a la lactosa, eleccion de un estilo de vida diferente o reduccion de grasas. En este recetario encontraras infinidad de opciones sin lactosa.",
  },
  {
    icon: CandyOff,
    title: "Sin Azucar Refinada",
    description:
      "El consumo excesivo de azucar puede desencadenar enfermedades cronicas como la diabetes, obesidad y enfermedades cardiovasculares. Por eso, hemos preparado todas las recetas sin azucar refinado.",
  },
]

export function StorySection() {
  return (
    <section className="bg-secondary py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Por que es diferente
          </p>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-foreground sm:text-4xl md:text-5xl text-balance">
            Recetas diseñadas para cuidar tu salud
          </h2>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {benefits.map((benefit, i) => (
            <div
              key={i}
              className="flex flex-col items-center rounded-2xl border border-border bg-card p-8 text-center shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <benefit.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-foreground">
                {benefit.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
