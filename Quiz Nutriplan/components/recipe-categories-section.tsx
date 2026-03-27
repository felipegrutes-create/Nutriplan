import Image from "next/image"

const categories = [
  {
    title: "Desayunos",
    count: "50+",
    description: "Opciones bajas en carbohidratos y altas en proteinas para comenzar el dia. Omelettes, tortillas, waffles y mas.",
    image: "/images/cat-desayunos.jpg",
  },
  {
    title: "Almuerzos y Cenas",
    count: "80+",
    description: "Desde recetas sencillas hasta platos elaborados: pizzas, ensaladas, sopas, pescado, carne, pollo y verduras.",
    image: "/images/cat-almuerzos.jpg",
  },
  {
    title: "Panes y Masas",
    count: "50+",
    description: "Hechos a base de harina de almendras, coco y semillas. Panes, tostadas, sandwiches y tacos sin picos de azucar.",
    image: "/images/cat-panes.jpg",
  },
  {
    title: "Dulces y Postres",
    count: "50+",
    description: "Reemplazamos el azucar por edulcorantes naturales. Tortas, helados, galletas y brownies sin culpa.",
    image: "/images/cat-postres.jpg",
  },
  {
    title: "Bebidas y Smoothies",
    count: "35+",
    description: "Smoothies de frutas y verduras, cafe especial, te helado, batidos proteicos y mas opciones refrescantes.",
    image: "/images/cat-bebidas.jpg",
  },
  {
    title: "Snacks y Refrigerios",
    count: "35+",
    description: "Bocadillos saludables para media tarde: chips, frituras de queso, bolitas energeticas y opciones rapidas.",
    image: "/images/cat-snacks.jpg",
  },
]

export function RecipeCategoriesSection() {
  return (
    <section className="bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Explora las categorias
          </p>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-foreground sm:text-4xl md:text-5xl text-balance">
            Mas de 300 Recetas organizadas para ti
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            Cada receta fue probada y diseñada para que puedas comer delicioso sin disparar tu glucosa
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, i) => (
            <div
              key={i}
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={cat.image}
                  alt={`Categoria ${cat.title}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                  <h3 className="text-lg font-bold text-card">
                    {cat.title}
                  </h3>
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                    {cat.count} recetas
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="p-5">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {cat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
