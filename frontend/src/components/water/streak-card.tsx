'use client'

import { motion } from 'framer-motion'
import { Flame, Trophy, Target } from 'lucide-react'
import { useStreaks } from '@/hooks'
import { LoadingSpinner } from './shared/components'

export default function StreakCard() {
	const { data: streaks, isLoading } = useStreaks()

	if (isLoading) {
		return <LoadingSpinner className="h-24" />
	}

	if (!streaks) return null

	const { currentStreak, longestStreak, totalGoalDays, badges } = streaks

	return (
		<div className="space-y-4">
			{/* Stats row */}
			<div className="grid grid-cols-3 gap-3">
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					className="flex flex-col items-center gap-1 rounded-xl border border-gray-100 bg-gray-50 px-3 py-3 dark:border-gray-700 dark:bg-gray-800"
				>
					<Flame className="h-5 w-5 text-orange-500" />
					<span className="text-xl font-bold text-gray-900 dark:text-white">
						{currentStreak}
					</span>
					<span className="text-[11px] text-gray-500">Current</span>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.05 }}
					className="flex flex-col items-center gap-1 rounded-xl border border-gray-100 bg-gray-50 px-3 py-3 dark:border-gray-700 dark:bg-gray-800"
				>
					<Trophy className="h-5 w-5 text-amber-500" />
					<span className="text-xl font-bold text-gray-900 dark:text-white">
						{longestStreak}
					</span>
					<span className="text-[11px] text-gray-500">Best</span>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="flex flex-col items-center gap-1 rounded-xl border border-gray-100 bg-gray-50 px-3 py-3 dark:border-gray-700 dark:bg-gray-800"
				>
					<Target className="h-5 w-5 text-green-500" />
					<span className="text-xl font-bold text-gray-900 dark:text-white">
						{totalGoalDays}
					</span>
					<span className="text-[11px] text-gray-500">Goals met</span>
				</motion.div>
			</div>

			{/* Badges */}
			{badges.length > 0 && (
				<div>
					<h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
						Badges
					</h3>
					<div className="flex flex-wrap gap-2">
						{badges.map((badge, i) => (
							<motion.div
								key={badge.id}
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: i * 0.04 }}
								title={`${badge.name} — ${badge.description}`}
								className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5
								           shadow-sm dark:border-gray-700 dark:bg-gray-800"
							>
								<span className="text-base">{badge.emoji}</span>
								<span className="text-xs font-medium text-gray-700 dark:text-gray-300">
									{badge.name}
								</span>
							</motion.div>
						))}
					</div>
				</div>
			)}
		</div>
	)
}
