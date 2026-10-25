import type { LucideIcon } from "lucide-react"

import { RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"

type ChoiceCardProps = {
  value: string
  id: string
  title: string
  description?: string
  icon?: LucideIcon
  meta?: string
  disabled?: boolean
  badge?: string
  children?: React.ReactNode
  className?: string
}

/** A large, card-shaped radio option. Must be used inside a RadioGroup. */
export function ChoiceCard({
  value,
  id,
  title,
  description,
  icon: Icon,
  meta,
  disabled,
  badge,
  children,
  className,
}: ChoiceCardProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "relative flex cursor-pointer items-start gap-4 rounded-2xl border-2 bg-card p-5 transition-colors hover:border-primary/40",
        "has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5",
        "has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
        // Disabled cards stay readable: their text often explains why (e.g. no voice support).
        disabled && "cursor-not-allowed border-dashed bg-muted/40 hover:border-border",
        className
      )}
    >
      <RadioGroupItem value={value} id={id} disabled={disabled} className="mt-1" />
      {Icon && (
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-heading text-base font-bold">{title}</span>
          {badge && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
              {badge}
            </span>
          )}
        </span>
        {meta && <span className="block text-sm font-medium text-primary">{meta}</span>}
        {description && (
          <span className="mt-1 block text-sm text-muted-foreground">{description}</span>
        )}
        {children}
      </span>
    </label>
  )
}
