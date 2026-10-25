import Link from "next/link"
import { Compass } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <span className="mb-6 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Compass className="size-8" aria-hidden="true" />
      </span>
      <h1 className="font-heading text-3xl font-extrabold tracking-tight">
        This page took a detour
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        We couldn&apos;t find what you were looking for. Let&apos;s get you back on track.
      </p>
      <Button asChild size="lg" className="mt-8 h-11 px-5 text-base">
        <Link href="/">Back to home</Link>
      </Button>
    </section>
  )
}
