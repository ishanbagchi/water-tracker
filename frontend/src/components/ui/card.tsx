'use client'

import { ReactNode } from 'react'

interface CardProps {
	children: ReactNode
	className?: string
}

/**
 * Reusable Card wrapper with consistent styling.
 */
export default function Card({ children, className = '' }: CardProps) {
	return (
		<div
			className={`
        rounded-2xl border border-gray-200 bg-white p-6 shadow-sm
        dark:border-gray-700 dark:bg-gray-900
        ${className}
      `}
		>
			{children}
		</div>
	)
}
