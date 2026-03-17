interface LoadingSpinnerProps {
	/** Tailwind class controlling outer container height, e.g. "h-24" or "h-full" */
	className?: string
}

export function LoadingSpinner({ className = 'h-24' }: LoadingSpinnerProps) {
	return (
		<div className={`flex items-center justify-center ${className}`}>
			<div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
		</div>
	)
}
