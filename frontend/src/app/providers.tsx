'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, ReactNode } from 'react'

interface ProvidersProps {
	children: ReactNode
}

/**
 * Client-side providers wrapper. Creates a single QueryClient per session.
 */
export default function Providers({ children }: ProvidersProps) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 30_000, // 30 seconds
						retry: 1,
						refetchOnWindowFocus: true,
					},
				},
			}),
	)

	return (
		<QueryClientProvider client={queryClient}>
			{children}
		</QueryClientProvider>
	)
}
