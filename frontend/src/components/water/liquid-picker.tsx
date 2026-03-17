'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'
import { LIQUID_META, LiquidType } from '@/types'
import { LIQUID_ENTRIES } from './shared/constants'

const DROPDOWN_W = 256
const DROPDOWN_H = 272 // approx height of 2-col 4-row grid
const GAP = 6

interface LiquidPickerProps {
	value: LiquidType
	onChange: (type: LiquidType) => void
}

interface DropdownPos {
	top?: number
	bottom?: number
	left: number
}

export default function LiquidPicker({ value, onChange }: LiquidPickerProps) {
	const [open, setOpen] = useState(false)
	const [pos, setPos] = useState<DropdownPos | null>(null)
	const triggerRef = useRef<HTMLButtonElement>(null)
	const dropdownRef = useRef<HTMLDivElement>(null)

	const calcPosition = useCallback(() => {
		if (!triggerRef.current) return
		const rect = triggerRef.current.getBoundingClientRect()

		const spaceBelow = window.innerHeight - rect.bottom - GAP
		const spaceAbove = rect.top - GAP
		const openAbove = spaceBelow < DROPDOWN_H && spaceAbove >= spaceBelow

		let left = rect.left
		if (left + DROPDOWN_W > window.innerWidth - 8) {
			left = rect.right - DROPDOWN_W
		}
		left = Math.max(8, left)

		setPos({
			left,
			...(openAbove
				? { bottom: window.innerHeight - rect.top + GAP }
				: { top: rect.bottom + GAP }),
		})
	}, [])

	const handleToggle = () => {
		if (open) {
			setOpen(false)
		} else {
			calcPosition()
			setOpen(true)
		}
	}

	useEffect(() => {
		if (!open) return

		const onPointerDown = (e: PointerEvent) => {
			if (
				!triggerRef.current?.contains(e.target as Node) &&
				!dropdownRef.current?.contains(e.target as Node)
			) {
				setOpen(false)
			}
		}
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setOpen(false)
		}
		const onScrollOrResize = () => calcPosition()

		document.addEventListener('pointerdown', onPointerDown)
		document.addEventListener('keydown', onKeyDown)
		window.addEventListener('scroll', onScrollOrResize, true)
		window.addEventListener('resize', onScrollOrResize)

		return () => {
			document.removeEventListener('pointerdown', onPointerDown)
			document.removeEventListener('keydown', onKeyDown)
			window.removeEventListener('scroll', onScrollOrResize, true)
			window.removeEventListener('resize', onScrollOrResize)
		}
	}, [open, calcPosition])

	const selected = LIQUID_META[value]

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
					{LIQUID_ENTRIES.map(([type, meta]) => (
						<button
							key={type}
							type="button"
							onClick={() => {
								onChange(type)
								setOpen(false)
							}}
							className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors ${
								value === type
									? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
									: 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
							}`}
						>
							<span className="text-base leading-none">
								{meta.emoji}
							</span>
							<span className="text-xs font-medium">
								{meta.label}
							</span>
						</button>
					))}
				</div>
			</div>
		) : null

	return (
		<div className="relative">
			<button
				ref={triggerRef}
				type="button"
				onClick={handleToggle}
				aria-haspopup="listbox"
				aria-expanded={open}
				className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600"
			>
				<span>{selected.emoji}</span>
				{selected.label}
				<ChevronDown
					className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
				/>
			</button>

			{typeof window !== 'undefined' &&
				createPortal(dropdown, document.body)}
		</div>
	)
}
