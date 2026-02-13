/** Reusable utility functions */

/** Format ml to display string respecting user unit preference. */
export function formatAmount(ml: number, unit: 'ml' | 'oz' = 'ml'): string {
	if (unit === 'oz') {
		return `${(ml / 29.5735).toFixed(1)} oz`
	}
	return `${ml} ml`
}

/** Clamp a number between min and max. */
export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max)
}

/** Calculate progress percentage (0–100). */
export function calcProgress(current: number, goal: number): number {
	if (goal <= 0) return 0
	return clamp(Math.round((current / goal) * 100), 0, 100)
}

/** Format a YYYY-MM-DD date string into a human-readable label. */
export function formatDateLabel(dateStr: string): string {
	const date = new Date(dateStr + 'T00:00:00')
	return date.toLocaleDateString('en-US', {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
	})
}

/** Format a timestamp into time only (e.g. 2:35 PM). */
export function formatTime(timestamp: string): string {
	return new Date(timestamp).toLocaleTimeString('en-US', {
		hour: 'numeric',
		minute: '2-digit',
	})
}
