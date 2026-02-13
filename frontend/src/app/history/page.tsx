'use client'

import { Navbar, AuthGuard } from '@/components/layout'
import { Card } from '@/components/ui'
import { HistoryChart } from '@/components/water'
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

				{/* Per-day detail list */}
				{!isLoading && history && (
					<Card>
						<h2 className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400">
							Daily Breakdown
						</h2>
						<ul className="divide-y divide-gray-100 dark:divide-gray-800">
							{history.map((day) => (
								<li
									key={day.date}
									className="flex items-center justify-between py-3"
								>
									<span className="text-sm text-gray-600 dark:text-gray-400">
										{day.date}
									</span>
									<span
										className={`text-sm font-semibold ${
											day.total >=
											(user?.dailyGoal ?? 2000)
												? 'text-green-600 dark:text-green-400'
												: 'text-gray-900 dark:text-white'
										}`}
									>
										{day.total} ml
									</span>
								</li>
							))}
						</ul>
					</Card>
				)}
			</main>
		</AuthGuard>
	)
}
