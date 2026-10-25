import { BookOpen, ExternalLink, Globe, GraduationCap, Mail, type LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  RESOURCE_PRICING_LABELS,
  RESOURCE_TYPE_LABELS,
  type Resource,
  type ResourceType,
} from "@/content/resources"

const TYPE_ICONS: Record<ResourceType, LucideIcon> = {
  book: BookOpen,
  website: Globe,
  newsletter: Mail,
  course: GraduationCap,
}

export function ResourceCard({ resource }: { resource: Resource }) {
  const Icon = TYPE_ICONS[resource.type]

  return (
    <article className="group relative flex h-full gap-4 rounded-2xl border bg-card p-5 transition-shadow focus-within:ring-3 focus-within:ring-ring/50 hover:shadow-md">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <h3 className="font-heading font-bold">
          {/* The ::after overlay makes the whole card clickable. */}
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none"
          >
            {resource.title}
            <ExternalLink
              className="ml-1.5 inline size-3.5 text-muted-foreground transition-colors group-hover:text-primary"
              aria-hidden="true"
            />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </h3>
        {resource.author && <p className="text-sm text-muted-foreground">{resource.author}</p>}
        <p className="mt-2 text-sm">{resource.description}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge variant="secondary">{RESOURCE_TYPE_LABELS[resource.type]}</Badge>
          <Badge variant="outline">{RESOURCE_PRICING_LABELS[resource.pricing]}</Badge>
        </div>
      </div>
    </article>
  )
}
