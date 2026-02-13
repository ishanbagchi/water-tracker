'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
	size?: 'sm' | 'md' | 'lg'
	isLoading?: boolean
}

const variantStyles: Record<string, string> = {
	primary: 'bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500',
	secondary:
		'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
	ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
	danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
}

const sizeStyles: Record<string, string> = {
	sm: 'px-3 py-1.5 text-sm',
	md: 'px-4 py-2 text-sm',
	lg: 'px-6 py-3 text-base',
}

/**
 * Reusable Button component with variant & size support.
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			variant = 'primary',
			size = 'md',
			isLoading,
			className = '',
			children,
			disabled,
			...props
		},
		ref,
	) => {
		return (
			<button
				ref={ref}
				disabled={disabled || isLoading}
				className={`
          inline-flex items-center justify-center gap-2 rounded-xl font-medium
          transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]} ${sizeStyles[size]} ${className}
        `}
				{...props}
			>
				{isLoading && (
					<svg
						className="h-4 w-4 animate-spin"
						viewBox="0 0 24 24"
						fill="none"
					>
						<circle
							className="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							strokeWidth="4"
						/>
						<path
							className="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
						/>
					</svg>
				)}
				{children}
			</button>
		)
	},
)

Button.displayName = 'Button'

export default Button
