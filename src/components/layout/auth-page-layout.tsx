import type { PropsWithChildren } from 'react'

import { ThemeToggle } from '@/components/layout/theme-toggle'

export function AuthPageLayout({ children }: PropsWithChildren) {
  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-muted/50 px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />
      <ThemeToggle className="absolute top-4 right-4 text-muted-foreground" />
      <div className="relative w-full max-w-sm">{children}</div>
    </main>
  )
}
