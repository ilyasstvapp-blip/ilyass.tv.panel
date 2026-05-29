import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border text-sm font-medium whitespace-nowrap transition-all duration-250 outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 bg-clip-padding",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-cyan-500/90 to-blue-600/90 text-white shadow-lg shadow-cyan-500/15 border-cyan-400/30 hover:shadow-xl hover:shadow-cyan-500/25 hover:border-cyan-300/50 hover:from-cyan-400 hover:to-blue-500 active:shadow-md active:from-cyan-600 active:to-blue-700 [a]:hover:bg-primary/80 dark:from-cyan-400/80 dark:to-indigo-500/80 dark:shadow-cyan-400/15 dark:border-cyan-300/25 dark:hover:from-cyan-300 dark:hover:to-indigo-400 dark:hover:shadow-cyan-300/30 dark:hover:border-cyan-200/40",
        outline:
          "border-border bg-background shadow-sm hover:bg-muted hover:text-foreground hover:shadow-md hover:border-cyan-400/30 hover:shadow-cyan-400/10 aria-expanded:bg-muted aria-expanded:text-foreground active:shadow-sm dark:border-white/10 dark:bg-transparent dark:hover:bg-white/5 dark:hover:border-cyan-400/25 dark:hover:shadow-cyan-400/10",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm border-white/10 hover:bg-secondary/80 hover:shadow-md hover:border-cyan-400/20 active:shadow-sm aria-expanded:bg-secondary aria-expanded:text-secondary-foreground dark:border-white/5",
        ghost:
          "border-transparent hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-white/5",
        destructive:
          "bg-destructive/10 text-destructive shadow-sm border-red-400/20 hover:bg-destructive/20 hover:shadow-md hover:border-red-400/30 hover:shadow-red-400/10 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40 dark:border-red-400/15 dark:hover:border-red-400/25 active:shadow-sm",
        link: "text-primary underline-offset-4 hover:underline border-transparent",
      },
      size: {
        default:
          "h-9 gap-1.5 rounded-lg px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        xs: "h-7 gap-1 rounded-md px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 rounded-md px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 gap-2 rounded-lg px-4 text-base has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-9 rounded-lg",
        "icon-xs":
          "size-7 rounded-md in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8 rounded-md in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
