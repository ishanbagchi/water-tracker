import type { WaterEntry, LiquidType, Unit } from '@/types'

export type { WaterEntry, LiquidType, Unit }

export interface RingSegment {
	type: LiquidType
	length: number
	offset: number
}

export interface RingCapProps {
	cx: number
	cy: number
	fill: string
	opacity: number
}

export interface SegmentedRingProps {
	segments: RingSegment[]
	circumference: number
	radius: number
	hoveredType: LiquidType | null
	endCapX: number
	endCapY: number
}

export interface SingleArcProps {
	radius: number
	circumference: number
	progress: number
}

export interface RingCenterProps {
	progress: number
	current: number
	unit: Unit
}

export interface StatsRowProps {
	current: number
	remaining: number
	goal: number
	unit: Unit
}

export interface LiquidChipsProps {
	typeTotals: { type: LiquidType; total: number }[]
	hoveredType: LiquidType | null
	onHover: (type: LiquidType | null) => void
	unit: Unit
}

export interface WaterProgressProps {
	current: number
	goal: number
	unit?: Unit
	entries?: WaterEntry[]
}
