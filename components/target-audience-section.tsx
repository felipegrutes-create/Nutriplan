import { Check } from "lucide-react"

const targets = [
  "Para todo aquel que busque opciones sin gluten, azucar refinada o harina de trigo.",
  "Para quienes buscan reducir el cansancio, la ansiedad y el estres general.",
  "Para personas que quieren terminar con el problema de querer comer a toda hora.",
  "Para aquellos que quieren cambiar sus habitos alimentarios de una vez por todas.",
  "Para hombres y mujeres que quieren restringir carbohidratos y adelgazar de forma sana.",
  "Para diabeticos que quieren disfrutar comida deliciosa sin disparar su glucosa.",
]

export function TargetAudienceSection() {
  return (
    <section className="bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-primary/20 bg-card shadow-lg">
          <div className="bg-primary px-6 py-4 text-center">
            <h2 className="font-serif text-2xl text-primary-foreground sm:text-3xl">
              {"Para quien es el App Nutriplan?"}
            </h2>
          </div>

          <div className="p-8 sm:p-10">
            <ul className="space-y-5">
              {targets.map((item, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-base leading-relaxed text-foreground/80">{item}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
