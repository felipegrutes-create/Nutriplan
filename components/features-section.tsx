import Image from "next/image"
import {
  Smartphone,
  BookOpen,
  Zap,
  Gift,
  RefreshCw,
  MapPin,
  LayoutGrid,
} from "lucide-react"

const features = [
  {
    icon: Smartphone,
    title: "Acceso completo por el app",
    description:
      "Todo tu plan disponible directamente en el app Nutriplan, desde tu celular de forma practica y organizada.",
  },
  {
    icon: BookOpen,
    title: "300 Recetas paso a paso",
    description:
      "El Pan de Todos los Dias: recetas organizadas, claras y diseñadas para mantener tu glucosa estable.",
  },
  {
    icon: Zap,
    title: "Acceso inmediato",
    description:
      "Despues de la compra recibes acceso directamente en tu correo electronico. Sin esperas.",
  },
  {
    icon: Gift,
    title: "4 Bonos exclusivos",
    description:
      "Bonos de alto valor incluidos sin costo adicional para acelerar tus resultados.",
  },
  {
    icon: RefreshCw,
    title: "Actualizaciones semanales",
    description:
      "Nuevas recetas y consejos cada semana para que nunca te aburras ni te quedes sin ideas.",
  },
  {
    icon: MapPin,
    title: "Acceso desde cualquier lugar",
    description:
      "En cualquier momento, desde cualquier dispositivo. Tu plan siempre contigo.",
  },
  {
    icon: LayoutGrid,
    title: "Todo centralizado",
    description:
      "Sin PDFs sueltos ni confusion. Todo organizado en un solo lugar dentro del app.",
  },
]

export function FeaturesSection() {
  return (
    <section className="bg-secondary py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Nutriplan Logo */}
          <div className="relative mx-auto flex max-w-sm items-center justify-center lg:order-2">
            <div className="relative">
              <Image
                src="/images/nutriplan-logo.png"
                alt="Nutriplan - Tu plan de alimentacion saludable"
                width={360}
                height={360}
                className="drop-shadow-xl"
              />
            </div>
            {/* Decorative glow */}
            <div className="absolute -inset-4 -z-10 rounded-full bg-primary/5 blur-3xl" />
          </div>

          {/* Features list */}
          <div className="lg:order-1">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Lo que incluye
            </p>
            <h2 className="mt-3 font-serif text-3xl leading-tight text-foreground sm:text-4xl text-balance">
              {"¿"}A que tendras acceso?
            </h2>

            <div className="mt-10 space-y-6">
              {features.map((feature, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
