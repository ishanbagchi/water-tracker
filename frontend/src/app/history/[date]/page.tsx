'use client'

import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { Navbar, AuthGuard } from '@/components/layout'
import { Card } from '@/components/ui'
import { QuickAddButtons, ManualEntry, EntryList } from '@/components/water'
import { useWaterByDate, useUser } from '@/hooks'

export default function DayDetailPage() {
	const params = useParams<{ date: string }>()
	const router = useRouter()
	const date = params.date

	const { data: dayData, isLoading: dayLoading } = useWaterByDate(date)
	const { data: user, isLoading: userLoading } = useUser()

	const isLoading = dayLoading || userLoading
	const goal = user?.dailyGoal ?? 2000
	const total = dayData?.total ?? 0
	const entries = dayData?.entries ?? []
	const progressPct = Math.min((total / goal) * 100, 100)
	const metGoal = total >= goal

	return (
		<AuthGuard>
			<Navbar />
			<main className="mx-auto max-w-2xl space-y-6 px-4 py-8">
				{/* Header */}
				<div className="flex items-center gap-3">
					<button
						onClick={() => router.push('/history')}
						className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
						aria-label="Back to history"
					>
						<ArrowLeft className="h-5 w-5" />
					</button>
					<div>
						<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
							{date}
						</h1>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							Day detail
						</p>
					</div>
				</div>

				{isLoading ? (
					<div className="flex h-64 items-center justify-center">
						<div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
					</div>
				) : (
					<>
						{/* Progress summary */}
						<Card>
							<div className="flex items-center justify-between mb-3">
								<span className="text-sm font-medium text-gray-500 dark:text-gray-400">
									Progress
								</span>
								<span
									className={`text-lg font-bold ${
										metGoal
											? 'text-green-600 dark:text-green-400'
											: 'text-gray-900 dark:text-white'
									}`}
								>
									{total} / {goal} ml
								</span>
							</div>
							<div className="h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
								<motion.div
									initial={{ width: 0 }}
									animate={{ width: `${progressPct}%` }}
									transition={{ duration: 0.6, ease: 'easeOut' }}
									className={`h-full rounded-full ${
										metGoal ? 'bg-green-500' : 'bg-brand-500'
									}`}
								/>
							</div>
						</Card>

						{/* Quick-add buttons */}
						<Card>
							<h2 className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400">
								Quick Add
							</h2>
							<QuickAddButtons date={date} />
						</Card>

						{/* Custom amount */}
						<Card>
							<h2 className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400">
								Custom Amount
							</h2>
							<ManualEntry date={date} />
						</Card>

						{/* Entries list */}
						<Card>
							<h2 className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400">
								Entries ({entries.length})
							</h2>
							<EntryList entries={entries} unit={user?.unit} />
						</Card>
					</>
				)}
			</main>
		</AuthGuard>
	)
}
