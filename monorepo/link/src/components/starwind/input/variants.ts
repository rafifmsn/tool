import { tv } from "tailwind-variants";

export const input = tv({
  base: [
    "border-border text-foreground w-full rounded-xl border bg-background shadow-xs",
    "focus-visible:border-white focus-visible:ring-white/10 transition-[color,box-shadow] focus-visible:ring-3 focus-visible:transition-none focus-visible:outline-none",
    "file:text-foreground file:my-auto file:mr-4 file:h-full file:border-0 file:bg-transparent file:text-sm file:font-medium",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "data-error-visible:border-error data-error-visible:focus-visible:ring-error/40",
    "peer placeholder:text-neutral-700 text-sm",
  ],
  variants: {
    size: {
      sm: "h-9 px-3 text-sm rounded-lg",
      md: "h-12 px-4 text-sm rounded-xl",
      lg: "h-14 px-5 text-base rounded-2xl",
    },
  },
  defaultVariants: {
    size: "md",
  },
});
