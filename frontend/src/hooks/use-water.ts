import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'
import type { ApiResponse, TodayData, HistoryDay, MonthData } from '@/types'

// ── Query Keys (centralised for cache invalidation) ──
export const waterKeys = {
	today: ['water', 'today'] as const,
	history: ['water', 'history'] as const,
	day: (date: string) => ['water', 'day', date] as const,
	month: (year: number, month: number) =>
		['water', 'month', year, month] as const,
}

/** GET /water/today – today's total + entries list. */
export function useWaterToday() {
	return useQuery({
		queryKey: waterKeys.today,
		queryFn: async () => {
			const { data } =
				await apiClient.get<ApiResponse<TodayData>>('/water/today')
			return data.data
		},
		refetchOnWindowFocus: true,
	})
}

/** GET /water/history – aggregated 7-day totals. */
export function useWaterHistory() {
	return useQuery({
		queryKey: waterKeys.history,
		queryFn: async () => {
			const { data } =
				await apiClient.get<ApiResponse<HistoryDay[]>>('/water/history')
			return data.data
		},
	})
}

/** GET /water/month/:year/:month – daily totals for an entire month. */
export function useWaterMonth(year: number, month: number) {
	return useQuery({
		queryKey: waterKeys.month(year, month),
		queryFn: async () => {
			const { data } = await apiClient.get<ApiResponse<MonthData>>(
				`/water/month/${year}/${month}`,
			)
			return data.data
		},
	})
}

/** POST /water/log – add a new water entry with optimistic update. */
export function useLogWater() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (amount: number) => {
			const { data } = await apiClient.post<ApiResponse>('/water/log', {
				amount,
			})
			return data.data
		},
		// Optimistic update: immediately bump the total in cache
		onMutate: async (amount) => {
			await queryClient.cancelQueries({ queryKey: waterKeys.today })
			const previous = queryClient.getQueryData<TodayData>(
				waterKeys.today,
			)

			if (previous) {
				queryClient.setQueryData<TodayData>(waterKeys.today, {
					...previous,
					total: previous.total + amount,
				})
			}

			return { previous }
		},
		onError: (_err, _amount, context) => {
			// Roll back on error
			if (context?.previous) {
				queryClient.setQueryData(waterKeys.today, context.previous)
			}
		},
		onSettled: () => {
			// Always refetch to sync with server
			queryClient.invalidateQueries({ queryKey: waterKeys.today })
			queryClient.invalidateQueries({ queryKey: waterKeys.history })
		},
	})
}

/** DELETE /water/:id – remove an entry. */
export function useDeleteWaterEntry() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (entryId: string) => {
			await apiClient.delete(`/water/${entryId}`)
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: waterKeys.today })
			queryClient.invalidateQueries({ queryKey: waterKeys.history })
			// Invalidate all day-specific queries too
			queryClient.invalidateQueries({ queryKey: ['water', 'day'] })
		},
	})
}

/** GET /water/day/:date – entries and total for a specific date. */
export function useWaterByDate(date: string) {
	return useQuery({
		queryKey: waterKeys.day(date),
		queryFn: async () => {
			const { data } = await apiClient.get<ApiResponse<TodayData>>(
				`/water/day/${date}`,
			)
			return data.data
		},
		enabled: !!date,
	})
}

/** POST /water/log/:date – log water for a specific (possibly past) date. */
export function useLogWaterForDate(date: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (amount: number) => {
			const { data } = await apiClient.post<ApiResponse>(
				`/water/log/${date}`,
				{ amount },
			)
			return data.data
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: waterKeys.day(date) })
			queryClient.invalidateQueries({ queryKey: waterKeys.history })
			queryClient.invalidateQueries({ queryKey: waterKeys.today })
		},
	})
}
