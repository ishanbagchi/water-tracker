'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
	ArrowLeft,
	Plus,
	Trash2,
	GlassWater,
	CupSoda,
	FlaskConical,
	Droplets,
	Waves,
} from 'lucide-react'
import { Navbar, AuthGuard } from '@/components/layout'
import { Card, Button, Input } from '@/components/ui'
import { useWaterByDate, useLogWaterForDate, useDeleteWaterEntry, useUser } from '@/hooks'
import { formatAmount, formatTime } from '@/lib/utils'

/** Icon rotation for quick-add buttons */
const ICONS = [GlassWater, CupSoda, FlaskConical, Droplets, Waves]

export default function DayDetailPage() {
	const params = useParams<{ date: string }>()
	const router = useRouter()
	const date = params.date

	const { data: dayData, isLoading: dayLoading } = useWaterByDate(date)
	const { data: user, isLoading: userLoading } = useUser()
	const logWater = useLogWaterForDate(date)
	const deleteEntry = useDeleteWaterEntry()

	const [customAmount, setCustomAmount] = useState('')

	const isLoading = dayLoading || userLoading
	const amounts = user?.quickAddAmounts ?? [250, 500, 750]
	const goal = user?.dailyGoal ?? 2000
	const total = dayData?.total ?? 0
	const entries = dayData?.entries ?? []
	const progressPct = Math.min((total / goal) * 100, 100)
	const metGoal = total >= goal

	const handleCustomSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		const parsed = parseInt(customAmount, 10)
		if (parsed > 0) {
			logWater.mutate(parsed)
			setCustomAmount('')
		}
	}

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
										metGoal
											? 'bg-green-500'
											: 'bg-brand-500'
									}`}
								/>
							</div>
						</Card>

						{/* Quick-add buttons */}
						<Card>
							<h2 className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400">
								Quick Add
							</h2>
							<div className="grid grid-cols-3 gap-3">
								{amounts.map((amount, index) => {
									const Icon = ICONS[index % ICONS.length]
									const label = `${amount} ml`
									return (
										<motion.button
											key={amount}
											whileTap={{ scale: 0.93 }}
											whileHover={{ scale: 1.03 }}
											disabled={logWater.isPending}
											onClick={() => logWater.mutate(amount)}
											className="flex flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-5
												shadow-sm transition-colors hover:border-brand-300 hover:bg-brand-50
												disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900
												dark:hover:border-brand-600 dark:hover:bg-brand-950"
											aria-label={`Add ${label}`}
										>
											<Icon className="h-7 w-7 text-brand-500" />
											<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
												{label}
											</span>
										</motion.button>
									)
								})}
							</div>
						</Card>

						{/* Custom amount entry */}
						<Card>
							<h2 className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400">
								Custom Amount
							</h2>
							<form onSubmit={handleCustomSubmit} className="flex items-end gap-3">
								<div className="flex-1">
									<Input
										label="Amount (ml)"
										type="number"
										min={1}
										placeholder="e.g. 350"
										value={customAmount}
										onChange={(e) => setCustomAmount(e.target.value)}
									/>
								</div>
								<Button
									type="submit"
									size="md"
									disabled={!customAmount || parseInt(customAmount) <= 0}
									isLoading={logWater.isPending}
									className="mb-0.5"
								>
									<Plus className="h-4 w-4" />
									Add
								</Button>
							</form>
						</Card>

						{/* Entries list */}
						<Card>
							<h2 className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400">
								Entries ({entries.length})
							</h2>

							{entries.length === 0 ? (
								<p className="py-6 text-center text-sm text-gray-400">
									No entries for this day yet. Add one above!
								</p>
							) : (
								<ul className="space-y-2">
									<AnimatePresence mode="popLayout">
										{entries.map((entry) => (
											<motion.li
												key={entry._id}
												layout
												initial={{ opacity: 0, x: -20 }}
												animate={{ opacity: 1, x: 0 }}
												exit={{ opacity: 0, x: 20 }}
												className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3
													dark:border-gray-700 dark:bg-gray-800"
											>
												<div>
													<span className="font-medium text-gray-900 dark:text-white">
														{formatAmount(entry.amount, user?.unit ?? 'ml')}
													</span>
													<span className="ml-2 text-xs text-gray-400">
														{formatTime(entry.timestamp)}
													</span>
												</div>
												<button
													onClick={() => deleteEntry.mutate(entry._id)}
													disabled={deleteEntry.isPending}
													className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500
														dark:hover:bg-red-950"
													aria-label="Delete entry"
												>
													<Trash2 className="h-4 w-4" />
												</button>
											</motion.li>
										))}
									</AnimatePresence>
								</ul>
							)}
						</Card>
					</>
				)}
			</main>
		</AuthGuard>
	)
}
