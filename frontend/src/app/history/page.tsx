'use client'

import { Navbar, AuthGuard } from '@/components/layout'
import { Card } from '@/components/ui'
import { HistoryChart, GoalCalendar } from '@/components/water'
import { useWaterHistory, useUser } from '@/hooks'

export default function HistoryPage() {
	const { data: history, isLoading: historyLoading } = useWaterHistory()
	const { data: user, isLoading: userLoading } = useUser()

	const isLoading = historyLoading || userLoading

	return (
		<AuthGuard>
			<Navbar />
			<main className="mx-auto max-w-2xl space-y-6 px-4 py-8">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
					7-Day History
				</h1>

				{isLoading ? (
					<div className="flex h-64 items-center justify-center">
						<div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
					</div>
				) : (
					<Card>
						<HistoryChart
							data={history ?? []}
							goal={user?.dailyGoal ?? 2000}
						/>
					</Card>
				)}

				{/* Monthly goal calendar */}
				<Card>
					<GoalCalendar />
				</Card>
			</main>
		</AuthGuard>
	)
}
