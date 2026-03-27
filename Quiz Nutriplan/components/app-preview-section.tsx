import Image from "next/image"
import { ArrowRight } from "lucide-react"

const CTA_LINK = "https://pay.hotmart.com/G103480301S"

export function AppPreviewSection() {
  return (
    <section className="bg-secondary py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Mira por dentro
          </p>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-foreground sm:text-4xl md:text-5xl text-balance">
            Un vistazo al App Nutriplan
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            Todas las recetas organizadas, paso a paso, con fotos y tiempos de preparacion
          </p>
        </div>

        <div className="mt-12 flex flex-col items-center gap-8 md:flex-row md:justify-center">
          {/* Phone mockup 1 */}
          <div className="relative">
            <div className="relative mx-auto w-64 overflow-hidden rounded-[2rem] border-4 border-foreground/10 bg-foreground shadow-2xl sm:w-72">
              <div className="relative aspect-[9/19] min-h-[400px]">
                <Image
                  src="/images/app-mockup.jpg"
                  alt="Vista del App Nutriplan - lista de recetas"
                  fill
                  sizes="(max-width: 640px) 256px, 288px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* Phone mockup 2 */}
          <div className="relative md:-mt-8">
            <div className="relative mx-auto w-64 overflow-hidden rounded-[2rem] border-4 border-foreground/10 bg-foreground shadow-2xl sm:w-72">
              <div className="relative aspect-[9/19] min-h-[400px]">
                <Image
                  src="/images/app-preview-inside.jpg"
                  alt="Vista del App Nutriplan - detalle de receta"
                  fill
                  sizes="(max-width: 640px) 256px, 288px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <a
            href={CTA_LINK}
            className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5"
          >
            Quiero Acceder al App
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  )
}
