"use client"

import { ThemeProvider } from "next-themes"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { HQStoreProvider } from "./hq-store"

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <HQStoreProvider>
        <TooltipProvider delayDuration={250}>
          {children}
          <Toaster position="bottom-right" />
        </TooltipProvider>
      </HQStoreProvider>
    </ThemeProvider>
  )
}
