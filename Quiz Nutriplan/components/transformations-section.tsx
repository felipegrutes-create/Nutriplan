import Image from "next/image"
import { ArrowRight } from "lucide-react"

const transformations = [
  {
    name: "Joana Fr.",
    subtitle: "Agradecida con la vida",
    result: "De 83 kg a 57 kg",
    text: "Llegue a pesar 83 kilos a mis 16 anos, haciendo ejercicio y comiendo menos carbohidratos en medio ano baje hasta los 68 kilos. Actualmente peso 57 kilos. Mi mejor amiga me recomendo el libro y desde que lo compre me ha sorprendido para bien.",
    reactions: "225",
    comments: "35",
  },
  {
    name: "Erika Solorzano",
    subtitle: "",
    result: "Perdio los kilos que la acomplejaban por anos",
    text: "Por fin despues de probar tantas dietas pude encontrar una que me ayude a perder esos kilos que me habian acomplejado por anos y sin tener efecto rebote por suerte. Gracias por recomendar el libro, para mi que soy amante de lo dulce ha sido como una bendicion.",
    reactions: "101",
    comments: "3",
  },
  {
    name: "Raul Almeda",
    subtitle: "",
    result: "De 129 kg a 108 kg en 7 meses",
    text: "Llevo 7 meses continuos con las recetas del Nutriplan y he rebajado de 129 kg a 108 Kg. Lo mejor: como sabroso, no sufro de ansiedad como con otras dietas ni me da hambre, y tambien me siento mucho mejor. Recetas deliciosas y super completas.",
    reactions: "643",
    comments: "43",
  },
]

export function TransformationsSection() {
  return (
    <section className="bg-secondary py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Resultados reales
          </p>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-foreground sm:text-4xl md:text-5xl text-balance">
            Mira las transformaciones de quienes ya empezaron
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            Personas reales, resultados reales. Capturas reales de Facebook de quienes cambiaron su vida.
          </p>
        </div>

        {/* Full width screenshot image */}
        <div className="mt-12 overflow-hidden rounded-2xl border border-border shadow-xl">
          <Image
            src="/images/transformations-fb.png"
            alt="Capturas de Facebook mostrando transformaciones reales: Joana bajo de 83kg a 57kg, Erika perdio kilos que la acomplejaban, Raul bajo de 129kg a 108kg"
            width={1260}
            height={700}
            className="w-full"
            quality={90}
          />
        </div>

        {/* Transformation Cards */}
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {transformations.map((t, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Result badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5">
                <ArrowRight className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-bold text-primary">{t.result}</span>
              </div>

              {/* Name */}
              <p className="mt-3 text-sm font-bold text-foreground">{t.name}</p>

              {/* Text */}
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-4">
                {'"'}{t.text}{'"'}
              </p>

              {/* Facebook-like reactions */}
              <div className="mt-4 flex items-center gap-4 border-t border-border pt-3">
                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-1">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] text-card">
                      {'👍'}
                    </span>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-card">
                      {'❤️'}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{t.reactions}</span>
                </div>
                <span className="text-xs text-muted-foreground">{t.comments} Comments</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <a
            href="https://pay.hotmart.com/G103480301S"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-lg transition-all hover:brightness-110"
          >
            Quiero resultados como estos
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  )
}
