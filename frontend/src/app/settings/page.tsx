'use client'

import { useState, useEffect } from 'react'
import { Navbar, AuthGuard } from '@/components/layout'
import { Card, Button, Input } from '@/components/ui'
import { useUser, useUpdateSettings } from '@/hooks'

export default function SettingsPage() {
	const { data: user, isLoading } = useUser()
	const updateSettings = useUpdateSettings()

	const [dailyGoal, setDailyGoal] = useState('')
	const [unit, setUnit] = useState<'ml' | 'oz'>('ml')

	// Sync form state when user data loads
	useEffect(() => {
		if (user) {
			setDailyGoal(String(user.dailyGoal))
			setUnit(user.unit)
		}
	}, [user])

	const handleSave = (e: React.FormEvent) => {
		e.preventDefault()
		const parsed = parseInt(dailyGoal, 10)
		if (parsed > 0) {
			updateSettings.mutate({ dailyGoal: parsed, unit })
		}
	}

	return (
		<AuthGuard>
			<Navbar />
			<main className="mx-auto max-w-2xl space-y-6 px-4 py-8">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
					Settings
				</h1>

				{isLoading ? (
					<div className="flex h-32 items-center justify-center">
						<div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
					</div>
				) : (
					<Card>
						<form onSubmit={handleSave} className="space-y-5">
							{/* Daily Goal */}
							<Input
								label="Daily Hydration Goal (ml)"
								type="number"
								min={1}
								value={dailyGoal}
								onChange={(e) => setDailyGoal(e.target.value)}
							/>

							{/* Unit toggle */}
							<div>
								<label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
									Display Unit
								</label>
								<div className="flex gap-2">
									{(['ml', 'oz'] as const).map((u) => (
										<button
											key={u}
											type="button"
											onClick={() => setUnit(u)}
											className={`rounded-xl px-5 py-2 text-sm font-medium transition-colors ${
												unit === u
													? 'bg-brand-600 text-white'
													: 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
											}`}
										>
											{u.toUpperCase()}
										</button>
									))}
								</div>
							</div>

							{/* Account info */}
							<div className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
								Signed in as{' '}
								<strong className="text-gray-700 dark:text-gray-200">
									{user?.email}
								</strong>
							</div>

							{/* Save */}
							<Button
								type="submit"
								isLoading={updateSettings.isPending}
								className="w-full"
							>
								Save Settings
							</Button>

							{updateSettings.isSuccess && (
								<p className="text-center text-sm text-green-600">
									✓ Settings saved!
								</p>
							)}
						</form>
					</Card>
				)}
			</main>
		</AuthGuard>
	)
}
