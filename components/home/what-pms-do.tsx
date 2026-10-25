import { HomeSection, IconTile, iconTones, SectionHeading } from "@/components/home/home-section"
import { Reveal } from "@/components/layout/reveal"
import { Card } from "@/components/ui/card"
import { homeContent } from "@/content/home"

export function WhatPmsDo() {
  const { whatPmsDo: section } = homeContent

  return (
    <HomeSection id={section.id}>
      <SectionHeading {...section} />
      <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {section.items.map((item, index) => (
          <li key={item.title}>
            <Reveal delay={index * 0.08} className="h-full">
              <Card className="h-full gap-0 p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-primary/30">
                <IconTile icon={item.icon} tone={iconTones[index % iconTones.length]} />
                <h3 className="mt-5 font-heading text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </Card>
            </Reveal>
          </li>
        ))}
      </ul>
    </HomeSection>
  )
}
