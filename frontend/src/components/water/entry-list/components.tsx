'use client'

import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { formatAmount, formatTime } from '@/lib/utils'
import { LIQUID_META } from '@/types'
import type { EntryItemProps } from './types'

export function EntryItem({
	entry,
	unit,
	onDelete,
	isDeleting,
}: EntryItemProps) {
	const meta = LIQUID_META[entry.liquidType ?? 'water']
	const showHydrated =
		entry.hydratedAmount != null && entry.hydratedAmount !== entry.amount

	return (
		<motion.li
			layout
			initial={{ opacity: 0, x: -20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: 20 }}
			className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3
			dark:border-gray-700 dark:bg-gray-800"
		>
			<div className="flex items-center gap-3">
				<span
					className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-base shadow-sm dark:bg-gray-700"
					title={meta.label}
				>
					{meta.emoji}
				</span>
				<div>
					<div className="flex items-baseline gap-1.5">
						<span className="font-medium text-gray-900 dark:text-white">
							{formatAmount(entry.amount, unit)}
						</span>
						{showHydrated && (
							<span className="text-xs text-gray-400">
								≈ {formatAmount(entry.hydratedAmount, unit)}{' '}
								hydration
							</span>
						)}
					</div>
					<div className="flex items-center gap-1.5 text-xs text-gray-400">
						<span>{meta.label}</span>
						<span>·</span>
						<span>{formatTime(entry.timestamp)}</span>
					</div>
				</div>
			</div>
			<button
				onClick={() => onDelete(entry._id)}
				disabled={isDeleting}
				className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500
				dark:hover:bg-red-950"
				aria-label="Delete entry"
			>
				<Trash2 className="h-4 w-4" />
			</button>
		</motion.li>
	)
}
