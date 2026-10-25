import { HomeSection, IconTile, iconTones, SectionHeading } from "@/components/home/home-section"
import { Reveal } from "@/components/layout/reveal"
import { Card } from "@/components/ui/card"
import { homeContent } from "@/content/home"
import { cn } from "@/lib/utils"

export function Benefits() {
  const { benefits: section } = homeContent
  const lastIndex = section.items.length - 1

  return (
    <HomeSection id={section.id}>
      <SectionHeading {...section} />
      {/* Six-column grid: three cards on the first row, two wider cards on the second. */}
      <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
        {section.items.map((item, index) => (
          <li
            key={item.title}
            className={cn(
              "lg:col-span-2",
              index >= 3 && "lg:col-span-3",
              index === lastIndex && index % 2 === 0 && "sm:col-span-2 lg:col-span-3"
            )}
          >
            <Reveal delay={(index % 3) * 0.08} className="h-full">
              <Card className="h-full flex-row items-start gap-4 p-6">
                <IconTile icon={item.icon} tone={iconTones[index % iconTones.length]} />
                <div>
                  <h3 className="font-heading text-lg font-bold">{item.title}</h3>
                  <p className="mt-1.5 text-base leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </Card>
            </Reveal>
          </li>
        ))}
      </ul>
    </HomeSection>
  )
}
