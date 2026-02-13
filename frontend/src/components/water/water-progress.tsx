'use client'

import { motion } from 'framer-motion'
import { Droplets } from 'lucide-react'
import { calcProgress, formatAmount } from '@/lib/utils'

interface WaterProgressProps {
	current: number
	goal: number
	unit?: 'ml' | 'oz'
}

/**
 * Circular progress visualisation for daily water intake.
 * Uses SVG + Framer Motion for a smooth animated fill.
 */
export default function WaterProgress({
	current,
	goal,
	unit = 'ml',
}: WaterProgressProps) {
	const progress = calcProgress(current, goal)
	const remaining = Math.max(goal - current, 0)

	// SVG circle math
	const radius = 90
	const circumference = 2 * Math.PI * radius
	const strokeDashoffset = circumference - (progress / 100) * circumference

	return (
		<div className="flex flex-col items-center gap-4">
			{/* Circular progress ring */}
			<div className="relative h-56 w-56">
				<svg className="h-full w-full -rotate-90" viewBox="0 0 200 200">
					{/* Background ring */}
					<circle
						cx="100"
						cy="100"
						r={radius}
						fill="none"
						stroke="currentColor"
						strokeWidth="12"
						className="text-gray-200 dark:text-gray-700"
					/>
					{/* Animated progress ring */}
					<motion.circle
						cx="100"
						cy="100"
						r={radius}
						fill="none"
						stroke="currentColor"
						strokeWidth="12"
						strokeLinecap="round"
						className="text-brand-500"
						initial={{ strokeDashoffset: circumference }}
						animate={{ strokeDashoffset }}
						transition={{ duration: 0.8, ease: 'easeOut' }}
						style={{ strokeDasharray: circumference }}
					/>
				</svg>

				{/* Center content */}
				<div className="absolute inset-0 flex flex-col items-center justify-center">
					<motion.div
						key={current}
						initial={{ scale: 0.8, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ type: 'spring', stiffness: 200 }}
					>
						<Droplets className="mx-auto mb-1 h-6 w-6 text-brand-500" />
						<p className="text-3xl font-bold text-gray-900 dark:text-white">
							{progress}%
						</p>
					</motion.div>
				</div>
			</div>

			{/* Stats */}
			<div className="flex gap-8 text-center text-sm">
				<div>
					<p className="font-semibold text-gray-900 dark:text-white">
						{formatAmount(current, unit)}
					</p>
					<p className="text-gray-500">Consumed</p>
				</div>
				<div>
					<p className="font-semibold text-gray-900 dark:text-white">
						{formatAmount(remaining, unit)}
					</p>
					<p className="text-gray-500">Remaining</p>
				</div>
				<div>
					<p className="font-semibold text-gray-900 dark:text-white">
						{formatAmount(goal, unit)}
					</p>
					<p className="text-gray-500">Goal</p>
				</div>
			</div>
		</div>
	)
}
