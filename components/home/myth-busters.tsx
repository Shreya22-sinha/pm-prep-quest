import { CircleCheck, CircleX } from "lucide-react"

import { HomeSection, SectionHeading } from "@/components/home/home-section"
import { Reveal } from "@/components/layout/reveal"
import { Card } from "@/components/ui/card"
import { homeContent } from "@/content/home"

export function MythBusters() {
  const { mythBusters: section } = homeContent

  return (
    <HomeSection id={section.id}>
      <SectionHeading {...section} />
      <ul className="mt-14 grid gap-5 md:grid-cols-2">
        {section.myths.map((item, index) => (
          <li key={item.myth}>
            <Reveal delay={(index % 2) * 0.08} className="h-full">
              <Card className="h-full gap-0 p-6 sm:p-7">
                <p className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                  <CircleX className="size-4" aria-hidden="true" />
                  {section.mythLabel}
                </p>
                <h3 className="mt-2 font-heading text-xl font-bold text-muted-foreground line-through decoration-2">
                  {item.myth}
                </h3>
                <div className="mt-5 rounded-2xl bg-success/10 p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-success">
                    <CircleCheck className="size-4" aria-hidden="true" />
                    {section.realityLabel}
                  </p>
                  <p className="mt-2 text-base leading-relaxed text-foreground">{item.reality}</p>
                </div>
              </Card>
            </Reveal>
          </li>
        ))}
      </ul>
    </HomeSection>
  )
}
