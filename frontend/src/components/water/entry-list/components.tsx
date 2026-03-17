'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { Trash2, Pencil, Check, X } from 'lucide-react'
import { formatAmount, formatTime } from '@/lib/utils'
import { LIQUID_META, LiquidType } from '@/types'
import type { EntryItemProps } from './types'

const DROPDOWN_W = 256
const DROPDOWN_H = 272
const GAP = 6

function EmojiTypePicker({
	value,
	onChange,
}: {
	value: LiquidType
	onChange: (t: LiquidType) => void
}) {
	const [open, setOpen] = useState(false)
	const [pos, setPos] = useState<{
		top?: number
		bottom?: number
		left: number
	} | null>(null)
	const triggerRef = useRef<HTMLButtonElement>(null)
	const dropdownRef = useRef<HTMLDivElement>(null)

	const calcPosition = useCallback(() => {
		if (!triggerRef.current) return
		const rect = triggerRef.current.getBoundingClientRect()
		const spaceBelow = window.innerHeight - rect.bottom - GAP
		const openAbove = spaceBelow < DROPDOWN_H && rect.top > spaceBelow
		let left = rect.left
		if (left + DROPDOWN_W > window.innerWidth - 8)
			left = rect.right - DROPDOWN_W
		left = Math.max(8, left)
		setPos({
			left,
			...(openAbove
				? { bottom: window.innerHeight - rect.top + GAP }
				: { top: rect.bottom + GAP }),
		})
	}, [])

	useEffect(() => {
		if (!open) return
		const onPointerDown = (e: PointerEvent) => {
			if (
				!triggerRef.current?.contains(e.target as Node) &&
				!dropdownRef.current?.contains(e.target as Node)
			)
				setOpen(false)
		}
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setOpen(false)
		}
		const reposition = () => calcPosition()
		document.addEventListener('pointerdown', onPointerDown)
		document.addEventListener('keydown', onKeyDown)
		window.addEventListener('scroll', reposition, true)
		window.addEventListener('resize', reposition)
		return () => {
			document.removeEventListener('pointerdown', onPointerDown)
			document.removeEventListener('keydown', onKeyDown)
			window.removeEventListener('scroll', reposition, true)
			window.removeEventListener('resize', reposition)
		}
	}, [open, calcPosition])

	const dropdown =
		open && pos ? (
			<div
				ref={dropdownRef}
				style={{
					position: 'fixed',
					top: pos.top,
					bottom: pos.bottom,
					left: pos.left,
					width: DROPDOWN_W,
					zIndex: 9999,
				}}
				className="rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl dark:border-gray-700 dark:bg-gray-900"
			>
				<div className="grid grid-cols-2 gap-1">
					{(Object.keys(LIQUID_META) as LiquidType[]).map((t) => (
						<button
							key={t}
							type="button"
							onClick={() => {
								onChange(t)
								setOpen(false)
							}}
							className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors ${
								value === t
									? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
									: 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
							}`}
						>
							<span className="text-base leading-none">
								{LIQUID_META[t].emoji}
							</span>
							<span className="text-xs font-medium">
								{LIQUID_META[t].label}
							</span>
						</button>
					))}
				</div>
			</div>
		) : null

	return (
		<>
			<button
				ref={triggerRef}
				type="button"
				aria-label="Change liquid type"
				title={`${LIQUID_META[value].label} — tap to change`}
				onClick={() => {
					if (open) {
						setOpen(false)
					} else {
						calcPosition()
						setOpen(true)
					}
				}}
				className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-base shadow-sm
				           transition-all hover:ring-2 hover:ring-brand-400
				           dark:bg-gray-700 dark:hover:ring-brand-500"
			>
				{LIQUID_META[value].emoji}
				{/* tiny chevron badge — subtle affordance */}
				<span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-600">
					<svg
						viewBox="0 0 6 4"
						className="h-1.5 w-1.5 fill-gray-500 dark:fill-gray-400"
					>
						<path d="M0 0l3 4 3-4H0z" />
					</svg>
				</span>
			</button>
			{typeof window !== 'undefined' &&
				createPortal(dropdown, document.body)}
		</>
	)
}

export function EntryItem({
	entry,
	unit,
	onDelete,
	isDeleting,
	onEdit,
	isEditing,
}: EntryItemProps) {
	const meta = LIQUID_META[entry.liquidType ?? 'water']
	const showHydrated =
		entry.hydratedAmount != null && entry.hydratedAmount !== entry.amount

	const [editing, setEditing] = useState(false)
	const [amount, setAmount] = useState(String(entry.amount))
	const [liquidType, setLiquidType] = useState<LiquidType>(
		entry.liquidType ?? 'water',
	)

	const handleSave = () => {
		const parsed = Number(amount)
		if (!parsed || parsed < 1 || parsed > 10000) return
		const unchanged =
			parsed === entry.amount &&
			liquidType === (entry.liquidType ?? 'water')
		if (!unchanged)
			onEdit({ entryId: entry._id, amount: parsed, liquidType })
		setEditing(false)
	}

	const handleCancel = () => {
		setAmount(String(entry.amount))
		setLiquidType(entry.liquidType ?? 'water')
		setEditing(false)
	}

	return (
		<motion.li
			layout
			initial={{ opacity: 0, x: -20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: 20 }}
			className="group flex min-h-[66px] items-center rounded-xl border border-gray-100 bg-gray-50 px-4 py-3
			dark:border-gray-700 dark:bg-gray-800"
		>
			{editing ? (
				<div className="flex w-full items-center justify-between gap-2">
					<div className="flex min-w-0 flex-1 items-center gap-2">
						<EmojiTypePicker
							value={liquidType}
							onChange={setLiquidType}
						/>
						<input
							type="number"
							min={1}
							max={10000}
							value={amount}
							onChange={(e) => {
								if (Number(e.target.value) <= 10_000)
									setAmount(e.target.value)
							}}
							className="h-8 w-24 shrink-0 rounded-lg border border-gray-200 bg-white px-2 text-sm font-medium text-gray-900
							           focus:outline-none focus:ring-2 focus:ring-brand-500
							           dark:border-gray-600 dark:bg-gray-700 dark:text-white"
							autoFocus
						/>
					</div>
					<div className="flex shrink-0 items-center gap-1">
						<button
							onClick={handleSave}
							disabled={isEditing}
							className="rounded-lg p-1.5 text-green-500 transition-colors hover:bg-green-50 dark:hover:bg-green-950"
							aria-label="Save"
						>
							<Check className="h-4 w-4" />
						</button>
						<button
							onClick={handleCancel}
							className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
							aria-label="Cancel"
						>
							<X className="h-4 w-4" />
						</button>
					</div>
				</div>
			) : (
				<div className="flex w-full items-center justify-between">
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
										≈{' '}
										{formatAmount(
											entry.hydratedAmount,
											unit,
										)}{' '}
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
					<div className="flex items-center gap-1 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
						<button
							onClick={() => setEditing(true)}
							disabled={isDeleting}
							className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600
							dark:hover:bg-gray-700 dark:hover:text-gray-300"
							aria-label="Edit entry"
						>
							<Pencil className="h-3.5 w-3.5" />
						</button>
						<button
							onClick={() => onDelete(entry._id)}
							disabled={isDeleting}
							className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500
							dark:hover:bg-red-950"
							aria-label="Delete entry"
						>
							<Trash2 className="h-4 w-4" />
						</button>
					</div>
				</div>
			)}
		</motion.li>
	)
}
