"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "¿Es seguro para diabeticos?",
    answer:
      "Si. El Metodo Sin Picos fue desarrollado con base en estudios de nutricion y combinaciones de ingredientes que ayudan a reducir el impacto glucemico. Sin embargo, siempre recomendamos consultar a tu medico.",
  },
  {
    question: "¿Necesito saber cocinar?",
    answer:
      "No. Las recetas estan diseñadas para ser extremadamente simples, con instrucciones paso a paso que cualquier persona puede seguir, incluso sin experiencia en la cocina.",
  },
  {
    question: "¿Como accedo al contenido?",
    answer:
      "Inmediatamente despues de la compra recibiras un correo electronico con las instrucciones para acceder al app Nutriplan. Todo estara disponible en tu celular de forma organizada.",
  },
  {
    question: "¿Hay alguna mensualidad o pago recurrente?",
    answer:
      "No. Pagas una sola vez y tienes acceso vitalicio a todo el contenido, incluyendo las actualizaciones semanales y todos los bonos.",
  },
  {
    question: "¿Que pasa si no me gusta?",
    answer:
      "Tienes 60 dias de garantia incondicional. Si por cualquier motivo no estas satisfecho, solo debes solicitar el reembolso y devolvemos el 100% de tu dinero. Sin preguntas.",
  },
  {
    question: "¿El precio esta en dolares?",
    answer:
      "Si, el precio esta en dolares americanos (US$). Sin embargo, al momento del pago, el valor se convertira automaticamente a la moneda de tu pais.",
  },
]

export function FaqSection() {
  return (
    <section className="bg-secondary py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Preguntas Frecuentes
          </p>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-foreground sm:text-4xl text-balance">
            {"¿"}Tienes dudas? Aqui las resolvemos
          </h2>
        </div>

        <Accordion type="single" collapsible className="mt-10">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="border-border"
            >
              <AccordionTrigger className="py-5 text-left text-base font-semibold text-foreground hover:text-primary hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-base leading-relaxed text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
