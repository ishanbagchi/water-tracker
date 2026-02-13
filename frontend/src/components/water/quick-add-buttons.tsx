'use client'

import { motion } from 'framer-motion'
import {
	GlassWater,
	CupSoda,
	FlaskConical,
	Droplets,
	Waves,
} from 'lucide-react'
import { useLogWater, useUser } from '@/hooks'

/** Icon mapping for different amounts */
const ICONS = [GlassWater, CupSoda, FlaskConical, Droplets, Waves]

/**
 * Quick-add buttons to log common water amounts in one tap.
 */
export default function QuickAddButtons() {
	const logWater = useLogWater()
	const { data: user } = useUser()

	const amounts = user?.quickAddAmounts ?? [250, 500, 750]

	return (
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
	)
}
