import type { WaterEntry, Unit, LiquidType } from '@/types'
import type { EditWaterPayload } from '@/hooks/use-water'

export type { WaterEntry, Unit, LiquidType, EditWaterPayload }

export interface EntryListProps {
	entries: WaterEntry[]
	unit?: Unit
}

export interface EntryItemProps {
	entry: WaterEntry
	unit: Unit
	onDelete: (id: string) => void
	isDeleting: boolean
	onEdit: (payload: EditWaterPayload) => void
	isEditing: boolean
}
