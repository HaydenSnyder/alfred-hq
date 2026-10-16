"use client"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

/** One settings section; `id` is the anchor target used by the section nav. */
export function SettingsSection({
  id,
  title,
  description,
  badge,
  children,
  className,
}: {
  id: string
  title: string
  description?: React.ReactNode
  badge?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn("scroll-mt-20 rounded-xl border bg-card", className)}>
      <div className="border-b px-4 py-3.5 sm:px-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id={`${id}-title`} className="text-sm font-medium">
            {title}
          </h2>
          {badge}
        </div>
        {description && <p className="mt-0.5 text-xs text-muted-foreground text-pretty">{description}</p>}
      </div>
      <div className="px-4 py-2 sm:px-5">{children}</div>
    </section>
  )
}

/** Row with a label/description on the left and a control on the right. */
export function SettingRow({
  label,
  htmlFor,
  description,
  control,
  className,
}: {
  label: React.ReactNode
  htmlFor?: string
  description?: React.ReactNode
  control: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-2 border-b py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6", className)}>
      <div className="min-w-0 space-y-0.5">
        {htmlFor ? (
          <Label htmlFor={htmlFor} className="text-sm font-normal">
            {label}
          </Label>
        ) : (
          <p className="text-sm">{label}</p>
        )}
        {description && <p className="text-xs text-muted-foreground text-pretty">{description}</p>}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  )
}

export function SwitchRow({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
}: {
  id: string
  label: React.ReactNode
  description?: React.ReactNode
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-6 border-b py-3 last:border-b-0">
      <div className="min-w-0 space-y-0.5">
        <Label htmlFor={id} className="text-sm font-normal">
          {label}
        </Label>
        {description && <p id={`${id}-desc`} className="text-xs text-muted-foreground text-pretty">{description}</p>}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-describedby={description ? `${id}-desc` : undefined}
      />
    </div>
  )
}

export function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="pt-3 pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">{children}</h3>
}

export function Note({ children, icon, className }: { children: React.ReactNode; icon?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("my-3 flex items-start gap-2 rounded-lg border bg-surface-2 px-3 py-2 text-xs text-muted-foreground", className)}>
      {icon && <span className="mt-0.5 shrink-0 [&_svg]:size-3.5">{icon}</span>}
      <div className="min-w-0 text-pretty">{children}</div>
    </div>
  )
}
