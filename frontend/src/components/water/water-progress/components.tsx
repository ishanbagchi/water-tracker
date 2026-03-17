'use client'

import { motion } from 'framer-motion'
import { formatAmount } from '@/lib/utils'
import { LIQUID_META } from '@/types'
import { LIQUID_COLORS, RING_CAP_RADIUS, RING_STROKE_WIDTH } from './constants'
import type {
	RingCapProps,
	SegmentedRingProps,
	SingleArcProps,
	RingCenterProps,
	StatsRowProps,
	LiquidChipsProps,
} from './types'

export function RingCap({ cx, cy, fill, opacity }: RingCapProps) {
	return (
		<circle
			cx={cx}
			cy={cy}
			r={RING_CAP_RADIUS}
			fill={fill}
			opacity={opacity}
			style={{ transition: 'opacity 0.2s' }}
		/>
	)
}

export function SegmentedRing({
	segments,
	circumference,
	radius,
	hoveredType,
	endCapX,
	endCapY,
}: SegmentedRingProps) {
	const first = segments[0]
	const last = segments[segments.length - 1]
	return (
		<>
			{segments.map(({ type, length, offset }) => (
				<circle
					key={type}
					cx="100"
					cy="100"
					r={radius}
					fill="none"
					stroke={LIQUID_COLORS[type]}
					strokeWidth={RING_STROKE_WIDTH}
					strokeLinecap="butt"
					strokeDasharray={`${length} ${circumference}`}
					strokeDashoffset={offset}
					opacity={
						hoveredType === null || hoveredType === type ? 1 : 0.15
					}
					style={{
						transition:
							'stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease, opacity 0.2s',
					}}
				/>
			))}
			<RingCap
				cx={100 + radius}
				cy={100}
				fill={LIQUID_COLORS[first.type]}
				opacity={
					hoveredType === null || hoveredType === first.type
						? 1
						: 0.15
				}
			/>
			<RingCap
				cx={endCapX}
				cy={endCapY}
				fill={LIQUID_COLORS[last.type]}
				opacity={
					hoveredType === null || hoveredType === last.type ? 1 : 0.15
				}
			/>
		</>
	)
}

export function SingleArc({ radius, circumference, progress }: SingleArcProps) {
	return (
		<motion.circle
			cx="100"
			cy="100"
			r={radius}
			fill="none"
			stroke="currentColor"
			strokeWidth={RING_STROKE_WIDTH}
			strokeLinecap="round"
			className={progress >= 100 ? 'text-green-500' : 'text-brand-500'}
			initial={{ strokeDashoffset: circumference }}
			animate={{
				strokeDashoffset:
					circumference - (progress / 100) * circumference,
			}}
			transition={{ duration: 0.9, ease: 'easeOut' }}
			style={{ strokeDasharray: circumference }}
		/>
	)
}

export function RingCenter({ progress, current, unit }: RingCenterProps) {
	return (
		<div className="absolute inset-0 flex flex-col items-center justify-center">
			<motion.p
				key={progress}
				className="text-4xl font-bold tabular-nums text-gray-900 dark:text-white"
				initial={{ scale: 0.8, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				transition={{ type: 'spring', stiffness: 220, damping: 18 }}
			>
				{progress}%
			</motion.p>
			<p className="mt-0.5 text-sm text-gray-400 dark:text-gray-500">
				{formatAmount(current, unit)}
			</p>
		</div>
	)
}

export function StatsRow({ current, remaining, goal, unit }: StatsRowProps) {
	const stats = [
		{ label: 'Consumed', value: current },
		{ label: 'Remaining', value: remaining },
		{ label: 'Goal', value: goal },
	]
	return (
		<div className="flex w-full max-w-xs divide-x divide-gray-200 text-center dark:divide-gray-700">
			{stats.map(({ label, value }) => (
				<div key={label} className="flex-1 px-3">
					<p className="text-base font-semibold text-gray-900 dark:text-white">
						{formatAmount(value, unit)}
					</p>
					<p className="text-xs text-gray-400">{label}</p>
				</div>
			))}
		</div>
	)
}

export function LiquidChips({
	typeTotals,
	hoveredType,
	onHover,
	unit,
}: LiquidChipsProps) {
	return (
		<motion.div
			className="flex flex-wrap justify-center gap-2"
			initial={{ opacity: 0, y: 6 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: 6 }}
			transition={{ duration: 0.25 }}
		>
			{typeTotals.map(({ type, total }) => (
				<div
					key={type}
					className="flex cursor-default items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium shadow-sm dark:border-gray-700 dark:bg-gray-800"
					onMouseEnter={() => onHover(type)}
					onMouseLeave={() => onHover(null)}
				>
					<span
						className="h-2 w-2 shrink-0 rounded-full"
						style={{ background: LIQUID_COLORS[type] }}
					/>
					<span className="text-gray-600 dark:text-gray-400">
						{LIQUID_META[type].label}
					</span>
					<span className="tabular-nums text-gray-900 dark:text-white">
						{formatAmount(total, unit)}
					</span>
				</div>
			))}
		</motion.div>
	)
}
