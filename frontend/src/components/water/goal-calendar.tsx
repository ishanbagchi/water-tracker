'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Droplets } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWaterMonth, useUser } from '@/hooks'
import { LoadingSpinner } from './shared/components'

const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
/** Always render 6 rows × 7 cols = 42 cells for a fixed-height grid. */
const TOTAL_CELLS = 42

export default function GoalCalendar() {
	const router = useRouter()
	const { data: user } = useUser()
	const goal = user?.dailyGoal ?? 2000

	const [viewDate, setViewDate] = useState(() => new Date())
	const year = viewDate.getFullYear()
	const month = viewDate.getMonth() + 1

	const { data: monthData, isLoading } = useWaterMonth(year, month)

	const dayTotals = useMemo(() => {
		const map = new Map<string, number>()
		monthData?.days.forEach((d) => map.set(d.date, d.total))
		return map
	}, [monthData])

	const daysInMonth = new Date(year, month, 0).getDate()
	const firstDayOfWeek = (new Date(year, month - 1, 1).getDay() + 6) % 7
	const trailingCells = TOTAL_CELLS - firstDayOfWeek - daysInMonth

	const todayStr = new Date().toLocaleDateString('en-CA')

	const goalMetCount = useMemo(() => {
		let count = 0
		dayTotals.forEach((total) => {
			if (total >= goal) count++
		})
		return count
	}, [dayTotals, goal])

	const goToPrevMonth = () =>
		setViewDate((p) => {
			const d = new Date(p)
			d.setMonth(d.getMonth() - 1)
			return d
		})

	const goToNextMonth = () =>
		setViewDate((p) => {
			const d = new Date(p)
			d.setMonth(d.getMonth() + 1)
			return d
		})

	const goToToday = () => setViewDate(new Date())

	const monthLabel = viewDate.toLocaleDateString('en-US', {
		month: 'short',
		year: 'numeric',
	})

	const isCurrentMonth =
		viewDate.getMonth() === new Date().getMonth() &&
		viewDate.getFullYear() === new Date().getFullYear()

	return (
		<div className="flex flex-col gap-2">
			{/* Month nav */}
			<div className="flex items-center justify-between">
				<button
					onClick={goToPrevMonth}
					className="rounded-md p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
				>
					<ChevronLeft className="h-4 w-4" />
				</button>
				<div className="flex items-center gap-1.5">
					<span className="text-sm font-semibold text-gray-900 dark:text-white">
						{monthLabel}
					</span>
					{!isCurrentMonth && (
						<button
							onClick={goToToday}
							className="rounded px-1.5 py-0.5 text-[10px] font-medium text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950"
						>
							Today
						</button>
					)}
				</div>
				<button
					onClick={goToNextMonth}
					className="rounded-md p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
				>
					<ChevronRight className="h-4 w-4" />
				</button>
			</div>

			{/* Goal count */}
			{!isLoading && goalMetCount > 0 && (
				<p className="text-center text-[11px] font-medium text-green-600 dark:text-green-400">
					🏆 {goalMetCount} day{goalMetCount !== 1 ? 's' : ''} goal
					met
				</p>
			)}

			{/* Fixed-height grid area */}
			<div className="h-[236px]">
				{isLoading ? (
					<LoadingSpinner className="h-full" />
				) : (
					<AnimatePresence mode="wait">
						<motion.div
							key={`${year}-${month}`}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.15 }}
							className="grid h-full grid-cols-7 grid-rows-[auto_repeat(6,1fr)]"
						>
							{/* Header row */}
							{DAYS.map((d) => (
								<div
									key={d}
									className="flex items-center justify-center pb-1 text-[10px] font-medium text-gray-400 dark:text-gray-500"
								>
									{d}
								</div>
							))}

							{/* Empty leading cells */}
							{Array.from({ length: firstDayOfWeek }).map(
								(_, i) => (
									<div key={`e-${i}`} />
								),
							)}

							{/* Day cells */}
							{Array.from({ length: daysInMonth }).map((_, i) => {
								const dayNum = i + 1
								const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
								const total = dayTotals.get(dateStr) ?? 0
								const metGoal = total >= goal
								const hasData = total > 0
								const isToday = dateStr === todayStr
								const isFuture = dateStr > todayStr

								return (
									<div
										key={dateStr}
										className="flex items-center justify-center"
									>
										<button
											onClick={() =>
												!isFuture &&
												router.push(
													`/history/${dateStr}`,
												)
											}
											disabled={isFuture}
											className={`
												relative flex h-7 w-7 items-center justify-center rounded-md text-[11px] font-medium transition-colors
												${isFuture ? 'cursor-default text-gray-300 dark:text-gray-600' : 'cursor-pointer'}
												${isToday ? 'ring-1.5 ring-brand-500 ring-offset-1 dark:ring-offset-gray-900' : ''}
												${
													metGoal
														? 'bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500'
														: hasData
															? 'bg-brand-100 text-brand-700 hover:bg-brand-200 dark:bg-brand-900/40 dark:text-brand-300 dark:hover:bg-brand-800/60'
															: isFuture
																? ''
																: 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
												}
											`}
										>
											{dayNum}
											{metGoal && (
												<Droplets className="absolute -right-0.5 -top-0.5 h-2 w-2 text-green-300" />
											)}
											{hasData &&
												!metGoal &&
												!isFuture && (
													<span className="absolute bottom-0.5 h-0.5 w-2.5 rounded-full bg-brand-400/60 dark:bg-brand-500/60" />
												)}
										</button>
									</div>
								)
							})}

							{/* Trailing empty cells to fill 6 rows */}
							{Array.from({ length: trailingCells }).map(
								(_, i) => (
									<div key={`t-${i}`} />
								),
							)}
						</motion.div>
					</AnimatePresence>
				)}
			</div>

			{/* Legend */}
			<div className="flex items-center justify-center gap-3 text-[10px] text-gray-400 dark:text-gray-500">
				<span className="flex items-center gap-1">
					<span className="h-2 w-2 rounded-sm bg-green-500" />
					Goal met
				</span>
				<span className="flex items-center gap-1">
					<span className="h-2 w-2 rounded-sm bg-brand-100 dark:bg-brand-900/40" />
					Logged
				</span>
			</div>
		</div>
	)
}
