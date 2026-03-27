const testimonials = [
  {
    name: "Carmen R.",
    location: "Mexico",
    text: "Pensaba que nunca mas comeria pan. Ahora lo disfruto todos los dias y mi glucosa esta mas estable que nunca.",
    rating: 5,
  },
  {
    name: "Jorge M.",
    location: "Colombia",
    text: "Las recetas son increiblemente faciles. En 15 minutos tengo un pan delicioso y sin preocuparme por mi azucar.",
    rating: 5,
  },
  {
    name: "Ana L.",
    location: "Argentina",
    text: "Mi doctor no podia creer mis resultados. El Metodo Sin Picos cambio completamente mi forma de cocinar.",
    rating: 5,
  },
  {
    name: "Roberto S.",
    location: "Peru",
    text: "La app es super practica. Tengo todo organizado y las recetas nuevas cada semana me mantienen motivado.",
    rating: 5,
  },
  {
    name: "Maria F.",
    location: "Chile",
    text: "Compre con dudas pero la garantia me dio confianza. Ya llevo 3 meses y no puedo vivir sin el Nutriplan.",
    rating: 5,
  },
  {
    name: "Luis P.",
    location: "Ecuador",
    text: "Lo mejor es la lista de alimentos. Ahora voy al supermercado sabiendo exactamente que comprar. Sin confusion.",
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section className="bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Testimonios reales
          </p>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-foreground sm:text-4xl md:text-5xl text-balance">
            Personas que pensaban que nunca mas comerian pan...
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            Hoy dicen esto
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <svg
                    key={j}
                    className="h-4 w-4 fill-accent text-accent"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Text */}
              <p className="mt-4 flex-1 text-base leading-relaxed text-foreground/80">
                {'"'}{t.text}{'"'}
              </p>

              {/* Author */}
              <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full font-semibold text-primary-foreground"
                  style={{
                    background: `hsl(${i * 50 + 140}, 35%, 50%)`,
                  }}
                >
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
