export type Period = 'week' | 'month' | 'all'

export interface StatItem {
	icon: React.ElementType
	label: string
	value: string
	subtitle?: string
	color: string
}
