'use client'

import { useState, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { calcProgress } from '@/lib/utils'
import { RING_RADIUS } from './constants'
import {
	SegmentedRing,
	SingleArc,
	RingCenter,
	StatsRow,
	LiquidChips,
} from './components'
import type { LiquidType, WaterProgressProps, RingSegment } from './types'

export default function WaterProgress({
	current,
	goal,
	unit = 'ml',
	entries = [],
}: WaterProgressProps) {
	const [hoveredType, setHoveredType] = useState<LiquidType | null>(null)

	const progress = calcProgress(current, goal)
	const remaining = Math.max(goal - current, 0)

	const radius = RING_RADIUS
	const circumference = 2 * Math.PI * radius

	const segments = useMemo<RingSegment[]>(() => {
		if (!entries.length) return []
		const byType = new Map<LiquidType, number>()
		for (const e of entries) {
			const type = e.liquidType ?? 'water'
			byType.set(
				type,
				(byType.get(type) ?? 0) + (e.hydratedAmount ?? e.amount),
			)
		}
		const totalConsumed = [...byType.values()].reduce((s, v) => s + v, 0)
		if (totalConsumed === 0) return []
		// Sort: water first, then largest→smallest so the ring reads intuitively
		const sorted = [...byType.entries()].sort((a, b) => {
			if (a[0] === 'water') return -1
			if (b[0] === 'water') return 1
			return b[1] - a[1]
		})
		const fillLength = (Math.min(current, goal) / goal) * circumference
		let accumulated = 0
		return sorted.map(([type, amount]) => {
			const length = (amount / totalConsumed) * fillLength
			const offset = -accumulated
			accumulated += length
			return { type, length, offset }
		})
	}, [entries, current, goal, circumference])

	const typeTotals = useMemo(() => {
		const map = entries.reduce((acc, e) => {
			const type = e.liquidType ?? ('water' as LiquidType)
			acc.set(type, (acc.get(type) ?? 0) + (e.hydratedAmount ?? e.amount))
			return acc
		}, new Map<LiquidType, number>())
		return [...map.entries()]
			.map(([type, total]) => ({ type, total }))
			.sort((a, b) => b.total - a.total)
	}, [entries])

	const isMultiType = typeTotals.length > 1

	const fillAngle = (Math.min(current, goal) / goal) * 2 * Math.PI
	const endCapX = 100 + radius * Math.cos(fillAngle)
	const endCapY = 100 + radius * Math.sin(fillAngle)

	return (
		<div className="flex flex-col items-center gap-5 w-full">
			{/* Ring */}
			<div className="relative h-56 w-56">
				<svg className="h-full w-full -rotate-90" viewBox="0 0 200 200">
					{/* Track */}
					<circle
						cx="100"
						cy="100"
						r={radius}
						fill="none"
						stroke="currentColor"
						strokeWidth="16"
						className="text-gray-100 dark:text-gray-800"
					/>
					{isMultiType && segments.length > 0 ? (
						<SegmentedRing
							segments={segments}
							circumference={circumference}
							radius={radius}
							hoveredType={hoveredType}
							endCapX={endCapX}
							endCapY={endCapY}
						/>
					) : (
						<SingleArc
							radius={radius}
							circumference={circumference}
							progress={progress}
						/>
					)}
				</svg>
				<RingCenter progress={progress} current={current} unit={unit} />
			</div>

			<StatsRow
				current={current}
				remaining={remaining}
				goal={goal}
				unit={unit}
			/>

			<AnimatePresence>
				{isMultiType && (
					<LiquidChips
						typeTotals={typeTotals}
						hoveredType={hoveredType}
						onHover={setHoveredType}
						unit={unit}
					/>
				)}
			</AnimatePresence>
		</div>
	)
}
