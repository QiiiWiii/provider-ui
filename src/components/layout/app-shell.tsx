import type { CSSProperties, PointerEvent, KeyboardEvent } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  BoxesIcon,
  ChartNoAxesColumnIcon,
  ChevronsUpDownIcon,
  KeyRoundIcon,
  LogOutIcon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
  SunMoonIcon,
  UsersIcon,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { NavLink, Outlet, useLocation } from 'react-router'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import { logoutAuthSession } from '@/features/auth/auth-session'
import type { AuthUser, AuthUserRole } from '@/features/auth/auth-types'
import { useAuthState } from '@/features/auth/use-auth-state'
import type { SidebarDragResult } from '@/lib/sidebar-width'
import {
  clampSidebarWidth,
  readStoredSidebarWidth,
  resolveSidebarDrag,
  sidebarCollapseThreshold,
  sidebarKeyboardStep,
  sidebarMaxWidth,
  sidebarResizeDirections,
  storeSidebarWidth,
} from '@/lib/sidebar-width'
import { cn } from '@/lib/utils'

// Only the directions still available, so the cursor never promises a dead end.
const resizeCursorClasses = {
  both: 'cursor-col-resize',
  left: 'cursor-w-resize',
  right: 'cursor-e-resize',
} as const

const primaryNavigation = [
  {
    label: 'Providers',
    href: '/providers',
    icon: BoxesIcon,
    superAdminOnly: true,
  },
  {
    label: 'API Keys',
    href: '/api-keys',
    icon: KeyRoundIcon,
    superAdminOnly: false,
  },
  {
    label: 'Usage',
    href: '/usage',
    icon: ChartNoAxesColumnIcon,
    superAdminOnly: false,
  },
] as const

const themeOptions = [
  { value: 'light', label: 'Light', icon: SunIcon },
  { value: 'dark', label: 'Dark', icon: MoonIcon },
  { value: 'system', label: 'System', icon: MonitorIcon },
] as const

const administrationNavigation = [
  {
    label: 'Users',
    href: '/users',
    icon: UsersIcon,
    superAdminOnly: true,
  },
] as const

