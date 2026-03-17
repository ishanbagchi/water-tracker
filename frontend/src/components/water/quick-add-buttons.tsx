'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
	GlassWater,
	CupSoda,
	FlaskConical,
	Droplets,
	Waves,
} from 'lucide-react'
import { useLogWater, useLogWaterForDate, useUser } from '@/hooks'
import { LIQUID_META, LiquidType } from '@/types'
import LiquidPicker from './liquid-picker'

const AMOUNT_ICONS = [GlassWater, CupSoda, FlaskConical, Droplets, Waves]

export default function QuickAddButtons({ date }: { date?: string } = {}) {
	const logWaterToday = useLogWater()
	const logWaterForDate = useLogWaterForDate(date ?? '')
	const logWater = date ? logWaterForDate : logWaterToday
	const { data: user } = useUser()
	const [liquidType, setLiquidType] = useState<LiquidType>('water')

	const amounts = user?.quickAddAmounts ?? [250, 500, 750]

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<span className="text-xs text-gray-400 dark:text-gray-500">
					Beverage type
				</span>
				<LiquidPicker value={liquidType} onChange={setLiquidType} />
			</div>

			<div className="grid grid-cols-3 gap-3">
				{amounts.map((amount, index) => {
					const Icon = AMOUNT_ICONS[index % AMOUNT_ICONS.length]
					const label = `${amount} ml`
					return (
						<motion.button
							key={amount}
							whileTap={{ scale: 0.93 }}
							whileHover={{ scale: 1.03 }}
							disabled={logWater.isPending}
							onClick={() =>
								logWater.mutate({ amount, liquidType })
							}
							className="flex flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-5
							shadow-sm transition-colors hover:border-brand-300 hover:bg-brand-50
							disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900
							dark:hover:border-brand-600 dark:hover:bg-brand-950"
							aria-label={`Add ${label} of ${LIQUID_META[liquidType].label}`}
						>
							<Icon className="h-7 w-7 text-brand-500" />
							<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
								{label}
							</span>
						</motion.button>
					)
				})}
			</div>
		</div>
	)
}
