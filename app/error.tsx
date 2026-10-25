"use client"

import { useEffect } from "react"
import { RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <section
      role="alert"
      className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center"
    >
      <h1 className="font-heading text-3xl font-extrabold tracking-tight">
        Oops, something went sideways
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        That one&apos;s on us, not you. Give it another try.
      </p>
      <Button size="lg" className="mt-8 h-11 px-5 text-base" onClick={() => retry()}>
        <RefreshCw data-icon="inline-start" aria-hidden="true" />
        Try again
      </Button>
    </section>
  )
}
