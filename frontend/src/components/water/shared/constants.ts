import type { LiquidType, LiquidMeta } from '@/types'
import { LIQUID_META } from '@/types'

export const LIQUID_COLORS: Record<LiquidType, string> = {
	water: '#3b82f6',
	milk: '#a855f7',
	tea: '#10b981',
	sports_drink: '#f97316',
	coffee: '#92400e',
	juice: '#eab308',
	soda: '#ef4444',
}

/** Typed entries of LIQUID_META — avoids repeated Object.entries casts. */
export const LIQUID_ENTRIES: [LiquidType, LiquidMeta][] = Object.entries(
	LIQUID_META,
) as [LiquidType, LiquidMeta][]
