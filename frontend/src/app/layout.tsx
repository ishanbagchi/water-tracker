import type { Metadata, Viewport } from 'next'
import Providers from './providers'
import RegisterSW from '@/components/layout/register-sw'
import './globals.css'

export const metadata: Metadata = {
	title: 'HydroTrack – Stay Hydrated',
	description:
		'Minimalist water intake tracker to build healthy hydration habits.',
	manifest: '/manifest.json',
	icons: {
		icon: '/favicon.svg',
		apple: '/icons/icon-192.png',
	},
	appleWebApp: {
		capable: true,
		statusBarStyle: 'default',
		title: 'HydroTrack',
	},
}

export const viewport: Viewport = {
	themeColor: '#3b82f6',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="min-h-screen bg-gray-50 text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-100" suppressHydrationWarning>
				<Providers>{children}</Providers>
				<RegisterSW />
			</body>
		</html>
	)
}