export function AppShell() {
  const authState = useAuthState()
  const location = useLocation()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [sidebarWidth, setSidebarWidth] = useState(readStoredSidebarWidth)

  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0 })
  }, [location.pathname, location.search])

  const commitSidebarWidth = useCallback((width: number) => {
    setSidebarWidth(width)
    storeSidebarWidth(width)
  }, [])

  if (authState.status !== 'authenticated') {
    return null
  }

  // The stored width is read during the first render rather than in an effect,
  // so the sidebar never paints at the default 16rem first.
  // The header is mobile-only: below md the sidebar is a drawer, so the trigger
  // has to live outside it. From md up the sidebar carries its own controls.
  return (
    <SidebarProvider
      style={{ '--sidebar-width': `${sidebarWidth}px` } as CSSProperties}
    >
      <AppSidebar
        user={authState.user}
        width={sidebarWidth}
        onWidthChange={commitSidebarWidth}
      />
      <SidebarInset className="min-h-0 min-w-0 overflow-hidden bg-background">
        <header className="z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border/70 bg-card/85 px-4 backdrop-blur-xl sm:px-6 md:hidden">
          <SidebarTrigger className="-ml-1" />
        </header>
        <div
          ref={scrollContainerRef}
          className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10"
        >
          <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col pb-10">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function AppSidebar({
  user,
  width,
  onWidthChange,
}: {
  user: AuthUser
  width: number
  onWidthChange: (width: number) => void
}) {
  const { isMobile, setOpenMobile } = useSidebar()

  function closeMobileSidebar() {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  // Three things keep the collapsed icons centred and unclipped. The visible
  // band of bg-sidebar runs from the window edge to the card at 72px while
  // sidebar-container is 66px, so its symmetric p-2 is rebalanced below to match
  // the band. SidebarContent carries no padding of its own, because SidebarGroup
  // already brings the same p-2 the header and footer use. And the brand tile is
  // size-8, not size-9, because the lg button's content box is 32px and clips
  // anything larger.
  return (
    <Sidebar
      variant="inset"
      collapsible="icon"
      className="group-data-[collapsible=icon]:pr-1 group-data-[collapsible=icon]:pl-3"
    >
      <SidebarHeader className="pt-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Provider"
              render={
                <NavLink
                  to={user.role === 'super_admin' ? '/providers' : '/api-keys'}
                  onClick={closeMobileSidebar}
                />
              }
              className="hover:bg-transparent active:bg-transparent"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-sm shadow-sidebar-primary/20">
                <BoxesIcon className="size-4" />
              </span>
              <span className="grid flex-1 text-left leading-tight">
                <span className="truncate font-semibold tracking-tight">Provider</span>
                <span className="truncate text-xs text-sidebar-muted-foreground">
                  Control plane
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="pt-3">
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavigationMenu
              items={primaryNavigation.filter(
                (item) => !item.superAdminOnly || user.role === 'super_admin',
              )}
              onNavigate={closeMobileSidebar}
            />
          </SidebarGroupContent>
        </SidebarGroup>
        {user.role === 'super_admin' ? (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <NavigationMenu
                items={administrationNavigation}
                onNavigate={closeMobileSidebar}
              />
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <UserAccount user={user} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarResizeHandle width={width} onWidthChange={onWidthChange} />
    </Sidebar>
  )
}

// Straddles the left edge of the inset page card and drags it. That edge is the
// only boundary the eye can see: under variant="inset" the sidebar surface and
// the padding around it are both bg-sidebar, so the gap between them has no
// visible edge to sit on. It anchors to sidebar-container, whose right edge
// meets the card when expanded but stops 6px short when collapsed, hence the
// offset correction there.
//
// SidebarRail is deliberately not rendered in its place: it carries
// tabIndex={-1} so keyboard users cannot reach it, and its w-resize cursor
// advertises exactly this drag without implementing it.
function SidebarResizeHandle({
  width,
  onWidthChange,
}: {
  width: number
  onWidthChange: (width: number) => void
}) {
  const { state, setOpen, toggleSidebar } = useSidebar()
  const collapsed = state === 'collapsed'
  const dragRef = useRef<{ pointerId: number; startX: number; startEdge: number } | null>(
    null,
  )
  // Last width the drag rendered. A drag that ends collapsed still commits it,
  // or React state and localStorage keep the width from before the drag while
  // the CSS variable holds the dragged one.
  const lastLiveWidthRef = useRef<number | null>(null)

  // Dragging writes the width straight to the CSS variable and only commits to
  // React on release, so a pointermove does not re-render the whole page.
  function setLiveWidth(handle: HTMLElement, next: number) {
    wrapperOf(handle)?.style.setProperty('--sidebar-width', `${next}px`)
  }

  // Pointer capture keeps the drag alive far outside the 12px strip, so the
  // wrapper has to carry the cursor. It doubles as the flag that suppresses the
  // width transitions.
  function startDragState(handle: HTMLElement, result: SidebarDragResult) {
    const wrapper = wrapperOf(handle)
    if (wrapper) {
      wrapper.dataset.resizing = sidebarResizeDirections(
        result.collapsed,
        result.collapsed ? 0 : result.width,
      )
    }
  }

  function endDragState(handle: HTMLElement) {
    const wrapper = wrapperOf(handle)
    if (wrapper) {
      delete wrapper.dataset.resizing
    }
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) {
      return
    }

    // Measure where the edge is right now instead of deriving it from the width,
    // so the same code works collapsed, where the edge is not the width at all.
    const bounds = event.currentTarget.getBoundingClientRect()
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startEdge: bounds.left + bounds.width / 2,
    }
    lastLiveWidthRef.current = null
    event.currentTarget.setPointerCapture(event.pointerId)
    startDragState(
      event.currentTarget,
      collapsed ? { collapsed: true } : { collapsed: false, width },
    )
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) {
      return
    }

    const result = resolveSidebarDrag(drag.startEdge + (event.clientX - drag.startX))
    startDragState(event.currentTarget, result)

    if (result.collapsed) {
      if (!collapsed) {
        setOpen(false)
      }
      return
    }

    if (collapsed) {
      setOpen(true)
      onWidthChange(result.width)
    }

    lastLiveWidthRef.current = result.width
    setLiveWidth(event.currentTarget, result.width)
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    // First, and unconditionally: the attribute holds the resize cursor over the
    // whole page, so anything left of it strands the app in a drag it is not
    // doing. Capture is released implicitly, so nothing above it can throw.
    endDragState(event.currentTarget)

    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) {
      return
    }

    dragRef.current = null

    if (lastLiveWidthRef.current !== null) {
      onWidthChange(lastLiveWidthRef.current)
    }
  }

  // Fires however capture ends, including paths that never reach pointerup.
  function handleLostPointerCapture(event: PointerEvent<HTMLDivElement>) {
    dragRef.current = null
    endDragState(event.currentTarget)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleSidebar()
      return
    }

    const step =
      event.key === 'ArrowLeft'
        ? -sidebarKeyboardStep
        : event.key === 'ArrowRight'
          ? sidebarKeyboardStep
          : 0

    if (step === 0) {
      return
    }

    event.preventDefault()

    if (collapsed) {
      if (step > 0) {
        setOpen(true)
      }
      return
    }

    const next = width + step
    if (next < sidebarCollapseThreshold) {
      setOpen(false)
      return
    }

    onWidthChange(clampSidebarWidth(next))
  }

  // The reported floor is 0, not sidebarMinWidth: collapsed is a real value the
  // handle can take, and it is below every width the sidebar will ever render.
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize sidebar"
      aria-valuenow={collapsed ? 0 : width}
      aria-valuemin={0}
      aria-valuemax={sidebarMaxWidth}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onLostPointerCapture={handleLostPointerCapture}
      onKeyDown={handleKeyDown}
      onDoubleClick={toggleSidebar}
      data-slot="sidebar-resize-handle"
      className={cn(
        // touch-none, or a touch drag is taken for a scroll and cancelled.
        'absolute inset-y-0 right-0 z-30 hidden w-3 translate-x-1/2 touch-none group-data-[collapsible=icon]:-right-1.5 focus-visible:outline-none md:block',
        // Nothing is drawn on hover; the cursor is the whole affordance. The
        // marker only appears for keyboard focus, which has no cursor to read.
        'after:absolute after:inset-y-0 after:left-1/2 after:w-0.5 after:-translate-x-1/2 after:rounded-full after:bg-transparent focus-visible:after:bg-sidebar-ring',
        resizeCursorClasses[sidebarResizeDirections(collapsed, width)],
      )}
    />
  )
}

