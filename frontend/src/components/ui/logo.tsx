interface LogoProps {
	className?: string
	size?: number
}

/**
 * HydroTrack — minimal water droplet logo.
 * Simple solid drop with a single highlight.
 */
export default function Logo({ className = '', size = 32 }: LogoProps) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 32 32"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<path
				d="M16 3C16 3 6 14 6 20a10 10 0 0020 0C26 14 16 3 16 3Z"
				fill="#3b82f6"
			/>
			<ellipse cx="12.5" cy="14" rx="3" ry="1.5" fill="white" opacity="0.5" />
		</svg>
	)
}
