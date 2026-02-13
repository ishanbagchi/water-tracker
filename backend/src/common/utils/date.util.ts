/**
 * Returns today's date as YYYY-MM-DD in the local timezone.
 * Used as the partition key for fast daily aggregation.
 */
export function getTodayDateString(): string {
	return new Date().toISOString().split('T')[0]
}

/**
 * Returns an array of date strings for the last `n` days (including today).
 */
export function getLastNDays(n: number): string[] {
	const dates: string[] = []
	for (let i = 0; i < n; i++) {
		const d = new Date()
		d.setDate(d.getDate() - i)
		dates.push(d.toISOString().split('T')[0])
	}
	return dates
}
