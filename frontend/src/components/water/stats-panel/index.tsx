'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
	TrendingUp,
	Award,
	CalendarCheck,
	Percent,
	Droplets,
	BarChart3,
} from 'lucide-react'
import { useStats, useUser, useWaterHistory } from '@/hooks'
import { formatDateLabel, formatAmount } from '@/lib/utils'
import { LIQUID_META, type LiquidType } from '@/types'
import { LIQUID_COLORS } from '../shared/constants'
import { LoadingSpinner } from '../shared/components'
import type { Period } from './types'
import { PERIOD_LABELS } from './constants'

export default function StatsPanel() {
	const [period, setPeriod] = useState<Period>('week')
	const { data: stats, isLoading } = useStats(period)
	const { data: user } = useUser()
	const { data: historyData } = useWaterHistory()
	const unit = user?.unit ?? 'ml'

	const { typeTotals, grandTotal } = useMemo(() => {
		const map = new Map<LiquidType, number>()
		historyData?.forEach((day) =>
			day.byType?.forEach((b) =>
				map.set(b.liquidType, (map.get(b.liquidType) ?? 0) + b.total),
			),
		)
		const total = [...map.values()].reduce((s, v) => s + v, 0)
		return { typeTotals: map, grandTotal: total }
	}, [historyData])

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
				<LoadingSpinner className="h-32" />
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

			{/* 7-day beverage breakdown */}
			{typeTotals.size > 0 && (
				<div className="space-y-2 pt-1">
					<h3 className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
						7-Day Beverages
					</h3>
					<div className="space-y-2">
						{[...typeTotals.entries()]
							.sort((a, b) => b[1] - a[1])
							.map(([type, total]) => {
								const meta = LIQUID_META[type]
								const pct =
									grandTotal > 0
										? Math.round((total / grandTotal) * 100)
										: 0
								return (
									<div
										key={type}
										className="flex items-center gap-2.5"
									>
										<span
											className="h-2 w-2 shrink-0 rounded-full"
											style={{
												background: LIQUID_COLORS[type],
											}}
										/>
										<span className="w-16 truncate text-xs text-gray-500 dark:text-gray-400">
											{meta.label}
										</span>
										<div
											className="flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700"
											style={{ height: 6 }}
										>
											<motion.div
												className="h-full rounded-full"
												style={{
													background:
														LIQUID_COLORS[type],
												}}
												initial={{ width: 0 }}
												animate={{ width: `${pct}%` }}
												transition={{
													duration: 0.6,
													ease: 'easeOut',
												}}
											/>
										</div>
										<span className="min-w-[36px] text-right text-xs text-gray-400 dark:text-gray-500">
											{pct}%
										</span>
										<span className="min-w-[52px] text-right text-xs font-semibold text-gray-700 dark:text-gray-300">
											{total >= 1000
												? `${(total / 1000).toFixed(1)}L`
												: `${total} ml`}
										</span>
									</div>
								)
							})}
					</div>
				</div>
			)}
		</div>
	)
}
