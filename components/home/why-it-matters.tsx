import { Crown, Info } from "lucide-react"

import { HomeSection, IconTile, SectionHeading } from "@/components/home/home-section"
import { Reveal } from "@/components/layout/reveal"
import { homeContent } from "@/content/home"

export function WhyItMatters() {
  const { whyItMatters: section } = homeContent

  return (
    <HomeSection id={section.id} tinted>
      <div className="grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <SectionHeading {...section} align="left" />
          <Reveal delay={0.1} className="mt-6 space-y-4 text-lg leading-relaxed">
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </Reveal>
          <ul className="mt-10 grid gap-6 sm:grid-cols-3">
            {section.impacts.map((impact, index) => (
              <li key={impact.title}>
                <Reveal delay={0.15 + index * 0.08}>
                  <IconTile icon={impact.icon} size="md" />
                  <h3 className="mt-3 font-heading font-bold">{impact.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{impact.description}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>

        <Reveal delay={0.15}>
          <aside
            aria-labelledby="ceo-callout-title"
            className="relative isolate overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground shadow-xl shadow-primary/20 sm:p-10"
          >
            <div
              aria-hidden="true"
              className="absolute -top-16 -right-16 -z-10 size-56 rounded-full bg-primary-foreground/10 blur-2xl"
            />
            <span className="grid size-12 place-items-center rounded-2xl bg-primary-foreground/15">
              <Crown className="size-6" aria-hidden="true" />
            </span>
            <h3
              id="ceo-callout-title"
              className="mt-6 font-heading text-2xl font-extrabold tracking-tight"
            >
              {section.ceoCallout.title}
            </h3>
            <p className="mt-4 text-lg leading-relaxed">{section.ceoCallout.body}</p>
            <p className="mt-6 flex gap-3 rounded-2xl bg-primary-foreground/10 p-4 leading-relaxed">
              <Info className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <span>{section.ceoCallout.note}</span>
            </p>
          </aside>
        </Reveal>
      </div>
    </HomeSection>
  )
}
