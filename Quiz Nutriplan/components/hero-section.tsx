import Image from "next/image"
import { ArrowRight } from "lucide-react"

const CTA_LINK = "https://pay.hotmart.com/G103480301S"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-foreground">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-bread.jpg"
          alt=""
          fill
          className="object-cover opacity-30"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/80 via-foreground/60 to-foreground/90" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 pb-20 pt-28 text-center sm:px-6 md:pb-28 md:pt-36">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary-foreground/90">
          <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
          Metodo Sin Picos &mdash; Ya disponible
        </div>

        {/* Headline */}
        <h1 className="mx-auto max-w-4xl font-serif text-4xl leading-tight tracking-tight text-primary-foreground sm:text-5xl md:text-6xl lg:text-7xl">
          <span className="text-balance">
            Come Sin Culpa ni Remordimientos con{" "}
            <span className="text-accent">+300 Recetas</span> Saludables
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-primary-foreground/70 sm:text-lg md:text-xl">
          Deliciosas recetas faciles de preparar para no tener que privarte nunca mas, con ingredientes variados que puedes encontrar en tu ciudad,{" "}
          <strong className="text-primary-foreground/90">cero gluten, cero azucar, sin harinas y aptas para diabeticos.</strong>
        </p>

        {/* CTA */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href={CTA_LINK}
            className="group inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
          >
            Quiero Acceder Ahora
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </a>
          <p className="text-sm text-primary-foreground/50">
            60 dias de garantia incondicional
          </p>
        </div>

        {/* Social Proof */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-primary-foreground/60">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full border-2 border-foreground bg-muted"
                  style={{
                    background: `hsl(${i * 45 + 100}, 40%, 70%)`,
                  }}
                />
              ))}
            </div>
            <span>
              <strong className="text-primary-foreground/80">+2,400</strong> personas ya
              usan Nutriplan
            </span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <svg
                key={i}
                className="h-4 w-4 fill-accent text-accent"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="ml-1">4.9/5</span>
          </div>
        </div>

        {/* Key benefits pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {["Bajas en Carbohidratos", "Sin Azucar Refinada", "Sin Gluten", "Aptas para Diabeticos"].map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary-foreground/70"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
