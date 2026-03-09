'use client'

import Link from 'next/link'
import { BarChart3, Settings, Droplets } from 'lucide-react'
import { Logo } from '@/components/ui'

export default function Navbar() {
	return (
		<header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
			<div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
				{/* Brand */}
				<div className="flex items-center gap-2">
					<Link href="/" className="flex items-center gap-2">
						<Logo size={24} />
						<div className="flex flex-col items-start sm:flex-row sm:items-baseline sm:gap-1.5">
							<span className="text-lg font-bold leading-tight text-gray-900 dark:text-white">
								HydroTrack
							</span>
						</div>
					</Link>
					<span className="mt-1 text-[11px] leading-tight text-gray-400">
						by{' '}
						<a
							href="https://ishanbagchi.com"
							target="_blank"
							rel="noopener noreferrer"
							className="underline decoration-gray-300 underline-offset-2 transition-colors hover:text-brand-500 dark:decoration-gray-600"
						>
							Ishan Bagchi
						</a>
					</span>
				</div>

				{/* Nav links */}
				<nav className="flex items-center gap-1">
					<Link
						href="/"
						className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900
                       dark:hover:bg-gray-800 dark:hover:text-white"
						aria-label="Dashboard"
					>
						<Droplets className="h-5 w-5" />
					</Link>
					<Link
						href="/history"
						className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900
                       dark:hover:bg-gray-800 dark:hover:text-white"
						aria-label="History"
					>
						<BarChart3 className="h-5 w-5" />
					</Link>
					<Link
						href="/settings"
						className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900
                       dark:hover:bg-gray-800 dark:hover:text-white"
						aria-label="Settings"
					>
						<Settings className="h-5 w-5" />
					</Link>
				</nav>
			</div>
		</header>
	)
}
