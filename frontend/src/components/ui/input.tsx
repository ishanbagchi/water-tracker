'use client'

import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string
	error?: string
}

/**
 * Reusable Input component with label and error display.
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
	({ label, error, className = '', id, ...props }, ref) => {
		const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

		return (
			<div className="w-full">
				{label && (
					<label
						htmlFor={inputId}
						className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						{label}
					</label>
				)}
				<input
					ref={ref}
					id={inputId}
					className={`
            w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5
            text-sm text-gray-900 placeholder-gray-400
            transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20
            dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
            ${className}
          `}
					{...props}
				/>
				{error && <p className="mt-1 text-xs text-red-500">{error}</p>}
			</div>
		)
	},
)

Input.displayName = 'Input'

export default Input
