import type { LucideIcon } from "lucide-react"

import { Reveal } from "@/components/layout/reveal"
import { cn } from "@/lib/utils"

type HomeSectionProps = {
  id: string
  children: React.ReactNode
  /** Adds a soft background band to separate neighbouring sections. */
  tinted?: boolean
  className?: string
}

export function HomeSection({ id, children, tinted = false, className }: HomeSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn("scroll-mt-16 px-4 py-20 sm:px-6 sm:py-28", tinted && "bg-muted/50", className)}
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  )
}

type SectionHeadingProps = {
  id: string
  eyebrow: string
  title: string
  description: string
  align?: "center" | "left"
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  align = "center",
}: SectionHeadingProps) {
  return (
    <Reveal className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      <p className="text-sm font-bold tracking-wider text-primary uppercase">{eyebrow}</p>
      <h2
        id={`${id}-title`}
        className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-balance sm:text-4xl"
      >
        {title}
      </h2>
      <p className="mt-4 text-lg text-pretty text-muted-foreground">{description}</p>
    </Reveal>
  )
}

const toneClasses = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/15 text-success",
  celebrate: "bg-celebrate/20 text-celebrate-strong",
} as const

export type IconTone = keyof typeof toneClasses

export const iconTones: readonly IconTone[] = ["primary", "success", "celebrate"]

type IconTileProps = {
  icon: LucideIcon
  tone?: IconTone
  size?: "md" | "lg"
  className?: string
}

export function IconTile({ icon: Icon, tone = "primary", size = "lg", className }: IconTileProps) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center",
        size === "lg" ? "size-12 rounded-2xl" : "size-10 rounded-xl",
        toneClasses[tone],
        className
      )}
    >
      <Icon className={size === "lg" ? "size-6" : "size-5"} aria-hidden="true" />
    </span>
  )
}
