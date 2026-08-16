/**
 * Geometry and persistence for the drag-resizable sidebar. The rules live here
 * rather than in the component so they can be exercised without a DOM.
 */

export const sidebarWidthStorageKey = 'sidebar-width'

/** Matches SIDEBAR_WIDTH in the sidebar primitive, so nothing moves on first run. */
export const sidebarDefaultWidth = 256
export const sidebarMinWidth = 208
export const sidebarMaxWidth = 384

/**
 * The width a drag has to cross for the sidebar to flip between collapsed and
 * expanded. It sits below sidebarMinWidth so the sidebar cannot be left in a
 * width it would never render: everything between the two is either clamped up
 * to the minimum or snapped shut, never held.
 */
export const sidebarCollapseThreshold = 160

/** How far one arrow key press moves the edge. */
export const sidebarKeyboardStep = 16

export function clampSidebarWidth(width: number): number {
  return Math.min(sidebarMaxWidth, Math.max(sidebarMinWidth, Math.round(width)))
}

export type SidebarDragResult =
  | { collapsed: true }
  | { collapsed: false; width: number }

/** Maps the raw width a drag is asking for onto the state the sidebar can take. */
export function resolveSidebarDrag(width: number): SidebarDragResult {
  if (width < sidebarCollapseThreshold) {
    return { collapsed: true }
  }

  return { collapsed: false, width: clampSidebarWidth(width) }
}

/** Which way the edge can still move, so the cursor can stop promising the rest. */
export type SidebarResizeDirections = 'both' | 'left' | 'right'

export function sidebarResizeDirections(
  collapsed: boolean,
  width: number,
): SidebarResizeDirections {
  // Collapsed is the one dead end on the left: there is nothing narrower to go
  // to. While expanded there is always something to the left, because below
  // sidebarMinWidth the drag stops resizing and starts closing instead.
  if (collapsed) {
    return 'right'
  }

  return width >= sidebarMaxWidth ? 'left' : 'both'
}

// Storage access throws outright where the browser blocks it, and this one runs
// during the first render, so an unguarded read would take the whole app down
// over a sidebar width.
export function readStoredSidebarWidth(): number {
  try {
    const stored = Number(window.localStorage.getItem(sidebarWidthStorageKey))

    return Number.isFinite(stored) && stored > 0
      ? clampSidebarWidth(stored)
      : sidebarDefaultWidth
  } catch {
    return sidebarDefaultWidth
  }
}

export function storeSidebarWidth(width: number): void {
  try {
    window.localStorage.setItem(sidebarWidthStorageKey, String(width))
  } catch {
    // A width that cannot be persisted still holds for this session.
  }
}
