'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { useDeleteWaterEntry } from '@/hooks'
import { formatAmount, formatTime } from '@/lib/utils'
import type { WaterEntry } from '@/types'

interface EntryListProps {
	entries: WaterEntry[]
	unit?: 'ml' | 'oz'
}

/**
 * Animated list of today's water log entries with delete (undo) support.
 */
export default function EntryList({ entries, unit = 'ml' }: EntryListProps) {
	const deleteEntry = useDeleteWaterEntry()

	if (entries.length === 0) {
		return (
			<p className="py-6 text-center text-sm text-gray-400">
				No entries yet today. Start logging!
			</p>
		)
	}

	return (
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
								{formatAmount(entry.amount, unit)}
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
	)
}
