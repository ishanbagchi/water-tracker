'use client'

import { motion } from 'framer-motion'
import { formatDateLabel } from '@/lib/utils'
import type { HistoryDay } from '@/types'

interface HistoryChartProps {
	data: HistoryDay[]
	goal: number
}

/**
 * Simple 7-day bar chart showing daily totals vs the goal line.
 */
export default function HistoryChart({ data, goal }: HistoryChartProps) {
	const maxVal = Math.max(goal, ...data.map((d) => d.total))

	return (
		<div className="space-y-4">
			<div className="flex items-end gap-2" style={{ height: 180 }}>
				{data.map((day) => {
					const heightPct =
						maxVal > 0 ? (day.total / maxVal) * 100 : 0
					const metGoal = day.total >= goal

					return (
						<div
							key={day.date}
							className="flex flex-1 flex-col items-center gap-1"
						>
							{/* Bar */}
							<div className="relative flex w-full flex-1 items-end justify-center">
								<motion.div
									initial={{ height: 0 }}
									animate={{ height: `${heightPct}%` }}
									transition={{
										duration: 0.5,
										ease: 'easeOut',
									}}
									className={`w-8 rounded-t-lg ${
										metGoal
											? 'bg-brand-500'
											: 'bg-brand-200 dark:bg-brand-800'
									}`}
								/>
							</div>

							{/* Label */}
							<span className="text-[10px] font-medium text-gray-500">
								{formatDateLabel(day.date).split(',')[0]}
							</span>
						</div>
					)
				})}
			</div>

			{/* Goal line label */}
			<div className="flex items-center gap-2 text-xs text-gray-400">
				<span className="h-px flex-1 bg-brand-300 dark:bg-brand-700" />
				<span>Goal: {goal} ml</span>
				<span className="h-px flex-1 bg-brand-300 dark:bg-brand-700" />
			</div>
		</div>
	)
}
