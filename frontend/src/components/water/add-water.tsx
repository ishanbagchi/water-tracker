'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
	Plus,
	GlassWater,
	CupSoda,
	FlaskConical,
	Droplets,
	Waves,
} from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { useLogWater, useLogWaterForDate, useUser } from '@/hooks'
import { LIQUID_META, LiquidType } from '@/types'
import LiquidPicker from './liquid-picker'

const AMOUNT_ICONS = [GlassWater, CupSoda, FlaskConical, Droplets, Waves]

export default function AddWater({ date }: { date?: string } = {}) {
	const logWaterToday = useLogWater()
	const logWaterForDate = useLogWaterForDate(date ?? '')
	const logWater = date ? logWaterForDate : logWaterToday
	const { data: user } = useUser()

	const [liquidType, setLiquidType] = useState<LiquidType>('water')
	const [amount, setAmount] = useState('')

	const amounts = user?.quickAddAmounts ?? [250, 500, 750]

	const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value
		if (Number(val) <= 10_000) setAmount(val)
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		const parsed = parseInt(amount, 10)
		if (parsed > 0) {
			logWater.mutate({ amount: parsed, liquidType })
			setAmount('')
		}
	}

	return (
		<div className="space-y-4">
			{/* Shared beverage type selector */}
			<div className="flex items-center justify-between">
				<span className="text-xs text-gray-400 dark:text-gray-500">
					Beverage type
				</span>
				<LiquidPicker value={liquidType} onChange={setLiquidType} />
			</div>

			{/* Quick-add grid */}
			<div className="grid grid-cols-3 gap-3">
				{amounts.map((amt, index) => {
					const Icon = AMOUNT_ICONS[index % AMOUNT_ICONS.length]
					return (
						<motion.button
							key={amt}
							whileTap={{ scale: 0.93 }}
							whileHover={{ scale: 1.03 }}
							disabled={logWater.isPending}
							onClick={() =>
								logWater.mutate({ amount: amt, liquidType })
							}
							className="flex flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-5
							shadow-sm transition-colors hover:border-brand-300 hover:bg-brand-50
							disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900
							dark:hover:border-brand-600 dark:hover:bg-brand-950"
							aria-label={`Add ${amt} ml of ${LIQUID_META[liquidType].label}`}
						>
							<Icon className="h-7 w-7 text-brand-500" />
							<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
								{amt} ml
							</span>
						</motion.button>
					)
				})}
			</div>

			{/* Divider */}
			<div className="relative flex items-center">
				<div className="flex-1 border-t border-gray-100 dark:border-gray-700" />
				<span className="mx-3 text-xs text-gray-400 dark:text-gray-500">
					or enter custom amount
				</span>
				<div className="flex-1 border-t border-gray-100 dark:border-gray-700" />
			</div>

			{/* Custom amount */}
			<form onSubmit={handleSubmit}>
				<div className="flex items-end gap-3">
					<div className="flex-1">
						<Input
							label="Custom amount (ml)"
							type="number"
							min={1}
							max={10000}
							placeholder="e.g. 350"
							value={amount}
							onChange={handleAmountChange}
						/>
					</div>
					<Button
						type="submit"
						size="md"
						disabled={!amount || parseInt(amount) <= 0}
						isLoading={logWater.isPending}
						className="mb-0.5"
					>
						<Plus className="h-4 w-4" />
						Add
					</Button>
				</div>
			</form>
		</div>
	)
}
