import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import apiClient from '@/lib/api-client'
import { setToken, setUser, removeToken } from '@/lib/auth'
import type { ApiResponse, AuthResponse } from '@/types'

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
			setToken(data.accessToken)
			setUser(data.user)
			router.push('/')
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
			setToken(data.accessToken)
			setUser(data.user)
			router.push('/')
		},
	})
}

/** Logout – client-only, clears token and redirects. */
export function useLogout() {
	const router = useRouter()

	return () => {
		removeToken()
		router.push('/login')
	}
}
