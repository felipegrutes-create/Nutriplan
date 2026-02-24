import { Check, ArrowRight, ShieldCheck } from "lucide-react"

const CTA_LINK = "https://pay.hotmart.com/G103480301S"

const included = [
  "Acceso vitalicio al App Nutriplan",
  "300+ Recetas inteligentes listas en minutos",
  "Categorias: Desayunos, Almuerzos, Cenas, Panes, Postres, Bebidas y Snacks",
  "Checklist Anti-Hipoglucemia",
  "Plan de 31 Dias de Control Glucemico",
  "Lista practica de alimentos permitidos y prohibidos",
  "Guia Completa: 200 Recetas Deliciosas para Diabeticos (Bono solo hoy)",
  "Actualizaciones semanales con nuevas recetas",
]

export function PricingSection() {
  return (
    <section id="oferta" className="bg-foreground py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Oferta especial
          </p>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-primary-foreground sm:text-4xl md:text-5xl text-balance">
            Aprovecha este 60% de descuento y llevate +300 Recetas
          </h2>
        </div>

        {/* Pricing Card */}
        <div className="relative mt-12 overflow-hidden rounded-3xl bg-card shadow-2xl">
          {/* Top ribbon */}
          <div className="bg-destructive px-6 py-3 text-center text-sm font-bold text-primary-foreground">
            60% DE DESCUENTO &mdash; APLICADO AUTOMATICAMENTE HOY
          </div>

          <div className="p-8 sm:p-10">
            <h3 className="font-serif text-2xl text-card-foreground sm:text-3xl">
              Acceso completo al App + Bonos incluidos
            </h3>

            <p className="mt-2 text-base text-muted-foreground">
              Todo lo que obtienes hoy:
            </p>

            {/* Feature list */}
            <ul className="mt-6 space-y-3">
              {included.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-base text-card-foreground/80">{item}</span>
                </li>
              ))}
            </ul>

            {/* Divider */}
            <div className="mt-8 border-t border-border" />

            {/* Price */}
            <div className="mt-8 flex flex-col items-center gap-2 text-center">
              <p className="text-sm text-muted-foreground">
                El valor total de todo esto seria facilmente de{" "}
                <span className="line-through">US$ 55</span>
              </p>
              <p className="text-base font-medium text-muted-foreground">
                Pero hoy no pagaras eso.
              </p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-lg text-muted-foreground line-through">
                  US$ 55
                </span>
                <span className="text-sm text-muted-foreground">Por solo:</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-medium text-muted-foreground">US$</span>
                <span className="font-serif text-7xl font-bold tracking-tight text-primary sm:text-8xl">
                  14
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                El valor se convertira automaticamente a la moneda de su pais.
              </p>
            </div>

            {/* CTA Button */}
            <div className="mt-8 flex flex-col items-center gap-4">
              <a
                href={CTA_LINK}
                className="group flex w-full max-w-md items-center justify-center gap-2 rounded-xl bg-primary px-8 py-5 text-lg font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 animate-pulse"
              >
                SI, QUIERO ESTE RECETARIO PARA MI
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </a>

              <p className="text-center text-xs font-semibold uppercase tracking-wider text-accent">
                HAZ CLICK EN EL BOTON PARA CONOCER EL PRECIO EN TU MONEDA LOCAL
              </p>

              {/* Trust badges */}
              <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>Acceso inmediato</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>Garantia 60 dias</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>Pago seguro</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
