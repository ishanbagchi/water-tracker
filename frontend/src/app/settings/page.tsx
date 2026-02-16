'use client'

import { useState, useEffect, useRef } from 'react'
import { LogOut } from 'lucide-react'
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	TouchSensor,
	useSensor,
	useSensors,
	DragEndEvent,
	DragStartEvent,
	DragOverlay,
} from '@dnd-kit/core'
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { Navbar, AuthGuard } from '@/components/layout'
import { Card, Button, Input } from '@/components/ui'
import {
	useUser,
	useUpdateSettings,
	useChangePassword,
	useLogout,
} from '@/hooks'

interface SortableItemProps {
	id: string
	value: string
	canDelete: boolean
	onChange: (value: string) => void
	onDelete: () => void
}

function SortableItem({
	id,
	value,
	canDelete,
	onChange,
	onDelete,
}: SortableItemProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id })

	const style = {
		transform: CSS.Transform.toString(transform),
		transition: isDragging ? 'none' : transition,
	}

	const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value
		if (
			newValue === '' ||
			(Number(newValue) >= 1 && Number(newValue) <= 10_000)
		) {
			onChange(newValue)
		}
	}

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`flex gap-2 ${isDragging ? 'opacity-0' : ''}`}
		>
			<button
				type="button"
				{...attributes}
				{...listeners}
				className="flex cursor-grab items-center rounded-lg px-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 active:cursor-grabbing dark:hover:bg-gray-800"
			>
				<svg
					className="h-4 w-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M4 8h16M4 16h16"
					/>
				</svg>
			</button>
			<Input
				type="number"
				min={1}
				max={10_000}
				placeholder="e.g. 250"
				value={value}
				onChange={handleOnChange}
				className="flex-1"
			/>
			{canDelete && (
				<button
					type="button"
					onClick={onDelete}
					className="rounded-lg px-3 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950 font-bold"
				>
					✕
				</button>
			)}
		</div>
	)
}

