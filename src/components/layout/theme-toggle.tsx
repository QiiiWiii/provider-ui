import { useEffect, useState } from 'react'
import { MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // The resolved theme is only known after next-themes reads storage and the
  // system preference on the client, so hold the icon back until then.
  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === 'dark'
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme'

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className={className}
      aria-label={label}
      title={label}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {mounted ? (
        isDark ? (
          <SunIcon />
        ) : (
          <MoonIcon />
        )
      ) : (
        <SunIcon className="opacity-0" />
      )}
    </Button>
  )
}
