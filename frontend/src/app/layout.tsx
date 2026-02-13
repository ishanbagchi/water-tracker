import type { Metadata } from 'next'
import Providers from './providers'
import './globals.css'

export const metadata: Metadata = {
	title: 'HydroTrack – Stay Hydrated',
	description:
		'Minimalist water intake tracker to build healthy hydration habits.',
	icons: {
		icon: '/favicon.svg',
	},
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="min-h-screen bg-gray-50 text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-100">
				<Providers>{children}</Providers>
			</body>
		</html>
	)
}
