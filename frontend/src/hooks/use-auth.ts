import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import apiClient from '@/lib/api-client'
import { setUser, removeUserToken } from '@/lib/auth'
import type { ApiResponse, AuthResponse } from '@/types'
import { useCallback } from 'react'

/** POST /auth/register */
export function useRegister() {
	const router = useRouter()

	return useMutation({
		mutationFn: async (body: { email: string; password: string }) => {
			const { data } = await apiClient.post<ApiResponse<AuthResponse>>(
				'/auth/register',
				body,
			)
			return data.data
		},
		onSuccess: (data) => {
			const user = (data as any).user ?? data

			if (user) {
				setUser(user)
				router.replace('/')
			} else {
				console.error('Login succeeded but no user data found:', data)
			}
		},
	})
}

/** POST /auth/login */
export function useLogin() {
	const router = useRouter()

	return useMutation({
		mutationFn: async (body: { email: string; password: string }) => {
			const { data } = await apiClient.post<ApiResponse<AuthResponse>>(
				'/auth/login',
				body,
			)
			return data.data
		},
		onSuccess: (data) => {
			const user = (data as any).user ?? data
			setUser(user)
			router.replace('/')
		},
	})
}

/** Logout – client-only, clears token and redirects. */
export function useLogout() {
	const router = useRouter()

	const logout = useCallback(async () => {
		try {
			await apiClient.post('/auth/logout').catch(() => {})
		} finally {
			removeUserToken()
			router.replace('/login')
		}
	}, [router])

	return logout
}
