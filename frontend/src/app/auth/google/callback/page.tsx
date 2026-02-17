'use client'

import { Suspense, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import apiClient from '@/lib/api-client'
import { setUser } from '@/lib/auth'

function GoogleCallbackContent() {
	const router = useRouter()

	useEffect(() => {
		// Backend set httpOnly cookie. Fetch session user from /auth/me
		apiClient
			.get('/auth/me')
			.then((res) => {
				const user = res.data?.data
				if (user) {
					setUser(user)
					router.replace('/')
				} else {
					router.replace('/login')
				}
			})
			.catch(() => router.replace('/login'))
	}, [router])

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
		</div>
	)
}

/**
 * Handles the redirect from the backend Google OAuth callback.
 * Wrapped in Suspense because useSearchParams requires it in Next.js 14.
 */
export default function GoogleCallbackPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
				</div>
			}
		>
			<GoogleCallbackContent />
		</Suspense>
	)
}
