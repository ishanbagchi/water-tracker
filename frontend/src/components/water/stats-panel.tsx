'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
	TrendingUp,
	Award,
	CalendarCheck,
	Percent,
	Droplets,
	BarChart3,
} from 'lucide-react'
import { useStats, useUser } from '@/hooks'
import { formatDateLabel, formatAmount } from '@/lib/utils'

type Period = 'week' | 'month' | 'all'

const PERIOD_LABELS: Record<Period, string> = {
	week: '7 Days',
	month: '30 Days',
	all: 'All Time',
}

/**
 * Aggregate stats panel: avg daily, best day, goal-hit rate, etc.
 * Supports period toggle (week / month / all).
 */
export default function StatsPanel() {
	const [period, setPeriod] = useState<Period>('week')
	const { data: stats, isLoading } = useStats(period)
	const { data: user } = useUser()
	const unit = user?.unit ?? 'ml'

	const statItems = stats
		? [
				{
					icon: Droplets,
					label: 'Total Logged',
					value: formatAmount(stats.totalLogged, unit),
					color: 'text-blue-500',
				},
				{
					icon: TrendingUp,
					label: 'Daily Average',
					value: formatAmount(stats.averageDaily, unit),
					color: 'text-brand-500',
				},
				{
					icon: Award,
					label: 'Best Day',
					value: `${formatAmount(stats.bestDay.total, unit)}`,
					subtitle:
						stats.bestDay.total > 0
							? formatDateLabel(stats.bestDay.date)
							: undefined,
					color: 'text-amber-500',
				},
				{
					icon: Percent,
					label: 'Goal Hit Rate',
					value: `${stats.goalHitRate}%`,
					color: 'text-green-500',
				},
				{
					icon: CalendarCheck,
					label: 'Goals Met',
					value: `${stats.daysGoalMet} / ${stats.daysTracked}`,
					subtitle: 'days',
					color: 'text-emerald-500',
				},
				{
					icon: BarChart3,
					label: 'Days Tracked',
					value: `${stats.daysTracked}`,
					color: 'text-purple-500',
				},
			]
		: []

	return (
		<div className="space-y-3">
			{/* Period toggle */}
			<div className="flex items-center justify-between">
				<h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
					Stats
				</h2>
				<div className="flex overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
					{(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
						<button
							key={p}
							onClick={() => setPeriod(p)}
							className={`px-3 py-1.5 text-xs font-medium transition-colors ${
								period === p
									? 'bg-brand-500 text-white'
									: 'bg-white text-gray-500 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
							}`}
						>
							{PERIOD_LABELS[p]}
						</button>
					))}
				</div>
			</div>

			{/* Stats grid */}
			{isLoading ? (
				<div className="flex h-32 items-center justify-center">
					<div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
				</div>
			) : (
				<div className="grid grid-cols-2 gap-3">
					{statItems.map((item, i) => (
						<motion.div
							key={item.label}
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: i * 0.04 }}
							className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3.5 py-3
							           dark:border-gray-700 dark:bg-gray-800"
						>
							<item.icon
								className={`mt-0.5 h-4 w-4 shrink-0 ${item.color}`}
							/>
							<div className="min-w-0">
								<p className="text-xs text-gray-500">
									{item.label}
								</p>
								<p className="text-sm font-semibold text-gray-900 dark:text-white">
									{item.value}
								</p>
								{item.subtitle && (
									<p className="truncate text-[11px] text-gray-400">
										{item.subtitle}
									</p>
								)}
							</div>
						</motion.div>
					))}
				</div>
			)}
		</div>
	)
}
