'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { LIQUID_ENTRIES } from './shared/constants'

interface HydrationInfoProps {
	open?: boolean
	onOpenChange?: (open: boolean) => void
}

export default function HydrationInfo({
	open: controlledOpen,
	onOpenChange,
}: HydrationInfoProps) {
	const [internalOpen, setInternalOpen] = useState(false)

	const isControlled = controlledOpen !== undefined
	const open = isControlled ? controlledOpen : internalOpen
	const setOpen = (val: boolean) => {
		if (isControlled) onOpenChange?.(val)
		else setInternalOpen(val)
	}

	useEffect(() => {
		if (!open) return
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setOpen(false)
		}
		document.addEventListener('keydown', onKey)
		document.body.style.overflow = 'hidden'
		return () => {
			document.removeEventListener('keydown', onKey)
			document.body.style.overflow = ''
		}
		// setOpen is stable — intentionally omitted
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open])

	return (
		<>
			{!isControlled && (
				<button
					type="button"
					onClick={() => setOpen(true)}
					className="flex items-center gap-1 text-xs text-gray-400 underline-offset-2 hover:text-brand-500 hover:underline transition-colors"
					aria-label="How hydration is calculated"
				>
					How we calculate hydration
				</button>
			)}
			<AnimatePresence>
				{open && (
					<motion.div
						key="backdrop"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm"
						onClick={() => setOpen(false)}
					>
						<div className="flex min-h-full items-center justify-center p-4">
							<motion.div
								key="panel"
								initial={{ opacity: 0, scale: 0.95, y: 12 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.95, y: 12 }}
								transition={{ type: 'spring', duration: 0.3 }}
								onClick={(e) => e.stopPropagation()}
								className="relative w-full max-w-lg rounded-2xl bg-white p-4 shadow-xl dark:bg-gray-900"
							>
								<button
									onClick={() => setOpen(false)}
									className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
									aria-label="Close"
								>
									<X className="h-4 w-4" />
								</button>

								<h2 className="pr-8 text-base font-semibold text-gray-900 dark:text-white">
									How We Calculate Hydration
								</h2>

								<p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
									Not all drinks hydrate equally. We apply the{' '}
									<strong className="text-gray-700 dark:text-gray-300">
										Beverage Hydration Index (BHI)
									</strong>{' '}
									— how much fluid stays in your body 2 hrs
									after drinking vs. plain water. Progress is
									based on <em>hydration credited</em>, not
									raw volume.
								</p>

								<p className="mt-2 rounded-lg bg-gray-50 px-3 py-2 font-mono text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
									Hydration credited = volume × hydration
									factor
								</p>

								<div className="mt-3 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
									<table className="w-full text-xs">
										<thead>
											<tr className="bg-gray-50 dark:bg-gray-800">
												<th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">
													Drink
												</th>
												<th className="px-3 py-2 text-right font-medium text-gray-500 dark:text-gray-400">
													Factor
												</th>
												<th className="hidden px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 sm:table-cell">
													Why
												</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-gray-100 dark:divide-gray-800">
											{LIQUID_ENTRIES.map(
												([type, meta]) => (
													<tr
														key={type}
														className="bg-white dark:bg-gray-900"
													>
														<td className="px-3 py-1.5">
															<span className="flex items-center gap-1.5">
																<span>
																	{meta.emoji}
																</span>
																<span className="font-medium text-gray-800 dark:text-gray-200">
																	{meta.label}
																</span>
															</span>
														</td>
														<td className="px-3 py-1.5 text-right font-mono text-gray-700 dark:text-gray-300">
															{(
																meta.factor *
																100
															).toFixed(0)}
															%
														</td>
														<td className="hidden px-3 py-1.5 text-gray-500 dark:text-gray-400 sm:table-cell">
															{meta.description}
														</td>
													</tr>
												),
											)}
										</tbody>
									</table>
								</div>

								<p className="mt-3 text-[11px] text-gray-400">
									Maughan et al. (2016),{' '}
									<em>Am. J. Clin. Nutrition</em>.
								</p>
							</motion.div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	)
}
