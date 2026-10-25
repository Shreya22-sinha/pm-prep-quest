import Link from "next/link"
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react"

import { HeroVisual } from "@/components/home/hero-visual"
import { Button } from "@/components/ui/button"
import { homeContent } from "@/content/home"

export function Hero() {
  const { hero } = homeContent

  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl lg:left-1/3" />
        <div className="absolute top-48 -right-24 size-80 rounded-full bg-celebrate/20 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-16 px-4 pt-14 pb-24 sm:px-6 sm:pt-24 lg:grid-cols-[1.15fr_1fr] lg:gap-10 lg:pb-32">
        <div className="text-center lg:text-left">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-sm font-semibold text-primary">
            <Sparkles className="size-4" aria-hidden="true" />
            {hero.eyebrow}
          </p>
          <h1
            id="hero-title"
            className="mt-6 font-heading text-4xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl"
          >
            {hero.headline} <span className="text-primary">{hero.headlineHighlight}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-pretty text-muted-foreground lg:mx-0">
            {hero.subtext}
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Button asChild size="lg" className="h-12 w-full px-6 text-base sm:w-auto">
              <Link href={hero.primaryCta.href}>
                {hero.primaryCta.label}
                <ArrowRight data-icon="inline-end" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 w-full px-6 text-base sm:w-auto"
            >
              <Link href={hero.secondaryCta.href}>{hero.secondaryCta.label}</Link>
            </Button>
          </div>

          <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-muted-foreground lg:justify-start">
            {hero.reassurances.map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <HeroVisual preview={hero.preview} />
      </div>
    </section>
  )
}
