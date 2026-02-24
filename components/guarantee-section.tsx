import Image from "next/image"
import { ArrowRight } from "lucide-react"

const CTA_LINK = "#oferta"

export function GuaranteeSection() {
  return (
    <section className="bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-primary/20 bg-primary/5 p-8 sm:p-12">
          <div className="flex flex-col items-center gap-8 md:flex-row">
            {/* Badge */}
            <div className="shrink-0">
              <div className="relative h-40 w-40 sm:h-48 sm:w-48">
                <Image
                  src="/images/guarantee-badge.jpg"
                  alt="Garantia de 60 dias"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            {/* Content */}
            <div className="text-center md:text-left">
              <h2 className="font-serif text-3xl leading-tight text-foreground sm:text-4xl">
                Garantia Incondicional de 60 Dias
              </h2>
              <div className="mt-4 space-y-3 text-base leading-relaxed text-muted-foreground">
                <p>
                  Prueba el App Nutriplan durante{" "}
                  <strong className="text-foreground">60 dias completos</strong>. Si por
                  cualquier motivo sientes que no es para ti, puedes solicitar el
                  reembolso del 100% de tu dinero.
                </p>
                <p>
                  Sin explicaciones. Sin preguntas incomodas. Sin riesgos.
                </p>
                <p className="font-medium text-foreground">
                  Queremos que tomes esta decision con total tranquilidad.
                </p>
              </div>
              <a
                href={CTA_LINK}
                className="group mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5"
              >
                Acceder con Garantia de 60 Dias
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
