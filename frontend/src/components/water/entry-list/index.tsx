'use client'

import { AnimatePresence } from 'framer-motion'
import { useDeleteWaterEntry } from '@/hooks'
import { EntryItem } from './components'
import type { EntryListProps } from './types'

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
					<EntryItem
						key={entry._id}
						entry={entry}
						unit={unit}
						onDelete={(id) => deleteEntry.mutate(id)}
						isDeleting={deleteEntry.isPending}
					/>
				))}
			</AnimatePresence>
		</ul>
	)
}
