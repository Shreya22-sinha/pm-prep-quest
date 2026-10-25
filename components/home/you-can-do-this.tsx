import { HomeSection, IconTile, iconTones, SectionHeading } from "@/components/home/home-section"
import { JourneySteps } from "@/components/home/journey-steps"
import { Reveal } from "@/components/layout/reveal"
import { homeContent } from "@/content/home"

export function YouCanDoThis() {
  const { youCanDoThis: section } = homeContent

  return (
    <HomeSection id={section.id} tinted>
      <SectionHeading {...section} />

      <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {section.backgrounds.map((background, index) => (
          <li key={background.title}>
            <Reveal
              delay={(index % 3) * 0.08}
              className="flex h-full items-start gap-4 rounded-2xl border bg-card p-5"
            >
              <IconTile
                icon={background.icon}
                tone={iconTones[index % iconTones.length]}
                size="md"
              />
              <div>
                <h3 className="font-heading font-bold">{background.title}</h3>
                <p className="mt-1 text-muted-foreground">{background.description}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>

      <div className="mt-20">
        <Reveal>
          <h3 className="text-center font-heading text-2xl font-extrabold tracking-tight">
            {section.stepsTitle}
          </h3>
        </Reveal>
        <div className="mt-12">
          <JourneySteps
            steps={section.steps.map(({ title, description, icon: Icon }) => ({
              title,
              description,
              icon: <Icon className="size-6" aria-hidden="true" />,
            }))}
            stepLabel={section.stepLabel}
          />
        </div>
      </div>
    </HomeSection>
  )
}
