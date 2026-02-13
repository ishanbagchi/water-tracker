/**
 * Get the current wall-clock date and hour in the user's timezone.
 * Uses `Intl.DateTimeFormat` so no external tz library is needed.
 */
function nowInTimezone(timezone: string): { dateStr: string; hour: number } {
	const now = new Date()
	const parts = new Intl.DateTimeFormat('en-CA', {
		timeZone: timezone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: 'numeric',
		hour12: false,
	}).formatToParts(now)

	const year = parts.find((p) => p.type === 'year')!.value
	const month = parts.find((p) => p.type === 'month')!.value
	const day = parts.find((p) => p.type === 'day')!.value
	const hour = parseInt(parts.find((p) => p.type === 'hour')!.value, 10)

	return { dateStr: `${year}-${month}-${day}`, hour }
}

/** Subtract one calendar day from a YYYY-MM-DD string. */
function subtractDay(dateStr: string): string {
	const d = new Date(dateStr + 'T12:00:00Z') // noon to avoid DST edge
	d.setUTCDate(d.getUTCDate() - 1)
	return d.toISOString().split('T')[0]
}

/**
 * Returns the "effective" current date as YYYY-MM-DD in the user's
 * timezone. If the current local hour is before `resetHour`, the
 * effective date is shifted back one day.
 */
export function getTodayDateString(resetHour = 0, timezone = 'UTC'): string {
	const { dateStr, hour } = nowInTimezone(timezone)
	if (hour < resetHour) {
		return subtractDay(dateStr)
	}
	return dateStr
}

/**
 * Returns an array of date strings for the last `n` effective days
 * (including the current effective day), respecting the user's
 * timezone and `resetHour`.
 */
export function getLastNDays(
	n: number,
	resetHour = 0,
	timezone = 'UTC',
): string[] {
	const today = getTodayDateString(resetHour, timezone)
	const base = new Date(today + 'T12:00:00Z')
	const dates: string[] = []
	for (let i = 0; i < n; i++) {
		const d = new Date(base)
		d.setUTCDate(d.getUTCDate() - i)
		dates.push(d.toISOString().split('T')[0])
	}
	return dates
}
