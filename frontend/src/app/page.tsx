'use client'

import { Navbar, AuthGuard } from '@/components/layout'
import { Card } from '@/components/ui'
import {
	WaterProgress,
	QuickAddButtons,
	ManualEntry,
	EntryList,
	StreakCard,
} from '@/components/water'
import { useWaterToday, useUser } from '@/hooks'

export default function DashboardPage() {
	const { data: todayData, isLoading: waterLoading } = useWaterToday()
	const { data: user, isLoading: userLoading } = useUser()

	const isLoading = waterLoading || userLoading

	return (
		<AuthGuard>
			<Navbar />
			<main className="mx-auto max-w-2xl space-y-6 px-4 py-8">
				{isLoading ? (
					<div className="flex h-64 items-center justify-center">
						<div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
					</div>
				) : (
					<>
						{/* Progress ring */}
						<Card className="flex justify-center">
							<WaterProgress
								current={todayData?.total ?? 0}
								goal={user?.dailyGoal ?? 2000}
								unit={user?.unit}
								entries={todayData?.entries}
							/>
						</Card>

						{/* Streak & badges */}
						<Card>
							<h2 className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400">
								Streaks & Badges
							</h2>
							<StreakCard />
						</Card>

						{/* Quick-add buttons */}
						<Card>
							<h2 className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400">
								Quick Add
							</h2>
							<QuickAddButtons />
						</Card>

						{/* Manual entry */}
						<Card>
							<h2 className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400">
								Custom Amount
							</h2>
							<ManualEntry />
						</Card>

						{/* Today's entries */}
						<Card>
							<h2 className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400">
								Today&apos;s Entries
							</h2>
							<EntryList
								entries={todayData?.entries ?? []}
								unit={user?.unit}
							/>
						</Card>
					</>
				)}
			</main>
		</AuthGuard>
	)
}
