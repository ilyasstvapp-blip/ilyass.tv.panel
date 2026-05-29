"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full transition-all duration-300 outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:bg-gradient-to-r data-checked:from-cyan-500 data-checked:to-blue-600 data-checked:shadow-lg data-checked:shadow-cyan-500/25 data-unchecked:bg-white/10 data-disabled:cursor-not-allowed data-disabled:opacity-50 shadow-sm data-[size=default]:h-[26px] data-[size=default]:w-[48px] data-[size=sm]:h-[16px] data-[size=sm]:w-[28px] data-checked:border-cyan-400/30 data-unchecked:border-white/10",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full bg-white ring-0 transition-all duration-300 shadow-md shadow-black/20 group-data-[size=default]/switch:size-[22px] group-data-[size=sm]/switch:size-3.5 group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)] dark:data-checked:bg-white group-data-[size=default]/switch:data-unchecked:translate-x-0.5 group-data-[size=sm]/switch:data-unchecked:translate-x-0.5 dark:data-unchecked:bg-white/80"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
