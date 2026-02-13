/** Standard API response envelope for consistent client-side parsing. */
export interface ApiResponse<T = unknown> {
	success: boolean
	data: T
	message?: string
}

/** Paginated API response. */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
	total: number
	page: number
	limit: number
}
