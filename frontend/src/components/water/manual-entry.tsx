'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { useLogWater } from '@/hooks'

/**
 * Manual entry input for custom water amounts.
 */
export default function ManualEntry() {
	const [amount, setAmount] = useState('')
	const logWater = useLogWater()

	const handleOnAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value
		if (Number(newValue) <= 10_000) setAmount(newValue)
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		const parsed = parseInt(amount, 10)
		if (parsed > 0) {
			logWater.mutate(parsed)
			setAmount('')
		}
	}

	return (
		<form onSubmit={handleSubmit} className="flex items-end gap-3">
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
		</form>
	)
}
