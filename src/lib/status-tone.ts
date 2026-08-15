/**
 * Status tones shared by badges, inline text and meters.
 *
 * Feature code must not reach for a raw palette color. Pick a tone here so the
 * light and dark values, and any future palette change, stay in one place.
 */
export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

const badgeTone: Record<StatusTone, string> = {
  success:
    'border-success-border bg-success-subtle text-success-subtle-foreground',
  warning:
    'border-warning-border bg-warning-subtle text-warning-subtle-foreground',
  danger: 'border-danger-border bg-danger-subtle text-danger-subtle-foreground',
  info: 'border-info-border bg-info-subtle text-info-subtle-foreground',
  neutral: 'border-border bg-muted text-muted-foreground',
}

const textTone: Record<StatusTone, string> = {
  success: 'text-success-subtle-foreground',
  warning: 'text-warning-subtle-foreground',
  danger: 'text-danger-subtle-foreground',
  info: 'text-info-subtle-foreground',
  neutral: 'text-muted-foreground',
}

const fillTone: Record<StatusTone, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
  neutral: 'bg-muted-foreground',
}

/** Chip surface: border, subtle background and readable text. */
export function statusBadgeTone(tone: StatusTone): string {
  return badgeTone[tone]
}

/**
 * Any foreground on a page, card or chip surface — text and icons alike. The
 * solid tone is too light to read against those surfaces, so it never gets
 * used for foregrounds.
 */
export function statusTextTone(tone: StatusTone): string {
  return textTone[tone]
}

/** Solid fill for meters, bars and dots. Nothing is drawn on top of it. */
export function statusFillTone(tone: StatusTone): string {
  return fillTone[tone]
}