function wrapperOf(element: HTMLElement): HTMLElement | null {
  return element.closest<HTMLElement>('[data-slot="sidebar-wrapper"]')
}

type NavigationItem = {
  label: string
  href: string
  icon: typeof BoxesIcon
  superAdminOnly: boolean
}

function NavigationMenu({
  items,
  onNavigate,
}: {
  items: readonly NavigationItem[]
  onNavigate: () => void
}) {
  const location = useLocation()

  return (
    <SidebarMenu className="gap-1.5">
      {items.map((item) => {
        const isActive =
          location.pathname === item.href ||
          location.pathname.startsWith(`${item.href}/`)

        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              tooltip={item.label}
              isActive={isActive}
              render={<NavLink to={item.href} onClick={onNavigate} />}
              className="h-9 rounded-lg px-2.5 data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground data-active:shadow-xs"
            >
              <item.icon />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}

function UserAccount({ user }: { user: AuthUser }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // next-themes only knows the stored preference after it reads storage on the
  // client, so keep the radio group unselected rather than flashing a wrong one.
  useEffect(() => {
    setMounted(true)
  }, [])

  const activeTheme = mounted ? (theme ?? 'system') : ''
  // The theme is a set-once preference, so it folds into a submenu that reports
  // its current value rather than spending three rows of the account menu. The
  // label takes flex-1 because SubmenuTrigger appends its own ml-auto chevron,
  // and flexbox splits free space evenly between competing auto margins.
  const activeThemeLabel = themeOptions.find(
    (option) => option.value === activeTheme,
  )?.label

  async function handleLogout() {
    if (isLoggingOut) {
      return
    }

    setIsLoggingOut(true)

    try {
      await logoutAuthSession()
    } catch {
      // Local session cleanup is guaranteed by logoutAuthSession.
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label={`Account menu for ${user.username}`}
            className="flex h-12 w-full min-w-0 items-center gap-2 rounded-lg bg-sidebar-accent/60 p-2 text-left transition-colors hover:bg-sidebar-accent focus-visible:ring-[3px] focus-visible:ring-sidebar-ring/50 focus-visible:outline-none group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-0!"
          />
        }
      >
        <Avatar className="rounded-lg" size="default">
          <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            {getUserInitial(user.username)}
          </AvatarFallback>
        </Avatar>
        <span className="grid min-w-0 flex-1 leading-tight group-data-[collapsible=icon]:hidden">
          <span className="truncate text-sm font-medium">{user.username}</span>
          <span className="truncate text-xs text-sidebar-muted-foreground">
            {formatRole(user.role)}
          </span>
        </span>
        <ChevronsUpDownIcon className="size-4 shrink-0 text-sidebar-muted-foreground group-data-[collapsible=icon]:hidden" />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-56">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <SunMoonIcon />
            <span className="flex-1">Theme</span>
            <span className="text-xs text-muted-foreground">
              {activeThemeLabel}
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup
              value={activeTheme}
              onValueChange={(value) => setTheme(String(value))}
            >
              {themeOptions.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  <option.icon />
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={isLoggingOut}
          onClick={() => void handleLogout()}
        >
          <LogOutIcon />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function getUserInitial(username: string): string {
  return username.trim().charAt(0).toUpperCase() || 'U'
}

function formatRole(role: AuthUserRole): string {
  return role === 'super_admin' ? 'Super admin' : 'User'
}
