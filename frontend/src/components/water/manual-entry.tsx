'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { useLogWater, useLogWaterForDate } from '@/hooks'
import { LiquidType } from '@/types'
import LiquidPicker from './liquid-picker'

export default function ManualEntry({ date }: { date?: string } = {}) {
	const [amount, setAmount] = useState('')
	const [liquidType, setLiquidType] = useState<LiquidType>('water')
	const logWaterToday = useLogWater()
	const logWaterForDate = useLogWaterForDate(date ?? '')
	const logWater = date ? logWaterForDate : logWaterToday

	const handleOnAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value
		if (Number(newValue) <= 10_000) setAmount(newValue)
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
		<form onSubmit={handleSubmit} className="space-y-3">
			<div className="flex items-center justify-between">
				<span className="text-xs text-gray-400 dark:text-gray-500">
					Beverage type
				</span>
				<LiquidPicker value={liquidType} onChange={setLiquidType} />
			</div>

			<div className="flex items-end gap-3">
				<div className="flex-1">
					<Input
						label="Custom amount (ml)"
						type="number"
						min={1}
						max={10000}
						placeholder="e.g. 350"
						value={amount}
						onChange={handleOnAmountChange}
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
	)
}
