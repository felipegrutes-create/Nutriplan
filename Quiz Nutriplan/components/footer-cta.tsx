import { ArrowRight } from "lucide-react"

const CTA_LINK = "https://pay.hotmart.com/G103480301S"

export function FooterCta() {
  return (
    <section className="bg-foreground py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="font-serif text-3xl leading-tight text-primary-foreground sm:text-4xl md:text-5xl text-balance">
          No dejes que el miedo decida lo que comes
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-primary-foreground/60">
          Empieza hoy a disfrutar tus comidas favoritas con el Metodo Sin Picos. Tu
          salud y tu paladar te lo agradeceran.
        </p>
        <a
          href={CTA_LINK}
          className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
        >
          Quiero Acceder Ahora
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </a>
        <p className="mt-4 text-sm text-primary-foreground/40">
          Pago unico de US$ 14 &mdash; Garantia de 60 dias
        </p>
      </div>

      {/* Footer */}
      <div className="mx-auto mt-16 max-w-5xl border-t border-primary-foreground/10 px-4 pt-8 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 text-xs text-primary-foreground/30 sm:flex-row">
          <p>Nutriplan &mdash; Todos los derechos reservados</p>
          <div className="flex gap-4">
            <a href="#" className="transition-colors hover:text-primary-foreground/60">
              Terminos de Uso
            </a>
            <a href="#" className="transition-colors hover:text-primary-foreground/60">
              Politica de Privacidad
            </a>
            <a href="#" className="transition-colors hover:text-primary-foreground/60">
              Contacto
            </a>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 text-center text-[10px] leading-relaxed text-primary-foreground/20">
          <p>
            DESCARGO DE RESPONSABILIDAD IMPORTANTE: Este sitio no es parte del sitio web de Facebook o Facebook INC. Ademas este sitio no esta respaldado por Facebook de ninguna manera. Facebook es una marca registrada de Facebook INC. Los resultados pueden variar de persona a persona. Este producto no pretende diagnosticar, tratar, curar o prevenir ninguna enfermedad. Consulte siempre a su medico antes de realizar cambios en su dieta.
          </p>
        </div>
      </div>
    </section>
  )
}
