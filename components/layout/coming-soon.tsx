import Link from "next/link"
import type { LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type ComingSoonProps = {
  title: string
  description: string
  phase: string
  icon: LucideIcon
}

export function ComingSoon({ title, description, phase, icon: Icon }: ComingSoonProps) {
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center sm:py-28">
      <span className="mb-6 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="size-8" aria-hidden="true" />
      </span>
      <Badge variant="secondary" className="mb-4">
        Coming in {phase}
      </Badge>
      <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{description}</p>
      <Button asChild size="lg" className="mt-8 h-11 px-5 text-base">
        <Link href="/">Back to home</Link>
      </Button>
    </section>
  )
}
