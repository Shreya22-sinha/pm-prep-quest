"use client"

import { Suspense } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Rocket } from "lucide-react"

import { XpPill } from "@/components/gamification/xp-pill"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"

function isActive(pathname: string | null, href: string) {
  if (pathname === null) return false
  return href === "/" ? pathname === "/" : pathname.startsWith(href)
}

type LinksProps = { pathname: string | null }

function DesktopLinks({ pathname }: LinksProps) {
  return (
    <ul className="flex items-center gap-1">
      {siteConfig.nav.map((item) => {
        const active = isActive(pathname, item.href)
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                active && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
              )}
            >
              {item.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

function MobileLinks({ pathname }: LinksProps) {
  return (
    <ul className="flex flex-col gap-1">
      {siteConfig.nav.map((item) => {
        const active = isActive(pathname, item.href)
        return (
          <li key={item.href}>
            <SheetClose asChild>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "block rounded-lg px-3 py-3 text-base font-medium transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                  active && "bg-primary/10 text-primary"
                )}
              >
                {item.label}
              </Link>
            </SheetClose>
          </li>
        )
      })}
    </ul>
  )
}

// Reading the current path is request-time data on routes with unknown params
// (e.g. /interview/session/[id]), so only the links wait for it, inside Suspense,
// and the rest of the navbar stays in the static shell.
function WithPathname({ render }: { render: (pathname: string | null) => React.ReactNode }) {
  return render(usePathname())
}

function ActiveAware({ render }: { render: (pathname: string | null) => React.ReactNode }) {
  return (
    <Suspense fallback={render(null)}>
      <WithPathname render={render} />
    </Suspense>
  )
}

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/70 print:hidden">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg font-heading text-lg font-extrabold tracking-tight focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Rocket className="size-4" aria-hidden="true" />
          </span>
          <span className="hidden sm:inline">{siteConfig.name}</span>
          <span className="sr-only sm:hidden">{siteConfig.name}</span>
        </Link>

        <nav aria-label="Main" className="ml-6 hidden md:block">
          <ActiveAware render={(pathname) => <DesktopLinks pathname={pathname} />} />
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <XpPill />
          <ThemeToggle />

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-lg" className="md:hidden" aria-label="Open menu">
                <Menu className="size-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>{siteConfig.name}</SheetTitle>
                <SheetDescription>Where to next?</SheetDescription>
              </SheetHeader>
              <nav aria-label="Mobile" className="px-4">
                <ActiveAware render={(pathname) => <MobileLinks pathname={pathname} />} />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
