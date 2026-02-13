import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'
import type { ApiResponse, User } from '@/types'

export const userKeys = {
	me: ['user', 'me'] as const,
}

/** GET /user/me – fetch the current user profile. */
export function useUser() {
	return useQuery({
		queryKey: userKeys.me,
		queryFn: async () => {
			const { data } = await apiClient.get<ApiResponse<User>>('/user/me')
			return data.data
		},
	})
}

/** PATCH /user/settings – update daily goal or unit. */
export function useUpdateSettings() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (body: {
			dailyGoal?: number
			unit?: 'ml' | 'oz'
		}) => {
			const { data } = await apiClient.patch<ApiResponse<User>>(
				'/user/settings',
				body,
			)
			return data.data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: userKeys.me })
		},
	})
}
