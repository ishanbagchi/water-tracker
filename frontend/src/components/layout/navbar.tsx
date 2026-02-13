'use client'

import Link from 'next/link'
import { BarChart3, Settings, Droplets } from 'lucide-react'
import { Logo } from '@/components/ui'

/**
 * Top navigation bar with links.
 */
export default function Navbar() {
	return (
		<header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
			<div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
				{/* Brand */}
				<Link href="/" className="flex items-center gap-2">
					<Logo size={24} />
					<span className="text-lg font-bold text-gray-900 dark:text-white">
						HydroTrack
					</span>
				</Link>

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
