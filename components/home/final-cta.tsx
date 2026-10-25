import Link from "next/link"
import { ArrowRight, Trophy } from "lucide-react"

import { Reveal } from "@/components/layout/reveal"
import { Button } from "@/components/ui/button"
import { homeContent } from "@/content/home"

export function FinalCta() {
  const { finalCta } = homeContent

  return (
    <section aria-labelledby="final-cta-title" className="px-4 pb-24 sm:px-6 sm:pb-32">
      <Reveal className="mx-auto max-w-5xl">
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-primary px-6 py-16 text-center text-primary-foreground shadow-2xl shadow-primary/20 sm:px-12 sm:py-20">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-24 -left-20 size-72 rounded-full bg-primary-foreground/10 blur-2xl" />
            <div className="absolute -right-16 -bottom-28 size-80 rounded-full bg-celebrate/30 blur-3xl" />
          </div>
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-celebrate text-celebrate-foreground shadow-lg">
            <Trophy className="size-7" aria-hidden="true" />
          </span>
          <h2
            id="final-cta-title"
            className="mt-6 font-heading text-3xl font-extrabold tracking-tight text-balance sm:text-4xl"
          >
            {finalCta.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-pretty opacity-90">
            {finalCta.description}
          </p>
          <Button
            asChild
            size="lg"
            className="mt-10 h-12 bg-background px-6 text-base text-foreground hover:bg-background/90"
          >
            <Link href={finalCta.cta.href}>
              {finalCta.cta.label}
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </Reveal>
    </section>
  )
}
