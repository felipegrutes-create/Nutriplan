import { ArrowRight } from "lucide-react"

const CTA_LINK = "#oferta"

const questions = [
  {
    emoji: "images/cat-desayunos.jpg",
    text: "Que puede ser mas reconfortante que comenzar el dia con el fragante aroma de unos pancakes recien hechos?",
  },
  {
    emoji: "images/cat-almuerzos.jpg",
    text: "Como renunciar a esa deliciosa porcion de pizza recien salida del horno?",
  },
  {
    emoji: "images/cat-postres.jpg",
    text: "Que mejor opcion que un rico helado para terminar un dia estresante y agotador?",
  },
  {
    emoji: "images/cat-panes.jpg",
    text: "Quien dijo que un pan caliente y crujiente esta prohibido para los que cuidan su glucosa?",
  },
]

export function EmotionalHooksSection() {
  return (
    <section className="bg-secondary py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Saborea sin miedo
          </p>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-foreground sm:text-4xl md:text-5xl text-balance">
            Tomate tus antojos muy en serio
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            La vida deja de ser completa y placentera cuando dejas de comer lo que mas te gusta. A partir de hoy,{" "}
            <strong className="text-foreground">ya no necesitas renunciar</strong> a los postres, panes, pizzas o sopas.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {questions.map((q, i) => (
            <div
              key={i}
              className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xl">
                <span className="text-accent font-serif text-lg font-bold">{"?"}</span>
              </div>
              <p className="text-base leading-relaxed text-foreground/80 font-serif italic">
                {q.text}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl bg-foreground p-8 text-center sm:p-10">
          <p className="text-lg leading-relaxed text-primary-foreground/80 sm:text-xl">
            Antes que privarte de todo lo que te gusta...{" "}
            <strong className="text-primary-foreground">
              no es mucho mejor aprender a hacer la version saludable de tus comidas favoritas?
            </strong>
          </p>
          <p className="mt-4 text-base text-primary-foreground/60">
            Dile <span className="font-bold text-destructive">ADIOS</span> a las mismas comidas insipidas de todos los dias y{" "}
            <span className="font-bold text-primary">HOLA</span> a los brownies, helados, pasteles, pizzas, panes y sopas que le hacen bien a tu cuerpo.
          </p>
          <a
            href={CTA_LINK}
            className="group mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5"
          >
            Quiero estas Recetas
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  )
}
