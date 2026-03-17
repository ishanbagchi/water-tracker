import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'
import type {
	ApiResponse,
	TodayData,
	HistoryDay,
	MonthData,
	StreaksData,
	StatsData,
	LiquidType,
	WaterEntry,
} from '@/types'
import { HYDRATION_FACTOR } from '@/types'

export interface LogWaterPayload {
	amount: number
	liquidType?: LiquidType
}

// ── Query Keys (centralised for cache invalidation) ──
export const waterKeys = {
	today: ['water', 'today'] as const,
	history: ['water', 'history'] as const,
	day: (date: string) => ['water', 'day', date] as const,
	month: (year: number, month: number) =>
		['water', 'month', year, month] as const,
	streaks: ['water', 'streaks'] as const,
	stats: (period: string) => ['water', 'stats', period] as const,
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
		mutationFn: async ({
			amount,
			liquidType = 'water',
		}: LogWaterPayload) => {
			const { data } = await apiClient.post<ApiResponse>('/water/log', {
				amount,
				liquidType,
			})
			return data.data
		},
		onMutate: async ({ amount, liquidType = 'water' }) => {
			await queryClient.cancelQueries({ queryKey: waterKeys.today })
			const previous = queryClient.getQueryData<TodayData>(
				waterKeys.today,
			)

			if (previous) {
				const hydratedAmount = Math.round(
					amount * HYDRATION_FACTOR[liquidType],
				)
				const tempEntry: WaterEntry = {
					_id: `optimistic-${Date.now()}`,
					userId: previous.entries[0]?.userId ?? '',
					amount,
					liquidType,
					hydratedAmount,
					date: previous.date,
					timestamp: new Date().toISOString(),
				}
				queryClient.setQueryData<TodayData>(waterKeys.today, {
					...previous,
					total: previous.total + hydratedAmount,
					entries: [...previous.entries, tempEntry],
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
			queryClient.invalidateQueries({ queryKey: waterKeys.streaks })
			queryClient.invalidateQueries({ queryKey: ['water', 'stats'] })
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
			queryClient.invalidateQueries({ queryKey: waterKeys.streaks })
			queryClient.invalidateQueries({ queryKey: ['water', 'stats'] })
			queryClient.invalidateQueries({ queryKey: ['water', 'day'] })
		},
	})
}

export interface EditWaterPayload {
	entryId: string
	amount: number
	liquidType: LiquidType
}

/** PATCH /water/:id – update amount and/or liquid type of an entry. */
export function useEditWaterEntry() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			entryId,
			amount,
			liquidType,
		}: EditWaterPayload) => {
			const { data } = await apiClient.patch<ApiResponse>(
				`/water/${entryId}`,
				{ amount, liquidType },
			)
			return data.data
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: waterKeys.today })
			queryClient.invalidateQueries({ queryKey: waterKeys.history })
			queryClient.invalidateQueries({ queryKey: waterKeys.streaks })
			queryClient.invalidateQueries({ queryKey: ['water', 'stats'] })
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
		mutationFn: async ({
			amount,
			liquidType = 'water',
		}: LogWaterPayload) => {
			const { data } = await apiClient.post<ApiResponse>(
				`/water/log/${date}`,
				{ amount, liquidType },
			)
			return data.data
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: waterKeys.day(date) })
			queryClient.invalidateQueries({ queryKey: waterKeys.history })
			queryClient.invalidateQueries({ queryKey: waterKeys.today })
			queryClient.invalidateQueries({ queryKey: waterKeys.streaks })
			queryClient.invalidateQueries({ queryKey: ['water', 'stats'] })
		},
	})
}

/** GET /water/streaks – current streak, longest streak, badges. */
export function useStreaks() {
	return useQuery({
		queryKey: waterKeys.streaks,
		queryFn: async () => {
			const { data } =
				await apiClient.get<ApiResponse<StreaksData>>('/water/streaks')
			return data.data
		},
	})
}

/** GET /water/stats – aggregate stats for a period (week/month/all). */
export function useStats(period: 'week' | 'month' | 'all' = 'week') {
	return useQuery({
		queryKey: waterKeys.stats(period),
		queryFn: async () => {
			const { data } = await apiClient.get<ApiResponse<StatsData>>(
				`/water/stats?period=${period}`,
			)
			return data.data
		},
	})
}
