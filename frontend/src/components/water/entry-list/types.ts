import type { WaterEntry, Unit } from '@/types'

export type { WaterEntry, Unit }

export interface EntryListProps {
	entries: WaterEntry[]
	unit?: Unit
}

export interface EntryItemProps {
	entry: WaterEntry
	unit: Unit
	onDelete: (id: string) => void
	isDeleting: boolean
}
