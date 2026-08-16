import {
  CalendarIcon,
  Clock3Icon,
  ClockArrowDownIcon,
  ClockArrowUpIcon,
  XIcon,
} from 'lucide-react'
import { useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { formatDateTime } from '@/lib/datetime'
import { cn } from '@/lib/utils'

export function ApiKeyExpirationField({
  id,
  value,
  onChange,
  disabled = false,
  invalid = false,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  invalid?: boolean
}) {
  const selected = parseLocalDateTime(value)
  const [timeInput, setTimeInput] = useState(() =>
    localTimeValue(selected ?? new Date()),
  )
  const timeInputRef = useRef<HTMLInputElement>(null)

  function selectDate(date: Date | undefined) {
    if (!date) {
      return
    }

    onChange(withDateAndTime(date, parseClockTime(timeInput) ?? clockTimeNow()))
  }

  function updateTime(nextTime: string) {
    setTimeInput(nextTime)
    const time = parseClockTime(nextTime)
    if (selected && time) {
      onChange(withDateAndTime(selected, time))
    }
  }

  // Clearing unmounts this button, so the focus it is holding has to be handed
  // somewhere deliberate rather than falling back to the document body.
  function clearExpiration() {
    setTimeInput(localTimeValue(new Date()))
    onChange('')
    timeInputRef.current?.focus()
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            className={cn(
              'w-full justify-start font-normal',
              !selected && 'text-muted-foreground',
            )}
            disabled={disabled}
            aria-invalid={invalid}
          />
        }
      >
        <CalendarIcon />
        {selected ? formatDateTime(selected) : 'Never expires'}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-72 max-w-(--available-width) gap-0 p-0"
      >
        <Calendar
          mode="single"
          captionLayout="dropdown"
          // Months span five or six weeks, and the popup would resize and
          // reposition on every month change without a fixed grid.
          fixedWeeks
          startMonth={startOfToday()}
          endMonth={lastSelectableMonth()}
          selected={selected}
          defaultMonth={selected}
          disabled={{ before: startOfToday() }}
          onSelect={selectDate}
          // The popup sets the width now, so the grid stretches to fill it
          // rather than sitting at the component's own w-fit and leaving dead
          // space to the right of Sa. p-4 lines its edges up with the time row,
          // and the taller cell keeps the stretched columns from going squat.
          className="w-full p-4 [--cell-size:--spacing(8)]"
        />
        <div className="grid gap-2 border-t p-4">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor={`${id}-time`} className="text-sm font-medium">
              Time
            </label>
            <div className="flex items-center gap-0.5">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="text-muted-foreground"
                disabled={disabled}
                aria-label="Set time to start of day, 00:00:00"
                onClick={() => updateTime('00:00:00')}
              >
                <ClockArrowDownIcon />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="text-muted-foreground"
                disabled={disabled}
                aria-label="Set time to end of day, 23:59:59"
                onClick={() => updateTime('23:59:59')}
              >
                <ClockArrowUpIcon />
              </Button>
            </div>
          </div>
          <div className="relative">
            <Clock3Icon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={timeInputRef}
              id={`${id}-time`}
              type="time"
              step={1}
              autoComplete="off"
              value={timeInput}
              disabled={disabled}
              aria-label="Expiration time"
              // The native picker button would land under the clear button, and
              // it only opens the editor that clicking the field opens anyway.
              className="px-8 font-mono tabular-nums [&::-webkit-calendar-picker-indicator]:hidden"
              onChange={(event) => updateTime(event.target.value)}
              onBlur={() => {
                if (!parseClockTime(timeInput)) {
                  setTimeInput(localTimeValue(selected ?? new Date()))
                }
              }}
            />
            {/* Centred by the wrapper, not by -translate-y-1/2: the button's
                own active:translate-y-px would overwrite that transform and
                drop it to the top edge for as long as it is held down. */}
            {selected ? (
              <div className="absolute inset-y-0 right-1 flex items-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="text-muted-foreground"
                  disabled={disabled}
                  aria-label="Clear expiration"
                  onClick={clearExpiration}
                >
                  <XIcon />
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function parseLocalDateTime(value: string): Date | undefined {
  if (!value) {
    return undefined
  }

  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? date : undefined
}

type ClockTime = { hours: number; minutes: number; seconds: number }

// A time input may report either HH:mm or HH:mm:ss depending on whether the
// seconds segment is filled in, so both shapes have to parse.
function parseClockTime(value: string): ClockTime | null {
  const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value)
  if (!match) {
    return null
  }

  const hours = Number(match[1])
  const minutes = Number(match[2])
  const seconds = Number(match[3] ?? '0')
  if (hours > 23 || minutes > 59 || seconds > 59) {
    return null
  }

  return { hours, minutes, seconds }
}

function clockTimeNow(): ClockTime {
  const now = new Date()
  return {
    hours: now.getHours(),
    minutes: now.getMinutes(),
    seconds: now.getSeconds(),
  }
}

function withDateAndTime(date: Date, time: ClockTime): string {
  const selected = new Date(date)
  selected.setHours(time.hours, time.minutes, time.seconds, 0)
  return toLocalDateTimeValue(selected)
}

function toLocalDateTimeValue(date: Date): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 19)
}

function localTimeValue(date: Date): string {
  return [date.getHours(), date.getMinutes(), date.getSeconds()]
    .map((part) => part.toString().padStart(2, '0'))
    .join(':')
}

function startOfToday(): Date {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}

// The month and year dropdowns need an explicit range. Left alone they span the
// last 100 years and stop at the end of the current one, which lists only
// disabled past years and puts every later expiry out of reach.
function lastSelectableMonth(): Date {
  const date = startOfToday()
  date.setFullYear(date.getFullYear() + 10)
  return date
}
