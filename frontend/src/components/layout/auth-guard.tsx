'use client'

import { useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'

interface AuthGuardProps {
	children: ReactNode
}

/**
 * Client-side auth guard. Redirects to /login if no JWT is present.
 */
export default function AuthGuard({ children }: AuthGuardProps) {
	const router = useRouter()
	const [checked, setChecked] = useState(false)

	useEffect(() => {
		if (!isAuthenticated()) {
			router.replace('/login')
		} else {
			setChecked(true)
		}
	}, [router])

	if (!checked) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
			</div>
		)
	}

	return <>{children}</>
}