export default function SettingsPage() {
	const { data: user, isLoading } = useUser()
	const updateSettings = useUpdateSettings()
	const changePassword = useChangePassword()
	const logout = useLogout()

	const [dailyGoal, setDailyGoal] = useState('')
	const [unit, setUnit] = useState<'ml' | 'oz'>('ml')
	const idCounter = useRef(0)
	const makeItem = (value: string) => ({
		id: `qa-${idCounter.current++}`,
		value,
	})
	const [quickAddItems, setQuickAddItems] = useState(() => [
		makeItem('250'),
		makeItem('500'),
		makeItem('750'),
	])
	const [dayResetHour, setDayResetHour] = useState(0)
	const [timezone, setTimezone] = useState(
		() => Intl.DateTimeFormat().resolvedOptions().timeZone,
	)

	// Password change state
	const [currentPassword, setCurrentPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [confirmNewPassword, setConfirmNewPassword] = useState('')
	const [passwordError, setPasswordError] = useState('')

	// Sync form state when user data loads
	useEffect(() => {
		if (user) {
			setDailyGoal(String(user.dailyGoal))
			setUnit(user.unit)
			setQuickAddItems(
				user.quickAddAmounts.map((a) => makeItem(String(a))),
			)
			setDayResetHour(user.dayResetHour ?? 0)
			setTimezone(
				user.timezone && user.timezone !== 'UTC'
					? user.timezone
					: Intl.DateTimeFormat().resolvedOptions().timeZone,
			)
		}
	}, [user])

	const handleSave = (e: React.FormEvent) => {
		e.preventDefault()
		const parsed = parseInt(dailyGoal, 10)
		const parsedAmounts = quickAddItems
			.map((item) => parseInt(item.value, 10))
			.filter((a) => a > 0)

		if (parsed > 0 && parsedAmounts.length > 0) {
			updateSettings.mutate({
				dailyGoal: parsed,
				unit,
				quickAddAmounts: parsedAmounts,
				dayResetHour,
				timezone,
			})
		}
	}

	const handleChangePassword = (e: React.FormEvent) => {
		e.preventDefault()
		setPasswordError('')

		if (newPassword !== confirmNewPassword) {
			setPasswordError('New passwords do not match')
			return
		}

		changePassword.mutate(
			{ currentPassword, newPassword },
			{
				onSuccess: () => {
					setCurrentPassword('')
					setNewPassword('')
					setConfirmNewPassword('')
				},
				onError: (err: any) => {
					setPasswordError(
						err?.response?.data?.message ||
							'Failed to change password',
					)
				},
			},
		)
	}

	const addQuickAddSlot = () => {
		if (quickAddItems.length < 5) {
			setQuickAddItems([...quickAddItems, makeItem('')])
		}
	}

	const removeQuickAddSlot = (id: string) => {
		if (quickAddItems.length > 1) {
			setQuickAddItems(quickAddItems.filter((item) => item.id !== id))
		}
	}

	const updateQuickAddAmount = (id: string, value: string) => {
		setQuickAddItems(
			quickAddItems.map((item) =>
				item.id === id ? { ...item, value } : item,
			),
		)
	}

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 8 },
		}),
		useSensor(TouchSensor, {
			activationConstraint: { delay: 200, tolerance: 6 },
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	)

	const [activeId, setActiveId] = useState<string | null>(null)

	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(String(event.active.id))
	}

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event

		if (over && active.id !== over.id) {
			const oldIndex = quickAddItems.findIndex(
				(item) => item.id === active.id,
			)
			const newIndex = quickAddItems.findIndex(
				(item) => item.id === over.id,
			)
			setQuickAddItems(arrayMove(quickAddItems, oldIndex, newIndex))
		}
		setActiveId(null)
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
					<>
						<Card>
							<form onSubmit={handleSave} className="space-y-5">
								{/* Daily Goal */}
								<Input
									label="Daily Hydration Goal (ml)"
									type="number"
									min={1}
									value={dailyGoal}
									onChange={(e) =>
										setDailyGoal(e.target.value)
									}
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

								{/* Quick-add amounts */}
								<div>
									<div className="mb-2 flex items-center justify-between">
										<label className="text-sm font-medium text-gray-700 dark:text-gray-300">
											Quick-Add Amounts (ml)
										</label>
										{quickAddItems.length < 5 && (
											<button
												type="button"
												onClick={addQuickAddSlot}
												className="text-xs text-brand-600 hover:text-brand-700"
											>
												+ Add Slot
											</button>
										)}
									</div>
									<DndContext
										sensors={sensors}
										modifiers={[restrictToVerticalAxis]}
										collisionDetection={closestCenter}
										onDragStart={handleDragStart}
										onDragEnd={handleDragEnd}
									>
										<SortableContext
											items={quickAddItems.map(
												(item) => item.id,
											)}
											strategy={
												verticalListSortingStrategy
											}
										>
											<div className="space-y-2">
												{quickAddItems.map((item) => (
													<SortableItem
														key={item.id}
														id={item.id}
														value={item.value}
														canDelete={
															quickAddItems.length >
															1
														}
														onChange={(val) =>
															updateQuickAddAmount(
																item.id,
																val,
															)
														}
														onDelete={() =>
															removeQuickAddSlot(
																item.id,
															)
														}
													/>
												))}
											</div>
										</SortableContext>
										<DragOverlay>
											{activeId !== null
												? (() => {
														const activeItem =
															quickAddItems.find(
																(item) =>
																	item.id ===
																	activeId,
															)
														const canDelete =
															quickAddItems.length >
															1
														return (
															<div className="flex gap-2 rounded-lg bg-white p-1 shadow-lg ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
																<div className="flex cursor-grab items-center rounded-lg px-2 text-gray-400">
																	<svg
																		className="h-4 w-4"
																		fill="none"
																		viewBox="0 0 24 24"
																		stroke="currentColor"
																	>
																		<path
																			strokeLinecap="round"
																			strokeLinejoin="round"
																			strokeWidth={
																				2
																			}
																			d="M4 8h16M4 16h16"
																		/>
																	</svg>
																</div>
																<Input
																	type="number"
																	value={
																		activeItem?.value ??
																		''
																	}
																	readOnly
																	className="flex-1"
																/>
																{canDelete && (
																	<button
																		type="button"
																		className="rounded-lg px-3 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950 font-bold"
																	>
																		✕
																	</button>
																)}
															</div>
														)
													})()
												: null}
										</DragOverlay>
									</DndContext>
									<p className="mt-1 text-xs text-gray-400">
										Customize your quick-add buttons (1-5
										amounts)
									</p>
								</div>

								{/* Day reset time */}
								<div>
									<label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
										Day Reset Time
									</label>
									<p className="mb-2 text-xs text-gray-400">
										When should a new day start? Entries
										logged before this hour count towards
										the previous day.
									</p>
									<div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
										{[
											0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
											11,
										].map((h) => {
											const label =
												h === 0
													? '12 AM'
													: h < 12
														? `${h} AM`
														: `${h - 12 || 12} PM`
											return (
												<button
													key={h}
													type="button"
													onClick={() =>
														setDayResetHour(h)
													}
													className={`rounded-xl px-2 py-2 text-xs font-medium transition-colors ${
														dayResetHour === h
															? 'bg-brand-600 text-white'
															: 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
													}`}
												>
													{label}
												</button>
											)
										})}
									</div>
								</div>

								{/* Timezone */}
								<div>
									<label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
										Timezone
									</label>
									<div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
										{timezone}
									</div>
									<p className="mt-1 text-xs text-gray-400">
										Auto-detected from your browser. Day
										boundaries and reset time are based on
										this timezone.
									</p>
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

						{/* Change Password */}
						{!user?.googleId && (
							<Card>
								<h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
									Change Password
								</h2>
								<form
									onSubmit={handleChangePassword}
									className="space-y-4"
								>
									<Input
										label="Current Password"
										type="password"
										placeholder="••••••••"
										value={currentPassword}
										onChange={(e) =>
											setCurrentPassword(e.target.value)
										}
										required
										autoComplete="current-password"
									/>
									<Input
										label="New Password"
										type="password"
										placeholder="At least 6 characters"
										value={newPassword}
										onChange={(e) =>
											setNewPassword(e.target.value)
										}
										required
										minLength={6}
										autoComplete="new-password"
									/>
									<Input
										label="Confirm New Password"
										type="password"
										placeholder="••••••••"
										value={confirmNewPassword}
										onChange={(e) =>
											setConfirmNewPassword(
												e.target.value,
											)
										}
										required
										autoComplete="new-password"
									/>

									{(passwordError ||
										changePassword.isError) && (
										<p className="text-sm text-red-500">
											{passwordError ||
												'Failed to change password'}
										</p>
									)}

									{changePassword.isSuccess && (
										<p className="text-sm text-green-600">
											✓ Password changed successfully!
										</p>
									)}

									<Button
										type="submit"
										isLoading={changePassword.isPending}
										className="w-full"
									>
										Change Password
									</Button>
								</form>
							</Card>
						)}

						{/* Logout */}
						<Card>
							<button
								onClick={logout}
								className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
							>
								<LogOut className="h-4 w-4" />
								Log Out
							</button>
						</Card>
					</>
				)}
			</main>
		</AuthGuard>
	)
}
